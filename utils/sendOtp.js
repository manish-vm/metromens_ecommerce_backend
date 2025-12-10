// In production, integrate with real SMS provider (Twilio, MSG91, etc).
// For now, we just generate/stub an OTP.

const otpStore = new Map(); // phone -> {otp, expiresAt}

const generateOtp = (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  console.log(`OTP for ${phone}: ${otp}`); // For dev only
  return otp;
};

const verifyOtp = (phone, otp) => {
  const record = otpStore.get(phone);
  if (!record) return false;
  if (record.expiresAt < Date.now()) return false;
  return record.otp === otp;
};

module.exports = { generateOtp, verifyOtp };
