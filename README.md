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

## Cinematic experience update
The existing six-case application is retained. `/` is the cinematic entrance; `/headquarters` opens the original dashboard. Includes original-code demo replays, persistent per-case notebooks, difficulty filters, TRACE progressive hints, reduced-motion support, and hint-adjusted XP. A pre-change source backup is kept in `backup-before-cinematic-*`.

### Validation boundaries
Repairs use a conservative static reference comparison (whitespace and line comments ignored); alternative valid implementations may require manual review. The explanation check requires text, not semantic AI evaluation. Traces are authored walkthroughs of original code, never execution of editor contents. TRACE is rule-based and needs no API key. No real runtime test service is configured.

### Persistence and API
Browser progress uses the existing `ccs-progress` key; notes use `ccs-note-<case ID>`. Optional `VITE_API_URL=https://your-api.example/api` enables the existing Express progress endpoint. Without this setting the frontend is standalone and makes no localhost API calls. Backend progress remains a demo mirror under `local-detective`, not authenticated cross-device synchronization. Do not use this shared key for private multi-user accounts.

### Production / Netlify
Run `npm ci` then `npm run build` inside `frontend`. Deploy this same repository to the existing Netlify site with base `frontend`, build command `npm run build`, and publish directory `dist`. Root `netlify.toml` and `frontend/public/_redirects` configure builds and SPA deep links. Express must be hosted separately if enabled; Netlify static hosting does not run `backend/src/server.js`. Frontend Vite environment values are public: never store secrets in them. No new dependencies were required.
