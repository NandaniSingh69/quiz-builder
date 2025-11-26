import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSocket, initializeSocket } from '../../services/socket';
import { getSession } from '../../services/quizService';
import { SOCKET_EVENTS } from '../../utils/constants';

const QuizSession = () => {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState(null);
  const [quizTitle, setQuizTitle] = useState('Quiz Session');
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [participantCount, setParticipantCount] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const socketInstance = initializeSocket();
    setSocket(socketInstance);

    socketInstance.emit(SOCKET_EVENTS.JOIN_SESSION, {
      sessionCode,
      role: 'educator'
    });

    addActivity('🎯 You joined the session as educator');

    const handleSessionState = (data) => {
      console.log('Educator - Session state:', data);
      console.log('Current index from socket:', data.currentQuestionIndex);
      
      setQuizTitle(data.quizTitle || 'Quiz Session');
      setParticipantCount(data.participantCount || 0);
      setTotalQuestions(data.totalQuestions || 0);
      
      if (data.currentQuestionIndex !== undefined) {
        setCurrentQuestionIndex(data.currentQuestionIndex);
      }
      
      if (data.status === 'active') {
        setQuizStarted(true);
      }
    };

    const handleQuizStarted = () => {
      console.log('Quiz started event received!');
      setQuizStarted(true);
    };

    const handleParticipantCount = (data) => {
      setParticipantCount(data.count);
    };

    const handleParticipantUpdate = (data) => {
      if (data.action === 'joined') {
        addActivity(`👋 ${data.participantName} joined (Total: ${data.totalParticipants})`);
      }
    };

    const handleParticipantAnswered = (data) => {
      const icon = data.isCorrect ? '✅' : '❌';
      addActivity(`${icon} ${data.participantName} answered`);
    };

    const handleLeaderboardUpdate = (data) => {
      console.log('Leaderboard update:', data);
      setLeaderboard(data.leaderboard || []);
    };

    socketInstance.on(SOCKET_EVENTS.SESSION_STATE, handleSessionState);
    socketInstance.on(SOCKET_EVENTS.QUIZ_STARTED, handleQuizStarted);
    socketInstance.on(SOCKET_EVENTS.PARTICIPANT_COUNT, handleParticipantCount);
    socketInstance.on(SOCKET_EVENTS.PARTICIPANT_UPDATE, handleParticipantUpdate);
    socketInstance.on(SOCKET_EVENTS.PARTICIPANT_ANSWERED, handleParticipantAnswered);
    socketInstance.on(SOCKET_EVENTS.LEADERBOARD_UPDATE, handleLeaderboardUpdate);

    fetchSessionData();

    return () => {
      socketInstance.off(SOCKET_EVENTS.SESSION_STATE, handleSessionState);
      socketInstance.off(SOCKET_EVENTS.QUIZ_STARTED, handleQuizStarted);
      socketInstance.off(SOCKET_EVENTS.PARTICIPANT_COUNT, handleParticipantCount);
      socketInstance.off(SOCKET_EVENTS.PARTICIPANT_UPDATE, handleParticipantUpdate);
      socketInstance.off(SOCKET_EVENTS.PARTICIPANT_ANSWERED, handleParticipantAnswered);
      socketInstance.off(SOCKET_EVENTS.LEADERBOARD_UPDATE, handleLeaderboardUpdate);
    };
  }, [sessionCode]);

  const fetchSessionData = async () => {
    try {
      const response = await getSession(sessionCode);
      if (response.success) {
        setQuizTitle(response.session.quizTitle || 'Quiz Session');
        setTotalQuestions(response.session.totalQuestions || 0);
        setCurrentQuestionIndex(response.session.currentQuestion ?? -1);
        setParticipantCount(response.session.participantCount || 0);
        
        if (response.session.status === 'active') {
          setQuizStarted(true);
        }
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const addActivity = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLog(prev => [{
      time: timestamp,
      message
    }, ...prev].slice(0, 10));
  };

  const handleStartQuiz = () => {
    if (socket) {
      socket.emit('start-quiz', { sessionCode });
      setQuizStarted(true);
      addActivity('🚀 Quiz started!');
      console.log('Start quiz clicked, quizStarted set to true');
    }
  };

  const handleNextQuestion = () => {
    if (socket) {
      socket.emit('next-question', { sessionCode });
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      addActivity(`📝 Question ${nextIndex + 1} sent to all participants`);
    }
  };

  const handleEndQuiz = () => {
    navigate('/educator/dashboard');
  };

  const handleResetSession = async () => {
    if (!window.confirm('Are you sure you want to reset this session? All participant data will be cleared.')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/session/reset`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ sessionCode })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Session reset successfully!');
        window.location.reload();
      } else {
        alert('Failed to reset session: ' + data.error);
      }
    } catch (error) {
      console.error('Error resetting session:', error);
      alert('Failed to reset session');
    }
  };

  console.log('Render state:', { quizStarted, currentQuestionIndex, totalQuestions });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-orange-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-stone-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {quizTitle}
                </h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-stone-600" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    Session Code:
                  </p>
                  <span className="font-mono font-bold text-orange-600 text-base bg-orange-100 px-3 py-1 rounded-lg border border-orange-300">
                    {sessionCode}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleResetSession}
                className="bg-yellow-100 text-yellow-700 px-5 py-2.5 rounded-xl hover:bg-yellow-200 transition-all font-bold border-2 border-yellow-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset</span>
              </button>
              <button
                onClick={handleEndQuiz}
                className="bg-red-100 text-red-700 px-5 py-2.5 rounded-xl hover:bg-red-200 transition-all font-bold border-2 border-red-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>End Session</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Participants Card */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 font-medium mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Live Participants
                </p>
                <p className="text-5xl font-bold text-blue-600" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {participantCount}
                </p>
                <div className="flex items-center space-x-1 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-semibold">Connected</span>
                </div>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 font-medium mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Current Question
                </p>
                <p className="text-5xl font-bold text-purple-600" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {currentQuestionIndex === -1 ? '—' : currentQuestionIndex + 1}
                </p>
                <p className="text-sm text-stone-500 mt-2" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  of {totalQuestions} questions
                </p>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className={`rounded-2xl shadow-xl border-2 p-6 hover:shadow-2xl transition-all ${
            quizStarted ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-400' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${quizStarted ? 'text-green-100' : 'text-stone-600'}`} style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Quiz Status
                </p>
                <p className={`text-4xl font-bold ${quizStarted ? 'text-white' : 'text-gray-600'}`} style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {quizStarted ? 'Live' : 'Waiting'}
                </p>
                {quizStarted && (
                  <div className="flex items-center space-x-1 mt-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-100 font-semibold">Active Session</span>
                  </div>
                )}
              </div>
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                quizStarted ? 'bg-white/20 backdrop-blur-sm' : 'bg-gradient-to-br from-gray-400 to-gray-500'
              }`}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {quizStarted ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Control Panel - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Control Card */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-8">
              <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                <svg className="w-7 h-7 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Quiz Controls
              </h2>

              <div className="space-y-4">
                {!quizStarted && currentQuestionIndex === -1 ? (
                  <button
                    onClick={handleStartQuiz}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-6 rounded-2xl text-2xl font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-3"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Start Quiz Now</span>
                  </button>
                ) : quizStarted && currentQuestionIndex === -1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-6 rounded-2xl text-2xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-3"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Send Question 1</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex >= (totalQuestions - 1)}
                      className={`w-full py-6 rounded-2xl text-2xl font-bold transition-all transform shadow-xl flex items-center justify-center space-x-3 ${
                        currentQuestionIndex >= (totalQuestions - 1)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105'
                      }`}
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      {currentQuestionIndex >= (totalQuestions - 1) ? (
                        <>
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>All Questions Sent</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Send Question {currentQuestionIndex + 2}</span>
                        </>
                      )}
                    </button>
                    
                    {/* Progress Bar */}
                    <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                      Progress: {currentQuestionIndex + 1} of {totalQuestions} questions sent
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Activity Log - Takes 1 column */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-green-200 p-6">
            <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
              <span className="animate-pulse mr-2 text-green-500">●</span>
              Live Activity
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
              {activityLog.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    Waiting for activity...
                  </p>
                </div>
              ) : (
                activityLog.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-start p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-orange-200 transition-colors"
                  >
                    <span className="text-xs text-stone-500 font-mono mr-3 mt-1 flex-shrink-0" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                      {activity.time}
                    </span>
                    <span className="text-sm text-stone-700 leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                      {activity.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #EA580C;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #C2410C;
        }
      `}</style>
    </div>
  );
};

export default QuizSession;
