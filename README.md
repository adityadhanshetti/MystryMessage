# 🔮 Mystry Message

<p align="center">
  <img src="https://raw.githubusercontent.com/adityadhanshetti/MystryMessage/main/frontend/public/logo.svg" alt="Mystry Message Logo" width="80" height="80" onerror="this.style.display='none'"/>
</p>

<p align="center">
  <strong>A modern, privacy-first anonymous messaging & AMA platform with real-time two-way threads and social sharing.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-19+-61DAFB.svg?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MongoDB-7.0-47A248.svg?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-7.0_Alpine-DC382D.svg?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-Compose_Ready-2496ED.svg?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Clerk-Authentication-6C47FF.svg?style=flat-square&logo=clerk&logoColor=white" alt="Clerk" />
</p>

---

## Overview

**Mystry Message** allows creators, influencers, and everyday users to receive honest questions, feedback, and confessions from their audience without sacrificing safety or control. Unlike traditional one-off AMA apps, Mystry Message features **persistent two-way conversation threads**, **AI-inspired icebreakers**, **downloadable social story cards**, and **playful sender clues**.

---

## Features

###  Core Anonymous Experience
- **Secure Public Profiles**: Custom `@username` handles with bios, avatars, and toggleable message acceptance.
- **Two-Way Anonymous Conversations**: Senders receive a private cryptographic session token to converse back and forth with the recipient.
- **Content Moderation Engine**: Automatic regex-based profanity and abusive language filtering before messages are ever saved.
- **Redis Rate Limiting**: Token-bucket and sliding-window rate limiting on anonymous submissions to prevent spam attacks.

###  Viral & Engagement Features
- ** Icebreaker Prompt Generator**: Categorized prompt chips (* Fun & Spicy*, * Deep & Honest*, * Career & AMA*, * Kind Words*) with a **Shuffle** button to eliminate writer's block.
- ** Instagram & Snapchat Story PNG Generator**: In-browser HTML5 Canvas exports 1080x1920 (9:16) story cards with glowing dark gradients, formatted Q&As, and user watermarks ready for social posting.
- ** Real-Time Inbox Search**: Instant client-side keyword filtering to search messages and questions effortlessly.
- ** Privacy-Safe Sender Clues**: Non-identifying device hints (*e.g., 📱 iPhone • Safari • iOS*) give recipients playful clues without revealing IP addresses or personal identities.
- ** Message Emoji Reactions**: Quick reactions (*❤️, 🔥, 😂, 👏, 😮*) on message bubbles synchronized in real time.
- ** Profile Analytics**: Live metrics for profile owners: total messages received, response rate (%), unread count, and replies sent.
- ** Social Media Sharing**: 1-click sharing to WhatsApp, X (Twitter), Web Share API (Instagram Stories, Snapchat, Telegram), and direct clipboard copying.

---

##  Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 19, Vite, TanStack Router, TanStack Query | Modern SPA with type-safe routing and declarative cache management |
| **Styling** | Tailwind CSS v4 | Curated dark-mode theme, glassmorphism, and responsive UI |
| **Backend** | Python 3.12+, FastAPI, Uvicorn, Pydantic v2 | High-throughput asynchronous REST API |
| **Database** | MongoDB 7.0 (PyMongo) | Flexible document store for users, messages, and threads |
| **Caching / Limits** | Redis 7.0-Alpine | High-speed sliding-window rate limiting and session caching |
| **Authentication** | Clerk | JWT-based authentication with public key cryptographic validation |
| **Deployment** | Docker & Docker Compose | Containerized multi-service orchestration |

---

##  Quickstart with Docker Compose

The fastest way to run the complete platform is using Docker Compose.

### 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose installed and running.

### 2. Configure Environment
Copy the example environment configuration:
```bash
# In project root
cp backend/.env.example .env
```

Ensure your `.env` contains:
```env
# MongoDB & Redis
MONGODB_URI=mongodb://mongodb:27017
MONGODB_DATABASE=mystry_message
REDIS_URL=redis://redis:6379/0

# Clerk Authentication (Get from https://dashboard.clerk.com)
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Launch Services
```bash
docker compose up -d --build
```

### 4. Access the Application
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 🌐 Cloud Deployment (Vercel + Render)

For full step-by-step instructions on deploying the **frontend to Vercel** and **backend to Render** with MongoDB Atlas and Upstash Redis, see the dedicated guide:

👉 **[Complete Deployment Guide (DEPLOYMENT.md)](./DEPLOYMENT.md)**

---

##  Local Development (Without Docker)

### Backend Setup
```bash
cd backend
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Run automated tests
pytest

# Start development server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The development server will run at [http://localhost:5173](http://localhost:5173).

---

##  Security & Privacy Practices

- **Zero-Knowledge Anonymous Senders**: No IP addresses, device identifiers, or user tracking are tied to anonymous messages.
- **Privacy-Preserving Clues**: Only high-level OS / browser family names are extracted from User-Agent strings for fun guessing games.
- **Cryptographic Conversation Tokens**: Senders access two-way threads via high-entropy cryptographically generated tokens stored strictly in local storage.
- **Automated Abuse Defense**: Inappropriate submissions are rejected instantly by content moderation before reaching the recipient's inbox.
- **Redis Sliding-Window Rate Limits**: Prevents automated spam submissions per IP address.

---

##  Testing

The backend includes a comprehensive `pytest` test suite:
```bash
cd backend
pytest -v
```

---
