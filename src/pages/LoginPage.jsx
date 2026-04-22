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
          <h1>
            The best place for<br />
            <span className="gradient-text">mess management</span><br />
            & home-cooked meals.
          </h1>

          <div className="login-features">
            {[
              { icon: 'restaurant_menu', text: 'Daily updated menus from local experts' },
              { icon: 'timer', text: 'Timely meals at your doorstep or directly' },
              { icon: 'savings', text: 'Save up to 40% with monthly plans' }
            ].map((f) => (
              <div className="login-feature" key={f.text}>
                <div className="login-feature-icon">
                  <span className="material-icons icon">{f.icon}</span>
                </div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <div className="login-testimonial">
            <p>"Tiffo helped me find the perfect tiffin service near my office. Saves me ₹2000 every month!"</p>
            <div className="login-testimonial-author">
              <div className="login-testimonial-avatar">AM</div>
              <div>
                <strong>Amit M.</strong>
                <span>Software Engineer, Bangalore</span>
              </div>
            </div>
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

            <div className="social-login-btns">
              <button type="button" className="social-btn" id="google-login">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9086c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9086-2.2581c-.8059.54-1.8368.859-3.0478.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" />
                  <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9574A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9574 4.0418l3.0066-2.3318z" />
                  <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z" />
                </svg>
                <span>Google</span>
              </button>
              <button type="button" className="social-btn" id="phone-login">
                <span className="material-icons icon" style={{ color: 'var(--primary)' }}>phone_iphone</span>
                <span>Phone</span>
              </button>
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

          <div className="login-owner-cta">
            <span className="material-icons icon" style={{ color: 'var(--primary)' }}>storefront</span>
            <span>Own a mess? </span>
            <Link to="/owner/register" className="login-owner-link">Register Now</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
