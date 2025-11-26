import api from './api';

// Quiz APIs
export const createQuiz = async (quizData) => {
  const response = await api.post('/api/quiz/create', quizData);
  return response.data;
};

export const getAllQuizzes = async () => {
  const response = await api.get('/api/quiz');
  return response.data;
};

export const getQuizById = async (quizId) => {
  const response = await api.get(`/api/quiz/${quizId}`);
  return response.data;
};

// Session APIs
export const startSession = async (quizId) => {
  const response = await api.post('/api/session/start', { quizId });
  return response.data;
};

export const joinSession = async (sessionCode, participantName) => {
  const response = await api.post('/api/session/join', {
    sessionCode,
    participantName,
  });
  return response.data;
};

export const getSession = async (sessionCode) => {
  const response = await api.get(`/api/session/${sessionCode}`);
  return response.data;
};

export const submitAnswer = async (sessionCode, participantId, questionIndex, selectedAnswer) => {
  const response = await api.post('/api/session/answer', {
    sessionCode,
    participantId,
    questionIndex,
    selectedAnswer,
  });
  return response.data;
};

export const getLeaderboard = async (sessionCode) => {
  const response = await api.get(`/api/session/leaderboard/${sessionCode}`);
  return response.data;
};
