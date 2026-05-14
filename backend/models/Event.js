// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  events: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model('Event', eventSchema);