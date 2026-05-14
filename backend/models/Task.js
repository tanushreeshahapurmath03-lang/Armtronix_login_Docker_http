const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectTitle: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  completedPercentage: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['not-started', 'started', 'in-progress', 'completed', 'completed-pending-approval', 'approved'],
    default: 'not-started'
  },
  rationale: { type: String },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);