
import 'dotenv/config';
import mongoose from 'mongoose';
import Event from './src/models/Event.js';

const workshops = [
  {
    title: 'Build with Generative AI',
    description: 'Learn generative AI and build a simple AI-powered application.',
    venue: 'Innovation Lab, Bengaluru',
    startsAt: new Date('2026-11-08T10:00:00+05:30'),
    capacity: 50
  },
  {
    title: 'MERN Stack Web Development',
    description: 'Learn MongoDB, Express, React and Node.js.',
    venue: 'Technology Centre, Bengaluru',
    startsAt: new Date('2026-11-15T10:00:00+05:30'),
    capacity: 40
  },
  {
    title: 'Python for Beginners',
    description: 'Learn Python fundamentals and solve simple programming problems.',
    venue: 'Computer Lab, Bengaluru',
    startsAt: new Date('2026-11-22T10:00:00+05:30'),
    capacity: 35
  },
  {
    title: 'Introduction to Cybersecurity',
    description: 'Learn about online threats and safe browsing practices.',
    venue: 'Seminar Hall, Bengaluru',
    startsAt: new Date('2026-11-29T10:00:00+05:30'),
    capacity: 45
  }
];

try {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const workshop of workshops) {
    await Event.updateOne(
      { title: workshop.title },
      { $setOnInsert: workshop },
      { upsert: true }
    );
  }

  console.log('Workshops added or already exist.');
  console.log('Total workshops:', await Event.countDocuments());
} catch (error) {
  console.error('Could not add workshops:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
