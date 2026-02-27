import { Pencil, Eraser, Trash2, Undo, Redo, Download } from 'lucide-react';

const Toolbar = ({ tool, setTool, color, setColor, size, setSize, onClear }) => {
  const tools = [
    { id: 'pencil', icon: <Pencil size={20} />, label: 'Pencil' },
    { id: 'eraser', icon: <Eraser size={20} />, label: 'Eraser' },
  ];

  const handleUndo = () => window.dispatchEvent(new CustomEvent('undo-event'));
  const handleRedo = () => window.dispatchEvent(new CustomEvent('redo-event'));
  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'aura-masterpiece.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const colors = ['#1e293b', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#f8fafc'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', height: '100%' }}>
      {/* Tool Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`btn-aura ${tool === t.id ? 'btn-aura-primary' : 'btn-aura-secondary'}`}
            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', width: '48px', height: '48px' }}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div style={{ height: '1px', background: 'var(--aura-border)', margin: '0.25rem 0' }} />

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button onClick={handleUndo} className="btn-aura btn-aura-secondary" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', width: '48px', height: '48px' }} title="Undo"><Undo size={18} /></button>
        <button onClick={handleRedo} className="btn-aura btn-aura-secondary" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', width: '48px', height: '48px' }} title="Redo"><Redo size={18} /></button>
        <button onClick={handleDownload} className="btn-aura btn-aura-secondary" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', width: '48px', height: '48px' }} title="Export Image"><Download size={18} /></button>
      </div>

      <div style={{ height: '1px', background: 'var(--aura-border)', margin: '0.25rem 0' }} />

      {/* Color Palette */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          width: '28px', 
          height: '28px', 
          borderRadius: 'var(--radius-full)', 
          background: color, 
          border: '2px solid white', 
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          marginBottom: '0.25rem'
        }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: c,
                border: color === c ? '2px solid var(--aura-primary)' : '1px solid var(--aura-border)',
                cursor: 'pointer',
                padding: 0,
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              title={c}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.25)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
          ))}
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--aura-border)', margin: '0.25rem 0' }} />

      {/* Brush Size */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--aura-text-muted)' }}>{size}px</div>
        <input
          type="range"
          min="1"
          max="50"
          value={size}
          onChange={(e) => setSize(parseInt(e.target.value))}
          style={{ 
            width: '60px', 
            cursor: 'pointer', 
            accentColor: 'var(--aura-primary)',
            rotate: '-90deg',
            margin: '1.5rem 0'
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Clear Board */}
      <button
        onClick={onClear}
        className="btn-aura"
        style={{ 
          padding: '0.75rem', 
          borderRadius: 'var(--radius-md)', 
          color: '#ef4444',
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.1)',
          width: '48px',
          height: '48px'
        }}
        title="Clear Board"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

export default Toolbar;
