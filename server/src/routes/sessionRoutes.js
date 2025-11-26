const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Start a quiz session
router.post('/start', sessionController.startSession);

// Join a session
router.post('/join', sessionController.joinSession);

// Submit an answer
router.post('/answer', sessionController.submitAnswer);

// Get leaderboard
router.get('/leaderboard/:sessionCode', sessionController.getLeaderboard);

// Get session details
router.get('/:sessionCode', sessionController.getSession);

// Reset session to beginning
router.post('/reset', sessionController.resetSession);

// Get session results
router.get('/:sessionCode/results', sessionController.getSessionResults);


module.exports = router;
