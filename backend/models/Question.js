const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  section: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);