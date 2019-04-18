const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  },

  password: {
    type: String, required: true,
  },
  isVerified: {
    type: Boolean, required: true, default: false,
  },
  verificationToken: {
    type: String, required: false,
  },
  publicKey: {
    type: String, required: true,
  },
});

module.exports = mongoose.model('User', UserSchema);
