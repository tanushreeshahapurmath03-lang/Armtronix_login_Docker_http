const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  checkIn: {
    type: Date,
  },
  checkOut: {
    type: Date,
    validate: {
      validator: function(value) {
        // Ensure checkOut time cannot be before checkIn time
        return value >= this.checkIn;
      },
      message: 'Check-out time must be after check-in time',
    },
  },
  status: {
    type: String,
    enum: ['Checked In', 'Half Day', 'Full Day', 'Absent'],
    default: 'Checked In', // Default status is 'Checked In' when the user checks in
  },
  // checkInLocation: {
  //   latitude: Number,
  //   longitude: Number,
  // },
  // checkOutLocation: {
  //   latitude: Number,
  //   longitude: Number,
  // },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
