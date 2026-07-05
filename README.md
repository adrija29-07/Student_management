# 🎓 Student Curriculum & Activity Tracking System

> A modern, role-based web platform for managing student curriculum activities, mentor verification, institutional reporting, and student skill development.

![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-success)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![ImageKit](https://img.shields.io/badge/File%20Storage-ImageKit-red)

---

# 📖 Overview

Student Curriculum & Activity Tracking System is a centralized platform developed for colleges and universities to digitally manage students' academic, co-curricular, and extracurricular achievements.

Students upload certificates, project links, internship proofs, hackathon participation, sports achievements, research papers, and other accomplishments. Assigned mentors verify these submissions before credits are awarded.

The platform eliminates manual paperwork while providing institutions with analytics, department-wise insights, mentor dashboards, and student progress tracking.

---

# 🎯 Objectives

- Digitize student curriculum activities
- Reduce paperwork and manual verification
- Track credit completion automatically
- Assign mentors to students
- Enable secure certificate verification
- Generate department-wise reports
- Improve student participation in events
- Help mentors monitor assigned students
- Support institutional accreditation requirements

---

# 🚀 Key Features

## 👨‍🎓 Student Portal

- Secure Login & Registration
- Upload Activities
- Certificate Upload (ImageKit)
- GitHub & LinkedIn Links
- Internship Submission
- Research Paper Upload
- QR Attendance Support
- Credit Tracking
- Progress Dashboard
- Activity Timeline
- Skill Gap Detection
- Interested Field Recommendations
- Download Participation Certificates

---

## 👨‍🏫 Mentor Portal

- Assigned Student Dashboard
- Review Queue
- Approve / Reject Activities
- Certificate Preview
- Activity Verification
- Feedback System
- Student Progress Tracking
- Department Insights
- Club & Team Management
- Hackathon Team Builder
- Activity Reports

---

## 👨‍💼 Admin Portal

- User Management
- Mentor Assignment
- Department Management
- Activity Categories
- Analytics Dashboard
- Audit Logs
- Report Generation
- System Configuration
- Institution-wide Statistics

---

# 🏗 System Architecture

```
                    +-----------------------+
                    |     React Frontend    |
                    | Student / Mentor/Admin|
                    +----------+------------+
                               |
                          REST API
                               |
                    +----------▼------------+
                    | Express + Node.js API |
                    | JWT Authentication    |
                    | Prisma ORM            |
                    +----------+------------+
                               |
          +--------------------+--------------------+
          |                                         |
+---------▼----------+                  +-----------▼----------+
|     MongoDB Atlas  |                  |      ImageKit CDN    |
| Users              |                  | Certificates         |
| Activities         |                  | Images               |
| Reports            |                  | Documents            |
| Analytics          |                  +----------------------+
+--------------------+
```

---

# 🖥 Frontend Architecture

```
React
│
├── Components
│      ├── Dashboard Layout
│      ├── Sidebar
│      ├── Activity Cards
│      ├── Charts
│      └── Forms
│
├── Context API
│      └── Authentication
│
├── Services
│      └── API Calls
│
└── Pages
       ├── Student
       ├── Mentor
       ├── Admin
       └── Authentication
```

---

# ⚙ Backend Architecture

```
Express Server
│
├── Routes
│     ├── Auth
│     ├── Activities
│     ├── Mentor
│     ├── Admin
│     └── Reports
│
├── Middleware
│     ├── JWT
│     ├── Role Authorization
│     └── Upload
│
├── Prisma ORM
│
├── Utilities
│     ├── ImageKit
│     ├── Mailer
│     └── Helpers
│
└── MongoDB
```

---

# 📂 Project Structure

```
Student_management
│
├── backend
│   ├── prisma
│   │   ├── schema.prisma
│   │   ├── migrations
│   │   └── seed.ts
│   │
│   ├── src
│   │   ├── routes
│   │   ├── middleware
│   │   ├── utils
│   │   ├── auth.ts
│   │   └── server.ts
│   │
│   ├── package.json
│   └── .env.example
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── services
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

# 💻 Frontend Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI Development |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| React Router | Routing |
| Axios | API Requests |
| React Hook Form | Forms |
| Zod | Validation |
| Recharts | Analytics Charts |
| Framer Motion | Animations |
| Lucide React | Icons |

---

# ⚙ Backend Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | REST APIs |
| TypeScript | Backend Language |
| Prisma ORM | Database ORM |
| MongoDB Atlas | Database |
| JWT | Authentication |
| Multer | File Upload |
| ImageKit | Cloud Storage |
| Nodemailer | Email Notifications |
| bcrypt | Password Encryption |

---

# 🗄 Database Schema

## User

```
User
├── id
├── name
├── email
├── password
├── role
├── department
├── mentorId
├── interestedFields
├── isActive
└── createdAt
```

---

## Activity

```
Activity
├── id
├── studentId
├── category
├── type
├── title
├── description
├── credits
├── githubLink
├── linkedinLink
├── certificateURL
├── status
├── uploadDate
└── updatedAt
```

---

## Activity Approval

```
ActivityApproval
├── id
├── activityId
├── mentorId
├── decision
├── feedback
└── reviewDate
```

---

## Reports

```
Report
├── id
├── adminId
├── period
├── generatedAt
└── data
```

---

## Audit Logs

```
AuditLog
├── id
├── userId
├── action
├── details
└── timestamp
```

---

# 🔄 System Workflow

```
Student Login
      │
      ▼
Upload Activity
      │
      ▼
ImageKit Upload
      │
      ▼
MongoDB Stores Activity
      │
      ▼
Mentor Receives Notification
      │
      ▼
Review Activity
      │
 ┌────┴─────┐
 │          │
 ▼          ▼
Approve   Reject
 │          │
 ▼          ▼
Credits    Feedback
 │
 ▼
Student Dashboard Updated
```

---

# 🔐 Authentication Flow

```
User Login

      │

      ▼

JWT Generated

      │

      ▼

Protected Routes

      │

      ▼

Role Authorization

(Student / Mentor / Admin)
```

---

# ☁ File Storage

All certificates, PDFs, and images are uploaded to **ImageKit CDN**.

Supported formats:

- PDF
- JPG
- PNG
- DOC
- DOCX

Maximum upload size: **10 MB**

---

# 📊 Reports & Analytics

- Student Progress
- Credit Distribution
- Department Performance
- Mentor Workload
- Pending Reviews
- Approval Rate
- Activity Trends
- Skill Gap Analysis

---

# 🛠 Local Setup

## Backend

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev


# 🔮 Future Enhancements

- AI-Based Skill Recommendation
- OCR Certificate Verification
- Duplicate Certificate Detection
- Mobile Application
- Real-time Notifications
- Event Recommendation Engine
- Placement Readiness Dashboard
- AI Resume Builder

---

# 📜 License

This project was developed for academic and institutional purposes.

Commercial usage should comply with the respective licenses of all third-party libraries and services used.
