const { generateQuizQuestions, testAI } = require('../services/geminiService');
const Quiz = require('../models/Quiz');
const Session = require('../models/session');


/**
 * Test if AI is working
 */
async function testAIConnection(req, res) {
  try {
    const response = await testAI();
    res.json({ 
      success: true, 
      message: 'AI is working!', 
      aiResponse: response 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * Generate a new quiz using AI
 */
async function createQuiz(req, res) {
  try {
    // Get data from the request body
    const { title, topic, numQuestions, difficulty } = req.body;
    
    // Validate input
    if (!title || !topic) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title and topic are required' 
      });
    }
    
    console.log(`Creating quiz: ${title} about ${topic}`);
    
    // Generate questions using AI
    const questions = await generateQuizQuestions(
      topic, 
      numQuestions || 5, 
      difficulty || 'medium'
    );
    
    // Generate a unique 6-digit session code
    const sessionCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to database
    const quiz = new Quiz({
      title,
      topic,
      difficulty: difficulty || 'medium',
      questions,
      sessionCode,
      isActive: false
    });
    
    await quiz.save();
    
    console.log(`Quiz created successfully with code: ${sessionCode}`);
    
    // Send response
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully!',
      quiz: {
        id: quiz._id,
        title: quiz.title,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        sessionCode: quiz.sessionCode,
        questionCount: quiz.questions.length,
        questions: quiz.questions // Include questions in response
      }
    });
    
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * Get all quizzes
 */
/**
 * Get all quizzes
 */
async function getAllQuizzes(req, res) {
  try {
    const quizzes = await Quiz.find()
      .sort({ createdAt: -1 })
      .select('title topic difficulty sessionCode isActive createdAt questions');
    
    // Get participant count for each quiz from sessions
    const quizzesData = await Promise.all(
      quizzes.map(async (quiz) => {
        let participantCount = 0;
        
        // If quiz has an active session, get participant count
        if (quiz.sessionCode) {
          try {
            const Session = require('../models/session'); // Import here or at top
            const session = await Session.findOne({ sessionCode: quiz.sessionCode });
            if (session && session.participants) {
              participantCount = session.participants.length;
            }
          } catch (err) {
            console.log('Could not fetch session for:', quiz.sessionCode, err.message);
          }
        }
        
        return {
          _id: quiz._id,
          title: quiz.title,
          topic: quiz.topic,
          difficulty: quiz.difficulty,
          sessionCode: quiz.sessionCode,
          isActive: quiz.isActive,
          createdAt: quiz.createdAt,
          questions: quiz.questions || [],
          questionCount: quiz.questions?.length || 0,
          participantCount: participantCount
        };
      })
    );
    
    res.json({
      success: true,
      count: quizzesData.length,
      quizzes: quizzesData
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}



/**
 * Get a specific quiz by ID
 */
async function getQuizById(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        error: 'Quiz not found' 
      });
    }
    
    res.json({
      success: true,
      quiz
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
/**
 * Delete a quiz
 */
async function deleteQuiz(req, res) {
  try {
    const { quizId } = req.params;
    
    console.log('Deleting quiz:', quizId);
    
    const quiz = await Quiz.findByIdAndDelete(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }
    
    // Also delete associated session if exists
    if (quiz.sessionCode) {
      await Session.findOneAndDelete({ sessionCode: quiz.sessionCode });
    }
    
    console.log('Quiz deleted:', quizId);
    
    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  testAIConnection,
  createQuiz,
  getAllQuizzes,
  getQuizById,
  deleteQuiz // ADD THIS
};
