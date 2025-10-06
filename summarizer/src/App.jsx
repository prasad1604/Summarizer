import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

// Sample meeting data for demo
const sampleMeetings = {
  meeting1: {
    id: 'sample-1',
    filename: 'project-planning.mp3',
    summary: 'Project planning meeting discussing the development timeline for the new e-commerce platform. The team covered user authentication, product catalog, and shopping cart functionality.',
    action_items: [
      'Complete shopping cart functionality by next week',
      'Finish mobile responsive designs',
      'Set up automated testing pipeline'
    ],
    decisions: [
      'Use React for frontend framework',
      'Deploy on AWS infrastructure',
      'Weekly sprint meetings every Monday'
    ],
    participants: ['Sarah (Project Manager)', 'John (Developer)', 'Lisa (Designer)', 'Mike (QA)'],
    duration: '25:30'
  },
  meeting2: {
    id: 'sample-2', 
    filename: 'daily-standup.mp3',
    summary: 'Daily standup meeting where team members shared progress updates and discussed current blockers.',
    action_items: [
      'Resolve API integration issues',
      'Review pull requests by EOD',
      'Update project documentation'
    ],
    decisions: [
      'Move deadline for feature X to next sprint',
      'Adopt new code review process'
    ],
    participants: ['Alice (Scrum Master)', 'Bob (Developer)', 'Carol (Developer)'],
    duration: '15:45'
  }
};

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  
  const fileInputRef = useRef(null);
  const statusTimeout = useRef(null); // using timeout id instead of interval

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSummary(null);
      setJobId(null);
      setError(null);
    }
  };

  // Upload file to backend
  const uploadFile = async () => {
    if (!selectedFile) {
      setError('Please select an audio file');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setJobId(data.job_id);
      setActiveTab('processing');
      
      // Start polling for status
      startStatusPolling(data.job_id);

    } catch (err) {
      setError('Failed to upload file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Start polling job status (robust, non-overlapping)
  const startStatusPolling = (id) => {
    // clear any previous timeout
    if (statusTimeout.current) {
      clearTimeout(statusTimeout.current);
      statusTimeout.current = null;
    }

    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/status/${id}`);
        if (response.ok) {
          const status = await response.json();
          setJobStatus(status);

          // normalize status string for robustness
          const s = String(status.status || '').toLowerCase();

          // Treat explicit completed or progress >= 100 as done
          if (s === 'completed' || s === 'complete' || (typeof status.progress === 'number' && status.progress >= 100)) {
            // clear any pending timeout
            if (statusTimeout.current) {
              clearTimeout(statusTimeout.current);
              statusTimeout.current = null;
            }

            // fetch summary (will setActiveTab('results') on success)
            await fetchSummary(id);
            return; // stop polling
          } else if (s === 'failed') {
            if (statusTimeout.current) {
              clearTimeout(statusTimeout.current);
              statusTimeout.current = null;
            }
            setError(status.error || 'Processing failed');
            return;
          }
        } else {
          console.warn('Status fetch returned non-OK', response.status);
        }
      } catch (err) {
        console.error('Status polling error:', err);
      }

      // schedule next poll
      statusTimeout.current = setTimeout(poll, 2000);
    };

    // start immediately
    poll();
  };

  // Fetch summary after processing is complete
  const fetchSummary = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/summary/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
        setJobId(id);
        setActiveTab('results');
      } else {
        // If backend replied 400 ("Processing not completed") for a race-condition,
        // try a couple more times quickly before giving up.
        if (response.status === 400) {
          // small retry logic (2 quick retries)
          for (let i = 0; i < 2; i++) {
            await new Promise(r => setTimeout(r, 500));
            const r2 = await fetch(`${API_BASE_URL}/api/summary/${id}`);
            if (r2.ok) {
              const d2 = await r2.json();
              setSummary(d2);
              setJobId(id);
              setActiveTab('results');
              return;
            }
          }
          setError('Processing not completed yet. Please try again in a moment.');
        } else {
          setError('Failed to fetch summary');
        }
      }
    } catch (err) {
      setError('Failed to fetch summary: ' + err.message);
    }
  };

  // Export meeting minutes
  const exportMeeting = async (format = 'txt') => {
    if (!jobId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/export/${jobId}?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-minutes-${jobId.slice(0, 8)}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError('Export failed: ' + err.message);
    }
  };

  // Load sample data
  const loadSample = (sampleKey) => {
    const sample = sampleMeetings[sampleKey];
    setSummary(sample);
    setJobId(sample.id);
    setActiveTab('results');
    setSelectedFile(null);
    setError(null);
  };

  // Reset to initial state
  const reset = () => {
    setSelectedFile(null);
    setJobId(null);
    setJobStatus(null);
    setSummary(null);
    setError(null);
    setLoading(false);
    setActiveTab('upload');
    if (statusTimeout.current) {
      clearTimeout(statusTimeout.current);
      statusTimeout.current = null;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusTimeout.current) {
        clearTimeout(statusTimeout.current);
        statusTimeout.current = null;
      }
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎙️ Meeting Minutes Generator</h1>
        <p>Upload your audio files and get AI-powered meeting summaries</p>
      </header>

      <nav className="tab-nav">
        <button 
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload
        </button>
        <button 
          className={`tab ${activeTab === 'processing' ? 'active' : ''}`}
          onClick={() => setActiveTab('processing')}
          disabled={!jobId}
        >
          Processing
        </button>
        <button 
          className={`tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
          disabled={!summary}
        >
          Results
        </button>
      </nav>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <span>❌ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="upload-section">
            <div className="upload-area">
              <div className="file-input-wrapper">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="audio/*"
                  id="file-upload"
                  className="file-input"
                />
                <label htmlFor="file-upload" className="file-input-label">
                  📁 Choose Audio File
                </label>
                {selectedFile && (
                  <span className="file-name">{selectedFile.name}</span>
                )}
              </div>
              
              <button 
                onClick={uploadFile}
                disabled={!selectedFile || loading}
                className="upload-btn"
              >
                {loading ? '⏳ Uploading...' : '🚀 Upload & Process'}
              </button>
            </div>

            <div className="sample-section">
              <h3>Try with Sample Data</h3>
              <div className="sample-buttons">
                <button 
                  onClick={() => loadSample('meeting1')}
                  className="sample-btn"
                >
                  📊 Project Planning Meeting
                </button>
                <button 
                  onClick={() => loadSample('meeting2')}
                  className="sample-btn"
                >
                  📝 Daily Standup
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'processing' && jobStatus && (
          <div className="processing-section">
            <div className="status-card">
              <h3>Processing Status</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${jobStatus.progress || 0}%` }}
                ></div>
              </div>
              <p className="status-text">
                {jobStatus.current_stage || 'Processing'} - {jobStatus.progress || 0}%
              </p>
              <div className="job-info">
                <p><strong>Job ID:</strong> {jobStatus.job_id}</p>
                <p><strong>Status:</strong> {jobStatus.status}</p>
                <p><strong>Started:</strong> {jobStatus.created_at ? new Date(jobStatus.created_at).toLocaleString() : '—'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'results' && summary && (
          <div className="results-section">
            <div className="results-header">
              <h2>📋 Meeting Summary</h2>
              <div className="export-buttons">
                <button onClick={() => exportMeeting('txt')} className="export-btn">
                  📄 Export TXT
                </button>
                <button onClick={() => exportMeeting('docx')} className="export-btn">
                  📝 Export DOCX
                </button>
                <button onClick={() => exportMeeting('pdf')} className="export-btn">
                  📑 Export PDF
                </button>
              </div>
            </div>

            <div className="summary-content">
              <div className="summary-card">
                <h3>🎯 Summary</h3>
                <p>{summary.summary}</p>
              </div>

              {summary.action_items && summary.action_items.length > 0 && (
                <div className="summary-card">
                  <h3>✅ Action Items</h3>
                  <ul>
                    {summary.action_items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.decisions && summary.decisions.length > 0 && (
                <div className="summary-card">
                  <h3>🎯 Decisions Made</h3>
                  <ul>
                    {summary.decisions.map((decision, index) => (
                      <li key={index}>{decision}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.participants && summary.participants.length > 0 && (
                <div className="summary-card">
                  <h3>👥 Participants</h3>
                  <div className="participants">
                    {summary.participants.map((participant, index) => (
                      <span key={index} className="participant-tag">
                        {participant}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {summary.duration && (
                <div className="summary-card">
                  <h3>⏱️ Duration</h3>
                  <p>{summary.duration}</p>
                </div>
              )}
            </div>

            <button onClick={reset} className="new-meeting-btn">
              🆕 Process New Meeting
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
