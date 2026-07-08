# AI Interview Simulator

A full-stack AI-powered mock interview platform that helps candidates prepare for technical and behavioral interviews. Upload your resume, get AI-generated questions tailored to your background, take mock interview sessions, and track your progress over time.

**Live Demo:** [add your deployed link once live]
**Repo:** [add your GitHub repo link]

## Features

- 📄 **Resume Upload** — Upload your resume (PDF) via Cloudinary for AI-driven question generation
- 🤖 **AI-Generated Questions** — Personalized interview questions based on your resume and target role
- 🎯 **Mock Interview Sessions** — Simulated interview flow with real-time interaction
- ✅ **Answer Evaluation** — AI-powered feedback and scoring on your responses
- 📊 **Progress Tracking** — Track performance across multiple sessions over time
- 🏢 **Company/Topic-Based Question Banks** — Practice questions curated by company or subject area
- 🔐 **Secure Authentication** — JWT-based auth with access/refresh token rotation

## Tech Stack

**Frontend:** Next.js (App Router), Tailwind CSS
**Backend:** Next.js API Routes, MongoDB, Mongoose
**Authentication:** JWT (access + refresh token rotation)
**AI Providers:** Claude API (primary), Google Gemini API (fallback), Groq API (fallback)
**File Storage:** Cloudinary (resume PDF storage)

## Architecture

The app uses a multi-provider AI fallback system — if the primary AI provider (Claude) is unavailable or rate-limited, the app automatically falls back to Gemini, then Groq, ensuring consistent uptime for question generation and answer evaluation.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- API keys for Claude, Gemini, and Groq
- Cloudinary account

### Installation

```bash
git clone https://github.com/<your-username>/ai-interview-simulator.git
cd ai-interview-simulator
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
ANTHROPIC_API_KEY=your_claude_api_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to view the app.

## Project Structure

```
├── app/              # Next.js App Router pages and API routes
├── models/           # Mongoose schemas
├── lib/              # Utility functions (auth, AI provider fallback logic, etc.)
├── components/       # React components
└── public/           # Static assets
```

## License

This project is for educational and portfolio purposes.
