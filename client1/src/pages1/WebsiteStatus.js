import React, { useState, useEffect } from 'react';
import './Status.css';

const Status = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tokens,setTokens] = useState(null);
  // Get token from localStorage
  const getToken = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("user-info"));
      console.log("token ", userInfo?.token);
      return userInfo?.token;
    } catch (err) {
      console.error("Error getting token:", err);
      return null;
    }
  };

  // Fetch websites data
  const fetchWebsites = async () => {
    const token = getToken();
    
    if (!token) {
      setError("No authentication token found. Please login.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/websites', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setWebsites(data.websites || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching websites:", err);
      setError("Failed to fetch websites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add new website
  const handleAddWebsite = async (e) => {
    e.preventDefault();
    
    if (!urlInput.trim()) {
      alert("Please enter a valid URL");
      return;
    }

    const token = getToken();
    
    if (!token) {
      setError("No authentication token found. Please login.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:8080/api/v1/website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url: urlInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clear input and refresh data
      setUrlInput('');
      await fetchWebsites();
      alert("Website added successfully!");
    } catch (err) {
      console.error("Error adding website:", err);
      alert("Failed to add website. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Setup interval for periodic fetching
  useEffect(() => {
    // Fetch immediately on mount
    fetchWebsites();

    // Setup interval for every 70 seconds
    const interval = setInterval(() => {
      fetchWebsites();
    }, 70000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString();
  };

  // Get status color
  const getStatusColor = (status) => {
    return status === 'Good' ? '#10b981' : '#ef4444';
  };

  if (loading) {
    return (
      <div className="status-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading websites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="status-container">
      <div className="header">
        <h1>Website Monitoring Dashboard</h1>
        {lastUpdated && (
          <p className="last-updated">Last updated: {formatDate(lastUpdated)}</p>
        )}
      </div>

      {/* Add Website Form */}
      <div className="add-website-form">
        <form onSubmit={handleAddWebsite}>
          <input
            type="url"
            placeholder="Enter website URL (e.g., https://example.com)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={submitting}
            className="url-input"
          />
          <button 
            type="submit" 
            disabled={submitting}
            className="submit-button"
          >
            {submitting ? 'Adding...' : 'Add Website'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Websites List */}
      {websites.length === 0 ? (
        <div className="empty-state">
          <p>No websites are being monitored yet. Add one above to get started!</p>
        </div>
      ) : (
        <div className="websites-grid">
          {websites.map((website) => (
            <div key={website.id} className="website-card">
              <div className="website-header">
                <h2>{website.url}</h2>
                {website.disabled && (
                  <span className="disabled-badge">Disabled</span>
                )}
              </div>

              {website.ticks && website.ticks.length > 0 ? (
                <div className="ticks-container">
                  <table className="ticks-table">
                    <thead>
                      <tr>
                        <th>Validator Location</th>
                        <th>Status</th>
                        <th>Latency (ms)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {website.ticks.map((tick) => (
                        <tr key={tick.id}>
                          <td className="location-cell">
                            {tick.validator?.location || 'Unknown'}
                          </td>
                          <td>
                            <span 
                              className="status-badge"
                              style={{ 
                                backgroundColor: getStatusColor(tick.status),
                                color: 'white'
                              }}
                            >
                              {tick.status}
                            </span>
                          </td>
                          <td className="latency-cell">
                            {tick.latency.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-ticks">
                  <p>No monitoring data available yet.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Status;
