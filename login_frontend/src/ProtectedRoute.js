import React from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "./authService"; 

const ProtectedRoute = ({ element, requiredRole }) => {
    const navigate = useNavigate();
    const token = getToken();

    if (!token) {
        console.warn("No token found, redirecting...");
        navigate("/");  // Redirect to login
        return null;
    }

    try {
        const user = JSON.parse(atob(token.split(".")[1])); // Decode JWT
        if (user.role === requiredRole || (requiredRole === "admin" && user.isTemporaryAdmin)) {
            return element;
        } else {
            console.warn("Unauthorized, redirecting to employee page...");
            navigate("/employee"); 
            return null;
        }
    } catch (error) {
        console.error("Invalid token:", error);
        navigate("/");
        return null;
    }
};

export default ProtectedRoute;
