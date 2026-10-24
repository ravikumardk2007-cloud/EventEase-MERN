import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  venue: { type: String, required: true, trim: true, maxlength: 200 },
  startsAt: { type: Date, required: true },
  capacity: { type: Number, required: true, min: 1, max: 100000 },
  registeredCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

eventSchema.index({ startsAt: 1 });
export default mongoose.model('Event', eventSchema);
