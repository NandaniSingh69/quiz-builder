const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Test AI connection
router.get('/test-ai', quizController.testAIConnection);

// Create a new quiz with AI
router.post('/create', quizController.createQuiz);

// Get all quizzes
router.get('/', quizController.getAllQuizzes);

// Get specific quiz by ID
router.get('/:id', quizController.getQuizById);

// Delete quiz
router.delete('/:quizId', quizController.deleteQuiz);


module.exports = router;
