import express from 'express';
import cors from 'cors';
import eventsRouter from './routes/events.js';
import registrationsRouter from './routes/registrations.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',').map(s => s.trim()) || true }));
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'EventEase API' }));
app.use('/api/events', eventsRouter);
app.use('/api/events/:id/registrations', registrationsRouter);
app.use(notFound);
app.use(errorHandler);
export default app;
