
import session from 'express-session';
import MongoStore from 'connect-mongo';

const isProduction = process.env.NODE_ENV === 'production';

export const sessionMiddleware = session({
  name: 'eventease.admin.sid',
  secret: process.env.ADMIN_SESSION_SECRET || 'local-development-only-change-this-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'adminSessions',
    ttl: 60 * 60 * 4
  }),
 cookie: {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 4 * 60 * 60 * 1000
}
});

export function requireAdmin(req, res, next) {
  if (req.session?.isAdmin === true) {
    return next();
  }

  return res.status(401).json({ error: 'Admin login required' });
}
