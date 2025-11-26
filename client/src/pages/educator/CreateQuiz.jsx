import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz } from '../../services/quizService';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    numQuestions: 5,
    difficulty: 'medium',
  });
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedQuiz(null);

    try {
      console.log('Generating quiz with:', formData);
      const response = await createQuiz(formData);
      
      if (response.success) {
        setGeneratedQuiz(response.quiz);
        console.log('Quiz created:', response.quiz);
      } else {
        setError(response.error || 'Failed to create quiz');
      }
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError(err.response?.data?.error || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = () => {
    if (generatedQuiz) {
      navigate('/educator/dashboard');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-orange-200 shadow-sm py-3 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/educator/dashboard')}
              className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow hover:scale-110 transition-transform"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-stone-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Create AI Quiz
              </h1>
              <p className="text-xs text-stone-600" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                Generate questions in seconds ⚡
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/educator/dashboard')}
            className="text-sm text-stone-600 hover:text-orange-600 font-semibold transition-colors"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            Cancel
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {!generatedQuiz ? (
            /* Quiz Generation Form */
            <form onSubmit={handleGenerateQuiz}>
              <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-6">
                {/* Step Indicator */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full text-white text-sm font-bold shadow">
                    1
                  </div>
                  <span className="text-sm font-bold text-stone-700" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    Tell us what to quiz about
                  </span>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 bg-red-50 border-2 border-red-300 text-red-700 px-3 py-2 rounded-lg flex items-start text-sm">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span style={{ fontFamily: "'Open Sans', sans-serif" }}>{error}</span>
                  </div>
                )}

                {/* Quiz Title */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-stone-800 mb-1.5" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    Quiz Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., JavaScript Fundamentals Quiz"
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none text-stone-900 placeholder-stone-400 text-sm"
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                  />
                </div>

                {/* Topic */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-stone-800 mb-1.5" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    Topic / Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="e.g., JavaScript basics including variables, data types, functions, and arrays"
                    rows="3"
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none text-stone-900 placeholder-stone-400 resize-none text-sm"
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                  />
                  <p className="text-xs text-stone-500 mt-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    💡 Be specific for better questions
                  </p>
                </div>

                {/* Difficulty and Questions - Side by Side */}
                
                  {/* Difficulty */}
                  {/* Difficulty Level - Horizontal */}
<div className="mb-4">
  <label className="block text-sm font-bold text-stone-800 mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
    Difficulty Level
  </label>
  <div className="grid grid-cols-3 gap-2">
    {[
      { value: 'easy', label: 'Easy', emoji: '😊', color: 'green' },
      { value: 'medium', label: 'Medium', emoji: '🎯', color: 'orange' },
      { value: 'hard', label: 'Hard', emoji: '🔥', color: 'red' }
    ].map((level) => (
      <button
        key={level.value}
        type="button"
        onClick={() => setFormData({ ...formData, difficulty: level.value })}
        className={`py-2.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center space-x-2 ${
          formData.difficulty === level.value
            ? level.color === 'green'
              ? 'bg-green-500 text-white shadow-lg scale-105 border-2 border-green-600'
              : level.color === 'orange'
              ? 'bg-orange-500 text-white shadow-lg scale-105 border-2 border-orange-600'
              : 'bg-red-500 text-white shadow-lg scale-105 border-2 border-red-600'
            : 'bg-gray-50 text-stone-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
        }`}
        style={{ fontFamily: "'Open Sans', sans-serif" }}
      >
        <span className="text-base">{level.emoji}</span>
        <span>{level.label}</span>
      </button>
    ))}
  </div>


{/* Number of Questions - Full Width Below */}
<div className="mb-5">
  <label className="block text-sm font-bold text-stone-800 mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
    Number of Questions
  </label>
  <div className="relative">
    <select
      name="numQuestions"
      value={formData.numQuestions}
      onChange={handleInputChange}
      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none text-stone-900 appearance-none cursor-pointer font-semibold text-sm bg-white"
      style={{ fontFamily: "'Open Sans', sans-serif" }}
    >
      <option value={3}>3 questions</option>
      <option value={5}>5 questions</option>
      <option value={10}>10 questions</option>
      <option value={15}>15 questions</option>
      <option value={20}>20 questions</option>
    </select>
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
      <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
  <p className="text-xs text-stone-500 mt-2" style={{ fontFamily: "'Open Sans', sans-serif" }}>
    Recommended: 5-7 questions
  </p>
</div>
                  
              </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-bold text-base transition-all transform shadow-lg ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-2xl hover:scale-105'
                  }`}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating with AI...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Generate Quiz with AI</span>
                    </span>
                  )}
                </button>
              </div>
            </form>
          ) : (
  /* Generated Quiz Preview - BIG SCREEN */
  <div className="space-y-4">
    {/* Success Banner */}
    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg">
            ✅
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Quiz Generated Successfully!
            </h3>
            <p className="text-green-50 text-sm" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              Your quiz is ready to use
            </p>
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-xl px-6 py-3">
          <p className="text-xs text-green-50 mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>Session Code</p>
          <p className="text-2xl font-bold text-white font-mono tracking-wider">{generatedQuiz.sessionCode}</p>
        </div>
      </div>
    </div>

    {/* Quiz Info Card */}
    <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-stone-900 mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {generatedQuiz.title}
          </h2>
          <p className="text-stone-600 leading-relaxed mb-4" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            {generatedQuiz.topic}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {generatedQuiz.questionCount} Questions
        </span>
        <span className="inline-flex items-center bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg capitalize">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {generatedQuiz.difficulty} Level
        </span>
        <span className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ~{generatedQuiz.questionCount * 2} minutes
        </span>
      </div>
    </div>

    {/* Questions Preview - BIG SCREEN FORMAT */}
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-xl border-2 border-purple-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "'Nunito', sans-serif" }}>
          📝 Questions Preview
        </h3>
        <span className="text-sm text-stone-600 bg-white px-4 py-2 rounded-full font-semibold shadow" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          {generatedQuiz.questions.length} total
        </span>
      </div>

      <div className="space-y-6">
        {generatedQuiz.questions.map((q, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-shadow">
            {/* Question Number Badge */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {index + 1}
              </div>
              <div className="flex-1">
                {/* Question Text */}
                <h4 className="text-xl font-bold text-stone-900 mb-4 leading-relaxed" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {q.question}
                </h4>

                {/* Options - Large and Clear */}
                <div className="space-y-3">
                  {q.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`group p-4 rounded-xl transition-all border-2 ${
                        optIndex === q.correctAnswer
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-md'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          optIndex === q.correctAnswer
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-white text-stone-700 border-2 border-gray-300'
                        }`}>
                          {String.fromCharCode(65 + optIndex)}
                        </div>
                        <p className={`flex-1 text-base leading-relaxed ${
                          optIndex === q.correctAnswer
                            ? 'text-green-900 font-semibold'
                            : 'text-stone-700'
                        }`} style={{ fontFamily: "'Open Sans', sans-serif" }}>
                          {option}
                        </p>
                        {optIndex === q.correctAnswer && (
                          <div className="flex-shrink-0">
                            <div className="bg-green-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow-md flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Correct</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Explanation - If Available */}
                {q.explanation && (
                  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-blue-900 mb-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
                          Explanation
                        </p>
                        <p className="text-sm text-blue-800 leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Action Buttons - Large and Clear */}
    <div className="grid md:grid-cols-2 gap-4">
      <button
        onClick={handleStartSession}
        className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white py-5 px-8 rounded-2xl text-lg font-bold hover:from-orange-600 hover:to-orange-700 hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center space-x-3 shadow-xl"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span>Go to Dashboard</span>
      </button>
      <button
        onClick={() => {
          setGeneratedQuiz(null);
          setFormData({
            title: '',
            topic: '',
            numQuestions: 5,
            difficulty: 'medium',
          });
          setError('');
        }}
        className="group bg-white border-2 border-gray-300 text-stone-700 py-5 px-8 rounded-2xl text-lg font-bold hover:border-orange-500 hover:text-orange-600 hover:shadow-xl transition-all flex items-center justify-center space-x-3 shadow-lg"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Create Another Quiz</span>
      </button>
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
