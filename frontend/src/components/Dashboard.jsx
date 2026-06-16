import React, { useState } from 'react';

export default function Dashboard({ jobs, onStartResearch, onViewJob, onDeleteJob }) {
  const [topic, setTopic] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      onStartResearch(topic.trim());
      setTopic('');
    }
  };

  // Filtered jobs
  const filteredJobs = jobs.filter(job =>
    job.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics calculation
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const totalReports = completedJobs.length;
  const avgScore = totalReports > 0
    ? (completedJobs.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalReports).toFixed(1)
    : 'N/A';
  const activeJobsCount = jobs.filter(j => !['completed', 'failed'].includes(j.status)).length;

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Banner Header */}
      <div>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Research Console</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Query, crawl, synthesize, and critique topics autonomously using our multi-agent pipeline.
        </p>
      </div>

      {/* Main Initiator Search bar */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{
        padding: '24px',
        background: 'rgba(15, 15, 20, 0.4)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>
          Start New Agentic Synthesis
        </h3>
        <div className="search-input-wrapper">
          <input
            type="text"
            className="glass-input"
            placeholder="Enter a research topic (e.g. 'latest trends in multi-agent AI systems' or 'room temperature superconductors')..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <button type="submit" className="search-button" title="Initiate research">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 5L19 12L12 19" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </form>

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Syntheses</span>
            <h4 style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{totalReports}</h4>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Average LLM Rating</span>
            <h4 style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>
              {avgScore}{avgScore !== 'N/A' && <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>/10</span>}
            </h4>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div className={activeJobsCount > 0 ? "spin-slow" : ""} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
              </svg>
            </div>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Synthesizing Now</span>
            <h4 style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{activeJobsCount}</h4>
          </div>
        </div>
      </div>

      {/* History & Filter Section */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Recent Syntheses</h3>
          <input
            type="text"
            className="glass-input"
            placeholder="Filter by topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              maxWidth: '300px',
              padding: '10px 16px',
              fontSize: '14px',
              borderRadius: '8px'
            }}
          />
        </div>

        {filteredJobs.length === 0 ? (
          <div className="glass-panel" style={{
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}>
            No syntheses found. Start a new research topic above!
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {filteredJobs.map((job) => (
              <div key={job._id} className="glass-card" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '180px',
                position: 'relative'
              }}>
                {/* Delete button (upper right) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm("Delete this research job?")) onDeleteJob(job._id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '4px'
                  }}
                  title="Delete job"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>

                <div style={{ paddingRight: '20px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {formatDate(job.createdAt)}
                  </span>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginTop: '6px',
                    marginBottom: '12px',
                    lineHeight: '1.4',
                    color: 'var(--text-primary)',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.topic}
                  </h4>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.03)',
                  paddingTop: '12px'
                }}>
                  <span className={`status-badge ${job.status}`}>
                    {job.status === 'completed' ? `Score: ${job.score}/10` : job.status === 'failed' ? 'Failed' : job.status}
                  </span>

                  <button
                    onClick={() => onViewJob(job._id)}
                    className="glass-btn"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px'
                    }}
                  >
                    {['completed', 'failed'].includes(job.status) ? 'View synthesis' : 'Open live tracker'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
