<div align="center">

# 🎓 StudyPath AI

### An AI-powered learning and career guidance platform for students.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

</div>

---

## 📖 Overview

**StudyPath AI** is a premium, fully browser-based student productivity platform designed to help you plan your learning journey, track skills, manage study goals, organise notes and resources, and receive personalised roadmap-style career guidance — all in one place.

Whether you're preparing for technical interviews, tracking internship applications, or trying to stay on top of your assignments, StudyPath AI gives you a clean, structured system to stay ahead.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **User Login & Signup** | Secure email/password authentication + Google Sign-In via Firebase Auth |
| 📊 **Dashboard** | Real-time overview of tasks, skills, applications, and assignments |
| 🗺️ **AI Career Roadmaps** | Generate structured, step-by-step career paths tailored to your goals |
| 📚 **Study Planner** | Plan daily/weekly tasks with priorities, due dates, and completion tracking |
| 🚀 **Skills Tracker** | Track programming, DSA, AI/ML and soft skills with animated progress bars |
| 📝 **Smart Notes** | Save, search, and organise learning notes by category |
| 🔗 **Resource Library** | Curated resources for DSA, Web Dev, AI/ML, Interview Prep, and more |
| 📋 **Assignment Tracker** | Track deadlines, priorities, and submission status — never miss a due date |
| 💼 **Internship / Applications Tracker** | Kanban-style tracker from "Applied" to "Selected" |
| 📈 **Performance Analyzer** | Input academic results to get AI-suggested weak topics and a personalised study plan |
| ☁️ **Firestore Database** | All user data is stored securely per-user in Cloud Firestore |
| 📱 **Responsive Design** | Fully responsive for desktop, tablet, and mobile |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (Vanilla — no frameworks) |
| Logic | JavaScript (Vanilla ES6+) |
| Authentication | Firebase Authentication (Email/Password + Google Sign-In) |
| Database | Cloud Firestore (NoSQL) |
| Typography | Google Fonts — Inter & Poppins |
| Hosting (optional) | Firebase Hosting / GitHub Pages / Netlify |

> **No React. No Node.js. No Next.js. No build step.** This is a pure frontend project that runs directly in any modern browser.

---

## 📁 Folder Structure

```
studypathai/
│
├── index.html              # Landing page
├── login.html              # Login page
├── signup.html             # Sign-up page
├── dashboard.html          # Main dashboard
├── roadmap.html            # AI career roadmap generator
├── study-planner.html      # Study task planner
├── skills.html             # Skills tracker
├── notes.html              # Notes manager
├── resources.html          # Curated resource library
├── assignments.html        # Assignment tracker
├── applications.html       # Internship / career applications tracker
├── performance.html        # Performance analyzer
│
├── css/
│   ├── style.css           # Global styles and design system
│   ├── dashboard.css       # Dashboard-specific styles
│   └── auth.css            # Login / signup styles
│
├── js/
│   ├── firebase-config.example.js  # ✅ Safe config template (commit this)
│   ├── firebase-config.js          # 🔒 Your real credentials (DO NOT commit)
│   ├── auth.js             # Email + Google authentication logic
│   ├── guard.js            # Auth route guard (redirect if not logged in)
│   ├── firestore.js        # Shared Firestore CRUD helpers
│   ├── ui.js               # Shared UI utilities (navbar, mobile toggle, etc.)
│   ├── dashboard.js        # Dashboard data and stats
│   ├── roadmap.js          # Roadmap generation logic
│   ├── study.js            # Study planner logic
│   ├── skills.js           # Skills tracker logic
│   ├── notes.js            # Notes CRUD logic
│   ├── resources.js        # Resource library data and filters
│   ├── assignments.js      # Assignment tracker logic
│   ├── applications.js     # Applications tracker logic
│   └── performance.js      # Performance analyzer logic
│
├── firestore.rules         # Firestore security rules
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- [VS Code](https://code.visualstudio.com/) with the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) — **or** any local HTTP server
- A [Firebase](https://firebase.google.com/) project (free Spark plan is sufficient)

### 1. Clone the repository

```bash
git clone https://github.com/Srivalli-D/studypathai.git
cd studypathai
```

### 2. Set up Firebase

See the full **[Firebase Setup](#-firebase-setup)** section below.

### 3. Configure your Firebase credentials

```bash
# Copy the example config template
cp js/firebase-config.example.js js/firebase-config.js
```

Open `js/firebase-config.js` and replace every `PASTE_YOUR_..._HERE` placeholder with your actual Firebase project values:

```js
const firebaseConfig = {
  apiKey:            "your-api-key",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId:             "your-app-id",
  measurementId:     "G-XXXXXXXXXX"   // optional
};
```

> ⚠️ **Never commit `js/firebase-config.js` to Git.** It is already listed in `.gitignore` to protect your credentials.

### 4. Run locally

**Option A — VS Code Live Server (recommended)**

1. Open the project folder in VS Code
2. Right-click `index.html` → **"Open with Live Server"**
3. The app opens at `http://127.0.0.1:5500`

**Option B — Python HTTP server**

```bash
python -m http.server 5500
# then open http://localhost:5500
```

**Option C — Node.js `serve`**

```bash
npx serve .
```

---

## 🔥 Firebase Setup

### Step 1 — Create a Firebase project

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **"Add project"** and follow the wizard
3. Disable Google Analytics if you don't need it (optional)

### Step 2 — Register a Web App

1. Inside your project, click the **`</>`** (Web) icon
2. Give it a nickname (e.g., `StudyPath AI`)
3. Copy the `firebaseConfig` object shown — you'll paste this into `js/firebase-config.js`

### Step 3 — Enable Authentication

1. In the Firebase Console, go to **Authentication → Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (set your support email)
4. Under **Authorized domains**, add:
   - `localhost` (for local dev)
   - `127.0.0.1`
   - Your production domain (e.g., `yourusername.github.io`)

### Step 4 — Create Firestore Database

1. Go to **Firestore Database → Create database**
2. Choose **"Start in production mode"** (rules are set in the next step)
3. Select a region close to your users

### Step 5 — Set Firestore Security Rules

In **Firestore Database → Rules**, paste the contents of `firestore.rules`:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Each user can only read/write their own document and subcollections.
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{subcollection}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

  }
}
```

Click **"Publish"**.

---

## 🌐 Deployment Options

This is a static frontend project — it can be deployed anywhere that serves HTML files.

| Platform | Notes |
|---|---|
| **Firebase Hosting** | Best match — `firebase deploy` command, free on Spark plan |
| **GitHub Pages** | Free, push to `main` branch and enable Pages in repo settings |
| **Netlify** | Drag-and-drop deployment, free tier available |

> The app is **not yet deployed**. A live link will be added here once hosted.

---

## 📸 Screenshots

> Screenshots will be added soon.

---

## 🗺️ Roadmap & Future Improvements

- [ ] AI-generated assignments and tasks based on performance analysis
- [ ] Smarter skill recommendations using learning history
- [ ] Improved analytics dashboard with charts and trends
- [ ] Admin panel for educators or mentors
- [ ] Notification system for deadlines and milestones
- [ ] Mobile app wrapper (PWA or Capacitor)
- [ ] Improved automation for roadmap generation

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure you **never commit real Firebase credentials** — always use the `firebase-config.example.js` template.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

Copyright (c) 2026 [Srivalli-D](https://github.com/Srivalli-D)

---

<div align="center">

Made with ❤️ by [Srivalli-D](https://github.com/Srivalli-D)

</div>
