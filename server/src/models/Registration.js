import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
}, { timestamps: true });

// Database-level uniqueness protects against duplicate registrations even under concurrent requests.
registrationSchema.index({ event: 1, email: 1 }, { unique: true });
export default mongoose.model('Registration', registrationSchema);
