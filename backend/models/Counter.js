const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 1 }, // Start from 1 or any desired number
});

module.exports = mongoose.model('Counter', counterSchema);
