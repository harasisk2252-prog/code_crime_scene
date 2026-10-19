# Code Crime Scene 🔎
An interactive, detective-themed computer science learning platform. Investigate fictional software incidents, inspect evidence, form a diagnosis, and submit a fix.

## Features
- Premium dark dashboard and responsive case library
- Six investigation cases spanning JavaScript, databases, networking, memory, concurrency, and deployment
- Evidence panels, hypotheses, progressive hints, diagnosis, and fix submission
- Case results, XP, rank, streak, and achievements stored in the browser
- Express REST API with optional MongoDB Atlas support
- Works in demo mode without MongoDB credentials (backend uses local JSON persistence)
- No arbitrary server-side code execution: submitted fixes are checked against safe case-specific rules

## Requirements
- Node.js 18+ and npm
- Optional: MongoDB Atlas connection string

## Quick start (Windows PowerShell)
Open two terminals in the project folder.

### Terminal 1 — backend
```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```
The API starts at `http://localhost:5000`.

### Terminal 2 — frontend
```powershell
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite (usually `http://localhost:5173`).

## MongoDB Atlas (optional)
The app works without MongoDB. To use Atlas, edit `backend/.env` and set:
```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER/codecimescene?retryWrites=true&w=majority
```
Restart the backend. If MongoDB cannot connect, the API automatically continues in local JSON demo mode.

## Useful commands
- `npm run dev` in `backend`: run API with nodemon
- `npm start` in `backend`: run API normally
- `npm run dev` in `frontend`: start Vite
- `npm run build` in `frontend`: production build

## Project structure
```text
code-crime-scene/
├── frontend/   # React + Vite UI
├── backend/    # Express API, optional Mongoose models, JSON fallback
├── .gitignore
└── README.md
```

## Notes
- This is an educational prototype. Passwords and submitted fixes are not used to execute untrusted code.
- Demo authentication is intentionally lightweight for a local prototype. Before public deployment, use production-grade session/token handling, rate limiting, secure cookie settings, validation, and security review.
- Keep `.env` private. Commit `.env.example`, never `.env`.
