const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  empId: { type: String, unique: true, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  BloodGroup: { type: String, default: '' },
  Designation: { type: String, default: '' },
  Gender: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  teams: [{ type: String, default: [] }],
  requirePasswordChange: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);