import { useState, useEffect } from "react";
import axios from "axios";
import { API_BACKEND_URL } from "../config";

export function useWebsites() {
  const [websites, setWebsites] = useState([]);

  async function refreshWebsites() {
    try {
      const token = localStorage.getItem("google_jwt");
      const response = await axios.get(`${API_BACKEND_URL}/api/v1/websites`, {
        headers: { Authorization: token },
      });
      setWebsites(response.data.websites);
    } catch (err) {
      console.error("Failed to fetch websites", err);
    }
  }

  useEffect(() => {
    refreshWebsites();
    const interval = setInterval(refreshWebsites, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { websites, refreshWebsites };
}
