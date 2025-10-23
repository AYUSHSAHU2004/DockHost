import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Deploy from "./pages/Deploy";
import Status from "./pages1/WebsiteStatus";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import RefrshHandler from './RefreshHandler';
import GoogleLogin from './GoogleLogin';
import { useState } from "react";
import { Navigate } from "react-router-dom";



function App() {
  const appStyle = {
    backgroundColor: '#f4f4fb',  // Background color for the entire app
    minHeight: '100vh',  // Full viewport height
    display: 'flex',
    flexDirection: 'column',
    color:"black",
  };

  const mainStyle = {
    flexGrow: 1,
        color:"black",
    backgroundColor: 'white', // Default background color
    transition: 'background-color 0.3s ease', // Smooth transition for dark mode change
  };

  // Detecting dark mode (if applicable)
  const isDarkMode = false; // You can update this flag depending on the theme (e.g., user settings)

  if (isDarkMode) {
    mainStyle.backgroundColor = 'black'; // Dark mode background
    mainStyle.color = 'white';  // Text color in dark mode
  }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
	const GoogleWrapper = ()=>(
		<GoogleOAuthProvider clientId='894943633236-va774o3le7vcavpb8vt79jvn0a61qjbk.apps.googleusercontent.com'>
			<GoogleLogin></GoogleLogin>
		</GoogleOAuthProvider>
	)
	const PrivateRoute = ({ element }) => {
		return isAuthenticated ? element : <Navigate to="/login" />
	}

  return (
    <div style={appStyle}>
      <div style={mainStyle}>
      <BrowserRouter>
      <RefrshHandler setIsAuthenticated={setIsAuthenticated} />
        <Routes>
          <Route path="/login" element={<GoogleWrapper />} />
				  <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/dashboard" element={<Home/>} />
          <Route path="/Status" element={<Status/>} />
          <Route path="/deploy" element={<Deploy/>} />
        </Routes>
      </BrowserRouter>
      </div>
      <Footer />
    </div>
  );
}

export default App;
