/**
 * When ADMIN_SECRET is set in env, require header x-admin-secret to match.
 * Use for dashboard / key management. Omit ADMIN_SECRET in dev to allow open access.
 */
module.exports = function adminMiddleware(req, res, next) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return next();
  }
  const provided = req.headers["x-admin-secret"];
  if (provided !== secret) {
    return res.status(401).json({ success: false, message: "Invalid or missing x-admin-secret" });
  }
  return next();
};
