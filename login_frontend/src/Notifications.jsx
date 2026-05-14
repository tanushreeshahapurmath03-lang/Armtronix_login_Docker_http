import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./Notifications.css";
import HeaderSidebar_admin from "./HeaderSidebar_admin";



const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const socket = io(BACKEND_URL, { autoConnect: false }); // Don't auto-connect until login

const Notifications = ({ userEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const [notifications, setNotifications] = useState([]);

  // Fetch leave requests from MongoDB
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/leave-requests`)
      .then((response) => setNotifications(response.data))
      .catch((error) =>
        console.error("Error fetching leave requests:", error)
      );
  }, []);

  // Connect user to Socket.IO with their email
  useEffect(() => {
    if (userEmail) {
      socket.connect();
      socket.emit("register", userEmail); // Register user with their email

      socket.on("leave_status_updated", (data) => {
        console.log("Leave status updated:", data);
        alert(`Your leave request is now: ${data.status}`);

        // Update notifications in real-time
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === data.id
              ? { ...notif, status: data.status }
              : notif
          )
        );
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [userEmail]);

  const handleAction = async (id, status) => {
    try {
      await axios.post(`${BACKEND_URL}/approve-leave`, { id, status });

      // Update UI after approval/rejection
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, status } : notif
        )
      );
    } catch (error) {
      console.error("Error updating leave request:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <HeaderSidebar_admin />
      <main className="main-content">
        <h2 className="notifications-title">Leave Request Notifications</h2>
        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <div key={index} className="notification-card">
              <p className="employee-name">
                <strong>Name: </strong>
                {notif.name}
              </p>
              <div className="nc">
                <p className="request-reason">
                  <strong>Type of Leave:</strong> {notif.leaveType}
                </p>
                <p className="request-reason">
                  <strong>Start Date:</strong>{" "}
                  {notif.startDate ? new Date(notif.startDate).toLocaleDateString("en-GB", { timeZone: "UTC" }) : "N/A"}
                </p>

                <p className="request-reason">
                  <strong>End Date:</strong>{" "}
                  {new Date(notif.endDate).toLocaleDateString("en-GB")}
                </p>
                <p className="request-reason">
                  <strong>Total leave days: </strong>
                  {notif.totalLeaveDays}
                </p>
                <p className="request-reason">
                  <strong>Reason:</strong> {notif.reason}
                </p>
                {/* <p className="request-status">
                  <strong>Status: </strong>
                  <span
                    className={`status-${notif.status?.toLowerCase() || "pending"}`}
                  >
                    {notif.status || "Pending"}
                  </span>
                </p> */}

                <p className="request-status">
                  <strong>Status: </strong>
                  <span className={`status-${notif.status?.toLowerCase() || "pending"}`}>
                    {notif.autoApproved ? "Auto Approved" : notif.status || "Pending"}
                  </span>
                </p>

              </div>
              {notif.status === "Pending" && (
                <div className="action-buttons">
                  <button
                    onClick={() => handleAction(notif._id, "Approved")}
                    className="approve-button"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(notif._id, "Rejected")}
                    className="reject-button"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="no-requests">No new leave requests.</p>
        )}
      </main>
    </div>
  );
};

export default Notifications;
