# EventEase – Workshop Registration System

A MERN-stack workshop registration application. Organizers can create and manage events; participants can browse events and register. The API prevents duplicate registrations and enforces seat limits.

## Features
- Create, view, update, and delete events (API).
- Browse upcoming workshops in a responsive React interface.
- Register participants using name and email.
- Duplicate-registration prevention (same normalized email per event).
- Seat-limit enforcement and remaining-seat display.
- MongoDB persistence with Mongoose models and validation.
- REST API with consistent error responses.
- Demo mode: frontend works with local sample data if the API is not configured. Real registration requires the backend.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas (or local MongoDB)

## Project structure
```text
EventEase/
  server/
    src/
      models/Event.js
      models/Registration.js
      routes/events.js
      routes/registrations.js
      middleware/errorHandler.js
      app.js
      server.js
    .env.example
    package.json
  client/
    src/
      App.jsx
      main.jsx
      styles.css
    index.html
    package.json
    .env.example
  README.md
```

## Run locally
### 1. Requirements
Install Node.js 20+ and create a MongoDB database (local or MongoDB Atlas).

### 2. Backend
```bash
cd server
cp .env.example .env
# Edit .env and set MONGODB_URI and CLIENT_ORIGIN
npm install
npm run dev
```
The API runs on `http://localhost:5000`. Health check: `GET /api/health`.

### 3. Frontend
In another terminal:
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Open the Vite URL shown (normally `http://localhost:5173`).

## REST API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API health check |
| GET | `/api/events` | List events (`?search=` supported) |
| GET | `/api/events/:id` | Get event details |
| POST | `/api/events` | Create an event |
| PATCH | `/api/events/:id` | Update event fields |
| DELETE | `/api/events/:id` | Delete event and registrations |
| GET | `/api/events/:id/registrations` | List registrations for an event |
| POST | `/api/events/:id/registrations` | Register a participant |

### Create event example
```json
{
  "title": "Intro to Generative AI",
  "description": "A practical introduction to generative AI tools.",
  "venue": "Seminar Hall 2",
  "startsAt": "2026-11-15T10:00:00.000Z",
  "capacity": 60
}
```

### Register example
`POST /api/events/:id/registrations`
```json
{ "name": "Asha Kumar", "email": "asha@example.com" }
```
Duplicate registrations return `409`; a full event returns `409`; invalid input returns `400`.

## Deployment
This repository is prepared for a common split deployment:
1. Create a MongoDB Atlas database and allow your deployment provider to connect.
2. Deploy `server/` to Render (or another Node host). Set `MONGODB_URI`, `CLIENT_ORIGIN` to your deployed frontend origin, and `NODE_ENV=production`.
3. Deploy `client/` to Vercel or Netlify. Set `VITE_API_URL` to the deployed backend origin (without `/api`, e.g. `https://your-api.onrender.com`).
4. Configure the frontend host to rewrite all routes to `index.html` if client-side routes are added.

**Important:** No public deployment URL is included because hosting requires your own provider account and environment secrets. Never commit `.env` files or database credentials. Once deployed, test the health endpoint, create an event, register twice with the same email, and fill the last seat to verify conflict handling.

## Security notes / production hardening
This is a learning-project baseline. Add organizer authentication/authorization, rate limiting, email verification, pagination, structured logging, and automated tests before using it for real public events. The current CRUD endpoints are not authenticated.
