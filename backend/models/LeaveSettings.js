const mongoose = require('mongoose');

const LeaveSettingSchema = new mongoose.Schema({
  email: {
    type: String,
    sparse: true, // Allow null for global settings
  },
  isGlobal: {
    type: Boolean,
    default: false
  },
  totalLeaves: {
    type: Number,
    default: 35
  },
  leavesTaken: {
    type: Number,
    default: 0
  },
  // totalAnnualLeaves: {
  //   type: Number,
  //   default: 35
  // },
  lastResetDate: {  // NEW FIELD: Track when the leaves were last reset
    type: Date,
    default: new Date("2025-04-01")  // Example reset date
  }
}, { timestamps: true });

// Virtual for leavesRemaining (calculated field)
LeaveSettingSchema.virtual('leavesRemaining').get(function() {
  return this.totalLeaves - this.leavesTaken;
});

// For including the virtual field in JSON responses
LeaveSettingSchema.set('toJSON', { virtuals: true });
LeaveSettingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('LeaveSetting', LeaveSettingSchema);
