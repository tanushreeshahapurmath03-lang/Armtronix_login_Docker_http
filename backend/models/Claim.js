const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  claimNumber: String,
  date: String,
  employeeName: String,
  employeeID: String,
  location: String,
  expenses: Array,
  advanceReceived: Number,
  adjustments: Number,
  cashReturned: Number,
  paymentStatus: { type: String, default: 'Pending' },
  bills: [{
    data: Buffer,
    contentType: String,
    originalName: String
  }]  
});

module.exports = mongoose.model("Claim", claimSchema);