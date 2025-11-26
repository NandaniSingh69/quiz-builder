const { Server } = require('socket.io');
const Session = require('../models/session');

/**
 * Initialize Socket.IO server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.IO server instance
 */
function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000", // React app URL
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Track active connections
  const activeConnections = new Map(); // sessionCode -> Set of socket IDs

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    /**
     * Educator/Participant joins a session room
     */
    socket.on('join-session', async (data) => {
      try {
        const { sessionCode, role, participantId, participantName } = data;
        
        console.log(`📥 ${role} joining session: ${sessionCode}`);
        
        // Join the Socket.IO room
        socket.join(sessionCode);
        
        // Track connection
        if (!activeConnections.has(sessionCode)) {
          activeConnections.set(sessionCode, new Set());
        }
        activeConnections.get(sessionCode).add(socket.id);
        
        // Store session info in socket
        socket.sessionCode = sessionCode;
        socket.role = role;
        socket.participantId = participantId;
        socket.participantName = participantName;
        
        // Get current session state
        const session = await Session.findOne({ sessionCode })
          .populate({
            path: 'quizId',
            select: 'title questions difficulty topic'
          });
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }
        
        // If participant and not already in session, add them
        if (role === 'participant' && participantName) {
          // Check if participant already exists
          const existingParticipant = session.participants.find(
            p => p.name.toLowerCase() === participantName.toLowerCase()
          );
          
          if (!existingParticipant) {
            // Generate participant ID if not provided
            const newParticipantId = participantId || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Add new participant
            session.participants.push({
              participantId: newParticipantId,
              name: participantName,
              score: 0,
              answers: []
            });
            
            await session.save();
            
            // Update socket's participantId
            socket.participantId = newParticipantId;
            
            console.log(`✅ ${participantName} added to session ${sessionCode}`);
            
            // Send participant their ID
            socket.emit('participant-joined', {
              participantId: newParticipantId,
              participantName: participantName
            });
          } else {
            // Use existing participant's ID
            socket.participantId = existingParticipant.participantId;
            
            socket.emit('participant-joined', {
              participantId: existingParticipant.participantId,
              participantName: existingParticipant.name
            });
          }
        }
        
        // Reload session to get updated participant count
        const updatedSession = await Session.findOne({ sessionCode })
          .populate({
            path: 'quizId',
            select: 'title questions difficulty topic'
          });

        // Send current state to the joining client
        socket.emit('session-state', {
          status: updatedSession.status,
          currentQuestionIndex: updatedSession.currentQuestionIndex,
          participantCount: updatedSession.participants.length,
          quizTitle: updatedSession.quizId?.title,
          totalQuestions: updatedSession.quizId?.questions?.length || 0
        });

        console.log(`Sent session state with ${updatedSession.quizId?.questions?.length} questions`);
        
        // Notify ALL clients in the room about participant count update
        io.to(sessionCode).emit('participant-count', {
          count: updatedSession.participants.length
        });
        
        // Notify educator about new participant
        if (role === 'participant') {
          socket.to(sessionCode).emit('participant-update', {
            action: 'joined',
            participantName: participantName,
            totalParticipants: updatedSession.participants.length
          });
        }
        
        console.log(`✅ ${role} (${participantName || 'educator'}) joined session ${sessionCode}. Total participants: ${updatedSession.participants.length}`);
        
      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    /**
     * Educator starts the quiz
     */
    socket.on('start-quiz', async (data) => {
      try {
        const { sessionCode } = data;
        
        console.log(`🚀 Starting quiz in session: ${sessionCode}`);
        
        const session = await Session.findOne({ sessionCode });
        
        if (session) {
          session.status = 'active';
          // DON'T change currentQuestionIndex - keep it at -1
          // Educator will manually send first question
          await session.save();
          
          // Notify all participants
          io.to(sessionCode).emit('quiz-started', {
            message: 'Quiz is starting!'
          });
          
          console.log(`✅ Quiz started in session ${sessionCode}`);
          console.log(`Current question index: ${session.currentQuestionIndex}`); // Should be -1
        }
        
      } catch (error) {
        console.error('Error starting quiz:', error);
        socket.emit('error', { message: 'Failed to start quiz' });
      }
    });

    /**
     * Educator moves to next question
     */
    socket.on('next-question', async (data) => {
      try {
        const { sessionCode } = data;
        
        console.log(`➡️ Next question in session: ${sessionCode}`);
        
        const session = await Session.findOne({ sessionCode })
          .populate({
            path: 'quizId',
            select: 'title questions difficulty topic'
          });
        
        if (session) {
          const currentIndex = session.currentQuestionIndex;
          const nextIndex = currentIndex + 1;
          
          console.log(`📊 Current index: ${currentIndex}, Moving to: ${nextIndex}, Total: ${session.quizId.questions.length}`);
          
          if (nextIndex < session.quizId.questions.length) {
            // Move to next question
            session.currentQuestionIndex = nextIndex;
            await session.save();
            
            const question = session.quizId.questions[nextIndex];
            
            console.log(`📝 Sending question: "${question.question.substring(0, 50)}..."`);
            
            // Send question to all participants (without correct answer)
            io.to(sessionCode).emit('new-question', {
              questionIndex: nextIndex,
              question: {
                question: question.question,
                options: question.options
              },
              totalQuestions: session.quizId.questions.length,
              timeLimit: session.settings.timePerQuestion
            });
            
            console.log(`✅ Sent question ${nextIndex + 1}/${session.quizId.questions.length} to session ${sessionCode}`);
          } else {
            // Quiz completed
            session.status = 'completed';
            session.endedAt = new Date();
            await session.save();
            
            io.to(sessionCode).emit('quiz-completed', {
              message: 'Quiz completed! Check final results.'
            });
            
            console.log(`🏁 Quiz completed in session ${sessionCode}`);
          }
        }
        
      } catch (error) {
        console.error('❌ Error moving to next question:', error);
        socket.emit('error', { message: 'Failed to load next question' });
      }
    });

    /**
     * Participant submits answer (real-time notification)
     */
    socket.on('answer-submitted', async (data) => {
      try {
        const { sessionCode, participantName, isCorrect, score } = data;
        
        // Notify educator about the submission
        socket.to(sessionCode).emit('participant-answered', {
          participantName,
          isCorrect,
          timestamp: new Date()
        });
        
        // Update and broadcast leaderboard
        const session = await Session.findOne({ sessionCode });
        
        if (session) {
          const leaderboard = session.participants
            .map(p => ({
              name: p.name,
              score: p.score,
              answeredCount: p.answers.length
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
          
          // Broadcast updated leaderboard to everyone
          io.to(sessionCode).emit('leaderboard-update', {
            leaderboard,
            totalParticipants: session.participants.length
          });
        }
        
      } catch (error) {
        console.error('Error handling answer submission:', error);
      }
    });

    /**
     * Get current question
     */
    socket.on('get-current-question', async (data) => {
      try {
        const { sessionCode } = data;
        
        const session = await Session.findOne({ sessionCode }).populate('quizId');
        
        if (session && session.currentQuestionIndex >= 0) {
          const question = session.quizId.questions[session.currentQuestionIndex];
          
          socket.emit('new-question', {
            questionIndex: session.currentQuestionIndex,
            question: {
              question: question.question,
              options: question.options
            },
            totalQuestions: session.quizId.questions.length,
            timeLimit: session.settings.timePerQuestion
          });
        }
        
      } catch (error) {
        console.error('Error getting current question:', error);
      }
    });

    /**
     * Request leaderboard update
     */
    socket.on('request-leaderboard', async (data) => {
      try {
        const { sessionCode } = data;
        
        const session = await Session.findOne({ sessionCode });
        
        if (session) {
          const leaderboard = session.participants
            .map(p => ({
              name: p.name,
              score: p.score,
              answeredCount: p.answers.length
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
          
          socket.emit('leaderboard-update', {
            leaderboard,
            totalParticipants: session.participants.length
          });
        }
        
      } catch (error) {
        console.error('Error getting leaderboard:', error);
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      
      // Clean up tracking
      if (socket.sessionCode && activeConnections.has(socket.sessionCode)) {
        activeConnections.get(socket.sessionCode).delete(socket.id);
        
        // If room is empty, clean up
        if (activeConnections.get(socket.sessionCode).size === 0) {
          activeConnections.delete(socket.sessionCode);
        }
      }
    });

  });

  console.log('✅ Socket.IO server initialized');
  
  return io;
}

module.exports = initializeSocket;
