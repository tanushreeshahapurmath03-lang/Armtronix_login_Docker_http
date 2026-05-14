import React, { useEffect, useState } from "react";
import axios from "axios";
import './Notifications.css';
import HeaderSidebar_admin from "./HeaderSidebar_admin";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminNotifications = () => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveSettings, setLeaveSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userEmail = localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAdminLeaveHistory = async () => {
      if (!userEmail || !token) {
        setError("Authentication information missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BACKEND_URL}/api/leave/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Admin Leave Response:", response.data);

        // Extract the leave history and settings from the response
        if (response.data && response.data.leaveHistory) {
          setLeaveHistory(response.data.leaveHistory);
        }

        if (response.data && response.data.leaveSettings) {
          setLeaveSettings(response.data.leaveSettings);
        }
      } catch (err) {
        console.error("Error fetching admin leave history:", err);
        setError("Failed to load your leave history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminLeaveHistory();
  }, [userEmail, token]);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading)
    return <div className="loading">🔄 Loading...</div>;

  if (error)
    return (
      <div className="error">
        ❌ {error} <br />
        <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
      </div>
    );

  return (
    <div className="dashboard-container">
      <HeaderSidebar_admin />
      <main className="main-content1">
        <div className="notifications-container">
          <h2 className="notifications-title">My Leave Requests</h2>

          {Array.isArray(leaveHistory) && leaveHistory.length > 0 ? (
            <div className="leave-history">
              {leaveHistory.map((leave) => (
                <div key={leave._id} className="notification-card">
                  <div className="request-header">
                    <h3>{leave.leaveType || "Leave Request"}</h3>
                    <span className={`status-badge1 ${getStatusClass(leave.status)}`}>
                      {leave.status || "Pending"}
                    </span>
                  </div>

                  <div className="nc">
                    <div className="request-meta">
                      <p className="timestamp">📅 Submitted: {formatDate(leave.timestamp)}</p>
                      <p className="leave-start">🚀 Start Date: {formatDate(leave.startDate)}</p>
                      <p className="leave-end">🏁 End Date: {formatDate(leave.endDate)}</p>
                      <p className="leave-days">🗓️ Total Leave Days: {leave.totalLeaveDays || "N/A"}</p>
                      <p className="request-reason">💬 Reason: {leave.reason || "No reason provided"}</p>
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

export default AdminNotifications;