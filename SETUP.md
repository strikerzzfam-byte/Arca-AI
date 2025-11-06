# AI Chat Application Setup Guide

## Prerequisites
1. Node.js (v18 or higher)
2. Neon Database account
3. Google AI API key

## Step-by-Step Setup

### 1. Database Setup (Neon)
1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string

### 2. Google AI API Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy the API key

### 3. Environment Configuration
1. Update `.env` file with your credentials:
```
DATABASE_URL=your_neon_database_url_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
PORT=3001
```

### 4. Database Migration
```bash
npm run db:generate
npm run db:migrate
```

### 5. Install Dependencies
```bash
npm install
cd backend && npm install
```

### 6. Run the Application
```bash
# Run both frontend and backend
npm run dev:full

# Or run separately:
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run backend
```

### 7. Access the Application
- Frontend: http://localhost:5173
- AI Chat: http://localhost:5173/ai-chat
- Backend API: http://localhost:3001

## Usage
1. Navigate to `/ai-chat` route
2. Type messages in the chat interface
3. AI will respond with either text (displayed in chat) or code (rendered in the preview panel)
4. All interactions are saved to the database

## Database Schema
- `chats` table: Stores conversational messages
- `frames` table: Stores generated UI code snippets