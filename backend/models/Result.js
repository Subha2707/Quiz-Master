const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  score: { type: Number, required: true },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  unanswered: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOptionIndex: { type: Number }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Result', ResultSchema);
