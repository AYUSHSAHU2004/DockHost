import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from './api/axiosInstance'; // adjust path to your actual axios instance

function RefrshHandler({ setIsAuthenticated }) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('http://localhost:8002/me', { withCredentials: true });
                setIsAuthenticated(true);

                if (location.pathname === '/' || location.pathname === '/login') {
                    navigate('/dashboard', { replace: false });
                }
            } catch (err) {
                setIsAuthenticated(false); // cookie missing/expired/invalid
            }
        };

        checkAuth();
    }, [location, navigate, setIsAuthenticated]);

    return null;
}

export default RefrshHandler;