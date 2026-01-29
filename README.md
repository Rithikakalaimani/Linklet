# Linklet – URL Shortener

A production-ready URL shortener with auth, analytics, QR codes, and caching. Built with Node.js, React, MongoDB, Redis, and Firebase Auth.

**Live app:** [https://linklett.netlify.app/](https://linklett.netlify.app/)

---

## Tech stack

- **Backend:** Node.js, Express, MongoDB, Redis, Firebase Admin
- **Frontend:** React, Tailwind CSS, Axios, React Router, Firebase Auth
- **Deploy:** Frontend on Netlify, backend on Railway

---
## Features

### Authentication
- Sign up and sign in with **Firebase** (email/password)
- Protected routes: Home, Dashboard, and Analytics require login
- Forgot password flow
- Header shows Sign In / Sign Up when logged out; Home, Dashboard, Sign Out when logged in

### URL Shortening
- Paste a long URL and get a short link (Base62 encoding)
- Optional **custom alias** (3–20 characters)
- Optional **expiration** (TTL in days)
- Copy short URL, delete link, generate/download **QR code** per link

### Analytics
- **Per-link:** total clicks, unique visitors, clicks by day, browser, OS, device, country, referrer
- **Dashboard:** overall stats when logged in; list of your short URLs with actions
- Time-series charts and world map (Recharts, react-simple-maps)
- User-agent and geo parsing for devices and locations

### Backend & Performance
- **MongoDB** for URLs and analytics; **Redis** for caching redirects and QR codes
- Rate limiting, Helmet, CORS, URL validation
- Trust proxy for Railway; Firebase Admin for token verification

---

## Screenshots


![Home](https://github.com/Rithikakalaimani/Linklet/blob/main/screenshots/Screenshot%202026-01-29%20at%204.35.47%E2%80%AFPM.png) 
![dashoard](https://github.com/Rithikakalaimani/Linklet/blob/main/screenshots/Screenshot%202026-01-29%20at%202.44.30%E2%80%AFPM.png) 
![visits](https://github.com/Rithikakalaimani/Linklet/blob/main/screenshots/Screenshot%202026-01-29%20at%202.44.44%E2%80%AFPM.png) 
![Pie](https://github.com/Rithikakalaimani/Linklet/blob/main/screenshots/Screenshot%202026-01-29%20at%202.45.04%E2%80%AFPM.png)
![Location](https://github.com/Rithikakalaimani/Linklet/blob/main/screenshots/Screenshot%202026-01-29%20at%202.45.20%E2%80%AFPM.png) 
![Qrcode](https://github.com/Rithikakalaimani/Linklet/blob/main/screenshots/Screenshot%202026-01-29%20at%202.45.31%E2%80%AFPM.png) 

## Run locally

1. **Install:** `npm run install-all`
2. **Env:** Create `.env` with `PORT`, `MONGODB_URI`, `REDIS_HOST`, `BASE_URL`, `FRONTEND_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_JSON`. For client, use Firebase config or `REACT_APP_*` (see `ENVIRONMENT_VARIABLES.md`).
3. **Start:** `npm run dev` (server + client)
4. **URLs:** Frontend http://localhost:3000, API http://localhost:5000

---

## Project layout

- `server/` – Express API, URL & analytics routes, Firebase Admin auth, Redis/Mongo
- `client/` – React app (Home, Dashboard, Analytics, Login, Signup, Forgot password)
- `screenshots/` – App screenshots for README

---

## License

MIT.
