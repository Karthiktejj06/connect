import React, { useState } from 'react';
import { X, User, Shield, LogOut, Key, Trash2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const ProfileSettings = ({ isOpen, onClose }) => {
  const { user, logout, updateProfile, changePassword, deleteAccount } = useAuth();
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Password Change State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!displayName.trim()) return toast.error('Name cannot be empty');
    setIsUpdating(true);
    const res = await updateProfile(displayName.trim());
    setIsUpdating(false);
    if (res.success) {
      toast.success('Settings saved successfully!');
      // Update local display name state if necessary
      setDisplayName(res.username || displayName);
    } else {
      toast.error(res.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    
    setIsPasswordUpdating(true);
    const res = await changePassword(currentPassword, newPassword);
    setIsPasswordUpdating(false);
    
    if (res.success) {
      toast.success('Password updated successfully!');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(res.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Once deleted, your data is gone forever. This cannot be undone. Are you sure?')) {
      const res = await deleteAccount();
      if (res.success) {
        toast.success('Account deleted successfully');
        onClose();
      } else {
        toast.error(res.message);
      }
    }
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
          maxWidth: '640px', 
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
            width: '80px', 
            height: '80px', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, var(--aura-primary), var(--aura-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: '900',
            color: 'white',
            boxShadow: 'var(--shadow-aura)',
            flexShrink: 0
          }}>
            {user?.username?.[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.04em', margin: 0 }}>Profile Settings</h2>
            <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>{user?.email}</p>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="aura-card" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--aura-text-muted)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Personal Information</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.6rem' }}>Display Name</label>
              <input 
                type="text" 
                className="aura-input" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How others see you"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--aura-text-muted)', marginTop: '0.5rem' }}>
                This name will be visible to everyone in collaborative rooms.
              </p>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.6rem' }}>Email Address</label>
              <input 
                type="email" 
                className="aura-input" 
                value={user?.email} 
                disabled 
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <button 
            onClick={handleSave} 
            className="btn-aura btn-aura-primary" 
            style={{ width: '100%', marginTop: '2rem', padding: '1rem', opacity: isUpdating ? 0.7 : 1 }}
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Security & Account Card */}
        <div className="aura-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--aura-text-muted)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Security & Account</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--aura-border)' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Password</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--aura-text-muted)' }}>Last changed: Just now</div>
              </div>
              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="btn-aura btn-aura-secondary" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Change
              </button>
            </div>

            <div style={{ marginTop: '1rem', padding: '1.5rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
              <h5 style={{ color: '#ef4444', margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>Danger Zone</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--aura-text-muted)', margin: '0.5rem 0 1.25rem 0' }}>Once deleted, your data is gone forever.</p>
              <button 
                onClick={handleDeleteAccount}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Sub-Modal */}
      {isPasswordModalOpen && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(8px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 3000,
          padding: '2rem'
        }} onClick={() => setIsPasswordModalOpen(false)}>
          <div 
            className="aura-card" 
            style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: 'var(--aura-card)', border: '1px solid var(--aura-glass-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>Change Password</h3>
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem', opacity: 0.8 }}>Current Password</label>
                <input 
                  type="password" 
                  className="aura-input" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem', opacity: 0.8 }}>New Password</label>
                <input 
                  type="password" 
                  className="aura-input" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem', opacity: 0.8 }}>Confirm New Password</label>
                <input 
                  type="password" 
                  className="aura-input" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="btn-aura btn-aura-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-aura btn-aura-primary"
                  style={{ flex: 2 }}
                  disabled={isPasswordUpdating}
                >
                  {isPasswordUpdating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
