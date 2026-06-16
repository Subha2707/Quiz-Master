const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  score: { type: Number, required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOptionIndex: { type: Number }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Result', ResultSchema);