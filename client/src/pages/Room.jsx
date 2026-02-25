import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, ChatBubble, Layout, Video, PhoneOff, Mic, MicOff, VideoOff, 
  Monitor, ScreenShareOff, ChevronLeft, ChevronRight, Send, Download,
  Maximize2, Minimize2, Share2, LogOut, X
} from 'lucide-react';
import useSocket from '../hooks/useSocket';
import Whiteboard from '../components/Whiteboard';
import Toolbar from '../components/Toolbar';
import Chat from '../components/Chat';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

const Room = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [roomData, setRoomData] = useState(null);
  
  // States for features
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  
  // Socket and Collaboration
  const socket = useSocket(roomId, user);
  
  // Media States
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [remoteFaceCams, setRemoteFaceCams] = useState({}); // { username: stream }
  const [remoteScreens, setRemoteScreens] = useState({}); // { username: stream }
  const [focusedStream, setFocusedStream] = useState(null); // { type, username, stream }
  const [isFaceCamActive, setIsFaceCamActive] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [mainStream, setMainStream] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isStreamExpanded, setIsStreamExpanded] = useState(false);
  const [users, setUsers] = useState([]);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#8b5cf6');
  const [size, setSize] = useState(5);

  const peerConnections = useRef({}); // { username: RTCPeerConnection }
  const remoteVideosRef = useRef({}); // To manage video elements
  const localStreamRef = useRef(null);
  const localFaceCam = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Chat message listener
    const handleChatMessage = (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    };
    socket.on('chat-message', handleChatMessage);

    // WebRTC Signaling Handler
    const handleSignaling = async ({ type, from, data }) => {
      if (from === user.username) return;

      if (type === 'offer') {
        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('signaling', { roomId, to: from, type: 'answer', data: { answer } });
      } else if (type === 'answer') {
        const pc = peerConnections.current[from];
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      } else if (type === 'candidate') {
        const pc = peerConnections.current[from];
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } else if (type === 'stream-stopped') {
        const { streamType } = data;
        
        // Remove from bubbles (both camera and screen shares use this)
        setRemoteFaceCams(prev => {
          const next = { ...prev };
          delete next[from];
          return next;
        });
        
        // If this user was being focused in the large overlay, clear it
        if (focusedStream?.username === from) {
          setFocusedStream(null);
          setIsStreamExpanded(false);
          // Note: mainStream is local only, so we don't touch it here
        }
      }
    };
    socket.on('signaling', handleSignaling);

    // Sync profile changes to the room in real-time
    const handleProfileUpdate = (e) => {
      const updatedUser = e.detail;
      console.log('Room: Profile updated, syncing to socket...', updatedUser.username);
      socket.emit('update-username', { 
        roomId, 
        userId: user._id, 
        newUsername: updatedUser.username 
      });
    };
    window.addEventListener('profile-updated', handleProfileUpdate);

    const handleUserList = (userList) => {
      console.log('Room: Received user-list:', userList);
      setUsers((prevUsers) => {
        // Find users who left by comparing IDs
        const leftUsers = prevUsers.filter(u => u && u._id && !userList.find(nu => nu._id === u._id));
        
        console.log('Room: Users who left:', leftUsers);
        
        leftUsers.forEach(u => {
          if (!u || !u.username) return;
          // Cleanup PeerConnection
          if (peerConnections.current[u.username]) {
            peerConnections.current[u.username].close();
            delete peerConnections.current[u.username];
          }
          // Cleanup Remote Video
          setRemoteFaceCams(prev => {
            const next = { ...prev };
            delete next[u.username];
            return next;
          });
          // Cleanup Focused Stream
          setFocusedStream(prev => (prev?.username === u.username ? null : prev));
        });
        
        return userList;
      });
    };
    socket.on('user-list', handleUserList);

    // NOW join the room - all listeners are ready
    const joinRoom = () => {
      console.log('Room: Emitting join-room', { roomId, username: user.username, userId: user._id });
      socket.emit('join-room', { roomId, username: user.username, userId: user._id });
    };
    if (socket.connected) {
      joinRoom();
    } else {
      socket.on('connect', joinRoom);
    }

    return () => {
      socket.off('user-list', handleUserList);
      socket.off('chat-message', handleChatMessage);
      socket.off('signaling', handleSignaling);
      window.removeEventListener('profile-updated', handleProfileUpdate);
      socket.off('connect', joinRoom);
      Object.values(peerConnections.current).forEach(pc => pc.close());
    };
  }, [socket, user.username, roomId]);

  const createPeerConnection = (targetUser) => {
    if (peerConnections.current[targetUser]) return peerConnections.current[targetUser];

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signaling', { roomId, to: targetUser, type: 'candidate', data: { candidate: event.candidate } });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteFaceCams(prev => ({ ...prev, [targetUser]: stream }));
      
      // Auto-focus if it's the first remote stream or if a screen share starts
      if (Object.keys(remoteFaceCams).length === 0 || event.track.kind === 'video') {
         // Optionally auto-expand if desired, but let's keep it manual for now
      }

      // Cleanup if tracks end naturally
      event.track.onended = () => {
        setRemoteFaceCams(prev => {
          const next = { ...prev };
          delete next[targetUser];
          return next;
        });
      };
    };

    peerConnections.current[targetUser] = pc;
    return pc;
  };



  const toggleScreenShare = async () => {
    if (isSharing) {
      localStream.current?.getTracks().forEach(track => track.stop());
      setIsSharing(false);
      setMainStream(null);
      // Notify others
      socket.emit('signaling', { roomId, type: 'stream-stopped', data: { streamType: 'screen' } });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      localStream.current = stream;
      setIsSharing(true);
      setMainStream(stream);

      // Simple implementation: Send to everyone
      users.forEach(({ username }) => {
        if (username !== user.username) {
          const pc = createPeerConnection(username);
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
          pc.createOffer().then(offer => {
            pc.setLocalDescription(offer);
            socket.emit('signaling', { roomId, to: username, type: 'offer', data: { offer } });
          });
        }
      });

      stream.getVideoTracks()[0].onended = () => {
        setIsSharing(false);
        setMainStream(null);
      };
    } catch (err) {
      toast.error('Could not open screen portal');
    }
  };

  const toggleFaceCam = async () => {
    if (isFaceCamActive) {
      localFaceCam.current?.getTracks().forEach(track => track.stop());
      setIsFaceCamActive(false);
      // Notify others
      socket.emit('signaling', { roomId, type: 'stream-stopped', data: { streamType: 'camera' } });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      localFaceCam.current = stream;
      setIsFaceCamActive(true);

      // Broadcast to others
      users.forEach(({ username }) => {
        if (username !== user.username) {
          const pc = createPeerConnection(username);
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
          pc.createOffer().then(offer => {
            pc.setLocalDescription(offer);
            socket.emit('signaling', { roomId, to: username, type: 'offer', data: { offer } });
          });
        }
      });
    } catch (err) {
      toast.error('Face Cam portal offline');
    }
  };

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/rooms/${roomId}`);
        setRoomData(data);
        
        // Save to Recent Sessions
        const recent = JSON.parse(localStorage.getItem('aura_recent_sessions') || '[]');
        const newSession = { roomId, name: data.name, timestamp: new Date().getTime() };
        
        // Filter out duplicates and keep latest 5
        const updatedRecent = [
          newSession,
          ...recent.filter(s => s.roomId !== roomId)
        ].slice(0, 5);
        
        localStorage.setItem('aura_recent_sessions', JSON.stringify(updatedRecent));
        
      } catch (err) {
        toast.error(err.response?.data?.message || 'Session not found');
        navigate('/');
      }
    };
    fetchRoom();
  }, [roomId, navigate]);

  const handleLeave = () => {
    if (window.confirm('Leave the session?')) {
      navigate('/');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Session link copied!');
  };



  if (!roomData) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--aura-bg)', color: 'var(--aura-text)' }}>Connecting...</div>;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--aura-bg)', overflow: 'hidden' }}>
      {/* Connect Header */}
      <header className="aura-glass room-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="aura-logo" style={{ fontSize: '1.25rem' }}>Connect</div>
          <div style={{ width: '1px', height: '24px', background: 'var(--aura-border)' }} className="mobile-hide" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontWeight: '800', fontSize: '1rem', letterSpacing: '-0.02em' }}>{roomData.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="aura-badge">{roomId}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  toast.success('Room ID copied!');
                }}
                className="btn-aura-secondary"
                style={{ background: 'transparent', border: 'none', color: 'var(--aura-primary)', cursor: 'pointer', padding: '0.2rem', display: 'flex' }}
                title="Copy ID"
              >
                <Share2 size={12} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--aura-text-muted)', fontSize: '0.85rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <span>{users.length} Online</span>
          </div>
          <button onClick={handleShare} className="btn-aura btn-aura-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
            <Share2 size={16} /> <span className="mobile-hide">Share</span>
          </button>
          <button onClick={handleLeave} className="btn-aura" style={{ 
            padding: '0.5rem 1rem', 
            fontSize: '0.75rem', 
            background: 'rgba(239, 68, 68, 0.05)', 
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.1)' 
          }}>
            <LogOut size={16} /> <span className="mobile-hide">Leave</span>
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }} className="room-layout">
        {/* Left Toolbar */}
        <aside className="room-toolbar">
          <Toolbar
            tool={tool}
            setTool={setTool}
            color={color}
            setColor={setColor}
            size={size}
            setSize={setSize}
            onClear={() => {
              const currentUserId = user._id;
              const hostId = roomData?.host?._id || roomData?.host;
              if (hostId === currentUserId) {
                socket.emit('clear-board', { roomId });
              } else {
                toast.warning('Only the Host can clear the board');
              }
            }}
          />
        </aside>

        {/* Main Workspace */}
        <main style={{ position: 'relative', background: 'var(--aura-bg)' }} className="room-main">
          <div className="aura-card" style={{ 
            width: '100%', 
            height: '100%', 
            padding: 0, 
            overflow: 'hidden',
            position: 'relative',
            background: 'var(--aura-card)',
            border: '1px solid var(--aura-glass-border)'
          }}>
            <Whiteboard socket={socket} roomId={roomId} tool={tool} color={color} size={size} />

            {/* Dynamic Stream Panel (Focused Essence) */}
            {(mainStream || focusedStream) && (
              <div className="aura-glass stream-overlay" style={{ 
                position: 'absolute', 
                top: '1.5rem', 
                right: '1.5rem', 
                width: isStreamExpanded ? '85%' : '380px', 
                height: isStreamExpanded ? '85%' : 'auto',
                borderRadius: 'var(--radius-lg)', 
                overflow: 'hidden',
                boxShadow: 'var(--shadow-aura)',
                border: '1px solid var(--aura-primary)',
                zIndex: 200,
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                background: 'rgba(0,0,0,0.8)'
              }}>
                <div style={{ padding: '0.6rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(10px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                      {focusedStream ? `${focusedStream.username}'s Essence` : 'Live Aura (Screen)'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => setIsStreamExpanded(!isStreamExpanded)} 
                      style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.2rem' }}
                      title={isStreamExpanded ? "Collapse" : "Expand"}
                    >
                      <Monitor size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        setMainStream(null);
                        setFocusedStream(null);
                        setIsStreamExpanded(false);
                      }} 
                      style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <video 
                  ref={el => {
                    if (el) {
                      if (focusedStream) el.srcObject = focusedStream.stream;
                      else if (mainStream) el.srcObject = mainStream;
                    }
                  }} 
                  autoPlay 
                  playsInline 
                  style={{ 
                    width: '100%', 
                    height: 'calc(100% - 44px)', 
                    display: 'block', 
                    objectFit: isStreamExpanded ? 'contain' : 'cover', 
                    background: '#000' 
                  }} 
                />
              </div>
            )}

            {/* Local/Remote Face Cam Bubbles */}
            <div style={{ 
              position: 'absolute', 
              bottom: '1.5rem', 
              right: '1.5rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              alignItems: 'flex-end',
              zIndex: 210
            }}>
              {isFaceCamActive && (
                <div className="aura-glass" style={{ width: '160px', aspectRatio: '16/9', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-aura)', border: '2px solid var(--aura-primary)' }}>
                  <video ref={el => { if (el) el.srcObject = localFaceCam.current; }} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              {Object.entries(remoteFaceCams).map(([uname, stream]) => (
                <div 
                  key={uname} 
                  className="aura-glass" 
                  onClick={() => {
                    setFocusedStream({ username: uname, stream });
                    // If not already showing a stream, or if clicking a new one, show expansion
                  }}
                  style={{ 
                    width: '160px', 
                    aspectRatio: '16/9', 
                    borderRadius: 'var(--radius-md)', 
                    overflow: 'hidden', 
                    boxShadow: 'var(--shadow-aura)', 
                    border: focusedStream?.username === uname ? '2px solid var(--aura-primary)' : '1px solid var(--aura-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  <video 
                    autoPlay 
                    playsInline 
                    ref={el => { if (el) el.srcObject = stream; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ position: 'absolute', bottom: '2px', left: '4px', fontSize: '10px', color: 'white', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', backdropFilter: 'blur(4px)' }}>
                    {uname}
                  </div>
                  <div className="expand-hint" style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(139, 92, 246, 0.8)',
                    padding: '4px',
                    borderRadius: '50%',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    color: 'white'
                  }}>
                    <Share2 size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ethereal Floating Controls */}
          <div className="aura-glass floating-controls">
            <button onClick={toggleScreenShare} className={`btn-aura ${isSharing ? 'btn-aura-primary' : 'btn-aura-secondary'}`} style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem', width: '48px', height: '48px' }} title="Share Screen">
              <Monitor size={22} />
            </button>
            <button onClick={toggleFaceCam} className={`btn-aura ${isFaceCamActive ? 'btn-aura-primary' : 'btn-aura-secondary'}`} style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem', width: '48px', height: '48px' }} title="Camera">
              <Users size={22} />
            </button>
            <button onClick={toggleTheme} className="btn-aura btn-aura-secondary" style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem', width: '48px', height: '48px' }} title="Toggle Theme">
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </button>

          </div>
        </main>

        {/* Aura Right Panel */}
        <aside className="aura-glass room-panel">
          <div style={{ display: 'flex', borderBottom: '1px solid var(--aura-border)' }}>
            <button onClick={() => setActiveTab('chat')} style={{ flex: 1, padding: '1.25rem', border: 'none', background: activeTab === 'chat' ? 'var(--aura-bg)' : 'transparent', borderBottom: activeTab === 'chat' ? '2px solid var(--aura-primary)' : 'none', color: activeTab === 'chat' ? 'var(--aura-primary)' : 'var(--aura-text-muted)', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <MessageSquare size={18} /> <span className="mobile-hide">Chat</span>
            </button>
            <button onClick={() => setActiveTab('users')} style={{ flex: 1, padding: '1.25rem', border: 'none', background: activeTab === 'users' ? 'var(--aura-bg)' : 'transparent', borderBottom: activeTab === 'users' ? '2px solid var(--aura-primary)' : 'none', color: activeTab === 'users' ? 'var(--aura-primary)' : 'var(--aura-text-muted)', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <Users size={18} /> <span className="mobile-hide">Users</span>
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeTab === 'chat' ? (
              <Chat socket={socket} roomId={roomId} messages={chatMessages} />
            ) : (
              <div style={{ padding: '2rem' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--aura-text-muted)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>In this Session</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {users && users.length > 0 ? users.map((u, i) => {
                      if (!u || !u.username) return null;
                      const isMe = u._id === user._id;
                      const isHost = u._id === roomData.host?._id;
                      
                      return (
                        <div key={u._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }} className="animate-fade-in">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--aura-primary), var(--aura-accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: 'var(--shadow-soft)' }}>
                              {u.username[0].toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                                {u.username} 
                                {isMe && <span style={{ color: 'var(--aura-primary)', fontSize: '0.75rem', marginLeft: '0.4rem' }}>(Me)</span>}
                                {isHost && <span style={{ color: 'var(--aura-secondary)', fontSize: '0.75rem', marginLeft: '0.4rem' }}>(Host)</span>}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                  }) : (
                    <div style={{ textAlign: 'center', py: '2rem', color: 'var(--aura-text-muted)', fontSize: '0.85rem' }}>
                      No other users in this session.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Room;
