
import { Router } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

// Admin login
router.post('/login', (req, res, next) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !process.env.ADMIN_USERNAME ||
    !process.env.ADMIN_PASSWORD
  ) {
    return res.status(400).json({ error: 'Invalid login details' });
  }

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  req.session.regenerate((err) => {
    if (err) return next(err);

    req.session.isAdmin = true;

    req.session.save((saveErr) => {
      if (saveErr) return next(saveErr);
      res.json({ message: 'Admin login successful' });
    });
  });
});

// Check whether admin is logged in
router.get('/me', requireAdmin, (req, res) => {
  res.json({ authenticated: true });
});

// Admin-only workshop overview
router.get('/events', requireAdmin, async (req, res, next) => {
  try {
    const events = await Event.find()
      .select('title venue startsAt capacity registeredCount')
      .sort({ startsAt: 1 })
      .lean();

    res.json(events);
  } catch (error) {
    next(error);
  }
});

// Admin-only attendee list
router.get('/registrations', requireAdmin, async (req, res, next) => {
  try {
    const registrations = await Registration.find()
      .populate('event', 'title')
      .select('name email event createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      registrations.map((registration) => ({
        id: registration._id,
        name: registration.name,
        email: registration.email,
        workshop: registration.event?.title || 'Workshop unavailable',
        registeredAt: registration.createdAt
      }))
    );
  } catch (error) {
    next(error);
  }
});

// Admin logout
router.post('/logout', requireAdmin, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);

    res.clearCookie('eventease.admin.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.json({ message: 'Admin logged out' });
  });
});

export default router;
