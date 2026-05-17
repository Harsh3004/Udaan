<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=220&section=header&text=Udaan&fontSize=100&fontAlignY=38&animation=twinkling&fontColor=fff&desc=उड़ान%20·%20Take%20Flight%20with%20Knowledge&descAlignY=58&descSize=22&descColor=cccccc" />

<br/>

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Groq](https://img.shields.io/badge/Groq_AI-FF6C37?style=for-the-badge&logo=meta&logoColor=white)](https://groq.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://udaan-tawny.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<h4>
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-dhruv--ai-course-agent">Dhruv AI</a> ·
  <a href="#-ai-course-review">AI Review</a> ·
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
| 🤖 **AI Model** | LLaMA 3.3 70B + Whisper (via Groq) |
| 💳 **Payments** | Razorpay (paid) + Free enrollment |
| ☁️ **Media** | Cloudinary (video, image, files) |
| 🔐 **Auth** | JWT + Google OAuth + Email OTP |
| 🚀 **Deploy** | Vercel (FE) · Render (BE) · MongoDB Atlas |

</div>

---

## 🎯 What is Udaan?

**Udaan** *(उड़ान — "flight" in Hindi)* is a full-stack AI-enhanced e-learning platform. Instructors create rich courses through a conversational AI agent or a manual form — their choice. Students learn with real-time instructor messaging, AI quizzes, discussion forums, downloadable resources, personal notes, and now **AI-generated course quality reviews powered by video transcription**.

> *"Every learner deserves a launchpad."*

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🤖 Dhruv — AI Course Creator
Conversational 7-phase agent guiding instructors via real-time SSE streaming.
- **CoursePathModal** — choose Dhruv AI **or** Manual form at creation
- Phase-aware quick-reply chips
- Extracts structured JSON embedded in LLM responses
- Live sidebar shows draft progress in real time

</td>
<td width="50%" valign="top">

### 🔍 AI Course Review 
Automated quality scoring for published courses using video transcription.
- **Groq Whisper** transcribes every lesson video (32k bitrate MP3)
- **LLaMA 3.3 70B** summarises transcripts then evaluates the full course
- Returns `score` (1–100) · `summary` · `strengths[]` · `weaknesses[]`
- Result persisted in `course.aiReview` on MongoDB

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 💬 Real-Time Messaging
Student ↔ Instructor direct chat per course via Socket.IO.
- JWT-authenticated socket rooms (`user:<id>`, `course:<id>`)
- Typing indicators (`typing` / `user_typing` events)
- Read receipts · optimistic UI updates
- Unread badges · delete messages & conversations
- Dedicated `/dashboard/messages` inbox page

</td>
<td width="50%" valign="top">

### 🧪 AI Quiz Generator
Instant MCQ quizzes from any lesson topic.
- Groq `response_format: json_object` enforces valid JSON
- Server-side validation of 4-option structure
- Context from lesson `title`, `description`, `aiContext`
- Configurable question count per request

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 📁 Course Resources
Instructors attach downloadable files to their courses.
- Any file type via Cloudinary
- Download counter tracked per resource
- Students access files from the lesson sidebar
- Role-guarded: only instructors can upload/delete

</td>
<td width="50%" valign="top">

### 💬 Discussion Forums
Per-course community discussion threads.
- Create, edit, delete discussions
- Auth-gated — enrolled students only
- Rendered inside the immersive course viewer

</td>
</tr>
<tr>
<td width="50%" valign="top">

###  Ratings & Reviews
Animated star rating modal.
- Hover tooltips (Poor → Excellent)
- 500-char review with live counter
- Unique per {user, course} enforced by DB index
- Framer Motion star burst animation

</td>
<td width="50%" valign="top">

### 🧠 In-Lesson AI Assistant
Ask questions mid-video with full lesson context.
- Grounded in lesson `title` + `description` + instructor `aiContext`
- Markdown-formatted streaming answers
- Personal timestamped notes per subsection
- Notes persist across sessions

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 💳 Payments & Free Enrollment
Full Razorpay + free-course flow.
- Paid: Razorpay order → signature verify → enroll
- Free: `POST /payment/enroll-free` — instant enrollment
- Purchase history dashboard
- Shopping cart with localStorage sync

</td>
<td width="50%" valign="top">

### 🔐 Auth & Security
Multi-strategy auth with full RBAC.
- Email OTP (6-digit, 5-min TTL via MongoDB TTL index)
- Google OAuth one-click (`@react-oauth/google`)
- HTTP-only cookie JWT (3-day expiry)
- bcrypt hashing (10 rounds)
- Student / Instructor / Admin role guards

</td>


</tr>
</table>

---

## 🤖 Dhruv — AI Course Agent

Dhruv is a **7-phase agentic AI** that holds a natural conversation and extracts all data needed to build a complete course.

```
Phase 1 → Warm greeting & course goal
Phase 2 → Title · Description · Language · Difficulty · Audience
Phase 3 → 3–5 learning outcomes
Phase 4 → Module & section structure
Phase 5 → Pricing & prerequisites
Phase 6 → Category & tags
Phase 7 → Summary confirmation → "Click View Draft"
```

**How it works:**
- **SSE Streaming** — tokens arrive via `text/event-stream`, rendered in real time
- **JSON embedding** — responses wrap course data in `[COURSE_DATA]{...}[/COURSE_DATA]`
- **CoursePathModal** — new gated entry: instructor picks *Dhruv AI* or *Manual Form*
- **React 18 safe** — `hasGreeted` ref prevents StrictMode double-fire
- **Stale-closure free** — `messagesRef` pattern keeps history current across renders

---

## 🔍 AI Course Review

> Automatically evaluates a published course by **transcribing every video** and asking an LLM to score it.

```
POST /api/ai/review-course  { courseId }
         │
         ▼
  For each Section → Subsection:
    1. Convert video URL → MP3 (Cloudinary transform: f_mp3,ac_mp3,br_32k)
    2. POST to Groq Whisper (whisper-large-v3) → transcript
    3. Summarise transcript with LLaMA 3.3 70B (max 500 tokens)
         │
         ▼
  Build full courseContentSummary string
         │
         ▼
  LLaMA 3.3 70B evaluates course structure + summaries
  Returns JSON: { score, summary, strengths[], weaknesses[] }
         │
         ▼
  Saved to course.aiReview in MongoDB
```

**Schema addition in `courseModel.js`:**
```js
aiReview: {
  score:      Number,      // 1–100
  summary:    String,
  strengths:  [String],
  weaknesses: [String]
}
```

---

## 💬 Real-Time Messaging (Socket.IO)

**Architecture:** Each course has its own Socket.IO room (`course:<courseId>`). Users also join a personal room (`user:<userId>`) for targeted events.

**Socket events:**

| Event (Client → Server) | Description |
|--------------------------|-------------|
| `authenticate` | Send JWT token to auth the socket connection |
| `join_course_chat` | Join a course chat room |
| `leave_course_chat` | Leave a course chat room |
| `typing` | Broadcast typing status to others in room |

| Event (Server → Client) | Description |
|--------------------------|-------------|
| `authenticated` | Confirms socket auth success |
| `auth_error` | Auth failed, socket disconnected |
| `new_message` | New message in course chat |
| `message_deleted` | A message was deleted |
| `messages_read` | Conversation marked as read |
| `user_typing` | Another user is typing |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND  (Vercel)                      │
│  React 18 + Vite · Redux Toolkit · React Router v7      │
│  Tailwind CSS · Motion · Socket.IO Client               │
└────────────┬──────────────────────────┬─────────────────┘
             │ REST API                  │ WebSocket
             ▼                          ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND  (Render)                      │
│  Express.js 5 · JWT Middleware · RBAC Guards            │
│  Auth · Course · AI · Chat · Discussion · Resource      │
│  Section · Subsection · Payment · Profile               │
└──────┬─────────┬────────┬──────────┬─────────┬──────────┘
       │         │        │          │         │
  MongoDB   Cloudinary  Razorpay  Groq API  Gmail OAuth2
  Atlas      Media      Payments  LLM+STT   Email
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| Vite | 7.1.2 | Build tool |
| Redux Toolkit | 2.8.2 | State management |
| React Router | 7.8.1 | Routing |
| Tailwind CSS | 3.4.17 | Styling |
| Motion (Framer) | 12.23.12 | Animations |
| Socket.IO Client | — | Real-time chat |
| Axios | 1.11.0 | HTTP client |
| @react-oauth/google | 0.13.5 | Google sign-in |
| react-hot-toast | — | Notifications |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 5.1.0 | Web framework |
| Mongoose | 8.17.1 | MongoDB ODM |
| Socket.IO | — | WebSocket server |
| jsonwebtoken | 9.0.2 | Auth tokens |
| bcrypt | 6.0.0 | Password hashing |
| Cloudinary | 2.7.0 | Media & file storage |
| Razorpay | 2.9.6 | Payment gateway |
| Nodemailer | 7.0.5 | Transactional email |
| express-fileupload | — | Multipart file handling |

### AI & Intelligence

| Service | Model | Purpose |
|---------|-------|---------|
| Groq API | `llama-3.3-70b-versatile` | Dhruv agent, Q&A, Quiz, Course Review |
| Groq API | `whisper-large-v3` | Video transcription for AI Review |
| Groq API | SSE streaming | Real-time token delivery |

---

## 📂 Project Structure

```
Udaan/
├── backend/
│   ├── config/
│   │   ├── socket.js          ← Socket.IO init, room management, emitters
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── razorpay.js
│   ├── controllers/
│   │   ├── aiController.js    ← askAI · generateQuiz · saveNote · generateCourseReview 
│   │   ├── authController.js  ← signUp · login · googleAuth · deleteAccount 
│   │   ├── chatController.js  ← Socket-backed messaging
│   │   ├── courseController.js
│   │   ├── discussionController.js
│   │   ├── dhruvController.js ← 7-phase SSE agent
│   │   ├── payment.js         ← Razorpay + enrollFreeCourse 
│   │   ├── resourceController.js
│   │   └── ...
│   ├── models/
│   │   ├── courseModel.js     ← aiReview field added 
│   │   ├── additionalDetails.js ← bank account fields added 
│   │   ├── chatModel.js
│   │   ├── courseDiscussionModel.js
│   │   ├── courseNoteModel.js
│   │   ├── courseResourceModel.js
│   │   └── ...
│   └── routes/
│       ├── aiRoutes.js · chatRoutes.js · discussionRoutes.js · resourceRoutes.js
│       └── userRoutes.js · courseRoutes.js · paymentsRoutes.js · profileRoutes.js
│
└── frontend/src/
    ├── pages/
    │   ├── Messages.jsx          ← Full messaging inbox
    │   ├── ViewCourse.jsx        ← Discussion + Resources + AI sidebar
    │   └── CourseDetails.jsx
    ├── components/
    │   ├── InstructorChat.jsx    ← Floating chat panel on course page
    │   ├── RatingModal.jsx       ← Animated star rating
    │   ├── Dasboard/
    │   │   ├── Setting.jsx       ← Bank details section for Instructors 
    │   │   ├── AddCourse/
    │   │   │   ├── CoursePathModal.jsx  ← Dhruv vs Manual chooser 
    │   │   │   ├── DhruvChat.jsx · DhruvSidebar.jsx · DhruvDraftReview.jsx
    │   │   │   └── CourseBuilder.jsx · SubsectionModal.jsx
    │   │   └── ...
    │   └── ViewCourse/
    │       ├── AiSidebar.jsx · PersonalNotes.jsx
    │       ├── Discussion.jsx · Resources.jsx
    └── services/
        ├── api.js               ← All endpoint constants
        └── socketService.js     ← Socket.IO client wrapper
```

---

## 🌐 API Reference

**Base URL:** `http://localhost:5000/api`

### Auth `/api/auth`
| Method | Endpoint | Description |
|--------|----------|:-------------:|
| `POST` | `/sendOtp` | Send 6-digit OTP |
| `POST` | `/signUp` | Register with OTP |
| `POST` | `/login` | Email + password login |
| `POST` | `/google-auth` | Google OAuth login |
| `GET` | `/logout` | Logout |
| `PUT` | `/changePassword` | Change password |
| `PUT` | `/forgotPassword` | Send reset link |
| `PUT` | `/update-password` | Reset password |
| `DELETE` | `/delete-account` | Delete account  |

### Courses `/api/course`
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `GET` | `/` | All courses | Public |
| `GET` | `/top-rated` | Top rated courses | Public |
| `POST` | `/create` | Create course | Instructor |
| `PUT` | `/update/:courseId` | Update course | Instructor |
| `DELETE` | `/delete/:courseId` | Delete course | Instructor |
| `GET` | `/getInstructorCourses` | My courses | Instructor |
| `GET` | `/getEnrolledCourses` | Enrolled courses | Student |
| `POST` | `/update-course-progress` | Mark video done | Student |
| `GET` | `/view/:courseId` | Full course details | ✅ |

### AI `/api/ai`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `POST` | `/ask` | In-lesson Q&A | ✅ |
| `POST` | `/generate-quiz` | AI MCQ quiz | ✅ |
| `POST` | `/dhruv` | Dhruv SSE stream | ✅ |
| `POST` | `/review-course` | **AI course review**  | Instructor |
| `POST` | `/notes` | Save personal note | ✅ |
| `GET` | `/notes/:subsectionId` | Get notes | ✅ |
| `DELETE` | `/notes/:noteId` | Delete note | ✅ |

### Payments `/api/payment`
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/create-order` | Create Razorpay order | Student |
| `POST` | `/verify` | Verify & enroll | Student |
| `POST` | `/enroll-free` | Free course enrollment  | ✅ |

### Messaging `/api/chat`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
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
|--------|----------|-------------|:----:|
| `POST` | `/create` | Create thread | ✅ |
| `GET` | `/:courseId` | Get threads | ✅ |
| `PUT` | `/update/:discussionId` | Edit thread | ✅ |
| `DELETE` | `/delete/:discussionId` | Delete thread | ✅ |

### Resources `/api/resource`
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/upload` | Upload file | Instructor |
| `GET` | `/:courseId` | Get resources | ✅ |
| `DELETE` | `/delete/:resourceId` | Delete resource | Instructor |
| `PUT` | `/downloads/:resourceId` | Increment downloads | ✅ |

### Profile `/api/profile`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/` | Get profile | ✅ |
| `PUT` | `/update` | Update profile + bank details  | ✅ |

---

## 🎓 User Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Browse, purchase / enroll free, watch, track progress, message instructor, discuss, download resources, AI Q&A, AI quiz, notes, rate & review |
| **Instructor** | Dhruv AI or Manual course creation, manage content, upload resources, respond to messages, AI course review, bank account settings, analytics |
| **Admin** | Manage categories, platform oversight |

---

## 📧 Email Triggers

| Event | Template |
|-------|----------|
| Registration | Welcome + onboarding |
| OTP | 6-digit code (5-min expiry) |
| Password Reset | Secure token link |
| Course Purchase / Free Enroll | Enrollment confirmation |
| Course Published | Instructor notification |
| Course Deleted | Enrolled student notification |

---


## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE).

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=120&section=footer" />

###  If Udaan helped you, give it a star!

**Udaan** — *उड़ान · Take flight with knowledge* 🚀

Made with ❤️

</div>
