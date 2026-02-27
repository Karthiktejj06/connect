import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Hash, ArrowRight } from 'lucide-react';

const JoinModal = ({ isOpen, onClose }) => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
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
      zIndex: 1000 
    }} onClick={onClose}>
      <div 
        className="aura-card" 
        style={{ width: '400px', padding: '2rem', position: 'relative', background: 'var(--aura-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--aura-text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: 'var(--radius-md)', 
          background: 'rgba(236, 72, 153, 0.12)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#ec4899',
          marginBottom: '1.5rem'
        }}>
          <Hash size={24} />
        </div>

        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Join Session</h3>
        <p style={{ color: 'var(--aura-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Enter the Room ID to join the session.
        </p>

        <form onSubmit={handleJoin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              className="aura-input"
              placeholder="e.g. x7y2z9a"
              autoFocus
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-aura btn-aura-secondary" style={{ width: '100%' }}>
            Join Session <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinModal;
