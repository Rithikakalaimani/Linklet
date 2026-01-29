# Linklet – URL Shortener

A production-ready URL shortener with auth, analytics, QR codes, and caching. Built with Node.js, React, MongoDB, Redis, and Firebase Auth.

**Live app:** [https://linklett.netlify.app/](https://linklett.netlify.app/)

---

## Tech stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), Redis, Firebase Admin
- **Frontend:** React, Tailwind CSS, React Router, Firebase Auth
- **Deploy:** Frontend on Netlify, backend on Railway

---

## Features

- **Auth** – Sign up / Sign in with Firebase (email & password). Home, Dashboard, and Analytics require login.
- **Shorten URLs** – Paste a long URL, get a short link. Optional custom alias and expiration.
- **QR codes** – Generate and download QR codes for any short link.
- **Analytics** – Clicks, unique visitors, browsers, OS, devices, countries, referrers, time-series charts, map.
- **Dashboard** – List your short URLs, copy/delete/QR/analytics per link; overall stats when logged in.
- **Caching** – Redis cache for redirects and QR codes; MongoDB indexes for read-heavy workload.
- **Security** – Rate limiting, Helmet, URL validation, trust proxy for Railway.

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
