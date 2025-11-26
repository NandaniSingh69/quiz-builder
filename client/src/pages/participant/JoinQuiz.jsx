import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinSession } from '../../services/quizService';

const JoinQuiz = () => {
  const navigate = useNavigate();
  const [sessionCode, setSessionCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!sessionCode.trim() || !participantName.trim()) {
      setError('Please enter both session code and your name');
      return;
    }

    setLoading(true);
    setError('');

    console.log('Attempting to join session:', sessionCode, participantName);

    try {
      const response = await joinSession(sessionCode, participantName);
      
      console.log('Join response:', response);
      
      if (response.success) {
  sessionStorage.setItem('participantId', response.participant.participantId);
  sessionStorage.setItem('participantName', response.participant.name); // ← Should be .name NOT .participantName
  sessionStorage.setItem('sessionCode', sessionCode);
  
  console.log('✅ Participant data saved:', {
    id: response.participant.participantId,
    name: response.participant.name
  });
  
  navigate(`/play/${sessionCode}`);
}
 else {
        setError(response.error || 'Failed to join session');
      }
      
    } catch (error) {
      console.error('❌ Error joining session:', error);
      setError(error.response?.data?.error || 'Failed to join session. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full border-2 border-orange-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Join Quiz
          </h1>
          <p className="text-stone-600" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            Enter the code to get started
          </p>
        </div>

        <div className="space-y-4">
          {/* Session Code Input */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Session Code <span className="text-orange-600">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none text-center text-2xl font-bold font-mono tracking-widest uppercase"
                style={{ letterSpacing: '0.25em' }}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-2 text-center" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              Get the code from your teacher
            </p>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Your Name <span className="text-orange-600">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                style={{ fontFamily: "'Open Sans', sans-serif" }}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl flex items-start animate-shake">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span style={{ fontFamily: "'Open Sans', sans-serif" }}>{error}</span>
            </div>
          )}

          {/* Join Button */}
          <button
            onClick={handleJoin}
            disabled={loading}
            className={`w-full py-4 rounded-xl text-lg font-bold transition-all transform shadow-xl ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-2xl hover:scale-105'
            }`}
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-3">
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Joining...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Join Quiz</span>
              </span>
            )}
          </button>

          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="w-full text-stone-600 hover:text-orange-600 py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-xs text-stone-500">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span style={{ fontFamily: "'Open Sans', sans-serif" }}>No login needed</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span style={{ fontFamily: "'Open Sans', sans-serif" }}>Instant access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blob Animation Styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default JoinQuiz;
