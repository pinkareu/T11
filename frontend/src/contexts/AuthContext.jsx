import React, { createContext, useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// TODO: get the BACKEND_URL.
const VITE_BACKEND_URL = "http://localhost:3000";

/*
 * This provider should export a `user` context state that is 
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // TODO: complete me, by retriving token from localStorage and make an api call to GET /user/me.
        const token = localStorage.getItem("token");
        if (!token) return;

        //reload user 
        (async () => {
            try {
                const response = await fetch(`${VITE_BACKEND_URL}/user/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if(!response.ok){
                    localStorage.removeItem("token");
                    return;
                }
                const data = await response.json();
                console.log("Restored user:", data.user);   
                setUser(data.user);

            } catch (err) {
                console.error("Error restoring user:", err);
            }
        
        })();

    }, [])

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        // TODO: complete me
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    /**
     * Login a user with their credentials.
     *
     * @remarks Upon success, navigates to "/profile". 
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {string} - Upon failure, Returns an error message.
     */
    const login = async (username, password) => {
        // TODO: complete me
        try {
            const res = await fetch(`${VITE_BACKEND_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                const err = await res.json();
                return err.error || "Login failed.";
            }

            const data = await res.json();

            // Save token
            localStorage.setItem("token", data.token);

            // Save user to context
            setUser(data.user);

            // Navigate to profile page
            navigate("/profile");
            return "";
        } catch (err) {
            return "Login failed.";
        }
    };

    /**
     * Registers a new user. 
     * 
     * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
    const register = async (userData) => {
        // TODO: complete me
        try {
            const res = await fetch(`${VITE_BACKEND_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            if (!res.ok) {
                const err = await res.json();
                return err.error || "Registration failed.";
            }

            navigate("/"); // success
            return "";
        } catch (err) {
            return "Registration failed."        
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
