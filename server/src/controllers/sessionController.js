const Quiz = require('../models/Quiz');
const Session = require('../models/session');
const redis = require('../config/redis');

/**
 * Start a quiz session
 */
async function startSession(req, res) {
  try {
    const { quizId } = req.body;
    
    // Validate quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }
    
    // Use quiz's session code or generate new one
    const sessionCode = quiz.sessionCode || Math.floor(100000 + Math.random() * 900000).toString();
    
    // Check if session already exists
    let session = await Session.findOne({ quizId, status: { $ne: 'completed' } });
    
    if (session) {
      // Resume existing session
      session.status = 'active';
      session.startedAt = new Date();
      await session.save();
    } else {
      // Create new session
      session = new Session({
        quizId,
        sessionCode,
        status: 'active',
        startedAt: new Date(),
        settings: {
          timePerQuestion: 30
        }
      });
      await session.save();
      
      // Update quiz with session code
      quiz.sessionCode = sessionCode;
      quiz.isActive = true;
      await quiz.save();
    }
    
    console.log(`✅ Session started: ${sessionCode}`);
    
    res.json({
      success: true,
      message: 'Session started successfully',
      session: {
        id: session._id,
        sessionCode: session.sessionCode,
        status: session.status,
        quizTitle: quiz.title,
        totalQuestions: quiz.questions.length
      }
    });
    
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Join a quiz session as participant
 */
async function joinSession(req, res) {
  try {
    const { sessionCode, participantName } = req.body;
    
    if (!sessionCode || !participantName) {
      return res.status(400).json({
        success: false,
        error: 'Session code and participant name are required'
      });
    }
    
    // Find active session
    const session = await Session.findOne({ 
      sessionCode,
      status: { $in: ['waiting', 'active'] }
    }).populate('quizId');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or has ended'
      });
    }
    
    // Generate unique participant ID
    const participantId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if name already exists
    const existingParticipant = session.participants.find(
      p => p.name.toLowerCase() === participantName.toLowerCase()
    );
    
    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        error: 'This name is already taken. Please choose another name.'
      });
    }
    
    // Add participant
    session.participants.push({
      participantId,
      name: participantName,
      score: 0,
      answers: []
    });
    
    await session.save();
    
    console.log(`✅ ${participantName} joined session ${sessionCode}`);
    
    res.json({
      success: true,
      message: 'Joined session successfully',
      participant: {
        participantId,
        name: participantName,
        sessionCode,
        quizTitle: session.quizId.title,
        currentQuestion: session.currentQuestionIndex
      }
    });
    
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Submit an answer
 */
/**
 * Submit an answer (with Socket.IO notification)
 */
/**
 * Submit an answer (with Socket.IO notification)
 */
async function submitAnswer(req, res) {
  try {
    const { sessionCode, participantId, questionIndex, selectedAnswer } = req.body;
    
    // Validate input
    if (!sessionCode || !participantId || questionIndex === undefined || selectedAnswer === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Find session
    const session = await Session.findOne({ sessionCode }).populate('quizId');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Find participant
    const participant = session.participants.find(p => p.participantId === participantId);
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found in this session'
      });
    }
    
    // Check if already answered this question
    const alreadyAnswered = participant.answers.find(a => a.questionIndex === questionIndex);
    
    if (alreadyAnswered) {
      return res.status(400).json({
        success: false,
        error: 'You have already answered this question'
      });
    }
    
    // Get correct answer from quiz
    const question = session.quizId.questions[questionIndex];
    
    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Invalid question index'
      });
    }
    
    const isCorrect = question.correctAnswer === selectedAnswer;
    
    // Calculate points
    const points = isCorrect ? 100 : 0;
    
    // Record answer
    participant.answers.push({
      questionIndex,
      selectedAnswer,
      isCorrect,
      answeredAt: new Date(),
      timeSpent: 0
    });
    
    // Update score
    participant.score += points;
    
    await session.save();
    
    // Update Redis leaderboard
    await updateLeaderboard(sessionCode, participant);
    
    console.log(`✅ ${participant.name} answered Q${questionIndex + 1}: ${isCorrect ? 'Correct ✅' : 'Wrong ❌'} (Score: ${participant.score})`);
    
    // Get Socket.IO instance and emit real-time updates
    const io = req.app.get('io');
    if (io) {
      // Notify about the answer
      io.to(sessionCode).emit('participant-answered', {
        participantName: participant.name,
        isCorrect,
        score: participant.score
      });
      
      // Generate and broadcast updated leaderboard
      const leaderboard = session.participants
        .map(p => ({
          name: p.name,
          score: p.score,
          answeredCount: p.answers.length
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      io.to(sessionCode).emit('leaderboard-update', {
        leaderboard,
        totalParticipants: session.participants.length
      });
      
      console.log(`📡 Broadcasted updates to session ${sessionCode}`);
    } else {
      console.warn('⚠️ Socket.IO instance not found - real-time updates disabled');
    }
    
    res.json({
      success: true,
      message: 'Answer submitted successfully',
      result: {
        isCorrect,
        points,
        totalScore: participant.score,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      }
    });
    
  } catch (error) {
    console.error('❌ Error submitting answer:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


/**
 * Get current leaderboard
 */
async function getLeaderboard(req, res) {
  try {
    const { sessionCode } = req.params;
    
    const session = await Session.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Sort participants by score
    const leaderboard = session.participants
      .map(p => ({
        name: p.name,
        score: p.score,
        answeredCount: p.answers.length
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10
    
    res.json({
      success: true,
      leaderboard,
      totalParticipants: session.participants.length
    });
    
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get session details
 */
async function getSession(req, res) {
  try {
    const { sessionCode } = req.params;
    
    const session = await Session.findOne({ sessionCode }).populate('quizId');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      session: {
        sessionCode: session.sessionCode,
        status: session.status,
        currentQuestion: session.currentQuestionIndex,
        totalQuestions: session.quizId.questions.length,
        participantCount: session.participants.length,
        quizTitle: session.quizId.title
      }
    });
    
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Helper: Update Redis leaderboard
 */
async function updateLeaderboard(sessionCode, participant) {
  try {
    const key = `leaderboard:${sessionCode}`;
    await redis.zadd(key, participant.score, participant.name);
    await redis.expire(key, 86400); // Expire after 24 hours
  } catch (error) {
    console.error('Redis error:', error);
  }
}

/**
 * Reset session to beginning
 */
async function resetSession(req, res) {
  try {
    const { sessionCode } = req.body;
    
    console.log('Resetting session:', sessionCode);
    
    const session = await Session.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Reset session state
    session.currentQuestionIndex = -1;
    session.status = 'active';
    
    // Clear all participant answers and scores
    session.participants.forEach(p => {
      p.answers = [];
      p.score = 0;
    });
    
    await session.save();
    
    console.log(`🔄 Session ${sessionCode} reset to beginning`);
    
    res.json({
      success: true,
      message: 'Session reset successfully',
      session: {
        sessionCode: session.sessionCode,
        currentQuestionIndex: -1
      }
    });
    
  } catch (error) {
    console.error('Error resetting session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get session results with analytics
 */
async function getSessionResults(req, res) {
  try {
    const { sessionCode } = req.params;
    
    console.log('Getting results for session:', sessionCode);
    
    const session = await Session.findOne({ sessionCode })
      .populate({
        path: 'quizId',
        select: 'title questions'
      });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      session: {
        sessionCode: session.sessionCode,
        status: session.status,
        totalQuestions: session.quizId?.questions?.length || 0,
        startedAt: session.startedAt,
        endedAt: session.endedAt
      },
      quizTitle: session.quizId?.title || 'Quiz',
      participants: session.participants.map(p => ({
        participantId: p.participantId,
        name: p.name,
        score: p.score,
        answers: p.answers
      }))
    });
    
  } catch (error) {
    console.error('Error getting session results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  startSession,
  joinSession,
  submitAnswer,
  getLeaderboard,
  getSession,
  resetSession,
  getSessionResults // ADD THIS
};

