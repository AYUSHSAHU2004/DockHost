import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Deploy = () => {
  const navigate = useNavigate();
  const [buyedDomains, setBuyedDomains] = useState([]);
  const [temporaryDomains, setTemporaryDomains] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState({
    githubUrl: "",
    buildCommand: "",
    staticFolder: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted", formData);
    alert("Form Submitted Successfully!");
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
    // Fetch Buyed Domains
    fetch(`http://localhost:8002/get-Bdomains-by-email?email=${userEmail}`,{
      headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,  // pass JWT token here
  },
    })
      .then((response) => response.json())
      .then((data) => setBuyedDomains(data.names))
      .catch((err) => console.error("Error fetching Buyed Domains:", err));

    // Fetch Temporary Domains
    fetch(
      `http://localhost:8002/get-current-domains-by-email?email=${userEmail}`
    )
      .then((response) => response.json())
      .then((data) => setTemporaryDomains(data.currentDomains))
      .catch((err) => console.error("Error fetching Temporary Domains:", err));
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
          Buyed Domains
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
          Temporary Domains
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
            No Temporary Domains Found
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
