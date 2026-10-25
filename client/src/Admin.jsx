
import { useEffect, useState } from 'react';
import './admin.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  .replace(/\/$/, '');

export default function Admin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function api(path, options = {}) {
    const response = await fetch(`${API}/api/admin${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  async function loadDashboard() {
    setLoading(true);
    setError('');

    try {
      const [eventData, registrationData] = await Promise.all([
        api('/events'),
        api('/registrations')
      ]);

      setEvents(eventData);
      setRegistrations(registrationData);
      setLoggedIn(true);
    } catch (err) {
      setLoggedIn(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api('/me')
      .then(() => loadDashboard())
      .catch(() => {
        // Not logged in yet; show the login form.
      });
  }, []);

  async function login(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      setPassword('');
      setShowPassword(false);

      await loadDashboard();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await api('/logout', { method: 'POST' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoggedIn(false);
      setEvents([]);
      setRegistrations([]);
      setPassword('');
      setShowPassword(false);
    }
  }

  if (!loggedIn) {
    return (
      <main className="admin-login">
        <form className="login-card" onSubmit={login}>
          <p className="admin-label">EVENTEASE / ADMIN</p>

          <h1>Welcome back.</h1>

          <p>
            Sign in to manage workshop registrations.
          </p>

          {error && (
            <div className="admin-error" role="alert">
              {error}
            </div>
          )}

          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="Enter your username"
            />
          </label>

          <label>
            Password

            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(current => !current)}
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : 'Sign in'}
          </button>
        </form>
      </main>
    );
  }

  const totalSeats = events.reduce(
    (sum, event) => sum + (Number(event.capacity) || 0),
    0
  );

  const registeredSeats = events.reduce(
    (sum, event) =>
      sum + (Number(event.registeredCount ?? event.registered) || 0),
    0
  );

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="admin-label">EVENTEASE / ADMIN</p>
          <h1>Workshop overview</h1>
          <p>Manage your workshops and attendee registrations.</p>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          Log out
        </button>
      </header>

      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}

      <section className="admin-stats">
        <article>
          <span>Workshops</span>
          <strong>{events.length}</strong>
        </article>

        <article>
          <span>Registrations</span>
          <strong>{registrations.length}</strong>
        </article>

        <article>
          <span>Total capacity</span>
          <strong>{totalSeats}</strong>
        </article>

        <article>
          <span>Seats remaining</span>
          <strong>{Math.max(0, totalSeats - registeredSeats)}</strong>
        </article>
      </section>

      <section className="admin-section">
        <h2>Workshops</h2>

        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Workshop</th>
                <th>Venue</th>
                <th>Date</th>
                <th>Registered</th>
                <th>Capacity</th>
              </tr>
            </thead>

            <tbody>
              {events.map(event => (
                <tr key={event._id}>
                  <td>{event.title}</td>
                  <td>{event.venue || '—'}</td>
                  <td>
                    {event.startsAt
                      ? new Date(event.startsAt).toLocaleDateString('en-IN')
                      : '—'}
                  </td>
                  <td>
                    {event.registeredCount ?? event.registered ?? 0}
                  </td>
                  <td>{event.capacity ?? '—'}</td>
                </tr>
              ))}

              {events.length === 0 && (
                <tr>
                  <td colSpan="5">No workshops found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <h2>Attendee registrations</h2>

        <p className="admin-muted">
          Private attendee information — visible only after admin login.
        </p>

        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Attendee name</th>
                <th>Email address</th>
                <th>Workshop</th>
                <th>Registered on</th>
              </tr>
            </thead>

            <tbody>
              {registrations.map((registration, index) => (
                <tr
                  key={
                    registration._id ||
                    registration.id ||
                    `${registration.email}-${index}`
                  }
                >
                  <td>{registration.name || '—'}</td>
                  <td>{registration.email || '—'}</td>
                  <td>{registration.workshop || '—'}</td>
                  <td>
                    {registration.registeredAt
                      ? new Date(
                          registration.registeredAt
                        ).toLocaleDateString('en-IN')
                      : '—'}
                  </td>
                </tr>
              ))}

              {registrations.length === 0 && (
                <tr>
                  <td colSpan="4">No registrations yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
