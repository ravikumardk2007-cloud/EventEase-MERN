import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const port = process.env.PORT || 5000;
if (!process.env.MONGODB_URI) {
  console.error('Missing MONGODB_URI. Copy .env.example to .env and configure MongoDB.');
  process.exit(1);
}
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  app.listen(port, () => console.log(`EventEase API listening on port ${port}`));
} catch (error) {
  console.error('Unable to start EventEase:', error.message);
  process.exit(1);
}
