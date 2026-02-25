import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Chat = ({ socket, roomId, messages }) => {
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const chatEndRef = useRef(null);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit('chat-message', {
        roomId,
        message,
        username: user.username,
      });
      setMessage('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, index) => {
          const isMe = msg.username === user.username;
          const isSystem = msg.username === 'System';

          if (isSystem) {
            return (
              <div key={index} style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: '800', 
                  color: 'var(--aura-text-muted)', 
                  background: 'var(--aura-border)', 
                  padding: '0.2rem 0.75rem', 
                  borderRadius: 'var(--radius-full)',
                  textTransform: 'uppercase'
                }}>
                  {msg.message}
                </span>
              </div>
            );
          }

          return (
            <div key={index} style={{ 
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              {!isMe && (
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--aura-text-muted)', marginLeft: '0.5rem' }}>
                  {msg.username}
                </span>
              )}
              <div style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: isMe ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                background: isMe ? 'var(--aura-primary)' : 'var(--aura-card)',
                color: isMe ? 'white' : 'var(--aura-text)',
                boxShadow: isMe ? 'var(--shadow-aura)' : 'var(--shadow-soft)',
                border: isMe ? 'none' : '1px solid var(--aura-border)',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                {msg.message}
                <div style={{ textAlign: 'right', fontSize: '0.65rem', marginTop: '0.25rem', opacity: isMe ? 0.8 : 0.6 }}>
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div style={{ padding: '1.25rem', borderTop: '1px solid var(--aura-border)' }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="aura-input"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" className="btn-aura btn-aura-primary" style={{ borderRadius: 'var(--radius-full)', width: '42px', height: '42px', minWidth: '42px', padding: 0 }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
