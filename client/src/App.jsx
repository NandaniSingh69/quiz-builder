import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateQuiz from './pages/educator/CreateQuiz';
import Dashboard from './pages/educator/Dashboard';
import QuizSession from './pages/educator/QuizSession';
import JoinQuiz from './pages/participant/JoinQuiz';
import QuizPlay from './pages/participant/QuizPlay';
import Results from './pages/educator/Results';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/educator/dashboard" element={<Dashboard />} />
          <Route path="/educator/create-quiz" element={<CreateQuiz />} />
          <Route path="/educator/session/:sessionCode" element={<QuizSession />} />
          <Route path="/join" element={<JoinQuiz />} />
          <Route path="/play/:sessionCode" element={<QuizPlay />} />
          <Route path="/educator/results/:sessionCode" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
