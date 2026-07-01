import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import './Status.css';
import api from "../api/axiosInstance";

const Status = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const socketRef = useRef(null);
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
    try {
      const { data } = await api.get(
        "http://localhost:8002/subscribe",
        { withCredentials: true } // cookie sent automatically, no headers needed
      );
      setWebsites(data.urls);
      setLoading(false);
      setLastUpdated(new Date());
    } catch (err) {
      console.log(err);
      setLoading(false);
      setError("Failed to fetch websites");
    }
  };


  // Add new website
  const handleAddWebsite = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "http://localhost:8002/subscribe",
        { url: urlInput },
        { withCredentials: true }
      );
      setUrlInput("");
      await fetchWebsites();
    } catch (err) {
      console.log(err);
    }
  };

  // Setup interval for periodic fetching
  useEffect(() => {

    fetchWebsites();

    const token = getToken();

    socketRef.current = io(
      "http://localhost:8002",
      {
        auth: {
          token
        }
      }
    );

    socketRef.current.on("connect", () => {

      console.log("Socket Connected");

    });

    socketRef.current.on(
      "status-update",
      (updatedWebsite) => {

        console.log("Received Update:", updatedWebsite);

        setWebsites(previous =>

          previous.map(website =>

            website._id === updatedWebsite._id
              ? updatedWebsite
              : website

          )

        );

        setLastUpdated(new Date());

      }
    );

    socketRef.current.on("disconnect", () => {

      console.log("Socket Disconnected");

    });

    return () => {

      socketRef.current.disconnect();

    };

  }, []);

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString();
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
            <div key={website._id} className="website-card">
              <div className="website-header">
                <h2>{website.url}</h2>

              </div>
              <div className="website-details">

                <p>

                  <strong>Status :</strong>

                  {website.message}

                </p>

                <p>

                  <strong>Status Code :</strong>

                  {website.statusCode}

                </p>

                <p>

                  <strong>Alive :</strong>

                  {website.alive ? "🟢 Online" : "🔴 Offline"}

                </p>

              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Status;
