# QuickFix – Full-stack home services app

Frontend (HTML/CSS/JS, purple/cyan theme) + Backend (Node.js, Express, REST API, JSON-file database).

## Run
1. Install Node.js 18 or newer from nodejs.org
2. In this folder run:
   npm install
   npm start
3. Open http://localhost:3000

Demo logins: Admin 9999999999 / admin123 | Worker 9000000001 / worker123 (workers 1 to 4) | Customers: use Sign up.
A data.json file is created on first run and holds all data. Delete it to reset.

## Structure
- server.js : API, authentication, pricing engine, worker matching, OTP, photos, billing, payments, complaints
- public/index.html : the web app (served by the backend)

## Security built in
Passwords hashed (scrypt) | signed 7-day login tokens | login rate limit | role checks on every route |
workers never receive OTPs | server computes prices, fees and bills | inputs validated and sanitised.

## Main API (JSON, header Authorization: Bearer TOKEN)
POST /api/signup, /api/login | GET /api/state
POST /api/bookings | /api/bookings/:id/{cancel,trip,photo,start,finish,pay,rate}
POST /api/complaints, /api/messages
Admin: /api/complaints/:id/advance, /api/workers/:id/{penalize,toggle}, /api/prices, /api/rules

## Before going live
- Set environment variable SECRET to a long random string, and change the admin password.
- Replace the JSON file with PostgreSQL/MySQL/MongoDB for many users; store photos in cloud storage.
- Connect a real payment gateway (Razorpay/Cashfree) and an SMS OTP service; serve over HTTPS.
- Deploy on Render, Railway or any VPS (start command: npm start).
