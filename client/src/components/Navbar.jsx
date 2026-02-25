import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, User, LogOut, Settings, Hash, Plus } from 'lucide-react';
import JoinModal from './JoinModal';
import ProfileSettings from './ProfileSettings';

const Navbar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="aura-glass" style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 1000 }}>
        <Link to="/" className="aura-logo" style={{ textDecoration: 'none' }}>Connect</Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {user && (
            <button 
              onClick={() => setIsJoinModalOpen(true)}
              className="btn-aura btn-aura-secondary"
              style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
            >
              <Hash size={18} /> Join Session
            </button>
          )}

          <button 
            onClick={toggleTheme} 
            className="btn-aura btn-aura-secondary"
            style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)' }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={() => setIsProfileOpen(true)}
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: 'var(--radius-full)', 
                  background: 'linear-gradient(135deg, var(--aura-primary), var(--aura-accent))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-soft)',
                  fontSize: '1rem'
                }}
              >
                {user.username[0].toUpperCase()}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/login" className="btn-aura btn-aura-secondary" style={{ textDecoration: 'none', padding: '0.6rem 1.25rem' }}>Login</Link>
              <Link to="/register" className="btn-aura btn-aura-primary" style={{ textDecoration: 'none', padding: '0.6rem 1.25rem' }}>Register</Link>
            </div>
          )}
        </div>
      </nav>

      <JoinModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
      <ProfileSettings isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

export default Navbar;
