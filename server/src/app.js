import express from 'express';
import cors from 'cors';
import eventsRouter from './routes/events.js';
import registrationsRouter from './routes/registrations.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import adminRouter from './routes/admin.js';
import { sessionMiddleware } from './middleware/adminAuth.js';

const app = express();
app.use(cors({
  origin: process.env.CLIENT_ORIGIN?.split(',').map(s => s.trim()),
  credentials: true
}));app.use(express.json({ limit: '100kb' }));
app.set('trust proxy', 1);
app.use(sessionMiddleware);
app.use('/api/admin', adminRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'EventEase API' }));
app.use('/api/events', eventsRouter);
app.use('/api/events/:id/registrations', registrationsRouter);
app.use(notFound);
app.use(errorHandler);
export default app;
