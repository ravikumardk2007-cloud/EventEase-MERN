import { Router } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

const router = Router({ mergeParams: true });

router.post('/', async (req, res, next) => {
  let reservedEventId = null;
  try {
    const { name, email } = req.body || {};
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid event ID' });
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ error: 'Name must be between 2 and 100 characters.' });
    }
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    const eventId = new mongoose.Types.ObjectId(req.params.id);
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (await Registration.exists({ event: eventId, email: normalizedEmail })) {
      return res.status(409).json({ error: 'This email is already registered for this event.' });
    }

    // Atomic conditional increment prevents concurrent requests from exceeding capacity.
    const reserved = await Event.findOneAndUpdate(
      {_id: eventId, $expr: { $lt: ['$registeredCount', '$capacity'] } },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );
    if (!reserved) return res.status(409).json({ error: 'Sorry, this workshop is full.' });
    reservedEventId = eventId;

    const registration = await Registration.create({ event: eventId, name: name.trim(), email: normalizedEmail });
    reservedEventId = null;
    res.status(201).json({
      message: 'Registration successful!',
      registration,
      remainingSeats: Math.max(0, reserved.capacity - reserved.registeredCount)
    });
  } catch (e) {
    if (reservedEventId) {
      await Event.updateOne({_id: reservedEventId, registeredCount: { $gt: 0 } }, { $inc: { registeredCount: -1 } }).catch(() => {});
    }
    if (e?.code === 11000) return res.status(409).json({ error: 'This email is already registered for this event.' });
    next(e);
  }
});

export default router;
