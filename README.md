# 💼 FreelanceFlow

FreelanceFlow is a full-stack **freelance marketplace and client management platform** built with the **MERN stack** (MongoDB, Express.js, React, Node.js).  
It connects **Clients, Freelancers, and Admins** through dedicated portals — enabling job posting, application tracking, messaging, and project management in a modern, responsive interface.

---

## 🚀 Features

### 🧑‍💼 Client Portal
- Create and manage job postings  
- View and shortlist freelancer profiles  
- Track active, completed, and pending projects  
- Manage account settings and profile information  

### 💻 Freelancer Portal
- Browse and apply for available jobs  
- Manage proposals and active contracts  
- Update portfolio and availability  
- Communicate with clients securely  

### 🛠️ Admin Portal
- Approve or reject projects  
- Manage users (Clients / Freelancers)  
- Review system statistics and dashboards  
- Moderate reported content and feedback  

### 🔐 Authentication & Roles
- JWT-based authentication (Access + Refresh tokens)  
- Role-based access control for Admin, Client, and Freelancer  
- Secure password hashing with bcrypt  

### 💬 Communication
- Real-time messaging (Rooms + Direct Messages)  
- Project discussions per thread  
- Notifications for new applications or updates  

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React 18 + Vite + React Router + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas |
| **Auth** | JWT + bcrypt |
| **UI/UX** | Lucide React Icons, Headless UI, Framer Motion |
| **Deployment** | Frontend: [Vercel](https://vercel.com) <br> Backend: [Render](https://render.com) |

---
## 🎮 Try the demo

The login page has one-click **Client**, **Freelancer** and **Admin** demo buttons. All demo accounts use the password `password123`.

> The API runs on Render's free plan and sleeps when idle, so the first sign-in can take up to a minute.

## 🛠️ Run it locally

You need Node.js 20+ and the [backend](https://github.com/Priyankshah01/freelanceflow-backend) running on port 5000.

```bash
npm install
npm run dev        # http://localhost:5173
```

On localhost the app talks to `http://localhost:5000/api` automatically. To point it at another backend, copy `.env.example` to `.env.local` and set `VITE_API_URL`.

## 🚀 Deploy to Vercel

1. Import this repo in Vercel (framework preset: **Vite**).
2. Add the environment variable `VITE_API_URL` = your backend URL ending in `/api`, e.g. `https://freelanceflow-backend.onrender.com/api`.
3. Deploy. `vercel.json` already sends every route to the React app, so refreshing `/client/dashboard` works.

The backend address is set in one place: [`src/config/api.js`](src/config/api.js).
