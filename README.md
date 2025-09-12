# FreelanceFlow 💼✨

A full-stack web application designed to connect **freelancers** and **clients** in a seamless marketplace.  
FreelanceFlow provides tools for posting jobs, bidding, managing projects, and handling secure payments.  
This is my **Capstone Project** for HTTP 5213.

---

## 🚀 Features

### Must Have
- [Client] Create and manage job postings  
- [Freelancer] Browse and bid on jobs  
- [All Users] Register, login, and manage profiles  
- [Client ↔ Freelancer] Messaging system  
- [Admin] Manage users and monitor activity  

### Should Have
- [Freelancer] Portfolio showcase  
- [Client] Project tracking dashboard  
- [All Users] Notifications system  
- [Admin] Generate activity reports  

### Nice to Have
- [Freelancer] Skill endorsements and ratings  
- [Client] AI job-posting assistant  
- [All Users] Integrated payment gateway  

---

## 🛠️ Technology Stack

- **Frontend:** React, TailwindCSS  
- **Backend:** Node.js + Express  
- **Database:** MongoDB (MongoDB Atlas for deployment)  
- **Authentication:** JWT (JSON Web Tokens)  
- **Deployment:** Render / Vercel  
- **Other Tools:** Nodemailer (for emails), Cloudinary (for profile images)  

---

## 👥 User Roles

- **Client** → Posts jobs, hires freelancers, manages projects  
- **Freelancer** → Browses jobs, submits proposals, completes work  
- **Admin** → Oversees platform activity, resolves disputes, manages content  

---

## 📊 Data Model (Core Collections)

- **Users** → Stores client & freelancer profiles  
- **Jobs** → Contains job postings and details  
- **Proposals** → Bids submitted by freelancers  
- **Projects** → Active jobs with assigned freelancers  
- **Messages** → Communication between users  
