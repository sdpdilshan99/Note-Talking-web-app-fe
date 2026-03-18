import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
    user: any;
    token: string | null;
    login: (userData: any, token: string) => void;
    logout: () => void;
    loading: boolean;
    message: { type: 'success' | 'error', text: string } | null;
    showAlert: (type: 'success' | 'error', text: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children} : {children: React.ReactNode}) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);


    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing user from localStorage", error);
            }
        }
        setLoading(false);
    },[]);
    const showAlert = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const login = (userData: any, token: string) => {
        setUser(userData);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/');

    }

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    }

    

    return (
        <AuthContext.Provider value={{user,token, login, logout, loading, message, showAlert}}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};