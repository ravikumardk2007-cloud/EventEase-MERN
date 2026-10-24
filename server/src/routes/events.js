import { Router } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

const router = Router();
const fields = ['title', 'description', 'venue', 'startsAt', 'capacity'];

function cleanEvent(body) {
  const data = {};
  for (const key of fields) if (body[key] !== undefined) data[key] = body[key];
  if (data.title !== undefined && !String(data.title).trim()) throw new Error('Title is required');
  if (data.capacity !== undefined && (!Number.isInteger(Number(data.capacity)) || Number(data.capacity) < 1)) {
    throw new Error('Capacity must be a positive integer');
  }
  if (data.capacity !== undefined) data.capacity = Number(data.capacity);
  if (data.startsAt !== undefined && Number.isNaN(Date.parse(data.startsAt))) throw new Error('Invalid start date');
  return data;
}

async function withCounts(events) {
  const list = Array.isArray(events) ? events : [events];
  const result = list.map(e => {
    const item = e.toObject();
    item.registered = item.registeredCount || 0;
    item.remainingSeats = Math.max(0, item.capacity - item.registered);
    delete item.registeredCount;
    return item;
  });
  return Array.isArray(events) ? result : result[0];
}

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.search) filter.$or = [
      { title: { $regex: String(req.query.search).slice(0, 80), $options: 'i' } },
      { description: { $regex: String(req.query.search).slice(0, 80), $options: 'i' } },
      { venue: { $regex: String(req.query.search).slice(0, 80), $options: 'i' } }
    ];
    const events = await Event.find(filter).sort({ startsAt: 1 }).limit(100);
    res.json(await withCounts(events));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid event ID' });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(await withCounts(event));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = cleanEvent(req.body);
    for (const key of fields) if (data[key] === undefined || data[key] === '') return res.status(400).json({ error: `${key} is required` });
    const event = await Event.create(data);
    res.status(201).json(await withCounts(event));
  } catch (e) {
    if (e.message?.includes('required') || e.message?.includes('Capacity') || e.message?.includes('date')) return res.status(400).json({ error: e.message });
    next(e);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid event ID' });
    const data = cleanEvent(req.body);
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (data.capacity !== undefined) {
      const registered = event.registeredCount || await Registration.countDocuments({ event: event._id });
      if (data.capacity < registered) return res.status(409).json({ error: `Capacity cannot be lower than ${registered} existing registrations.` });
    }
    Object.assign(event, data);
    await event.save();
    res.json(await withCounts(event));
  } catch (e) {
    if (e.message?.includes('Capacity') || e.message?.includes('date')) return res.status(400).json({ error: e.message });
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid event ID' });
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await Registration.deleteMany({ event: event._id });
    res.json({ message: 'Event and its registrations deleted.' });
  } catch (e) { next(e); }
});

router.get('/:id/registrations', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid event ID' });
    if (!await Event.exists({ _id: req.params.id })) return res.status(404).json({ error: 'Event not found' });
    const registrations = await Registration.find({ event: req.params.id }).sort({ createdAt: -1 }).select('name email createdAt');
    res.json(registrations);
  } catch (e) { next(e); }
});

export default router;
