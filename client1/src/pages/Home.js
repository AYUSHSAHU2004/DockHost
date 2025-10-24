import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";



const Home = () => {
  const [buyedDomains, setBuyedDomains] = useState([]);
  const [temporaryDomains, setTemporaryDomains] = useState([]);
  const [domainName, setDomainName] = useState("");
  const [userEmail,setUserEmail] = useState("");
  const [responseMessage, setResponseMessage] = useState(null);

  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/deploy");
  };

    const loadScript = (src) => {
        return new Promise((resolve)=>{
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                resolve(true);
            }
            script.onerror = () =>{
                resolve(false);
            }
            document.body.appendChild(script);
        })
    }
    useEffect(()=>{
        loadScript('https://checkout.razorpay.com/v1/checkout.js')
    },[])

    const onPayment = async (domainName, userEmail) => {
        try {
            const options = {
                domainName: domainName,
                userEmail: userEmail
            };
            
            // Fetch order data from the backend
            const response = await fetch('http://localhost:8002/api/createOrder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domainName, userEmail }),
            });
    
            const data = await response.json();
            console.log(data);
    
            if (data && data.id) {
                const paymentObject = new (window).Razorpay({
                    key: "rzp_test_nUv9rTe1QN2FVQ",  // Ensure this is your actual Razorpay key
                    order_id: data.id,
                    ...data,  // This includes the 'amount', 'currency', etc.
    
                    handler: async function (response) {
                        console.log('Payment Success:', response);
    
                        const options2 = {
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            domainName:domainName,
                            userEmail:userEmail,
                        };
    
                        // Verify payment signature in the backend
                        const response2 = await fetch('http://localhost:8002/api/verifyPayment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(options2),
                        });
    
                        const data2 = await response2.json();
                        console.log('Payment Verification:', data2);
    
                        // Handle any further logic based on the payment verification response (e.g., show success message)
                    },
                });
    
                paymentObject.open();
            } else {
                console.log("Payment order not created.");
            }
        } catch (error) {
            console.log("Error initiating payment:", error);
        }
    }

  const handleTakeTempDomain = async () => {
    const userEmail = JSON.parse(localStorage.getItem("user-info")).email; // Get the email from local storage
    if (!userEmail) {
      alert("User email not found in localStorage. Please log in first.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8002/take-domain-temporarily",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ domainName, userEmail }),
        }
      );
      const data = await response.json();
      setResponseMessage(data); // Update the response message (or show the result below the button)
    } catch (error) {
      console.error("Error taking domain temporarily:", error);
      setResponseMessage({
        status: "error",
        message: "Failed to take domain temporarily.",
      });
    }
  };

  const handleCheckAvailability = async () => {
    const userEmail = JSON.parse(localStorage.getItem("user-info")).email; // Get the email from local storage
    if (!userEmail) {
      alert("User email not found in localStorage. Please log in first.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8002/check-domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domainName, userEmail }),
      });
      const data = await response.json();
      setResponseMessage(data);
    } catch (error) {
      console.error("Error checking domain availability:", error);
      setResponseMessage({
        status: "error",
        message: "Failed to check availability.",
      });
    }
  };

  useEffect(() => {
    // Get user_email from localStorage
    const userEmail = JSON.parse(localStorage.getItem("user-info")).email;
    const token = JSON.parse(localStorage.getItem("user-info")).token;
    console.log(userEmail);
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
  const handleLogout = ()=>{
    localStorage.removeItem('user-info');
    navigate('/login');
  }

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
            No Buyed SubDomains Found
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

      {/* Placeholder for Right Section */}
      <div
        style={{
          width: "50%",
          margin: "auto",
          padding: "20px",
          border: "1px solid #d3d3d3",
          borderRadius: "8px",
          backgroundColor: "#f7f7f7",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#333" }}>Get Your SubDomain</h2>
        <input
          type="text"
          placeholder="Enter SubDomain name"
          value={domainName}
          onChange={(e) => setDomainName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "5px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
        <button
          onClick={handleCheckAvailability}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Check Availability
        </button>
        {responseMessage && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <p style={{ fontSize: "18px", color: "#555" }}>
              {responseMessage.message}
            </p>
            {responseMessage.status === "taken-temporarily" && (
              <button
                onClick={()=>onPayment(domainName,userEmail)}
                style={{
                  padding: "10px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Buy Domain
              </button>
            )}
            {responseMessage.status === "available" && (
              <div>
                <button
                    onClick={()=>onPayment(domainName,userEmail)}
                  style={{
                    padding: "10px",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                >
                  Buy SubDomain
                </button>
                <button
                  onClick={handleTakeTempDomain}
                  style={{
                    padding: "10px",
                    backgroundColor: "#ffc107",
                    color: "#000",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Take Temp SubDomain
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "10px",
            marginTop:"30px",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Log Out
        </button>
<div style={{ marginTop: "20px", textAlign: "center" }}>
  <button
    onClick={() => navigate("/Status")}
    style={{
      padding: "10px",
      backgroundColor: "#17a2b8",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      marginRight: "10px",
    }}
  >
    checkStatus
  </button>
  <button
    onClick={() => window.location.href = "http://localhost:3001/"}
    style={{
      padding: "10px",
      backgroundColor: "#6f42c1",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    }}
  >
    ownEth
  </button>
</div>

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
      Hoist Your Website
    </button>


    </div>
  );
};

export default Home;
