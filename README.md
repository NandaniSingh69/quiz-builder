
# Quiz Builder

Full-stack real-time quiz platform for educators and participants with AI-powered quiz generation.

- Live sessions with Socket.IO
- AI quiz generation (Gemini)
- OTP-based auth
- MongoDB + Redis for data and sessions
- Deployed: Vercel (frontend) + Render (backend)

---

## Stack

**Frontend**

- React, React Router
- Axios
- Socket.IO client

**Backend**

- Node.js, Express
- Socket.IO
- MongoDB Atlas
- Upstash Redis
- Nodemailer
- Gemini API

---

## Setup

### 1. Clone

```
git clone https://github.com/NandaniSingh69/quiz-builder.git
cd quiz-builder
```

### 2. Install

```
# backend
cd server
npm install

# frontend
cd ../client
npm install
```

### 3. Env vars

`server/.env`:

```
PORT=5000
MONGODB_URI=your_mongodb_uri
REDIS_URL=your_redis_url
GEMINI_API_KEY=your_gemini_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
CLIENT_URL=http://localhost:3000
```

`client/.env`:

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## Run locally

```
# backend
cd server
npm run dev

# frontend (new terminal)
cd client
npm start
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

---

## Features (quick)

- Create quizzes (manual + AI)
- Start / manage live sessions
- Join via session code
- Live leaderboard & results
- Basic analytics for educators

---

## License

MIT

