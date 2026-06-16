import React from 'react';

export default function ResearchRunner({ job, onBack }) {
  if (!job) return null;

  // Pipeline stages configuration
  const stages = [
    {
      key: 'searching',
      label: 'Search Agent',
      desc: 'Executing web searches via Tavily to crawl recent and authoritative resources.',
      progressLabel: 'Searching the web...',
      completeLabel: 'Web search completed. 5 resources retrieved.'
    },
    {
      key: 'reading',
      label: 'Reader Agent',
      desc: 'Filtering resources, selecting the most relevant domain, and crawling text content.',
      progressLabel: 'Selecting URL & scraping text...',
      completeLabel: `Selected source: ${job.selectedUrl ? new URL(job.selectedUrl).hostname : ''}`
    },
    {
      key: 'writing',
      label: 'Writer Agent',
      desc: 'Synthesizing gathered snippets and raw crawls into a highly structured report.',
      progressLabel: 'Structuring & drafting report...',
      completeLabel: 'Drafted report.'
    },
    {
      key: 'critiquing',
      label: 'Critic Agent',
      desc: 'Performing strict evaluation of facts, structure, strengths, and areas to improve.',
      progressLabel: 'Critiquing and scoring report...',
      completeLabel: 'Feedback and score generated.'
    }
  ];

  const getStageStatus = (stageKey) => {
    const statusOrder = ['pending', 'searching', 'reading', 'writing', 'critiquing', 'completed', 'failed'];
    const currentIdx = statusOrder.indexOf(job.status);
    const stageIdx = statusOrder.indexOf(stageKey);

    if (job.status === 'failed') {
      // If failed, whatever was active is now failed, subsequent are pending
      if (currentIdx === stageIdx) return 'failed';
      return stageIdx < currentIdx ? 'completed' : 'pending';
    }

    if (job.status === 'completed') return 'completed';
    if (job.status === stageKey) return 'active';
    return stageIdx < currentIdx ? 'completed' : 'pending';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={onBack} className="glass-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>LIVE TRACKING PIPELINE</span>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{job.topic}</h2>
        </div>
      </div>

      {/* Main Grid: Pipeline visualizer and Terminal logs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Pipeline Stage List */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
            Agent Pipeline Progression
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '17px',
              bottom: '12px',
              width: '2px',
              background: 'rgba(255, 255, 255, 0.05)',
              zIndex: 1
            }}></div>

            {stages.map((stage, idx) => {
              const status = getStageStatus(stage.key);
              
              return (
                <div key={stage.key} style={{ display: 'flex', gap: '20px', zIndex: 2 }}>
                  {/* Circle indicator */}
                  <div style={{ position: 'relative' }}>
                    <div className={status === 'active' ? 'pulse-active' : ''} style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: status === 'completed' 
                        ? 'rgba(52, 211, 153, 0.1)' 
                        : status === 'failed' 
                        ? 'rgba(248, 113, 113, 0.1)' 
                        : status === 'active' 
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'var(--bg-tertiary)',
                      border: `1.5px solid ${
                        status === 'completed' 
                          ? 'var(--success)' 
                          : status === 'failed' 
                          ? 'var(--error)' 
                          : status === 'active' 
                          ? '#ffffff'
                          : 'rgba(255, 255, 255, 0.08)'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      {status === 'completed' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {status === 'failed' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                      {status === 'active' && (
                        <div className="spin-slow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
                            <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                            <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
                          </svg>
                        </div>
                      )}
                      {status === 'pending' && (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>{idx + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* Stage Text */}
                  <div style={{ flex: 1, paddingTop: '4px' }}>
                    <h4 style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)'
                    }}>
                      {stage.label}
                    </h4>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      marginTop: '4px',
                      lineHeight: '1.4',
                      display: status === 'pending' ? 'none' : 'block'
                    }}>
                      {status === 'completed' 
                        ? stage.completeLabel 
                        : status === 'active' 
                        ? stage.progressLabel 
                        : status === 'failed'
                        ? `Execution failed: ${job.error}`
                        : stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Console / Streamed Outputs */}
        <div className="glass-panel" style={{
          padding: '24px',
          background: 'rgba(5, 5, 8, 0.8)',
          border: '1px solid rgba(255,255,255,0.03)',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            paddingBottom: '12px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--text-secondary)' }}>
              root@researchmind:~# stdout
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
            </div>
          </div>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            height: '350px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingRight: '8px'
          }}>
            {/* Conditional pipeline logs */}
            <div>
              <span style={{ color: 'var(--text-muted)' }}>[SYSTEM]</span> Job created with status ID: {job._id}
            </div>

            {job.searchResults && (
              <div>
                <span style={{ color: '#60a5fa' }}>[SEARCH AGENT]</span> Tavily query triggered. Search Results gathered:<br />
                <pre style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '10px',
                  borderRadius: '6px',
                  whiteSpace: 'pre-wrap',
                  marginTop: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  fontSize: '11px',
                  maxHeight: '180px',
                  overflowY: 'auto'
                }}>
                  {job.searchResults}
                </pre>
              </div>
            )}

            {job.selectedUrl && (
              <div>
                <span style={{ color: '#fbbf24' }}>[READER AGENT]</span> Target resource selected: <a href={job.selectedUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>{job.selectedUrl}</a>
              </div>
            )}

            {job.scrapedContent && (
              <div>
                <span style={{ color: '#fbbf24' }}>[READER AGENT]</span> Scraped page content successfully (truncated to 3000 characters). Preview:<br />
                <pre style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '10px',
                  borderRadius: '6px',
                  whiteSpace: 'pre-wrap',
                  marginTop: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  fontSize: '11px',
                  maxHeight: '120px',
                  overflowY: 'auto'
                }}>
                  {job.scrapedContent.substring(0, 1000)}...
                </pre>
              </div>
            )}

            {job.report && (
              <div>
                <span style={{ color: '#a78bfa' }}>[WRITER AGENT]</span> Synthesized markdown draft completed. Report buffer size: {job.report.length} characters.
              </div>
            )}

            {job.feedback && (
              <div>
                <span style={{ color: '#34d399' }}>[CRITIC AGENT]</span> Multi-agent critique finalized. Score parsed: {job.score}/10.
              </div>
            )}

            {job.status === 'failed' && (
              <div style={{ color: 'var(--error)' }}>
                <span>[CRITICAL ERROR]</span> {job.error}
              </div>
            )}

            {job.status === 'completed' && (
              <div style={{ color: 'var(--success)' }}>
                <span>[SUCCESS]</span> Pipeline finished. All agent states successfully closed.
              </div>
            )}

            {/* Pulsing prompt to simulate activity */}
            {!['completed', 'failed'].includes(job.status) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulse-active" style={{ width: '6px', height: '12px', background: 'var(--text-primary)' }}></span>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Awaiting pipeline state shift...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
