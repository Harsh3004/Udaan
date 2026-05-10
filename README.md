<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=220&section=header&text=Udaan&fontSize=100&fontAlignY=38&animation=twinkling&fontColor=fff&desc=उड़ान%20·%20Take%20Flight%20with%20Knowledge&descAlignY=58&descSize=22&descColor=cccccc" />

<br/>

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Groq](https://img.shields.io/badge/Groq_AI-FF6C37?style=for-the-badge&logo=meta&logoColor=white)](https://groq.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://udaan-tawny.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

<h4>
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-dhruv--ai-course-agent">Dhruv AI</a> ·
  <a href="#-real-time-messaging">Messaging</a> ·
  <a href="#-api-reference">API Docs</a>
</h4>

</div>

---

## 📊 At a Glance

<div align="center">

| | |
|---|---|
| 🏗️ **Stack** | MERN + Socket.IO + Groq AI |
| 🤖 **AI Model** | LLaMA 3.3 70B via Groq (streaming) |
| 💳 **Payments** | Razorpay (live) |
| ☁️ **Media** | Cloudinary (video + image) |
| 🔐 **Auth** | JWT + Google OAuth + OTP |
| 🚀 **Frontend** | Vercel |
| ⚙️ **Backend** | Render |

</div>

---

## 🎯 What is Udaan?

**Udaan** *(उड़ान — "flight" in Hindi)* is a full-stack AI-enhanced e-learning platform built for the modern learner. Instructors create rich, structured courses through conversational AI. Students learn with real-time messaging, AI-generated quizzes, discussion forums, and downloadable resources — all in one place.

> *"Every learner deserves a launchpad."*

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🤖 Dhruv — AI Course Creator
Conversational 7-phase agent that guides instructors through course creation via real-time SSE streaming.
- Phase-aware quick-reply chips
- Auto-extracts structured JSON from responses
- Live sidebar showing draft progress
- Powered by **LLaMA 3.3 70B**

</td>
<td width="50%" valign="top">

### 💬 Real-Time Messaging 
Student ↔ Instructor direct messaging per course, powered by Socket.IO.
- Typing indicators & optimistic UI updates
- Read receipts (✓ / ✓✓)
- Unread count badges
- Delete messages & full conversations
- Dedicated `/dashboard/messages` inbox

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🧪 AI Quiz Generator 
Generate MCQ quizzes from any lesson topic instantly.
- Powered by Groq enforced JSON output (`response_format: json_object`)
- Validates 4-option structure server-side
- Context-aware from lesson `aiContext` field
- Configurable question count

</td>
<td width="50%" valign="top">

### 📁 Course Resources 
Instructors attach downloadable files to courses.
- Upload any file type via Cloudinary
- Download counter tracked per resource
- Students access from the lesson panel
- Role-guarded: only instructors can upload/delete

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 💬 Discussion Forums 
Per-course community discussion threads.
- Create, edit, delete discussions
- Auth-gated — enrolled students only
- Displayed inside the course viewer

</td>
<td width="50%" valign="top">

### ⭐ Ratings & Reviews 
Animated star rating modal with review text.
- Interactive hover tooltips (Poor → Excellent)
- 500-char review with live counter
- Unique per user per course (DB index enforced)
- Framer Motion star burst animation

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🧠 In-Lesson AI Assistant
Ask questions mid-video with full lesson context.
- Lesson title + description + instructor `aiContext`
- Markdown-formatted answers
- Timestamped personal notes per subsection
- Persistent across sessions

</td>
<td width="50%" valign="top">

### 💳 Payments & Enrollment
Full Razorpay integration with signature verification.
- Instant enrollment on success
- Transactional email on purchase
- Purchase history dashboard
- Shopping cart with localStorage sync

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🔐 Auth & Security
Multi-strategy authentication with role guards.
- Email + OTP (6-digit, 5-min TTL)
- Google OAuth one-click login
- HTTP-only cookie JWT (3-day expiry)
- bcrypt password hashing (10 rounds)
- Student / Instructor / Admin RBAC

</td>
<td width="50%" valign="top">

### 📈 Progress & Course Management
Full LMS content management.
- Course → Section → Subsection hierarchy
- Draft / Reviewing / Published workflow
- Per-video completion tracking
- Resume from last position
- Instructor analytics dashboard

</td>
</tr>
</table>

---

## 🤖 Dhruv — AI Course Agent

Dhruv is a **7-phase agentic AI** that holds a natural conversation with the instructor and extracts all data needed to build a complete course structure.

```
Phase 1 → Warm greeting & course goal
Phase 2 → Title · Description · Language · Difficulty · Audience
Phase 3 → 3–5 learning outcomes
Phase 4 → Module structure
Phase 5 → Pricing & prerequisites
Phase 6 → Category & tags
Phase 7 → Summary → "Click View Draft"
```

**Technical highlights:**
- **Streaming SSE** — tokens arrive in real time via `text/event-stream`
- **JSON embedding** — every response embeds `[COURSE_DATA]{...}[/COURSE_DATA]` parsed client-side
- **React 18 StrictMode safe** — `hasGreeted` ref prevents double-fire
- **Stale-closure free** — `messagesRef` pattern keeps history always current

---

## 💬 Real-Time Messaging

Powered by **Socket.IO** with a course-scoped chat architecture:

```
Student opens course → InstructorChat panel floats bottom-right
Student sends message → Optimistic UI update → Backend persist → Socket broadcast
Instructor opens /dashboard/messages → sees all conversations with unread badges
Both sides get typing indicators, read receipts, message deletion
```

**Socket events:**
| Event | Direction | Description |
|-------|-----------|-------------|
| `new_message` | Server → Client | Delivers new message in real time |
| `message_deleted` | Server → Client | Removes message from both screens |
| `messages_read` | Server → Client | Marks conversation as read |
| `typing` | Client → Server | Typing indicator broadcast |

---

## 🏗️ Architecture


```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND  (Vercel)                        │
│   React 18 + Vite · Redux Toolkit · React Router v7             │
│   Tailwind CSS · Motion · Socket.IO Client                       │
└──────────────┬──────────────────────────────┬───────────────────┘
               │ REST API                      │ WebSocket (Socket.IO)
               ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND  (Render)                         │
│   Express.js 5 · JWT Middleware · Role Guards                    │
│   Controllers: Auth · Course · AI · Chat · Discussion · Resource │
└──────┬──────────┬──────────┬──────────┬────────────┬────────────┘
       │          │          │          │            │
  MongoDB    Cloudinary  Razorpay   Groq API    Gmail OAuth2
  (Atlas)   (Media)     (Payments) (LLM/AI)    (Email)
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black) React | 18.3.1 | UI framework |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) Vite | 7.1.2 | Build tool |
| ![Redux](https://img.shields.io/badge/-Redux_Toolkit-764ABC?logo=redux&logoColor=white) Redux Toolkit | 2.8.2 | State management |
| ![Router](https://img.shields.io/badge/-React_Router-CA4245?logo=react-router&logoColor=white) React Router | 7.8.1 | Routing |
| ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) Tailwind CSS | 3.4.17 | Styling |
| ![Motion](https://img.shields.io/badge/-Motion-FF0055?logo=framer&logoColor=white) Motion | 12.23.12 | Animations |
| ![Socket.IO](https://img.shields.io/badge/-Socket.IO_Client-010101?logo=socket.io&logoColor=white) Socket.IO Client | — | Real-time messaging |
| ![Axios](https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white) Axios | 1.11.0 | HTTP client |
| ![Google](https://img.shields.io/badge/-Google_OAuth-4285F4?logo=google&logoColor=white) @react-oauth/google | 0.13.5 | Google sign-in |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| ![Express](https://img.shields.io/badge/-Express.js-000000?logo=express&logoColor=white) Express.js | 5.1.0 | Web framework |
| ![Mongo](https://img.shields.io/badge/-Mongoose-880000?logo=mongodb&logoColor=white) Mongoose | 8.17.1 | MongoDB ODM |
| ![Socket.IO](https://img.shields.io/badge/-Socket.IO-010101?logo=socket.io&logoColor=white) Socket.IO | — | WebSocket server |
| ![JWT](https://img.shields.io/badge/-JWT-000000?logo=json-web-tokens&logoColor=white) jsonwebtoken | 9.0.2 | Auth tokens |
| ![bcrypt](https://img.shields.io/badge/-bcrypt-003A70?logo=letsencrypt&logoColor=white) bcrypt | 6.0.0 | Password hashing |
| ![Cloudinary](https://img.shields.io/badge/-Cloudinary-3448C5?logo=cloudinary&logoColor=white) Cloudinary | 2.7.0 | Media & file storage |
| ![Razorpay](https://img.shields.io/badge/-Razorpay-02042B?logo=razorpay&logoColor=white) Razorpay | 2.9.6 | Payment gateway |
| ![Nodemailer](https://img.shields.io/badge/-Gmail_API-EA4335?logo=gmail&logoColor=white) Nodemailer + Gmail | 7.0.5 | Transactional email |

### AI & Intelligence

<p align="center">
<img src="https://img.shields.io/badge/Groq_API-LLaMA_3.3_70B-FF6C37?style=for-the-badge&logo=meta&logoColor=white" />
<img src="https://img.shields.io/badge/SSE_Streaming-Real--time_tokens-4CAF50?style=for-the-badge" />
<img src="https://img.shields.io/badge/JSON_Mode-Enforced_output-9C27B0?style=for-the-badge" />
</p>

---

## 📂 Project Structure

```
Udaan/
├── backend/
│   ├── config/           # DB, Cloudinary, Razorpay setup
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── chatController.js       — Socket.IO messaging
│   │   ├── discussionController.js — Forum threads
│   │   ├── resourceController.js   — File uploads + downloads
│   │   ├── aiController.js         — In Lesson AI + Notes + Quiz 
│   │   ├── dhruvController.js      — 7-phase SSE agent
│   │   ├── payment.js
│   │   └── ...
│   ├── routes/
│   │   ├── chatRoutes.js           
│   │   ├── discussionRoutes.js     
│   │   ├── resourceRoutes.js       
│   │   ├── aiRoutes.js             
│   │   └── ...
│   ├── models/           # Mongoose schemas
│   └── server.js
│
└── frontend/src/
    ├── pages/
    │   ├── Messages.jsx            — Full messaging inbox
    │   ├── ViewCourse.jsx          — Enhanced with Resources, Discussion
    │   └── ...
    ├── components/
    │   ├── InstructorChat.jsx      — Floating chat panel
    │   ├── RatingModal.jsx         — Animated star rating
    │   ├── ViewCourse/
    │   │   ├── Discussion.jsx      
    │   │   ├── Resources.jsx       
    │   │   ├── AiSidebar.jsx
    │   │   └── PersonalNotes.jsx
    │   └── Dasboard/AddCourse/     — Dhruv AI wizard
    └── services/
        └── socketService.js        — Socket.IO client
```

---

## 🌐 API Reference

**Base URL:** `http://localhost:5000/api`

### Auth `/api/auth`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:---:|
| `POST` | `/sendOtp` | Send OTP | ❌ |
| `POST` | `/signUp` | Register | ❌ |
| `POST` | `/login` | Login | ❌ |
| `POST` | `/google-auth` | Google OAuth | ❌ |
| `PUT` | `/changePassword` | Change password | ✅ |
| `PUT` | `/forgotPassword` | Reset link | ❌ |

### Courses `/api/course`
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `GET` | `/` | All courses | Public |
| `POST` | `/create` | Create course | Instructor |
| `PUT` | `/update/:courseId` | Update | Instructor |
| `DELETE` | `/delete/:courseId` | Delete | Instructor |
| `GET` | `/recommended/:courseId` | AI recs | Public |
| `POST` | `/update-course-progress` | Mark complete | Student |

### AI `/api/ai` 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:---:|
| `POST` | `/ask` | In-lesson Q&A | ✅ |
| `POST` | `/generate-quiz` | AI quiz | ✅ |
| `POST` | `/dhruv` | Dhruv SSE stream | ✅ |
| `POST` | `/notes` | Save note | ✅ |
| `GET` | `/notes/:subsectionId` | Get notes | ✅ |
| `DELETE` | `/notes/:noteId` | Delete note | ✅ |

### Messaging `/api/chat` 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:---:|
| `POST` | `/send` | Send message | ✅ |
| `GET` | `/messages/:courseId` | Get messages | ✅ |
| `GET` | `/conversations/student` | Student inbox | Student |
| `GET` | `/conversations/instructor` | Instructor inbox | Instructor |
| `PUT` | `/read/:courseId` | Mark as read | ✅ |
| `GET` | `/check/:courseId` | Chat exists? | ✅ |
| `DELETE` | `/message` | Delete message | ✅ |
| `DELETE` | `/:courseId` | Delete conversation | ✅ |

### Discussions `/api/discussion` 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:---:|
| `POST` | `/create` | Create thread | ✅ |
| `GET` | `/:courseId` | Get threads | ✅ |
| `PUT` | `/update/:discussionId` | Edit | ✅ |
| `DELETE` | `/delete/:discussionId` | Delete | ✅ |

### Resources `/api/resource` 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:---:|
| `POST` | `/upload` | Upload file | Instructor |
| `GET` | `/:courseId` | Get resources | ✅ |
| `DELETE` | `/delete/:resourceId` | Delete | Instructor |
| `PUT` | `/downloads/:resourceId` | Track download | ✅ |

### Payments `/api/payment`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:---:|
| `POST` | `/create-order` | Create order | Student |
| `POST` | `/verify` | Verify signature | Student |

---

## 🎓 User Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Browse, purchase, watch, track progress, message instructor, discuss, download resources, take AI quizzes, write notes & reviews |
| **Instructor** | Dhruv AI course creation, manage content, upload resources, respond to messages, view analytics, publish |
| **Admin** | Manage categories, platform oversight |

---

## 🔐 Auth Flow

```
Email + OTP          Email + Password       Google OAuth
─────────────        ─────────────────      ────────────────
Send OTP (5min TTL)  bcrypt.compare()       @react-oauth/google
  ↓                    ↓                      ↓
Verify OTP           Sign JWT               Verify token → googleapis
  ↓                    ↓                      ↓
Create User          HTTP-only Cookie       Auto-create / Login
  ↓                    ↓                      ↓
             ── Redirect to Dashboard ──
                    Role-based routes
            (isStudent / isInstructor / isAdmin)
```

---

## 📧 Email Triggers

| Event | Template |
|-------|----------|
| Registration | Welcome + onboarding |
| OTP | 6-digit code (5-min expiry) |
| Password Reset | Secure UUID token link |
| Course Purchase | Enrollment confirmation |
| Course Published | Instructor notification |
| Course Deleted | Enrolled student notification |

---

## 📄 License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

<p align="center">
<img src="https://img.shields.io/badge/Groq-Blazing_Fast_AI-FF6C37?style=for-the-badge&logo=meta&logoColor=white" />
<img src="https://img.shields.io/badge/Socket.IO-Real--time_Infra-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
<img src="https://img.shields.io/badge/Cloudinary-Media_Cloud-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
<img src="https://img.shields.io/badge/Razorpay-Payments-02042B?style=for-the-badge&logo=razorpay&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB_Atlas-Cloud_DB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
</p>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=120&section=footer" />

### ⭐ If Udaan helped you, give it a star!

**Udaan** — *उड़ान · Take flight with knowledge* 🚀

Made with ❤️

</div>
