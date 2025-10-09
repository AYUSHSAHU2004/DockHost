import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "./api";
import { useNavigate } from "react-router-dom";

const GoogleLogin = (props) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const responseGoogle = async (authResult) => {
        try {
            if (authResult["code"]) {
                const result = await googleAuth(authResult.code);
                const { email, name, image } = result.data.user;
                const token = result.data.token;
                const obj = { email, name, token, image };
                localStorage.setItem("user-info", JSON.stringify(obj));
                navigate("/");
            } else {
                console.log(authResult);
                throw new Error(authResult);
            }
        } catch (e) {
            console.log("Error while Google Login...", e);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: responseGoogle,
        onError: responseGoogle,
        flow: "auth-code",
    });

    return (
        <div 
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                textAlign: "center",
                backgroundColor: "#f4f4f4",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px", color: "#333" }}>
                Welcome to the Hosting Platform
            </h1>
            <p style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
                Here you can buy your subdomain and host your website, which is based on client-side rendering.
            </p>
            <button
                onClick={googleLogin}
                style={{
                    backgroundColor: "#4285F4",
                    color: "white",
                    padding: "12px 24px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    transition: "background 0.3s",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#357ae8")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#4285F4")}
            >
                Sign in with Google
            </button>
        </div>
    );
};

export default GoogleLogin;
