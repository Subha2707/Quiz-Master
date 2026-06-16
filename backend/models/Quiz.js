const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  durationMinutes: { type: Number, required: true },
  negativeMarkingWeight: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);