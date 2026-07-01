// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "./api/axiosInstance";

const AuthContext = createContext();

// AuthContext.jsx — expose a manual refetch function
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = () => {
        return api.get("/me", { withCredentials: true })
            .then((res) => setUser(res.data.user))
            .catch(() => setUser(null));
    };

    useEffect(() => {
        fetchUser().finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, refetchUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}


export const useAuth = () => useContext(AuthContext);