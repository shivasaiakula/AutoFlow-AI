# 🚀 AutoFlow AI

### Automate Work. Save Time. Build Smarter.

An AI-powered workflow automation tool built with React, Vite, TypeScript, and the Google Gemini API. AutoFlow AI lets users describe tasks in natural language and have an AI agent plan, execute, and report on multi-step workflows — turning repetitive work into a single prompt.

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![License](https://img.shields.io/badge/License-MIT-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![Gemini AI](https://img.shields.io/badge/Google-Gemini-orange)

---

## 📖 Overview

AutoFlow AI combines a Vite + React + TypeScript frontend with a lightweight Node/TypeScript server to let users trigger AI-driven workflows — document processing, report generation, email drafting, and task automation — powered by the Google Gemini API.

This project started from the Google AI Studio app template and is being actively extended into a full automation platform with persistent workflows, scheduled triggers, and third-party integrations.

> **Project status:** Core AI-assisted single-workflow app is functional. Multi-step workflow builder, scheduling/triggers, and integrations (Gmail, Slack, GitHub, etc.) are in active development — see [Roadmap](#-roadmap).

---

## ✨ Current Features

- AI-powered task assistant using Google Gemini API
- Single-page React + TypeScript UI (Vite build)
- Lightweight TypeScript server (`server.ts`) for API requests

## 🧭 Planned Features (see Roadmap)

- Visual drag-and-drop workflow builder with multi-step logic
- Scheduled and event/webhook-based triggers
- Background job queue for async, retryable workflow runs
- Integrations: Gmail, Slack, Discord, GitHub, Google Drive, Notion, Trello, Calendar
- Execution dashboard: logs, success rate, error tracking
- Per-user OAuth credential storage
- Authentication (JWT / Google OAuth) and role-based access

---

## 🛠 Tech Stack

**Frontend:** React, Vite, TypeScript
**Backend:** Node.js, TypeScript (`server.ts`)
**AI:** Google Gemini API
**Planned:** Redis/BullMQ (job queue), a persistent DB (PostgreSQL/MySQL + Prisma), Docker, GitHub Actions CI

---

## 📂 Project Structure

```
AutoFlow-AI
│
├── src/                # React frontend source
├── assets/.aistudio    # AI Studio project metadata
├── index.html
├── metadata.json
├── package.json
├── server.ts           # Node/TypeScript server entry point
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/shivasaiakula/AutoFlow-AI.git
cd AutoFlow-AI
```

### Install dependencies

```bash
npm install
```

### Configure environment

Copy `.env.example` to `.env` and fill in your keys:

```
GEMINI_API_KEY=your_api_key
```

### Run the app

```bash
npm run dev
```

The app will be available at:

```
http://localhost:5173
```

---

# 🎯 Use Cases

- AI-assisted document processing and summarization
- Automated report generation
- Draft/generate emails from prompts
- Foundation for broader business process automation

---

# 📈 Roadmap

- [x] AI task assistant (Gemini integration)
- [x] Vite + React + TypeScript frontend
- [ ] Persistent workflow schema (nodes/edges/steps)
- [ ] Workflow execution engine
- [ ] Scheduled triggers (cron)
- [ ] Webhook-based triggers
- [ ] Background job queue (BullMQ + Redis)
- [ ] First integration: Gmail
- [ ] Additional integrations: Slack, GitHub, Google Drive, Notion, Trello, Calendar
- [ ] Execution dashboard & logs
- [ ] Authentication (JWT / Google OAuth)
- [ ] Multi-user support with encrypted per-user credentials
- [ ] Docker + CI/CD (GitHub Actions)
- [ ] Test suite

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/NewFeature
   ```
3. Commit your changes
   ```bash
   git commit -m "Added New Feature"
   ```
4. Push and open a Pull Request
   ```bash
   git push origin feature/NewFeature
   ```

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Shiva Sai Akula**
GitHub: [@shivasaiakula](https://github.com/shivasaiakula)

---

### ⭐ Star this repository if you like the project!

Made with ❤️ by **Shiva Sai Akula**
