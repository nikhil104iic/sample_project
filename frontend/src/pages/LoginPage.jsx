import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await api.post(endpoint, payload);
      localStorage.setItem('access_token', response.data.access_token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.detail || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page page-center">
      {/* Animated background orbs */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />

      <div className="login-container animate-fade-in-up">
        {/* Logo / Brand */}
        <div className="login-header">
          <div className="login-logo">
            <div className="login-logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
                <path
                  d="M10 16L14 20L22 12"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#6c5ce7" />
                    <stop offset="1" stopColor="#a29bfe" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="login-logo-text">SampleApp</span>
          </div>
          <h1 className="login-title">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="login-subtitle">
            {isLogin
              ? 'Sign in to access your dashboard'
              : 'Get started with your free account'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group" style={{ animationDelay: '0.1s' }}>
              <label htmlFor="full_name" className="form-label">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleChange}
                required={!isLogin}
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Toggle login/register */}
        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              className="login-toggle-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
