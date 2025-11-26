export const ROUTES = {
  HOME: '/',
  EDUCATOR_DASHBOARD: '/educator/dashboard',
  CREATE_QUIZ: '/educator/create-quiz',
  QUIZ_SESSION: '/educator/session/:sessionCode',
  RESULTS: '/educator/results/:sessionCode',
  JOIN_QUIZ: '/join',
  QUIZ_PLAY: '/play/:sessionCode',
  QUIZ_RESULTS: '/results/:sessionCode',
};

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

export const SESSION_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

export const SOCKET_EVENTS = {
  JOIN_SESSION: 'join-session',
  SESSION_STATE: 'session-state',
  PARTICIPANT_COUNT: 'participant-count',
  QUIZ_STARTED: 'quiz-started',
  NEW_QUESTION: 'new-question',
  PARTICIPANT_ANSWERED: 'participant-answered',
  LEADERBOARD_UPDATE: 'leaderboard-update',
  QUIZ_COMPLETED: 'quiz-completed',
  PARTICIPANT_JOINED: 'participant-joined',
  PARTICIPANT_UPDATE: 'participant-update',
};
