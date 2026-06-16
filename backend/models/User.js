const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  emailVerificationCodeHash: { type: String },
  emailVerificationCodeExpiresAt: { type: Date },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  resetCodeHash: { type: String },
  resetCodeExpiresAt: { type: Date },
  resetVerifiedUntil: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
