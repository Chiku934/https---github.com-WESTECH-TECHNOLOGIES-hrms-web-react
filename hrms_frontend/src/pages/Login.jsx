import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading: authLoading, error: authError, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCompanyField, setShowCompanyField] = useState(false);

  useEffect(() => {
    const previous = document.body.className;
    document.body.className = `${previous} login-page`.trim();
    return () => {
      document.body.className = previous;
    };
  }, []);

  // Clear any auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Update message when authError changes
  useEffect(() => {
    if (authError) {
      setMessage({ type: 'error', text: authError });
    }
  }, [authError]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCompanySlug = companySlug.trim().toLowerCase() || null;

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
      await login(normalizedEmail, password, normalizedCompanySlug);
      
      setMessage({
        type: 'success',
        text: 'Login successful! Redirecting to dashboard...'
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if error indicates user belongs to multiple companies
      if (error.message?.includes('multiple companies') || error.response?.data?.message?.includes('multiple companies')) {
        setShowCompanyField(true);
        setMessage({
          type: 'info',
          text: 'You belong to multiple companies. Please specify which company to login to.'
        });
      } else {
        // Extract error message from backend response if available
        let errorMessage = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
        
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
      }
      setLoading(false);
    }
  };

  const toggleCompanyField = () => {
    setShowCompanyField(!showCompanyField);
    if (!showCompanyField) {
      setCompanySlug('');
    }
  };

  const isLoading = loading || authLoading;

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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  <Icon name={showPassword ? 'eye' : 'eye-slash'} size={16} />
                </button>
              </div>
            </label>

            {showCompanyField && (
              <label className="login-field">
                <span>Company Slug (Optional)</span>
                <div className="login-input-wrap">
                  <Icon name="building" size={16} />
                  <input
                    type="text"
                    value={companySlug}
                    onChange={(event) => setCompanySlug(event.target.value)}
                    placeholder="Enter company slug (e.g., acme-corp)"
                    autoComplete="organization"
                    disabled={isLoading}
                  />
                </div>
                <div className="login-field-help">
                  Required if you belong to multiple companies. Leave empty for default company.
                </div>
              </label>
            )}

            <div className="login-meta">
              <div className="login-meta-left">
                <a href="#" onClick={(event) => event.preventDefault()}>
                  Forgot password?
                </a>
              </div>
              <div className="login-meta-right">
                <button
                  type="button"
                  className="login-company-toggle"
                  onClick={toggleCompanyField}
                  disabled={isLoading}
                >
                  {showCompanyField ? 'Hide Company Field' : 'Multiple Companies?'}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="login-spinner" aria-hidden="true" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {message.text && (
              <div className={`login-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="login-footer">
              <p className="login-footer-text">
                Need help? Contact your system administrator.
              </p>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
