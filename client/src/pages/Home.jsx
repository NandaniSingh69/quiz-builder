import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50 flex flex-col overflow-hidden">
      {/* Header with subtle animation */}
      <header className="bg-white/90 backdrop-blur-md border-b border-orange-200 py-3 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-stone-800" style={{ fontFamily: "'Nunito', sans-serif" }}>
              QuizFlow
            </span>
          </div>
          <button
            onClick={() => navigate('/join')}
            className="text-sm text-stone-600 hover:text-orange-600 font-semibold transition-all hover:translate-x-1"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            Join with code →
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-6">
        <div className="max-w-5xl w-full">
          {/* Hero with animated badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300 rounded-full px-4 py-1.5 mb-4 shadow-sm animate-pulse">
              <span className="text-xs font-bold text-orange-700 flex items-center" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                AI-Powered • Real-Time • Free Forever
              </span>
            </div>
            
            <h1 
              className="text-4xl md:text-5xl font-black text-stone-900 mb-3 leading-tight"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Turn any topic into a
              <span className="block bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                live quiz in 30 seconds ⚡
              </span>
            </h1>
            
            <p 
              className="text-lg text-stone-700 max-w-2xl mx-auto font-medium"
              style={{ fontFamily: "'Open Sans', sans-serif" }}
            >
              AI creates the questions. You get the excitement. Everyone loves it.
            </p>
          </div>

          {/* Interactive Cards with stronger hover */}
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            {/* Teacher Card - More inviting */}
            <div 
              onClick={() => navigate('/educator/create-quiz')}
              className="group relative bg-white border-2 border-orange-200 rounded-2xl p-6 hover:border-orange-500 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
              
              <div className="relative flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-300 rounded-xl flex items-center justify-center text-3xl group-hover:scale-125 transform transition-all duration-300 shadow-lg">
                    👨‍🏫
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 
                      className="text-xl font-black text-stone-900"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      I'm a Teacher
                    </h2>
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  </div>
                  <p 
                    className="text-sm text-stone-600 mb-4 leading-relaxed"
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                  >
                    Create quizzes with AI in seconds. Watch students compete live. Get instant insights.
                  </p>
                  <div className="inline-flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm group-hover:bg-orange-700 transition-all shadow-md group-hover:shadow-lg">
                    <span style={{ fontFamily: "'Open Sans', sans-serif" }}>Create Free Quiz</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Enhanced Features */}
              <div className="relative mt-4 pt-4 border-t border-orange-100 flex flex-wrap gap-2">
                <span className="inline-flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md font-semibold">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  AI Generation
                </span>
                <span className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-semibold">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Live Sessions
                </span>
                <span className="inline-flex items-center text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-semibold">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Reports
                </span>
              </div>
            </div>

            {/* Student Card - More exciting */}
            <div 
              onClick={() => navigate('/join')}
              className="group relative bg-white border-2 border-purple-200 rounded-2xl p-6 hover:border-purple-500 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
              
              <div className="relative flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-50 border-2 border-purple-300 rounded-xl flex items-center justify-center text-3xl group-hover:scale-125 transform transition-all duration-300 shadow-lg">
                    🎮
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 
                      className="text-xl font-black text-stone-900"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      I'm a Student
                    </h2>
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      Fun
                    </span>
                  </div>
                  <p 
                    className="text-sm text-stone-600 mb-4 leading-relaxed"
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                  >
                    Join with a code. Answer live. Compete on the leaderboard. See results instantly.
                  </p>
                  <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm group-hover:bg-purple-700 transition-all shadow-md group-hover:shadow-lg">
                    <span style={{ fontFamily: "'Open Sans', sans-serif" }}>Join Quiz Now</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Enhanced Features */}
              <div className="relative mt-4 pt-4 border-t border-purple-100 flex flex-wrap gap-2">
                <span className="inline-flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md font-semibold">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No Login
                </span>
                <span className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-semibold">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Leaderboard
                </span>
                <span className="inline-flex items-center text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-md font-semibold">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Instant
                </span>
              </div>
            </div>
          </div>

          {/* Social Proof - Makes it feel real */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-6 bg-white/80 backdrop-blur-sm border border-amber-200 rounded-full px-6 py-2 shadow-md">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-bold text-stone-700" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  Loved by 10K+ teachers
                </span>
              </div>
              <div className="h-4 w-px bg-amber-300"></div>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-stone-700" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  ⚡ Setup in 30 seconds
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cleaner Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-orange-200 py-3 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-stone-600">
          <div style={{ fontFamily: "'Open Sans', sans-serif" }}>
            © 2025 QuizFlow • Made for education
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-orange-600 transition-colors font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>Help</a>
            <a href="#" className="hover:text-orange-600 transition-colors font-medium" style={{ fontFamily: "'Open Sans', sans-serif" }}>Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
