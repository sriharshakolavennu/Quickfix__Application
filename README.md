⚡ QuickFix – On-Demand Home Services Platform

Book trusted professionals for cleaning, cooking, baby care, plumbing, electrical work, home repairs, transport and more, at fair, fixed prices.

A full-stack web application (similar to Urban Company) built for customers in Hyderabad, India. It has three roles (Customer, Worker, Admin), a loyalty pricing model, OTP-verified jobs, before/after work photos, automatic billing and a complaint and safety system.

🌐 Live Demo

👉 Live link: PASTE YOUR DEPLOYED LINK HERE

Demo logins are listed in the Demo Accounts section below.

✨ Features
👤 Customer
Sign up, login and logout with a secure password
Browse 15 services: Home Cleaning, Cooking, Baby Care, Plumbing, Electrical, AC Service, Appliance Repair, Carpentry, Pest Control, Water Tank Cleaning, Home Remodelling, Personal Transport, Package Delivery, Moving Services, Emergency Services
Loyalty pricing: booking 1 is the lowest price, booking 2 is a little higher, and from booking 3 onward prices stay moderate and fixed
Fixed upfront price and estimated time for every service
Choose online or offline (cash) payment
Live worker tracking with ETA, and the worker's phone number to call
OTP to start and end the job
Before and after work photos from the worker
Automatic bill (standard price, intro discount, GST) with time taken
Booking history with filters and total paid
Cancellation with the exact fee shown first
Rating and review of workers
Complaint button, SOS button, trusted contacts and a 24/7 helpline
AI-style support assistant with a "Talk to a human" option
Language switcher: English, Telugu, Hindi
👷 Worker
Registration with admin approval
Online/offline toggle, assigned jobs, customer phone number and payment type
Upload a before photo to start and an after photo to finish (required)
OTP verification, earnings dashboard, ratings and penalty tracking
🛠️ Admin
Dashboard with bookings, revenue, complaints, workers and messages
Bookings table with worker phone, customer phone and payment status
Complaint queue (Submitted → Under review → Worker contacted → Resolved)
Worker penalty ladder: warning → fine → suspension → ban
Edit service prices and cancellation rules
Approve, suspend or reactivate workers
🧰 Tech Stack
Layer	Technology
Frontend	HTML, CSS, JavaScript (single-page app)
Backend	Node.js, Express
Database	JSON file (data.json), easy to replace with PostgreSQL/MongoDB
Auth	Scrypt password hashing, signed 7-day tokens
🚀 Run Locally

Requirements: Node.js 18 or newer (nodejs.org)

bash
# 1. Open the project folder in a terminal

# 2. Install dependencies
npm install

# 3. Start the server
npm start

Open http://localhost:3000 in your browser.

A data.json file is created automatically on first run and stores all data. Delete it to reset the app.

🔑 Demo Accounts
Role	Phone	Password
Admin	9999999999	admin123
Worker	9000000001 to 9000000004	worker123
Customer	Use Sign up on the login page	Your own password
Try the full flow
Sign up as a customer and book a service (for example Plumbing in Gachibowli).
Log in as a worker (9000000001). Tap Start trip, upload the before photo, and enter the start OTP shown to the customer.
Upload the after photo and enter the end OTP to finish the job.
Log back in as the customer, open the booking, view the bill and pay.
Log in as admin to see bookings, complaints and pricing.
📁 Project Structure
quickfix/
├── server.js          # API, authentication, pricing engine, worker matching,
│                      # OTP, photos, billing, payments, complaints
├── public/
│   └── index.html     # Web app (served by the backend)
├── package.json
└── README.md
🔒 Security Built In
Passwords hashed with scrypt, never stored as plain text
Signed login tokens that expire after 7 days
Login attempt rate limit
Role checks on every API route
Workers never receive OTPs
Prices, fees and bills are calculated on the server
All inputs validated and sanitised
🔌 Main API

All routes use JSON. Protected routes need the header Authorization: Bearer TOKEN.

Method	Route	Who
POST	/api/signup, /api/login	Public
GET	/api/state	Logged-in user
POST	/api/bookings	Customer
POST	/api/bookings/:id/cancel	Customer
POST	/api/bookings/:id/rate	Customer
POST	/api/bookings/:id/trip	Worker
POST	/api/bookings/:id/photo	Worker
POST	/api/bookings/:id/start and /finish	Worker
POST	/api/bookings/:id/pay	Customer (online) or Worker (cash)
POST	/api/complaints	Customer
POST	/api/messages	Public
POST	/api/complaints/:id/advance	Admin
POST	/api/workers/:id/penalize and /toggle	Admin
POST	/api/prices, /api/rules	Admin
☁️ Deployment

Deploy on Render, Railway or any VPS.

Push the code to GitHub.
Create a new Web Service and connect the repository.
Build command: npm install
Start command: npm start
Add the environment variable SECRET (a long random string).

Note: On free hosting plans the disk can reset, which erases data.json. For permanent data, use a hosted database.

⚠️ Before Going Live
Set the SECRET environment variable and change the admin password.
Replace the JSON file with PostgreSQL, MySQL or MongoDB for many users, and store photos in cloud storage.
Connect a real payment gateway (Razorpay or Cashfree) and an SMS OTP service. Online payment is currently a demo screen and OTPs are shown on screen.
Serve the app over HTTPS.
🗺️ Future Improvements
Subscription plans (monthly cleaning, weekly cook)
Milestone payments for remodelling projects
Real GPS tracking on a map
Push notifications and SMS/WhatsApp alerts
Mobile apps for customers and workers
📄 License

This project is for educational purposes.
