import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { authAPI } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    if (!password) {
      setMessage({ type: 'error', text: 'Please enter your password.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.login(normalizedEmail, password);
      
      // Extract data from response
      const { user, token } = response.data;
      
      // Store token and role in localStorage
      localStorage.setItem('hrms_token', token);
      localStorage.setItem('hrms_role', user.role);
      
      // Store additional user info if needed
      localStorage.setItem('hrms_user', JSON.stringify(user));
      
      setMessage({
        type: 'success',
        text: `Login successful! Redirecting to ${user.role} dashboard...`
      });
      
      // Redirect based on role
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Extract error message from backend response if available
      let errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      
      // Fallback to status-based messages if no specific message from backend
      if (!error.response?.data?.message) {
        if (error.response?.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (error.response?.status === 400) {
          errorMessage = 'Invalid request. Please check your input.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Access denied. User is not assigned to any company.';
        } else if (error.response?.status === 404) {
          errorMessage = 'User not found.';
        } else if (error.message?.includes('Network Error')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message?.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        }
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
      setLoading(false);
    }
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
          </form>
        </section>
      </div>
    </div>
  );
}
