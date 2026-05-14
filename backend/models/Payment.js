const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  claimNumber: String,
  employeeName: String,
  paymentType: String,
  utrNumber: String,
  amount: Number,
  status: { type: String, default: 'Pending' },
  paymentDate: { type: Date}
});

module.exports = mongoose.model("Payment", paymentSchema);