const pool = require("../db/pool");
const config = require("../config");
const Razorpay = require("razorpay");

let razorpay = null;
function getRazorpay() {
  if (!razorpay && config.razorpayKeyId && config.razorpayKeySecret) {
    razorpay = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret
    });
  }
  return razorpay;
}

async function getPlans() {
  const result = await pool.query("SELECT * FROM plans ORDER BY price_cents ASC");
  return result.rows.map(r => ({
    ...r,
    features: typeof r.features === "string" ? JSON.parse(r.features) : r.features
  }));
}

async function getUserPlan(userId) {
  const result = await pool.query(`
    SELECT u.plan, u.razorpay_customer_id, s.status, s.current_period_end,
      s.razorpay_subscription_id, p.name as plan_name, p.notification_limit, p.price_cents
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
    LEFT JOIN plans p ON p.id = u.plan
    WHERE u.id = $1
  `, [userId]);
  return result.rows[0] || null;
}

// In Razorpay, we create a subscription and pass its ID to the frontend to launch checkout
async function createCheckoutSession(userId, planId) {
  const rzp = getRazorpay();
  if (!rzp) throw Object.assign(new Error("Razorpay not configured"), { statusCode: 503 });

  const user = (await pool.query("SELECT * FROM users WHERE id = $1", [userId])).rows[0];
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  const plan = (await pool.query("SELECT * FROM plans WHERE id = $1", [planId])).rows[0];
  if (!plan || !plan.razorpay_plan_id) throw Object.assign(new Error("Plan not available for purchase (missing razorpay_plan_id)"), { statusCode: 400 });

  // 1. Ensure RZP Customer exists
  let customerId = user.razorpay_customer_id;
  if (!customerId) {
    const customer = await rzp.customers.create({
      name: user.name,
      email: user.email,
      contact: user.phone || "9999999999",
      notes: { userId: user.id }
    });
    customerId = customer.id;
    await pool.query("UPDATE users SET razorpay_customer_id = $1 WHERE id = $2", [customerId, userId]);
  }

  // 2. Create Razorpay Subscription
  const subscription = await rzp.subscriptions.create({
    plan_id: plan.razorpay_plan_id,
    customer_id: customerId,
    total_count: 120, // 10 years by default for SaaS monthly
    customer_notify: 1, // Let Razorpay email them
    notes: { userId: user.id, planId: planId }
  });

  // Keep it locally as "created" (unpaid yet)
  await pool.query(`
    INSERT INTO subscriptions (user_id, plan_id, razorpay_subscription_id, status)
    VALUES ($1, $2, $3, 'created')
    ON CONFLICT (user_id) DO UPDATE SET plan_id = $2, razorpay_subscription_id = $3, status = 'created', updated_at = NOW()
  `, [userId, planId, subscription.id]);

  // Frontend will use this subscription_id to open the Razorpay Checkout modal
  return { subscriptionId: subscription.id };
}

// Razorpay doesn't have a fully managed portal like Stripe, we'll cancel via API directly if requested
async function cancelSubscription(userId) {
  const rzp = getRazorpay();
  if (!rzp) throw Object.assign(new Error("Razorpay not configured"), { statusCode: 503 });

  const subRow = (await pool.query("SELECT razorpay_subscription_id FROM subscriptions WHERE user_id = $1 AND status = 'active'", [userId])).rows[0];
  if (!subRow?.razorpay_subscription_id) throw Object.assign(new Error("No active subscription to cancel"), { statusCode: 400 });

  await rzp.subscriptions.cancel(subRow.razorpay_subscription_id, false); // false = cancel immediately

  await pool.query("UPDATE subscriptions SET status = 'cancelled', updated_at = NOW() WHERE user_id = $1", [userId]);
  await pool.query("UPDATE users SET plan = 'FREE' WHERE id = $1", [userId]);

  return { success: true };
}

async function handleWebhookEvent(event) {
  // Event structure: { event: "subscription.activated", payload: { subscription: { entity: { id, notes, status, current_end } } } }
  const payload = event.payload;

  switch (event.event) {
    case "subscription.activated":
    case "subscription.charged": {
      const sub = payload.subscription.entity;
      const { userId, planId } = sub.notes;
      if (userId && planId) {
        await pool.query("UPDATE users SET plan = $1 WHERE id = $2", [planId, userId]);
        await pool.query(`
          UPDATE subscriptions 
          SET status = 'active', current_period_end = to_timestamp($1), updated_at = NOW()
          WHERE razorpay_subscription_id = $2
        `, [sub.current_end, sub.id]);
      }
      break;
    }
    case "subscription.halted":
    case "subscription.cancelled": {
      const sub = payload.subscription.entity;
      await pool.query("UPDATE subscriptions SET status = 'cancelled', updated_at = NOW() WHERE razorpay_subscription_id = $1", [sub.id]);
      
      const subRow = (await pool.query("SELECT user_id FROM subscriptions WHERE razorpay_subscription_id = $1", [sub.id])).rows[0];
      if (subRow) {
        await pool.query("UPDATE users SET plan = 'FREE' WHERE id = $1", [subRow.user_id]);
      }
      break;
    }
  }
}

async function getInvoices(userId) {
  const rzp = getRazorpay();
  if (!rzp) return [];
  const user = (await pool.query("SELECT razorpay_customer_id FROM users WHERE id = $1", [userId])).rows[0];
  if (!user?.razorpay_customer_id) return [];
  
  try {
    const invoices = await rzp.invoices.all({ customer_id: user.razorpay_customer_id });
    return invoices.items.map(inv => ({
      id: inv.id,
      amount: inv.amount,
      currency: inv.currency,
      status: inv.status,
      created: new Date(inv.created_at * 1000),
      invoiceUrl: inv.short_url,
      pdfUrl: null
    }));
  } catch { return []; }
}

module.exports = { getPlans, getUserPlan, createCheckoutSession, cancelSubscription, handleWebhookEvent, getInvoices };
