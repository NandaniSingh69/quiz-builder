const mongoose = require('mongoose');

// Define what a quiz looks like in the database
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questions: [
    {
      question: {
        type: String,
        required: true
      },
      options: {
        type: [String],
        required: true,
        validate: [arr => arr.length === 4, 'Must have 4 options']
      },
      correctAnswer: {
        type: Number,
        required: true,
        min: 0,
        max: 3
      },
      explanation: {
        type: String
      }
    }
  ],
  createdBy: {
    type: String,
    default: 'educator'
  },
  sessionCode: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  isActive: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the model from the schema
const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
