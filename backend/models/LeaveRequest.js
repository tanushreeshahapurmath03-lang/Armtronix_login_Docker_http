// const mongoose = require("mongoose");

// const leaveSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   designation: String,
//   leaveType: String,
//   startDate: Date,
//   endDate: Date,
//   totalLeaveDays: Number,
//   reason: String,
//   status: { type: String, default: "Pending" },
//   timestamp: { type: Date, default: Date.now }


// });

// module.exports = mongoose.model("LeaveRequests", leaveSchema);




const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  name: String,
  email: String,
  designation: String,
  leaveType: String,
  startDate: Date,
  endDate: Date,
  totalLeaveDays: {
    type: Number,
    min: 0.5 // ✅ allow half-day
  },
    reason: String,
  status: { type: String, default: "Pending" },
  autoApproved: { type: Boolean, default: false }, // Added field to track auto-approval
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LeaveRequests", leaveSchema);
