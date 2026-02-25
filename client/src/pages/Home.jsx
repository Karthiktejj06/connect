import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Users, ArrowRight, User, LogOut, Settings, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileSettings from '../components/ProfileSettings';

const Home = () => {
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName) return toast.error('Please enter a room name');
    
    // Generate a random unique room ID
    const generatedId = Math.random().toString(36).substring(2, 9);
    
    try {
      await axios.post('http://localhost:5007/api/rooms', { name: roomName, roomId: generatedId });
      toast.success('Room created!');
      navigate(`/room/${generatedId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create room');
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomId) return toast.error('Please enter a room ID');
    navigate(`/room/${roomId.trim().toLowerCase()}`);
  };

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-0.04em', marginBottom: '1rem' }}>
          Experience <span className="aura-logo">Connect</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--aura-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Simple real-time collaboration. Connect with your team instantly.
        </p>
      </header>

      {/* Simplified Profile Greeting */}
      <div style={{ 
        marginBottom: '4rem', 
        textAlign: 'center',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--aura-primary-muted)',
        border: '1px solid var(--aura-glass-border)'
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-0.02em', color: 'var(--aura-primary)' }}>
          Welcome back, {user?.username}
        </h2>
        <p style={{ color: 'var(--aura-text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>
          Ready to jump back into a session?
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Create Room Card */}
        <div className="aura-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: 'var(--radius-md)', 
            background: 'var(--aura-primary-muted)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--aura-primary)',
            marginBottom: '1.5rem'
          }}>
            <Plus size={32} strokeWidth={2.5} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>New Session</h3>
          <p style={{ color: 'var(--aura-text-muted)', marginBottom: '2.5rem', flex: 1 }}>
            Create a shared canvas and invite your team to collaborate.
          </p>
          <form onSubmit={handleCreateRoom}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                className="aura-input"
                placeholder="Session Name (e.g. Brainstorming)"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-aura btn-aura-primary" style={{ width: '100%' }}>
              Start <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Join Room Card */}
        <div className="aura-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: 'var(--radius-md)', 
            background: 'rgba(6, 182, 212, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--aura-secondary)',
            marginBottom: '1.5rem'
          }}>
            <Users size={32} strokeWidth={2.5} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Join Session</h3>
          <p style={{ color: 'var(--aura-text-muted)', marginBottom: '2.5rem', flex: 1 }}>
            Enter a Room ID below to join an existing session.
          </p>
          <form onSubmit={handleJoinRoom}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                className="aura-input"
                placeholder="Full Portal ID (e.g. abc1234)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-aura btn-aura-secondary" style={{ width: '100%' }}>
              Join <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Footer Logout */}
      <footer style={{ marginTop: '6rem', paddingTop: '3rem', borderBottom: '1.5rem solid transparent', borderTop: '1px solid var(--aura-border)', textAlign: 'center' }}>
        <button 
          onClick={() => {
            if(window.confirm('Are you sure you want to sign out?')) {
              logout();
            }
          }}
          className="btn-aura" 
          style={{ 
            padding: '0.75rem 2rem', 
            fontSize: '0.95rem', 
            color: '#ef4444', 
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            borderRadius: 'var(--radius-full)'
          }}
        >
          <LogOut size={18} /> Sign Out of Connect
        </button>
      </footer>

      <ProfileSettings isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      
      {/* Recent Sessions Portal */}
      <RecentSessions />
    </div>
  );
};

const RecentSessions = () => {
  const [recent, setRecent] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const sessions = JSON.parse(localStorage.getItem('aura_recent_sessions') || '[]');
    setRecent(sessions);
  }, []);

  const clearRecents = () => {
    if(window.confirm('Clear all recent portal records?')) {
      localStorage.removeItem('aura_recent_sessions');
      setRecent([]);
    }
  };

  if (recent.length === 0) return null;

  return (
    <div style={{ marginTop: '5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>Recent Sessions</h3>
        <button 
          onClick={clearRecents}
          style={{ background: 'transparent', border: 'none', color: 'var(--aura-text-muted)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Trash2 size={14} /> Clear History
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {recent.map((session) => (
          <div 
            key={session.roomId}
            className="aura-card" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '1.25rem',
              opacity: 0.9
            }}
          >
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'rgba(6, 182, 212, 0.05)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--aura-secondary)',
              flexShrink: 0
            }}>
              <Clock size={20} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--aura-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="aura-badge" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>{session.roomId}</span>
                <span style={{ fontSize: '0.6rem' }}>• {new Date(session.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default Home;
