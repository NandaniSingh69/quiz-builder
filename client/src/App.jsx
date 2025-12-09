import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import your pages
import Home from './pages/Home';
import JoinQuiz from './pages/participant/JoinQuiz';
import QuizPlay from './pages/participant/QuizPlay';
import Dashboard from './pages/educator/Dashboard';
import CreateQuiz from './pages/educator/CreateQuiz';
import QuizSession from './pages/educator/QuizSession';
import Results from './pages/educator/Results';

function App() {
  return (
    <Router>
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontFamily: "'Open Sans', sans-serif",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<JoinQuiz />} />
        <Route path="/play/:sessionCode" element={<QuizPlay />} />
        <Route path="/educator/dashboard" element={<Dashboard />} />
        <Route path="/educator/create-quiz" element={<CreateQuiz />} />
        <Route path="/educator/session/:sessionCode" element={<QuizSession />} />
        <Route path="/educator/results/:sessionCode" element={<Results />} />
      </Routes>
    </Router>
  );
}

export default App;
