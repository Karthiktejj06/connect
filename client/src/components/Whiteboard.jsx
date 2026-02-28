import React, { useEffect, useRef, useState } from 'react';

const Whiteboard = ({ socket, roomId, tool, color, size }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Use a fixed internal resolution for better consistency and synchronization
  const INTERNAL_WIDTH = 2000;
  const INTERNAL_HEIGHT = 1200;

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = INTERNAL_WIDTH;
    canvas.height = INTERNAL_HEIGHT;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    contextRef.current = ctx;

    // Save initial state
    const initialState = canvas.toDataURL();
    setHistory([initialState]);
    setHistoryStep(0);
  }, []);

  useEffect(() => {
    const handleUndo = () => undo();
    const handleRedo = () => redo();
    window.addEventListener('undo-event', handleUndo);
    window.addEventListener('redo-event', handleRedo);
    return () => {
      window.removeEventListener('undo-event', handleUndo);
      window.removeEventListener('redo-event', handleRedo);
    };
  }, [history, historyStep]);

  const undo = () => {
    if (historyStep <= 0) return;
    const prevStep = historyStep - 1;
    const img = new Image();
    img.src = history[prevStep];
    img.onload = () => {
      contextRef.current.clearRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
      contextRef.current.drawImage(img, 0, 0);
      setHistoryStep(prevStep);
    };
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    const nextStep = historyStep + 1;
    const img = new Image();
    img.src = history[nextStep];
    img.onload = () => {
      contextRef.current.clearRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
      contextRef.current.drawImage(img, 0, 0);
      setHistoryStep(nextStep);
    };
  };

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  useEffect(() => {
    if (!socket) return;

    const handleDraw = (drawData) => {
      const { x, y, lastX, lastY, color, size, tool } = drawData;
      const ctx = contextRef.current;
      if (!ctx) return;

      ctx.save();
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
      }

      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    };

    const handleClear = () => {
      const ctx = contextRef.current;
      if (!ctx) return;
      ctx.clearRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
    };

    socket.on('draw', handleDraw);
    socket.on('clear-board', handleClear);

    return () => {
      socket.off('draw', handleDraw);
      socket.off('clear-board', handleClear);
    };
  }, [socket]);

  // Map client coordinates to internal canvas coordinates
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = INTERNAL_WIDTH / rect.width;
    const scaleY = INTERNAL_HEIGHT / rect.height;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const { x, y } = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const { x, y } = getCoordinates(e);
    const ctx = contextRef.current;

    const lastX = ctx.lastX || x;
    const lastY = ctx.lastY || y;

    ctx.save();
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }

    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();

    if (socket) {
      socket.emit('draw', {
        roomId,
        drawData: {
          x,
          y,
          lastX,
          lastY,
          color,
          size,
          tool
        }
      });
    }

    ctx.lastX = x;
    ctx.lastY = y;
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (contextRef.current) {
        delete contextRef.current.lastX;
        delete contextRef.current.lastY;
      }
      saveHistory();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      style={{
        display: 'block',
        cursor: tool === 'eraser' ? 'cell' : 'crosshair',
        width: '100%',
        height: '100%',
        touchAction: 'none',
        background: 'transparent',
        objectFit: 'contain'
      }}
    />
  );
};

export default Whiteboard;
