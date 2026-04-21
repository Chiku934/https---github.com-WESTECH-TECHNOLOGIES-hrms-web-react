import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

const DEMO_USERS = {
  'super-admin': { email: 'superadmin@hrms.com', password: '1234', redirectTo: '/dashboard', label: 'Super Admin' },
  'sub-admin': { email: 'subadmin@hrms.com', password: '1234', redirectTo: '/dashboard', label: 'Sub Admin' },
  'company-admin': { email: 'companyadmin@hrms.com', password: '1234', redirectTo: '/dashboard', label: 'Company Admin' },
  hr: { email: 'hr@hrms.com', password: '1234', redirectTo: '/dashboard', label: 'HR' },
  manager: { email: 'manager@hrms.com', password: '1234', redirectTo: '/dashboard', label: 'Manager' },
  employee: { email: 'employee@hrms.com', password: '1234', redirectTo: '/dashboard', label: 'Employee' },
};

const DEFAULT_ROLE = 'company-admin';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_USERS[DEFAULT_ROLE].email);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const previous = document.body.className;
    document.body.className = `${previous} login-page`.trim();
    return () => {
      document.body.className = previous;
    };
  }, []);

  const handleQuickFill = (nextRole) => {
    setEmail(DEMO_USERS[nextRole].email);
    setPassword(DEMO_USERS[nextRole].password);
    setMessage({ type: '', text: '' });
    setShowPassword(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const currentUser = Object.values(DEMO_USERS).find((user) => user.email === normalizedEmail);

    if (!normalizedEmail) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    if (!password) {
      setMessage({ type: 'error', text: 'Please enter your password.' });
      return;
    }

    if (!currentUser) {
      setMessage({
        type: 'error',
        text: 'Use one of the demo emails from the quick links below or enter the matching role email.',
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    window.setTimeout(() => {
      if (normalizedEmail === currentUser.email && password === currentUser.password) {
        setMessage({ type: 'success', text: `Redirecting to ${currentUser.label} Dashboard...` });
        const matchedRole = Object.entries(DEMO_USERS).find(([, user]) => user.email === normalizedEmail)?.[0] ?? DEFAULT_ROLE;
        window.localStorage.setItem('hrms_role', matchedRole);
        window.setTimeout(() => navigate(currentUser.redirectTo), 900);
        return;
      }

      setMessage({
        type: 'error',
        text: 'Invalid credentials. Use the matching demo email and 1234 password from the quick links below.',
      });
      setLoading(false);
    }, 700);
  };

  return (
    <div className="login-shell">
      <div className="login-container">
        <section className="login-card" aria-label="Login form">
          <div className="login-card-top">
            <div>
              <div className="login-title">WELCOME BACK HRPulse</div>
              <div className="login-subtitle">Sign in to continue to your dashboard.</div>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="login-field">
              <span>Email</span>
              <div className="login-input-wrap">
                <Icon name="envelope" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="login-field">
              <span>Password</span>
              <div className="login-input-wrap">
                <Icon name="lock" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'eye' : 'eye-slash'} size={16} />
                </button>
              </div>
            </label>

            <div className="login-meta">
              <a href="#" onClick={(event) => event.preventDefault()}>
                Forgot password?
              </a>
              <span>Use the demo credentials below if needed.</span>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner" aria-hidden="true" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className={`login-message ${message.type}`}>{message.text}</div>

            <div className="login-quick-label">Quick Logins</div>
            <div className="login-quick">
              <button type="button" onClick={() => handleQuickFill('super-admin')}>
                Login as Super Admin
              </button>
              <button type="button" onClick={() => handleQuickFill('company-admin')}>
                Login as Company Admin
              </button>
              <button type="button" onClick={() => handleQuickFill('employee')}>
                Login as Employee
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
