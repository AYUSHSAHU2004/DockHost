import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

const Deploy = () => {
  const navigate = useNavigate();
  const [buyedDomains, setBuyedDomains] = useState([]);
  const [temporaryDomains, setTemporaryDomains] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState({
    githubUrl: "",
    buildCommand: "",
    staticFolder: "",
    domainName: "",  // add this
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("formData:", formData);

    try {
      const response = await api.post('http://localhost:8002/deploy', {
        GIT_REPO_URL: formData.githubUrl,
        PROJECT_ID: formData.domainName,
        BUILD_COMMAND: formData.buildCommand,
        FILE_LOCATION: formData.staticFolder,
      });

      alert("Deployment Successful! " + response.data.message);
    } catch (err) {
      console.error("Deployment failed:", err);
      alert("Deployment Failed: " + err.response?.data?.error || err.message);
    }
  };

  const styles = {
    container: {
      background: "#fff",
      borderRadius: "10px",
      padding: "30px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      width: "100%",
      maxWidth: "500px",
      margin: "20px auto",
    },
    heading: {
      fontSize: "24px",
      textAlign: "center",
      marginBottom: "20px",
      color: "#333",
    },
    label: {
      fontWeight: "bold",
      marginBottom: "10px",
      display: "block",
      color: "#555",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "20px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      fontSize: "16px",
    },
    button: {
      width: "100%",
      padding: "10px",
      backgroundColor: "#007BFF",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      fontSize: "16px",
      cursor: "pointer",
    },
    buttonHover: {
      backgroundColor: "#0056b3",
    },
  };

  const handleNavigation = () => {
    navigate("/");
  };

  useEffect(() => {
    // Get user_email from localStorage
    const userEmail = JSON.parse(localStorage.getItem("user-info")).email;
    const token = JSON.parse(localStorage.getItem("user-info")).token;

    setUserEmail(userEmail);
    console.log(token);
    // Fetch Buyed Domains
    api
      .get(`http://localhost:8002/get-Bdomains-by-email?email=${userEmail}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
      .then((response) => {
        setBuyedDomains(response.data.names);
        setFormData(prev => ({ ...prev, domainName: response.data.names[0] })); // add this
      })
      .catch((err) => console.error("Error fetching Buyed Domains:", err));

    // Fetch Temporary Domains
    api
      .get(
        `http://localhost:8002/get-current-domains-by-email?email=${userEmail}`,
        {
          withCredentials: true,
        }
      )
      .then((response) => setTemporaryDomains(response.data.currentDomains))
      .catch((err) =>
        console.error("Error fetching Temporary Domains:", err)
      );
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Section */}
      <div
        style={{
          flex: 1,
          borderRight: "2px solid #ccc",
          padding: "20px",
          overflowY: "auto",
          background: "#d3d3d3",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Buyed SubDomains
        </h2>
        {buyedDomains?.length > 0 ? (
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {buyedDomains?.map((domain, index) => (
              <li
                key={index}
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                {domain}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: "center", color: "#888" }}>
            No Buyed Domains Found
          </p>
        )}

        <h2
          style={{
            textAlign: "center",
            marginTop: "40px",
            marginBottom: "20px",
          }}
        >
          Temporary SubDomains
        </h2>
        {temporaryDomains?.length > 0 ? (
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {temporaryDomains?.map((domain, index) => (
              <li
                key={index}
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                {domain}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: "center", color: "#888" }}>
            No Temporary SubDomains Found
          </p>
        )}
      </div>

      {/* this will be middle section*/}

      <div style={styles.container}>
        <h1 style={styles.heading}>Hoist Your Client-Side Framework</h1>
        <form onSubmit={handleSubmit}>
          <label style={styles.label} htmlFor="githubUrl">
            GitHub URL:
          </label>
          <input
            style={styles.input}
            type="url"
            id="githubUrl"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleChange}
            placeholder="Enter GitHub repository URL"
            required
          />

          <label style={styles.label} htmlFor="buildCommand">
            Build Command:
          </label>
          <input
            style={styles.input}
            type="text"
            id="buildCommand"
            name="buildCommand"
            value={formData.buildCommand}
            onChange={handleChange}
            placeholder="e.g., npm run build"
            required
          />

          <label style={styles.label} htmlFor="domainName">
            Choose Domain Name:
          </label>
          <select
            style={styles.input}
            id="domainName"
            name="domainName"
            value={formData.domainName}
            onChange={handleChange}
            required
          >
            {buyedDomains.map((domain, index) => (
              <option key={index} value={domain}>
                {domain}
              </option>
            ))}
          </select>

          <label style={styles.label} htmlFor="staticFolder">
            Static Assets Folder:
          </label>
          <input
            style={styles.input}
            type="text"
            id="staticFolder"
            name="staticFolder"
            value={formData.staticFolder}
            onChange={handleChange}
            placeholder="e.g., /build or /dist"
            required
          />

          <button style={styles.button} type="submit">
            Submit
          </button>
        </form>
      </div>

      <div style={{ flex: 1 }}></div>
      <button
        onClick={handleNavigation}
        style={{
          padding: "5px",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Back To Home
      </button>
    </div>
  );
};

export default Deploy;
