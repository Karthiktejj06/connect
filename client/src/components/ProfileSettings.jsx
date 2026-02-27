import React, { useState } from 'react';
import { X, LogOut, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProfileSettings = ({ isOpen, onClose }) => {
  const { user, logout, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!displayName.trim()) return toast.error('Name cannot be empty');
    setIsUpdating(true);
    const res = await updateProfile(displayName.trim());
    setIsUpdating(false);
    if (res.success) {
      toast.success('Username updated!');
      setDisplayName(res.username);
    } else {
      toast.error(res.message);
    }
  };

  const handleClerkProfile = () => {
    window.open('https://accounts.clerk.com/user', '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '2rem'
    }} onClick={onClose}>
      <div
        className="aura-glass"
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          padding: '2.5rem',
          position: 'relative',
          background: 'var(--aura-card)',
          borderRadius: '24px',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--aura-text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        {/* Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--aura-primary), var(--aura-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: '900',
            color: 'white',
            boxShadow: 'var(--shadow-aura)',
            flexShrink: 0
          }}>
            {user?.username?.[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.04em', margin: 0 }}>My Profile</h2>
            <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{user?.email}</p>
          </div>
        </div>

        {/* Action Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="aura-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--aura-text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Identity</h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                className="aura-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Username"
                style={{ flex: 1 }}
              />
              <button
                onClick={handleSave}
                className="btn-aura btn-aura-primary"
                style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>

          <div className="aura-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--aura-text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Account Settings</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--aura-text-muted)', marginBottom: '1.25rem' }}>
              Manage your password, security, and linked accounts via Clerk.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleClerkProfile}
                className="btn-aura btn-aura-secondary"
                style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Key size={16} /> Manage Security
              </button>
              <button
                onClick={logout}
                className="btn-aura"
                style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleClerkProfile}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', opacity: 0.6 }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
