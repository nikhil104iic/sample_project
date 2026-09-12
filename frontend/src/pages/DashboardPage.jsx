import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './DashboardPage.css';

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_profile'));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => !localStorage.getItem('user_profile'));
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    let isActive = true;
    if (!user) {
      api.get('/api/auth/profile')
        .then((response) => {
          if (isActive) {
            setUser(response.data);
            localStorage.setItem('user_profile', JSON.stringify(response.data));
            setLoading(false);
          }
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_profile');
          navigate('/login', { replace: true });
        })
        .finally(() => {
          if (isActive) setLoading(false);
        });
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      isActive = false;
      clearInterval(timer);
    };
  }, [navigate, user]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    navigate('/login', { replace: true });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="page-center">
        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page page-full">
      {/* Background orbs */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />

      {/* Top Navigation */}
      <nav className="dashboard-nav">
        <div className="dashboard-nav-brand">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#nav-gradient)" />
            <path
              d="M10 16L14 20L22 12"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="nav-gradient" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#6c5ce7" />
                <stop offset="1" stopColor="#a29bfe" />
              </linearGradient>
            </defs>
          </svg>
          <span>SampleApp</span>
        </div>
        <div className="dashboard-nav-actions">
          <div className="dashboard-user-badge">
            <div className="dashboard-avatar">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="dashboard-user-name">{user?.full_name}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost dashboard-logout-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 14H3.33C2.6 14 2 13.4 2 12.67V3.33C2 2.6 2.6 2 3.33 2H6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.67 11.33L14 8L10.67 4.67" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 8H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Welcome Section */}
        <section className="dashboard-welcome animate-fade-in-up">
          <div className="dashboard-welcome-text">
            <h1>
              {getGreeting()}, <span className="gradient-text">{user?.full_name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="dashboard-date">{formatDate()}</p>
          </div>
          <div className="dashboard-clock">
            <span>{formatTime()}</span>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="dashboard-stats">
          <div className="stat-card glass-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon stat-icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">12</span>
              <span className="stat-label">Projects</span>
            </div>
          </div>

          <div className="stat-card glass-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon stat-icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">48</span>
              <span className="stat-label">Tasks Done</span>
            </div>
          </div>

          <div className="stat-card glass-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="stat-icon stat-icon-teal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">8</span>
              <span className="stat-label">Team Members</span>
            </div>
          </div>

          <div className="stat-card glass-card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="stat-icon stat-icon-pink">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">99%</span>
              <span className="stat-label">Uptime</span>
            </div>
          </div>
        </section>

        {/* Profile Card */}
        <section className="dashboard-profile glass-card animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h2>Your Profile</h2>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="profile-label">Full Name</span>
              <span className="profile-value">{user?.full_name}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Role</span>
              <span className="profile-value">{user?.role}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Email</span>
              <span className="profile-value">{user?.email}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Member Since</span>
              <span className="profile-value">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Account Status</span>
              <span className="profile-value profile-status-active">
                <span className="status-dot" />
                Active
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
