import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css';

const LoginPage = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' or 'owner'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (mode === 'signup' && !fullName)) {
      return setError('Please fill in all fields.');
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await login(email, password);
        if (user) {
          navigate(user.role === 'owner' ? '/owner/dashboard' : '/messes');
        } else {
          throw new Error('User profile not found after login.');
        }
      } else {
        const success = await signup({ name: fullName, email, password, role });
        if (success) {
          navigate('/onboarding');
        } else {
          throw new Error('Signup failed to return user data.');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <Link to="/" className="login-logo">
            <span>🍱</span> Tiffo
          </Link>
        </div>

        <div className="login-hero-text">
          

          <h1 className="hero-title reveal-2">
            The best place for<br />
            <span className="gradient-highlight">Mess Management</span><br />
            & Find meals.
          </h1>

          <div className="login-features">
            {[
              { icon: 'restaurant_menu', text: 'Daily updated menus from local experts' },
              { icon: 'verified', text: 'Verified home-style tiffin services' }
            ].map((f, idx) => (
              <div className={`login-feature reveal-${idx + 3}`} key={f.text}>
                <div className="login-feature-icon">
                  <span className="material-icons icon">{f.icon}</span>
                </div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          
        </div>

        <div className="login-left-pattern"></div>
      </div>

      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-tabs">
            <button 
              className={`login-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
              id="tab-login"
            >
              Log In
            </button>
            <button 
              className={`login-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => setMode('signup')}
              id="tab-signup"
            >
              Sign Up
            </button>
          </div>

          <div className="login-form-header">
            <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
            <p>
              {mode === 'login' 
                ? "Good to see you again! Let's get your meal sorted." 
                : "Join thousands of students finding home-style food."}
            </p>
          </div>

          {error && (
            <div style={{ color: '#ef5350', backgroundColor: '#ffebee', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <div className="input-group">
                  <label className="input-label" htmlFor="signup-name">Full Name</label>
                  <div className="input-with-icon">
                    <span className="material-icons icon input-icon-left">person</span>
                    <input 
                      id="signup-name"
                      type="text" 
                      className="input-field input-field-icon" 
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">I am a...</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', 
                      padding: '10px', border: '1px solid var(--gray-200)', borderRadius: '8px', flex: 1,
                      backgroundColor: role === 'customer' ? 'var(--primary-subtle)' : 'var(--white)',
                      borderColor: role === 'customer' ? 'var(--primary)' : 'var(--gray-200)',
                      transition: 'all 0.2s'
                    }}>
                      <input type="radio" name="role" value="customer" checked={role === 'customer'} onChange={() => setRole('customer')} style={{ display: 'none' }} />
                      <span className="material-icons icon" style={{ color: role === 'customer' ? 'var(--primary)' : 'var(--gray-500)' }}>restaurant</span>
                      <span style={{ fontWeight: role === 'customer' ? '600' : '400', color: role === 'customer' ? 'var(--primary)' : 'var(--gray-700)', fontSize: '14px' }}>Customer</span>
                    </label>
                    <label style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', 
                      padding: '10px', border: '1px solid var(--gray-200)', borderRadius: '8px', flex: 1,
                      backgroundColor: role === 'owner' ? 'var(--primary-subtle)' : 'var(--white)',
                      borderColor: role === 'owner' ? 'var(--primary)' : 'var(--gray-200)',
                      transition: 'all 0.2s'
                    }}>
                      <input type="radio" name="role" value="owner" checked={role === 'owner'} onChange={() => setRole('owner')} style={{ display: 'none' }} />
                      <span className="material-icons icon" style={{ color: role === 'owner' ? 'var(--primary)' : 'var(--gray-500)' }}>storefront</span>
                      <span style={{ fontWeight: role === 'owner' ? '600' : '400', color: role === 'owner' ? 'var(--primary)' : 'var(--gray-700)', fontSize: '14px' }}>Mess Owner</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label className="input-label" htmlFor="login-email">Email Address</label>
              <div className="input-with-icon">
                <span className="material-icons icon input-icon-left">mail</span>
                <input 
                  id="login-email"
                  type="email" 
                  className="input-field input-field-icon" 
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-label-row">
                <label className="input-label" htmlFor="login-password">Password</label>
                {mode === 'login' && <a href="#" className="forgot-link">Forgot password?</a>}
              </div>
              <div className="input-with-icon">
                <span className="material-icons icon input-icon-left">lock</span>
                <input 
                  id="login-password"
                  type="password" 
                  className="input-field input-field-icon" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg login-submit-btn" 
              id="login-submit"
              disabled={loading}
            >
              <span className="material-icons icon" style={{ marginRight: '8px' }}>
                {loading ? 'hourglass_empty' : (mode === 'login' ? 'login' : 'person_add')}
              </span>
              {loading ? 'Processing...' : (mode === 'login' ? 'Log In to Tiffo' : 'Create my Account')}
            </button>

            <div className="login-divider">
              <hr className="divider" />
              <span>or continue with</span>
              <hr className="divider" />
            </div>

           
          </form>

          <p className="login-switch">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="login-switch-btn" 
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? 'Create an account' : 'Log In'}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
