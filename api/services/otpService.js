const crypto = require("crypto");
const pool = require("../db/pool");
const jwt = require("jsonwebtoken");
const config = require("../config");

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendOtp(email) {
  const otp = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(email, { otp, expiresAt, attempts: 0 });

  // In production, send via email provider
  // For now, log it (and return in dev mode)
  console.log(`[OTP] ${email}: ${otp}`);

  return { sent: true, ...(process.env.NODE_ENV !== "production" ? { otp } : {}) };
}

async function verifyOtp(email, otp) {
  const entry = otpStore.get(email);
  if (!entry) {
    throw Object.assign(new Error("OTP expired or not found. Request a new one."), { statusCode: 400 });
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    throw Object.assign(new Error("OTP expired. Request a new one."), { statusCode: 400 });
  }

  entry.attempts++;
  if (entry.attempts > 5) {
    otpStore.delete(email);
    throw Object.assign(new Error("Too many attempts. Request a new OTP."), { statusCode: 429 });
  }

  if (entry.otp !== otp) {
    throw Object.assign(new Error("Invalid OTP."), { statusCode: 400 });
  }

  otpStore.delete(email);

  // Find or create user
  let result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  let user = result.rows[0];

  if (!user) {
    result = await pool.query(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, 'otp_auth') RETURNING *`,
      [email, email.split("@")[0]]
    );
    user = result.rows[0];
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan },
    token
  };
}

module.exports = { sendOtp, verifyOtp };
