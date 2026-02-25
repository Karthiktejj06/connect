import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (roomId, user) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId || !user) return;

    // Connect to the server
    const newSocket = io(import.meta.env.VITE_API_URL);
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Handle incoming events
    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
    };
  }, [roomId, user]);

  return socket;
};

export default useSocket;
