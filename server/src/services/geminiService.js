const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use the latest stable Flash model with JSON mode
const model = genAI.getGenerativeModel({ 
  model: 'gemini-flash-latest',
  generationConfig: {
    responseMimeType: "application/json" // Force JSON output
  }
});

/**
 * Generate quiz questions from a topic using AI
 * @param {string} topic - The topic/subject for the quiz
 * @param {number} numQuestions - How many questions to generate
 * @param {string} difficulty - easy, medium, or hard
 * @returns {Promise<Array>} Array of quiz questions
 */
async function generateQuizQuestions(topic, numQuestions = 5, difficulty = 'medium') {
  try {
    // Create a detailed prompt for the AI
    const prompt = `Generate ${numQuestions} multiple-choice quiz questions about "${topic}" with ${difficulty} difficulty level.

Return a JSON array where each question has:
- question: the question text
- options: array of 4 answer choices
- correctAnswer: index (0-3) of the correct option
- explanation: brief explanation of the correct answer

Example format:
[
  {
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": 1,
    "explanation": "2 + 2 equals 4"
  }
]`;

    // Call Gemini AI
    console.log(`🤖 Generating ${numQuestions} ${difficulty} questions about: ${topic}`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ AI Response received');
    
    // Parse JSON (should be clean now because of responseMimeType)
    const questions = JSON.parse(text);
    
    // Validate
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('AI returned empty or invalid array');
    }
    
    // Validate each question
    questions.forEach((q, index) => {
      if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${index + 1} is missing required fields`);
      }
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Question ${index + 1} has invalid correctAnswer: ${q.correctAnswer}`);
      }
    });
    
    console.log(`✅ Generated ${questions.length} valid questions`);
    return questions;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
}

/**
 * Test function to verify AI is working
 */
async function testAI() {
  try {
    const prompt = "Say hello and confirm you're working!";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('AI test failed:', error);
    throw error;
  }
}

module.exports = {
  generateQuizQuestions,
  testAI
};
