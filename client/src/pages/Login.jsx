import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async (idToken) => {
    const res = await loginWithGoogle(idToken);
    if (res.success) {
      toast.success('Google Login successful!');
      navigate('/');
    } else {
      toast.error(res.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 72px)', padding: '2rem' }}>
      <div className="aura-card" style={{ width: '100%', maxWidth: '440px', background: 'var(--aura-card)', border: '1px solid var(--aura-glass-border)' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: '900', marginBottom: '0.75rem', textAlign: 'center', letterSpacing: '-0.04em' }}>Welcome Back</h2>
        <p style={{ color: 'var(--aura-text-muted)', textAlign: 'center', marginBottom: '3rem', fontSize: '1rem' }}>
          Reconnect with your team.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--aura-text-muted)', letterSpacing: '0.05em' }}>Email</label>
            <input
              type="email"
              className="aura-input"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--aura-text-muted)', letterSpacing: '0.05em' }}>Password</label>
            <input
              type="password"
              className="aura-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn-aura btn-aura-primary"
            style={{ width: '100%', padding: '1.1rem' }}
          >
            Login
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'var(--aura-text-muted)' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--aura-border)' }}></div>
            <span style={{ padding: '0 1rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--aura-border)' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={credentialResponse => {
                handleGoogleLogin(credentialResponse.credential);
              }}
              onError={() => {
                toast.error('Google Login Failed');
              }}
              theme="filled_black"
              shape="pill"
              text="continue_with"
              width="400"
            />
          </div>
        </form>
        
        <p style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--aura-text-muted)', fontSize: '0.95rem' }}>
          New here? <Link to="/register" style={{ color: 'var(--aura-primary)', fontWeight: '800', textDecoration: 'none' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
