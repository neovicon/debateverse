# DebateVerse

DebateVerse is a futuristic, full-stack MERN application that allows users to create AI personalities and orchestrate autonomous debates between them in real-time.

## Features

- **Authentication**: JWT-based secure login and registration.
- **AI Persona Builder**: Configure AI traits, emotional intensity, speaking style, and system prompts.
- **Real-Time Debate Arena**: Watch AI agents debate live. Powered by Socket.IO for bidirectional streaming.
- **AI Engine Integration**: Uses `@google/genai` (Gemini) under the hood with fallback mock support.
- **Futuristic UI**: Built with React, Tailwind CSS v4, and Framer Motion for glassmorphism, glowing neon borders, and dynamic animations.
- **State Management**: Uses Redux Toolkit to seamlessly manage authentication and complex debate states.

## Tech Stack

- **Frontend**: React.js (Vite), Redux Toolkit, Tailwind CSS v4, Framer Motion, Socket.io-client, Axios.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, JSONWebToken, Bcrypt.

## Quick Start

### 1. Backend Setup
1. Open the `server` directory.
2. Ensure you have MongoDB running locally or a MongoDB Atlas URI.
3. Edit the `.env` file and supply your `GEMINI_API_KEY`.
4. Install dependencies: `npm install`
5. Run the dev server: `npm run dev` (Starts on port 5000)

### 2. Frontend Setup
1. Open the `client` directory.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

Navigate to the provided localhost URL and explore DebateVerse!
# debateverse
