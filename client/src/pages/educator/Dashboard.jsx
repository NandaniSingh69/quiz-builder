import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllQuizzes, startSession } from '../../services/quizService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingSession, setStartingSession] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await getAllQuizzes();
      if (response.success) {
        setQuizzes(response.quizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (quiz) => {
    setStartingSession(quiz._id);
    
    try {
      console.log('Starting session for quiz:', quiz._id);
      
      const response = await startSession(quiz._id);
      
      console.log('Start session response:', response);
      
      if (response.success) {
        await fetchQuizzes();
        navigate(`/educator/session/${response.session.sessionCode}`);
      } else {
        alert('Failed to start session: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error starting session:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to start session';
      alert('Error: ' + errorMessage);
    } finally {
      setStartingSession(null);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/quiz/${quizId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Quiz deleted successfully');
        fetchQuizzes();
      } else {
        alert('Failed to delete quiz: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-orange-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-stone-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Dashboard
                </h1>
                <p className="text-xs text-stone-600" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Manage your quizzes
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-stone-600 hover:text-orange-600 font-semibold transition-colors flex items-center space-x-1"
              style={{ fontFamily: "'Open Sans', sans-serif" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Home</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Total Quizzes
                </p>
                <p className="text-3xl font-bold text-stone-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {quizzes.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Active Sessions
                </p>
                <p className="text-3xl font-bold text-stone-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {quizzes.filter(q => q.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-6">
  <div className="flex items-center space-x-4">
    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
    <div>
      <p className="text-sm text-stone-600 font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>
        Total Participants
      </p>
      <p className="text-3xl font-bold text-stone-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {quizzes.reduce((sum, q) => sum + (q.participants?.length || 0), 0)}
      </p>
    </div>
  </div>
</div>

        </div>

        {/* Create Quiz Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/educator/create-quiz')}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-orange-600 hover:to-orange-700 hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center space-x-3 shadow-xl"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Quiz with AI</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>

        {/* Quiz List */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200">
          <div className="px-6 py-5 border-b-2 border-orange-100">
            <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Your Quizzes
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mb-4"></div>
                <p className="text-stone-600 text-lg font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Loading quizzes...
                </p>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  No quizzes yet
                </h3>
                <p className="text-stone-600 text-lg mb-6" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Create your first AI-powered quiz in seconds!
                </p>
                <button
                  onClick={() => navigate('/educator/create-quiz')}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg inline-flex items-center space-x-2"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Quiz</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="group border-2 border-gray-200 rounded-2xl p-6 hover:border-orange-300 hover:shadow-xl transition-all bg-gradient-to-r from-white to-orange-50/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Quiz Title and Status */}
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-lg">
                            {quiz.questions?.length || 0}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-xl font-bold text-stone-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
                                {quiz.title}
                              </h3>
                              {quiz.isActive && (
                                <span className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border-2 border-green-300">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                  Live
                                </span>
                              )}
                            </div>
                            <p className="text-stone-600 text-sm mb-3 leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                              {quiz.topic}
                            </p>
                          </div>
                        </div>

                        {/* Quiz Meta Info */}
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {quiz.questions?.length || 0} Questions
                          </span>
                          <span className="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {quiz.difficulty}
                          </span>
                          {quiz.sessionCode && (
                            <span className="inline-flex items-center bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold font-mono border border-orange-300">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                              {quiz.sessionCode}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        {/* Start/Resume Button */}
                        <button
                          onClick={() => handleStartSession(quiz)}
                          disabled={startingSession === quiz._id}
                          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center space-x-2 ${
                            startingSession === quiz._id
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : quiz.isActive
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-xl'
                              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl'
                          }`}
                          style={{ fontFamily: "'Nunito', sans-serif" }}
                        >
                          {startingSession === quiz._id ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Starting...</span>
                            </>
                          ) : quiz.isActive ? (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                              <span>Resume</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Start</span>
                            </>
                          )}
                        </button>
                        
                        {/* Results Button */}
                        {quiz.isActive && quiz.sessionCode && (
                          <button
                            onClick={() => navigate(`/educator/results/${quiz.sessionCode}`)}
                            className="bg-blue-100 text-blue-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-200 transition-all flex items-center space-x-2 border-2 border-blue-300"
                            style={{ fontFamily: "'Nunito', sans-serif" }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>Results</span>
                          </button>
                        )}
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          className="bg-red-100 text-red-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-200 transition-all flex items-center justify-center border-2 border-red-300"
                          style={{ fontFamily: "'Nunito', sans-serif" }}
                          title="Delete quiz"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
