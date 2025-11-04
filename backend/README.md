# Arca AI Backend

Node.js backend for the Arca AI website builder platform.

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure MongoDB Atlas**:
   - Update `.env` file with your MongoDB Atlas connection string
   - Replace `<username>` and `<password>` with your credentials

3. **Start development server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Health Check
- `GET /health` - Server health status

## Environment Variables

```env
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/arca-ai?retryWrites=true&w=majority
NODE_ENV=development
```