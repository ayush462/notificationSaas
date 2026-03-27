const pool = require("../db/pool");
const jwt = require("jsonwebtoken");
const config = require("../config");

/**
 * Google OAuth — verify token from frontend and create/login user.
 */
async function googleLogin(googlePayload) {
  const { sub: googleId, email, name, picture } = googlePayload;

  // Check if user exists by google_id or email
  let result = await pool.query("SELECT * FROM users WHERE google_id = $1 OR email = $2 LIMIT 1", [googleId, email]);
  let user = result.rows[0];

  if (user) {
    // Link Google if not already
    if (!user.google_id) {
      await pool.query("UPDATE users SET google_id = $1, avatar_url = $2, updated_at = NOW() WHERE id = $3", [googleId, picture, user.id]);
    }
  } else {
    // Create new user
    result = await pool.query(
      `INSERT INTO users (email, name, google_id, avatar_url, password_hash)
       VALUES ($1, $2, $3, $4, 'google_oauth')
       RETURNING *`,
      [email, name || email.split("@")[0], googleId, picture]
    );
    user = result.rows[0];
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar_url, plan: user.plan },
    token
  };
}

/**
 * Verify Google ID token from frontend.
 */
async function verifyGoogleToken(idToken) {
  const { OAuth2Client } = require("google-auth-library");
  const client = new OAuth2Client(config.googleClientId);

  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.googleClientId
  });
  return ticket.getPayload();
}

module.exports = { googleLogin, verifyGoogleToken };
