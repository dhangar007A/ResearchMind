import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ResearchRunner from './components/ResearchRunner';
import ReportView from './components/ReportView';

const API_BASE = 'http://localhost:5000/api/research';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'history' | 'runner' | 'report'
  const [jobs, setJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const pollingIntervalRef = useRef(null);

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      const response = await fetch(API_BASE);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs list:', error);
    }
  };

  // Fetch details of a single job
  const fetchJobDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`);
      const data = await response.json();
      setCurrentJob(data);
      return data;
    } catch (error) {
      console.error(`Error fetching details for job ${id}:`, error);
      return null;
    }
  };

  // Initial load and auto refresh past syntheses list
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 8000); // refresh list every 8s
    return () => clearInterval(interval);
  }, []);

  // Poll active job details
  const startPollingJob = (id) => {
    // Clear any existing poll
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      const job = await fetchJobDetails(id);
      if (!job || ['completed', 'failed'].includes(job.status)) {
        clearInterval(pollingIntervalRef.current);
        // Refresh the main list when job completes or fails
        fetchJobs();
      }
    }, 1500); // Poll every 1.5 seconds for live status
  };

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Action: Trigger a new research synthesis
  const handleStartResearch = async (topic) => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic })
      });
      const newJob = await response.json();
      
      setCurrentJob(newJob);
      setActiveView('runner');
      startPollingJob(newJob._id);
    } catch (error) {
      console.error('Error initiating research:', error);
      alert('Failed to start research. Check backend server.');
    } finally {
      setLoading(false);
    }
  };

  // Action: Open job details or live progress tracker
  const handleViewJob = async (id) => {
    const job = await fetchJobDetails(id);
    if (job) {
      if (job.status === 'completed') {
        setActiveView('report');
      } else {
        setActiveView('runner');
        if (!['completed', 'failed'].includes(job.status)) {
          startPollingJob(id);
        }
      }
    }
  };

  // Action: Delete a job
  const handleDeleteJob = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setJobs(jobs.filter(j => j._id !== id));
        if (currentJob && currentJob._id === id) {
          setCurrentJob(null);
          setActiveView('dashboard');
        }
      }
    } catch (error) {
      console.error(`Error deleting job ${id}:`, error);
    }
  };

  // Handling navigation clicks from sidebar
  const handleViewChange = (view) => {
    if (view === 'dashboard' || view === 'history') {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      setCurrentJob(null);
      fetchJobs();
      setActiveView('dashboard');
    }
  };

  return (
    <div className="app-container">
      {/* Background radial glow overlay */}
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      {/* Sidebar Navigation */}
      <Sidebar activeView={activeView === 'history' ? 'history' : 'dashboard'} onViewChange={handleViewChange} />

      {/* Main Container */}
      <main className="main-content">
        {activeView === 'dashboard' && (
          <Dashboard
            jobs={jobs}
            onStartResearch={handleStartResearch}
            onViewJob={handleViewJob}
            onDeleteJob={handleDeleteJob}
          />
        )}

        {activeView === 'runner' && currentJob && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ResearchRunner
              job={currentJob}
              onBack={() => handleViewChange('dashboard')}
            />
            {currentJob.status === 'completed' && (
              <div className="glass-panel" style={{
                padding: '20px',
                background: 'rgba(52, 211, 153, 0.05)',
                border: '1.5px solid var(--success)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                animation: 'fade-in 0.5s ease'
              }}>
                <div>
                  <h4 style={{ color: 'var(--success)', fontSize: '15px', fontWeight: '600' }}>Synthesis Complete</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
                    All agent layers finished successfully. Final critic score is {currentJob.score}/10.
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('report')}
                  className="glass-btn primary"
                  style={{ background: 'var(--success)', color: '#08080a', border: 'none' }}
                >
                  View Synthesis Report
                </button>
              </div>
            )}
          </div>
        )}

        {activeView === 'report' && currentJob && (
          <ReportView
            job={currentJob}
            onBack={() => handleViewChange('dashboard')}
          />
        )}
      </main>
    </div>
  );
}
