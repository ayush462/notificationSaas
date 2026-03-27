const express = require("express");
const googleAuth = require("../services/googleAuthService");
const otpService = require("../services/otpService");
const router = express.Router();

// Google OAuth — verify token from frontend
router.post("/google", async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: "idToken is required" });

    const payload = await googleAuth.verifyGoogleToken(idToken);
    const data = await googleAuth.googleLogin(payload);
    res.json({ success: true, data });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
    res.status(401).json({ success: false, message: "Google authentication failed" });
  }
});

// OTP — send code
router.post("/otp/send", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "email is required" });
    const data = await otpService.sendOtp(email);
    res.json({ success: true, data });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
    next(e);
  }
});

// OTP — verify code
router.post("/otp/verify", async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: "email and otp are required" });
    const data = await otpService.verifyOtp(email, otp);
    res.json({ success: true, data });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
    next(e);
  }
});

module.exports = router;
