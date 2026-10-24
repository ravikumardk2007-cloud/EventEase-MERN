export function notFound(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  if (err?.code === 11000) {
    return res.status(409).json({ error: 'This email is already registered for this event.' });
  }
  if (err?.name === 'ValidationError' || err?.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid input. Check the provided values.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
