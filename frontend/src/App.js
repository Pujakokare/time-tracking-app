import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [punchIns, setPunchIns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualTime, setManualTime] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch all punch-ins on component mount
  useEffect(() => {
    fetchPunchIns();
  }, []);

  const fetchPunchIns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/punch-ins');
      const result = await response.json();
      
      if (result.success) {
        setPunchIns(result.data);
      }
    } catch (error) {
      console.error('Error fetching punch-ins:', error);
      showMessage('Failed to load punch-in records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoPunchIn = async () => {
    const currentTime = new Date().toISOString();
    await savePunchIn(currentTime, false);
  };

  const handleManualPunchIn = async () => {
    if (!manualTime) {
      showMessage('Please enter a time', 'error');
      return;
    }

    try {
      const timestamp = new Date(manualTime).toISOString();
      await savePunchIn(timestamp, true);
      setManualTime('');
      setShowManualInput(false);
    } catch (error) {
      showMessage('Invalid time format', 'error');
    }
  };

  const savePunchIn = async (timestamp, manualEntry) => {
    try {
      setLoading(true);
      const response = await fetch('/api/punch-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timestamp, manualEntry }),
      });

      const result = await response.json();

      if (result.success) {
        showMessage('Punch-in recorded successfully!', 'success');
        fetchPunchIns();
      } else {
        showMessage(result.error || 'Failed to record punch-in', 'error');
      }
    } catch (error) {
      console.error('Error saving punch-in:', error);
      showMessage('Failed to record punch-in', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    return `${dateStr} ${timeStr}`;
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🕐 Punch-In Tracker</h1>
          <p>Track your work hours efficiently</p>
        </header>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="punch-in-section">
          <button
            className="btn btn-primary"
            onClick={handleAutoPunchIn}
            disabled={loading}
          >
            {loading ? 'Processing...' : '⏱️ Punch In Now'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowManualInput(!showManualInput)}
            disabled={loading}
          >
            📝 Manual Entry
          </button>

          {showManualInput && (
            <div className="manual-input">
              <input
                type="datetime-local"
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
                className="time-input"
              />
              <button
                className="btn btn-success"
                onClick={handleManualPunchIn}
                disabled={loading}
              >
                Save
              </button>
            </div>
          )}
        </div>

        <div className="records-section">
          <h2>Punch-In History</h2>
          
          {loading && punchIns.length === 0 ? (
            <div className="loading">Loading records...</div>
          ) : punchIns.length === 0 ? (
            <div className="no-records">No punch-in records yet. Start tracking!</div>
          ) : (
            <div className="records-list">
              {punchIns.map((record, index) => (
                <div key={record.id || index} className="record-card">
                  <div className="record-time">
                    <span className="time-icon">🕐</span>
                    <span className="time-text">
                      {formatDateTime(record.timestamp || record.createdAt)}
                    </span>
                  </div>
                  <div className="record-meta">
                    {record.manualEntry && (
                      <span className="badge">Manual Entry</span>
                    )}
                    <span className="record-date">
                      Recorded: {formatDateTime(record.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
