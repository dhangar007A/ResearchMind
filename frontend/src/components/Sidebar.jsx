import React from 'react';

export default function Sidebar({ activeView, onViewChange }) {
  return (
    <aside className="glass-panel" style={{
      width: 'var(--sidebar-width)',
      height: 'calc(100vh - 40px)',
      margin: '20px',
      marginRight: '0',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      borderRight: '1px solid var(--glass-border)'
    }}>
      {/* Brand Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '40px',
        paddingLeft: '8px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'radial-gradient(circle, #ffffff 10%, #1e1e24 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#08080a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#08080a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#08080a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>ResearchMind</h1>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>Multi-Agent OS v1.0</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <button
          onClick={() => onViewChange('dashboard')}
          className="glass-btn"
          style={{
            justifyContent: 'flex-start',
            width: '100%',
            padding: '12px 16px',
            background: activeView === 'dashboard' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            borderColor: activeView === 'dashboard' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" />
            <rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" />
            <rect x="3" y="16" width="7" height="5" />
          </svg>
          Console
        </button>

        <button
          onClick={() => onViewChange('history')}
          className="glass-btn"
          style={{
            justifyContent: 'flex-start',
            width: '100%',
            padding: '12px 16px',
            background: activeView === 'history' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            borderColor: activeView === 'history' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Report History
        </button>
      </nav>

      {/* Footer Details */}
      <div className="glass-panel" style={{
        padding: '12px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.01)',
        borderColor: 'rgba(255,255,255,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--success)',
            boxShadow: '0 0 8px var(--success)'
          }}></div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Local node active</span>
        </div>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Pipeline model: mistral-small
        </p>
      </div>
    </aside>
  );
}
