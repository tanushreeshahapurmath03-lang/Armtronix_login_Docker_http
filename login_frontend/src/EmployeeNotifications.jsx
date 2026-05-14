import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";  // Import Socket.IO
import './Notifications.css';
import HeaderSidebar from "./HeaderSidebar";



const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const socket = io(BACKEND_URL, { transports: ["websocket"] });  // Initialize Socket.IO

const EmployeeNotifications = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userEmail = localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEmployeeLeaveRequests = async () => {
      if (!userEmail) {
        setError("User email not found. Please log in again.");
        setLoading(false);
        return;
      }
  
      try {
        console.log("Fetching leave requests for:", userEmail);
  
        const response = await axios.get(`${BACKEND_URL}/api/leave/employee?email=${userEmail}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log("API Response:", response.data);
  
        setLeaveRequests(response.data.leaveHistory || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching leave requests:", err);
        setError("Failed to load your leave requests. Please try again later.");
        setLoading(false);
      }
    };
  
    fetchEmployeeLeaveRequests();
  
    // Debug WebSocket Connection
    socket.on("connect", () => console.log("🔗 Connected to WebSocket server!"));
    socket.on("disconnect", () => console.log("⚠️ Disconnected from WebSocket server."));
  
    // Listen for auto-approved leaves
    socket.on("auto_approved_leave", (data) => {
      console.log("Received auto-approved leave:", data);
  
      setLeaveRequests((prevRequests) => {
        const updatedRequests = prevRequests.map((request) =>
          request._id === data.id ? { ...request, status: data.status } : request
        );
        console.log("Updated leave requests:", updatedRequests);
        return [...updatedRequests]; // 🔥 Ensure new reference for re-render
      });
    });
  
    return () => {
      socket.off("auto_approved_leave"); // Cleanup listener on unmount
    };
  }, [userEmail, token]);
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  if (loading) return <div className="loading">🔄 Loading your leave requests...</div>;

  if (error)
    return (
      <div className="error">
        ❌ {error} <br />
        <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
      </div>
    );

  return (
    <div className="dashboard-container">
      <HeaderSidebar />
      <main className="main-content1">
        <div className="notifications-container">
          <h2 className="notifications-title">My Leave Requests</h2>

          {leaveRequests.length > 0 ? (
            <div className="leave-requests-list">
              {leaveRequests.map((request) => (
                <div key={request._id} className="notification-card">
                  <div className="request-header">
                    <h3>{request.subject || request.leaveType}</h3>
                    <span className={`status-badge1 ${getStatusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="nc">
                    <div className="request-meta">
                      <p className="timestamp">📅 Submitted: {formatDate(request.timestamp)}</p>
                      <p className="leave-start">🚀 Start Date: {formatDate(request.startDate)}</p>
                      <p className="leave-end">🏁 End Date: {formatDate(request.endDate)}</p>
                      <p className="leave-days">🗓️ Total Leave Days: {request.totalLeaveDays || "N/A"}</p>
                      <p className="request-reason">💬 Reason: {request.reason || "No reason provided"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-requests">📅 You haven't submitted any leave requests yet.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeNotifications;
