const mongoose = require('mongoose');

// Define what a quiz session looks like
const sessionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  sessionCode: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed'],
    default: 'waiting'
  },
  currentQuestionIndex: {
    type: Number,
    default: -1 // -1 means not started
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  participants: [
    {
      participantId: String,
      name: String,
      joinedAt: {
        type: Date,
        default: Date.now
      },
      score: {
        type: Number,
        default: 0
      },
      answers: [
        {
          questionIndex: Number,
          selectedAnswer: Number,
          isCorrect: Boolean,
          answeredAt: Date,
          timeSpent: Number // seconds
        }
      ]
    }
  ],
  settings: {
    timePerQuestion: {
      type: Number,
      default: 30 // seconds
    },
    showLeaderboard: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
