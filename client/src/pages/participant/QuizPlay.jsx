import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSocket, initializeSocket } from '../../services/socket';
import { submitAnswer } from '../../services/quizService';
import { SOCKET_EVENTS } from '../../utils/constants';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';


const QuizPlay = () => {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState('waiting');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [quizTitle, setQuizTitle] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = sessionStorage.getItem('soundEnabled');
    return saved === null ? true : saved === 'true';
  });

  const participantId = sessionStorage.getItem('participantId');
  const participantName = sessionStorage.getItem('participantName');

  const playSound = (isCorrect) => {
    if (!soundEnabled) return;
    
    const soundFile = isCorrect ? '/sounds/correct.mp3' : '/sounds/wrong.mp3';
    const audio = new Audio(soundFile);
    audio.volume = 0.4;
    audio.play().catch(err => {
      console.log('Sound play failed:', err);
    });
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    sessionStorage.setItem('soundEnabled', newState.toString());
  };

  // Wrap handleSubmitAnswer in useCallback to prevent infinite loops
  const handleSubmitAnswer = useCallback(async () => {
  if (selectedAnswer === null || hasAnswered) return;

  setHasAnswered(true);

  try {
    const response = await submitAnswer(
      sessionCode,
      participantId,
      currentQuestion.questionIndex,
      selectedAnswer
    );

    if (response.success) {
      setFeedback(response.result);
      setScore(response.result.totalScore);
      
      playSound(response.result.isCorrect);
      
      // Show toast notification
      if (response.result.isCorrect) {
        toast.success(`Correct! +${response.result.points} points`, { icon: '🎉' });
      } else {
        toast.error('Incorrect answer', { icon: '😔' });
      }
      
      if (socket) {
        socket.emit('answer-submitted', {
          sessionCode,
          participantName,
          isCorrect: response.result.isCorrect,
          score: response.result.totalScore
        });
      }
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
    toast.error('Failed to submit answer. Please try again.');
    setHasAnswered(false);
  }
}, [selectedAnswer, hasAnswered, sessionCode, participantId, currentQuestion, socket, participantName, soundEnabled]);


  // Timer countdown effect
  useEffect(() => {
    if (currentQuestion && !hasAnswered && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentQuestion, hasAnswered, timeLeft]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && currentQuestion && !hasAnswered) {
      handleSubmitAnswer();
    }
  }, [timeLeft, currentQuestion, hasAnswered, handleSubmitAnswer]);

  useEffect(() => {
    if (!participantId || !participantName) {
      console.error('No participant data found, redirecting to join page');
      navigate('/join');
      return;
    }

    const socketInstance = initializeSocket();
    setSocket(socketInstance);

    console.log('Joining session:', sessionCode);

    socketInstance.emit(SOCKET_EVENTS.JOIN_SESSION, {
      sessionCode,
      role: 'participant',
      participantId,
      participantName
    });

    const handleSessionState = (data) => {
      console.log('Participant - Session state:', data);
      setQuizTitle(data.quizTitle || '');
      setParticipantCount(data.participantCount || 0);
      
      if (data.status === 'active' && data.currentQuestionIndex >= 0) {
        console.log('Quiz already in progress, requesting current question');
        setGameState('playing');
        socketInstance.emit('get-current-question', { sessionCode });
      }
    };

    const handleQuizStarted = () => {
      console.log('Quiz started! Ready to receive questions.');
      setGameState('playing');
    };

    const handleNewQuestion = (data) => {
      console.log('📝 New question received:', data);
      console.log('Question index:', data.questionIndex);
      console.log('Question text:', data.question.question);
      
      setCurrentQuestion(data);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setFeedback(null);
      setGameState('playing');
      setTimeLeft(data.timeLimit || 30);
    };

    const handleParticipantCount = (data) => {
      console.log('Participant count update:', data.count);
      setParticipantCount(data.count);
    };

    const handleLeaderboardUpdate = (data) => {
      console.log('Leaderboard update:', data);
      setLeaderboard(data.leaderboard || []);
    };

    const handleQuizCompleted = () => {
      console.log('Quiz completed!');
      setGameState('completed');
    };

    socketInstance.on(SOCKET_EVENTS.SESSION_STATE, handleSessionState);
    socketInstance.on(SOCKET_EVENTS.QUIZ_STARTED, handleQuizStarted);
    socketInstance.on(SOCKET_EVENTS.NEW_QUESTION, handleNewQuestion);
    socketInstance.on(SOCKET_EVENTS.PARTICIPANT_COUNT, handleParticipantCount);
    socketInstance.on(SOCKET_EVENTS.LEADERBOARD_UPDATE, handleLeaderboardUpdate);
    socketInstance.on(SOCKET_EVENTS.QUIZ_COMPLETED, handleQuizCompleted);

    return () => {
      console.log('Cleaning up participant socket listeners');
      socketInstance.off(SOCKET_EVENTS.SESSION_STATE, handleSessionState);
      socketInstance.off(SOCKET_EVENTS.QUIZ_STARTED, handleQuizStarted);
      socketInstance.off(SOCKET_EVENTS.NEW_QUESTION, handleNewQuestion);
      socketInstance.off(SOCKET_EVENTS.PARTICIPANT_COUNT, handleParticipantCount);
      socketInstance.off(SOCKET_EVENTS.LEADERBOARD_UPDATE, handleLeaderboardUpdate);
      socketInstance.off(SOCKET_EVENTS.QUIZ_COMPLETED, handleQuizCompleted);
    };
  }, [sessionCode, participantId, participantName, navigate]);

  const handleAnswerSelect = (answerIndex) => {
    if (!hasAnswered) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleLeaveQuiz = () => {
    sessionStorage.removeItem('participantId');
    sessionStorage.removeItem('participantName');
    sessionStorage.removeItem('sessionCode');
    navigate('/');
  };

  // Waiting Screen
  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-orange-200">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {quizTitle || 'Quiz Session'}
          </h1>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-stone-700 mb-2" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              Welcome, <span className="font-bold text-blue-600">{participantName}</span>!
            </p>
            <p className="text-sm text-stone-600" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              Session: <span className="font-mono font-bold text-orange-600">{sessionCode}</span>
            </p>
          </div>
          <p className="text-stone-600 mb-6 text-lg" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            Waiting for quiz to start...
          </p>
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-800 font-bold text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
              👥 {participantCount} {participantCount === 1 ? 'participant' : 'participants'} ready
            </p>
          </div>
          <button
            onClick={handleLeaveQuiz}
            className="text-stone-600 hover:text-orange-600 font-semibold transition-colors"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            ← Leave Quiz
          </button>
        </div>
      </div>
    );
  }

  // Completed Screen
  if (gameState === 'completed') {
    const myRank = leaderboard.findIndex(p => p.name === participantName) + 1;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50 flex items-center justify-center p-4">
        <Confetti recycle={false} numberOfPieces={500} />
        
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full border-2 border-orange-200">
          <div className="text-center mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-6xl">
                {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎉'}
              </span>
            </div>
            <h1 className="text-5xl font-extrabold text-stone-900 mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Quiz Complete!
            </h1>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-6 mb-4">
              <p className="text-lg mb-2" style={{ fontFamily: "'Open Sans', sans-serif" }}>Your Final Score</p>
              <p className="text-6xl font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>{score}</p>
            </div>
            {myRank > 0 && (
              <p className="text-xl text-stone-600" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                You ranked <span className="font-bold text-orange-600">#{myRank}</span> out of {leaderboard.length}
              </p>
            )}
          </div>

          {leaderboard.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-stone-900 mb-4 flex items-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                <svg className="w-7 h-7 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Final Leaderboard
              </h2>
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      player.name === participantName
                        ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-400 shadow-lg scale-105'
                        : index < 3
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300'
                        : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : 
                          <span className="text-2xl font-bold text-stone-600" style={{ fontFamily: "'Nunito', sans-serif" }}>
                            #{index + 1}
                          </span>
                        }
                      </span>
                      <span className={`font-bold text-lg ${player.name === participantName ? 'text-orange-700' : 'text-stone-800'}`} style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {player.name}
                        {player.name === participantName && ' (You)'}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600" style={{ fontFamily: "'Nunito', sans-serif" }}>
                      {player.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleLeaveQuiz}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl text-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Waiting for Next Question
  if (gameState === 'playing' && !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto mb-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 flex justify-between items-center border-2 border-orange-200">
            <div>
              <p className="text-sm text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>Score</p>
              <p className="text-3xl font-bold text-blue-600" style={{ fontFamily: "'Nunito', sans-serif" }}>{score}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-stone-600" style={{ fontFamily: "'Open Sans', sans-serif" }}>{quizTitle}</p>
              <p className="font-bold text-stone-900" style={{ fontFamily: "'Nunito', sans-serif" }}>{participantName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>Players</p>
              <p className="text-3xl font-bold text-purple-600" style={{ fontFamily: "'Nunito', sans-serif" }}>{participantCount}</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border-2 border-orange-200">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Get Ready!
            </p>
            <p className="text-lg text-stone-600 mt-2" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              Waiting for next question...
            </p>
          </div>
        </div>
      </div>
    );
  }

 // Playing - Show Question
return (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50 p-4">
    {feedback && feedback.isCorrect && (
      <Confetti 
        recycle={false} 
        numberOfPieces={200}
        gravity={0.3}
      />
    )}

    {currentQuestion && (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 flex justify-between items-center border-2 border-orange-200">
            <div>
              <p className="text-sm text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>Score</p>
              <p className="text-3xl font-bold text-blue-600" style={{ fontFamily: "'Nunito', sans-serif" }}>{score}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-stone-600" style={{ fontFamily: "'Open Sans', sans-serif" }}>{quizTitle}</p>
              <p className="font-bold text-stone-900" style={{ fontFamily: "'Nunito', sans-serif" }}>{participantName}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSound}
                className="p-2 rounded-xl hover:bg-orange-100 transition-colors border-2 border-gray-200"
                title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              >
                <span className="text-2xl">{soundEnabled ? '🔊' : '🔇'}</span>
              </button>
              
              {!hasAnswered && (
                <div className="flex flex-col items-center">
                  <p className="text-xs text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>Time</p>
                  <div className={`text-4xl font-bold ${
                    timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-green-600'
                  }`} style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {timeLeft}s
                  </div>
                </div>
              )}
              
              {hasAnswered && (
                <div className="flex flex-col items-center">
                  <p className="text-xs text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>Players</p>
                  <p className="text-3xl font-bold text-purple-600" style={{ fontFamily: "'Nunito', sans-serif" }}>{participantCount}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Split Layout: Question Left, Leaderboard Right */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Side - Question (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-orange-200">
              <div className="mb-6">
                <p className="text-sm text-orange-600 font-bold mb-2" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Question {currentQuestion.questionIndex + 1} of {currentQuestion.totalQuestions}
                </p>
                <h2 className="text-3xl font-extrabold text-stone-900 leading-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {currentQuestion.question.question}
                </h2>
              </div>

              <div className="grid gap-4">
                {currentQuestion.question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={hasAnswered}
                    className={`p-5 rounded-xl text-left text-lg font-semibold transition-all border-2 ${
                      selectedAnswer === index
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 transform scale-105 shadow-xl'
                        : hasAnswered && feedback && index === feedback.correctAnswer
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600 shadow-lg'
                        : hasAnswered && selectedAnswer === index && !feedback.isCorrect
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600 shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-300 text-stone-800 hover:border-orange-400 hover:shadow-md'
                    } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                  >
                    <span className="font-bold mr-3 text-xl">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>

              {!hasAnswered && (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className={`w-full mt-6 py-5 rounded-xl text-xl font-bold transition-all shadow-lg ${
                    selectedAnswer === null
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-2xl transform hover:scale-105'
                  }`}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Submit Answer
                </button>
              )}

              {feedback && (
                <div className={`mt-6 p-6 rounded-2xl border-2 ${
                  feedback.isCorrect 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400' 
                    : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-400'
                }`}>
                  <p className={`text-2xl font-bold mb-3 ${
                    feedback.isCorrect ? 'text-green-700' : 'text-red-700'
                  }`} style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {feedback.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                  </p>
                  <p className="text-stone-700 mb-3 leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    {feedback.explanation}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-stone-600" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                      +{feedback.points} points
                    </p>
                    <p className="text-sm text-stone-500" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                      Waiting for next question...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Leaderboard (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-200 sticky top-4">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Leaderboard
              </h3>
              
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="text-stone-500 text-sm" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    Waiting for results...
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {leaderboard.map((player, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-4 rounded-xl transition-all ${
                        player.name === participantName 
                          ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-400 shadow-lg' 
                          : index < 3
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300'
                          : 'bg-gray-50 border-2 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : 
                            <span className="text-lg font-bold text-stone-600" style={{ fontFamily: "'Nunito', sans-serif" }}>
                              #{index + 1}
                            </span>
                          }
                        </span>
                        <div>
                          <span className={`font-bold text-sm ${player.name === participantName ? 'text-orange-700' : 'text-stone-700'}`} style={{ fontFamily: "'Nunito', sans-serif" }}>
                            {player.name}
                          </span>
                          {player.name === participantName && (
                            <p className="text-xs text-orange-600 font-medium">You</p>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-blue-600 text-xl" style={{ fontFamily: "'Nunito', sans-serif" }}>{player.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Custom Scrollbar */}
    <style jsx>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #A855F7;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #9333EA;
      }
    `}</style>
  </div>
);

};

export default QuizPlay;
