# 🎓 Student Curriculum & Activity Tracking System

A full-stack web application for tracking, submitting, and reviewing student co-curricular and extra-curricular activities. It supports three roles — **Student**, **Mentor**, and **Admin** — each with their own dedicated dashboard and workflow.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Roles & Features](#roles--features)
- [Project Structure](#project-structure)
- [Getting Started (Local Setup)](#getting-started-local-setup)
- [Environment Variables](#environment-variables)
- [Default Login Credentials](#default-login-credentials)

---

## Overview

Students can submit activity logs (workshops, internships, projects, volunteer work, etc.) along with file attachments. Assigned mentors review and approve/reject submissions with feedback. Admins manage users, assignments, and generate institutional reports with analytics.

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| TypeScript | 6.x | Type safety |
| Vite | 8.x | Build tool & dev server |
| Tailwind CSS | v4.x | Utility-first styling |
| React Router DOM | v7.x | Client-side routing |
| Framer Motion | 12.x | Animations & transitions |
| Recharts | 3.x | Charts and data visualization |
| React Hook Form | 7.x | Form management |
| Zod | 4.x | Schema validation |
| Axios | 1.x | HTTP client for API calls |
| Lucide React | 1.x | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20.x | Runtime |
| Express.js | 4.x | HTTP server & REST API |
| TypeScript | 5.x | Type safety |
| Prisma ORM | 5.x | Database access & migrations |
| SQLite | — | Local relational database |
| bcryptjs | 2.x | Password hashing |
| JSON Web Tokens | 9.x | Authentication & authorization |
| Multer | 1.x | File upload handling |
| Nodemailer | 6.x | Email notifications (optional) |
| Nodemon | 3.x | Dev auto-restart |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                        │
│          React SPA (Vite + TypeScript)           │
│  ┌──────────────────────────────────────────┐   │
│  │  React Router v7 (Client-Side Routing)   │   │
│  │  /          → Landing Page               │   │
│  │  /login     → Login                      │   │
│  │  /student/* → Student Dashboard Layout   │   │
│  │  /mentor/*  → Mentor Dashboard Layout    │   │
│  │  /admin     → Admin Dashboard            │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │  AuthContext (React Context API)          │   │
│  │  Stores JWT token + user role in state   │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │  Axios API Client (services/api.ts)       │   │
│  │  Sends JWT in Authorization header       │   │
│  └──────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────┘
                     │ HTTP / REST API
                     │ http://localhost:5000/api
                     ▼
┌─────────────────────────────────────────────────┐
│              EXPRESS.JS BACKEND                  │
│  ┌─────────────┐ ┌───────────┐ ┌─────────────┐ │
│  │ /api/auth   │ │/api/activ.│ │ /api/admin  │ │
│  │ login       │ │ submit    │ │ users       │ │
│  │ register    │ │ approve   │ │ reports     │ │
│  │ forgot-pwd  │ │ reject    │ │ audit logs  │ │
│  └─────────────┘ └───────────┘ └─────────────┘ │
│  ┌──────────────────────────────────────────┐   │
│  │       JWT Middleware (auth guard)         │   │
│  │  Verifies token on every protected route  │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │  Multer — Handles file upload to /uploads │   │
│  └──────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│         PRISMA ORM + SQLITE DATABASE            │
│  prisma/schema.prisma defines models            │
│  prisma/migrations/ tracks schema changes       │
│  prisma/dev.db is the local database file       │
└─────────────────────────────────────────────────┘
```

---

## Database Schema

### Models

#### `User`
- Stores all users regardless of role
- `role`: `STUDENT` | `MENTOR` | `ADMIN`
- `mentorId`: self-referential FK — a student is assigned to a mentor

#### `Activity`
- Submitted by a student
- `type`: Workshop, Project, Volunteer, Internship, etc.
- `status`: `SUBMITTED` → `UNDER_REVIEW` → `APPROVED` / `REJECTED`
- `filePath`: path to uploaded file (PDF/image)
- `credits`: number of credits the activity is worth

#### `ActivityApproval`
- One record per mentor review decision
- Stores `decision` (APPROVED/REJECTED) and `feedback` text
- Linked to both `Activity` and the reviewing `User` (mentor)

#### `Report`
- Created by admin
- `data` stores JSON-stringified analytics stats
- `period`: Weekly, Monthly, Semester

#### `AuditLog`
- Tracks every important action performed (login, approval, user creation, etc.)
- Linked to the `User` who performed the action

#### `SystemConfig`
- Key-value store for global app configuration (e.g., max credits allowed, deadline dates)

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/login` | Public | Login with email & password, returns JWT |
| POST | `/register` | Public | Register a new student account |
| POST | `/forgot-password` | Public | Send password reset email |

### Activities — `/api/activities`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Student/Mentor | List activities (filtered by role) |
| POST | `/` | Student | Submit a new activity (with file upload) |
| GET | `/:id` | Student/Mentor | Get activity detail |
| POST | `/:id/review` | Mentor | Move activity to UNDER_REVIEW |
| POST | `/:id/approve` | Mentor | Approve an activity with feedback |
| POST | `/:id/reject` | Mentor | Reject an activity with feedback |
| POST | `/:id/request-revision` | Mentor | Ask student to revise and resubmit |

### Admin — `/api/admin`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin | List all users |
| POST | `/users` | Admin | Create a new user |
| PUT | `/users/:id` | Admin | Update user details |
| DELETE | `/users/:id` | Admin | Deactivate a user |
| GET | `/reports` | Admin | List generated reports |
| POST | `/reports` | Admin | Generate a new report |
| GET | `/audit-logs` | Admin | View system audit logs |
| GET | `/config` | Admin | Get system config values |
| PUT | `/config` | Admin | Update system config |

---

## Roles & Features

### 🧑‍🎓 Student
- **Dashboard**: Overview of submitted activities, credit tally, and status breakdown
- **My Activities**: Paginated list of all submissions with status badges
- **Upload Activity**: Form to submit new activities with file attachment (PDF/image)
- **Activity Detail**: View full submission, attached file, and mentor feedback history
- **Progress Tracking**: Charts showing credit progress toward targets
- **My Reports**: Download personal reports
- **Notifications**: In-app alerts for activity status changes
- **Settings**: Update profile and change password

### 👨‍🏫 Mentor
- **Dashboard**: Overview of assigned students and pending review queue
- **Review Queue**: List of activities awaiting review
- **Review Activity**: Approve, reject, or request revision with written feedback
- **My Students**: View list of assigned students and their submission stats
- **Reports**: View reports for their cohort
- **Settings**: Update profile

### 🛠️ Admin
- **Dashboard**: System-wide analytics — total users, activities, approval rates
- **User Management**: Create, edit, deactivate users; assign students to mentors
- **Activity Overview**: View all activities across all students and mentors
- **Reports**: Generate and download Weekly/Monthly/Semester reports
- **Audit Logs**: Full history of every system action
- **System Config**: Manage global settings (credit limits, deadlines, etc.)

---

## Project Structure

```
Student/
├── .gitignore                    # Root gitignore (covers entire project)
├── README.md
│
├── backend/
│   ├── .env                      # ⛔ NOT pushed to GitHub
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── uploads/                  # Uploaded files (not pushed to GitHub)
│   │   └── .gitkeep
│   ├── prisma/
│   │   ├── schema.prisma         # Database models
│   │   ├── seed.ts               # Seeds default users
│   │   ├── dev.db                # ⛔ Local SQLite DB (not pushed)
│   │   └── migrations/           # ✅ Pushed — lets others recreate DB
│   └── src/
│       ├── server.ts             # Express app entry point
│       ├── auth.ts               # JWT middleware
│       └── routes/
│           ├── auth.ts           # Login, register, forgot-password
│           ├── activities.ts     # Submit, review, approve/reject
│           └── admin.ts          # User mgmt, reports, audit logs
│
└── frontend/
    ├── .env                      # ⛔ NOT pushed to GitHub
    ├── .gitignore
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx              # React entry point
        ├── App.tsx               # Router + protected routes
        ├── index.css             # Tailwind v4 theme tokens
        ├── context/
        │   └── AuthContext.tsx   # JWT + user state (React Context)
        ├── services/
        │   └── api.ts            # Axios client with all API calls
        ├── components/
        │   └── DashboardLayout.tsx  # Sidebar + header shell
        └── pages/
            ├── LandingPage.tsx
            ├── Login.tsx
            ├── Register.tsx
            ├── ForgotPassword.tsx
            ├── StudentDashboard.tsx
            ├── MentorDashboard.tsx
            ├── AdminDashboard.tsx
            ├── student/
            │   ├── MyActivities.tsx
            │   ├── UploadActivity.tsx
            │   ├── ActivityDetail.tsx
            │   ├── ProgressTracking.tsx
            │   ├── MyReports.tsx
            │   ├── Notifications.tsx
            │   └── Settings.tsx
            └── mentor/
                ├── MentorHome.tsx
                ├── ReviewQueue.tsx
                ├── ReviewActivity.tsx
                ├── MyStudents.tsx
                ├── MentorReports.tsx
                └── MentorSettings.tsx
```

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/student-tracker.git
cd student-tracker
```

### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env     # or create .env manually (see below)

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed default users (admin, mentor, student)
npm run prisma:seed

# Start development server
npm run dev
```
> Backend runs at: `http://localhost:5000`

### 3. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env     # or create .env manually (see below)

# Start development server
npm run dev
```
> Frontend runs at: `http://localhost:5173`

---

## Environment Variables

### `backend/.env`
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-strong-secret-key-here"
PORT=5000

# Optional: Gmail SMTP for email notifications
GMAIL_USER=""
GMAIL_PASS=""
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Default Login Credentials

After running `npm run prisma:seed`:

| Role | Email | Password |
|---|---|---|
| 🛠️ Admin | `admin@tracker.com` | `Welcome@123` |
| 👨‍🏫 Mentor | `sharma@tracker.com` | `Welcome@123` |
| 🧑‍🎓 Student | `arjun@tracker.com` | `Welcome@123` |

> ⚠️ Change these passwords in production before deploying.
