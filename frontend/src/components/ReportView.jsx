import React, { useState } from 'react';

export default function ReportView({ job, onBack }) {
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'sources' | 'critique'
  const [copied, setCopied] = useState(false);

  if (!job) return null;

  // Formatting date
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Basic Markdown parser
  const renderMarkdown = (text) => {
    if (!text) return { __html: '' };

    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Bullet lists
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');

    // Split by newlines and wrap paragraphs
    const blocks = html.split(/\n\n+/);
    const parsedBlocks = blocks.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<li')) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    });

    let finalHtml = parsedBlocks.join('\n');

    // Wrap list elements with ul tags
    finalHtml = finalHtml.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
    // Consolidate consecutive ul tags
    finalHtml = finalHtml.replace(/<\/ul>\s*<ul>/g, '');

    return { __html: finalHtml };
  };

  // Copy report to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(job.report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download markdown file
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([job.report], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    const filename = job.topic.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    element.download = `ResearchMind_${filename}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // SVG Score Ring variables
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((job.score || 0) / 10) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="printable-report">
      {/* View Header with back and action buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        paddingBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} className="glass-btn no-print">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              COMPLETED ON {formatDate(job.createdAt).toUpperCase()}
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginTop: '2px', color: 'var(--text-primary)' }}>
              {job.topic}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }} className="no-print">
          <button onClick={handleCopy} className="glass-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? 'Copied!' : 'Copy Markdown'}
          </button>

          <button onClick={handleDownload} className="glass-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Markdown
          </button>

          <button onClick={() => window.print()} className="glass-btn primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Main Grid: Info Cards (Tab contents) & Score Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Left Side: Tabs and Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Tabs bar */}
          <div className="no-print" style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            paddingBottom: '8px'
          }}>
            <button
              onClick={() => setActiveTab('report')}
              className={`glass-btn ${activeTab === 'report' ? 'primary' : ''}`}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Synthesis Report
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`glass-btn ${activeTab === 'sources' ? 'primary' : ''}`}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Authoritative Sources
            </button>
            <button
              onClick={() => setActiveTab('critique')}
              className={`glass-btn ${activeTab === 'critique' ? 'primary' : ''}`}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Critic Review
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            {activeTab === 'report' && (
              <article 
                className="markdown-body" 
                dangerouslySetInnerHTML={renderMarkdown(job.report)}
              />
            )}

            {activeTab === 'sources' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Deep-Scraped Source</h3>
                {job.selectedUrl ? (
                  <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      </div>
                      <a href={job.selectedUrl} target="_blank" rel="noreferrer" style={{
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        fontSize: '14px',
                        wordBreak: 'break-all',
                        textDecoration: 'none'
                      }}>
                        {job.selectedUrl}
                      </a>
                    </div>
                    
                    <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>Scraped Crawl Preview (3,000 Chars)</h4>
                    <pre style={{
                      background: 'rgba(0,0,0,0.2)',
                      padding: '12px',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      border: '1px solid rgba(255,255,255,0.03)'
                    }}>
                      {job.scrapedContent}
                    </pre>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No source URL scraped for this report.</p>
                )}

                <h3 style={{ fontSize: '16px', fontWeight: '600', marginTop: '16px' }}>Tavily Search Base</h3>
                <pre style={{
                  background: 'rgba(0,0,0,0.2)',
                  padding: '12px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}>
                  {job.searchResults}
                </pre>
              </div>
            )}

            {activeTab === 'critique' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                  Critic Critique Report
                </h3>
                
                <pre style={{
                  background: 'transparent',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>
                  {job.feedback}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Score Card Summary Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Circular Score display */}
          <div className="glass-panel" style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Critic Score</h3>
            
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <svg width="120" height="120" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="6"
                />
                {/* Progress Ring */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="transparent"
                  stroke="url(#scoreGlowGrad)"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="scoreGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#6b7280" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Inner score label */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '120px',
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
                  {job.score}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  out of 10
                </span>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              width: '100%',
              paddingTop: '12px',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              Agent consensus rate: 100%
            </div>
          </div>

          {/* Quick Summary Panel */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Synthesis Summary</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span style={{ color: 'var(--success)' }}>Finalized</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Source Crawled</span>
                <span style={{
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '160px'
                }}>
                  {job.selectedUrl ? new URL(job.selectedUrl).hostname : 'None'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Report Length</span>
                <span style={{ color: 'var(--text-primary)' }}>{job.report ? job.report.split(' ').length : 0} words</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
