import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    const res = await register(username, email, password);
    if (res.success) {
      toast.success('Registration successful!');
      navigate('/');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 72px)', padding: '2rem' }}>
      <div className="aura-card" style={{ width: '100%', maxWidth: '480px', background: 'var(--aura-card)', border: '1px solid var(--aura-glass-border)' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: '900', marginBottom: '0.75rem', textAlign: 'center', letterSpacing: '-0.04em' }}>Register</h2>
        <p style={{ color: 'var(--aura-text-muted)', textAlign: 'center', marginBottom: '3rem', fontSize: '1rem' }}>
          Get started with Connect.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--aura-text-muted)', letterSpacing: '0.05em' }}>Username</label>
            <input
              type="text"
              className="aura-input"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div>
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
            <div>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--aura-text-muted)', letterSpacing: '0.05em' }}>Confirm</label>
              <input
                type="password"
                className="aura-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="btn-aura btn-aura-primary"
            style={{ width: '100%', padding: '1.1rem' }}
          >
            Register
          </button>
        </form>
        
        <p style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--aura-text-muted)', fontSize: '0.95rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--aura-primary)', fontWeight: '800', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
