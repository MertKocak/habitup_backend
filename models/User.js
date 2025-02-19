const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String, default: null },  // Şifre sıfırlama token'ı
  resetPasswordExpires: { type: Date, default: null }   // Token geçerlilik süresi
});

{
    collection: "UserInfo"
}

// Şifreyi kaydetmeden önce hash'le
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

mongoose.model('UserInfo', UserSchema);
