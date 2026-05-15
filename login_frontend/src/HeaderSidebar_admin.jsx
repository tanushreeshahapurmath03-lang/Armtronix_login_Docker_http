
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Employee.css";
import "./HeaderSidebar_admin.css";
import axios from "axios";
import { io } from "socket.io-client";
import PWAWrapper from "./PWAWrapper"; // Import PWAWrapper
import { adminNavigationItems } from "./navigationConfig"; // Import navigation config



const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const socket = io(BACKEND_URL);

const HeaderSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotification, setHasNewNotification] = useState(
    JSON.parse(localStorage.getItem("hasNewNotification")) || false
  );
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/leave`);
        setNotifications(response.data);
        localStorage.setItem("notifications", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };

    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    socket.on("new_leave_request", (newRequest) => {
      setNotifications((prev) => {
        const updatedNotifications = [newRequest, ...prev];
        localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
        setHasNewNotification(true);
        localStorage.setItem("hasNewNotification", JSON.stringify(true));
        return updatedNotifications;
      });
    });

    return () => {
      socket.off("new_leave_request");
    };
  }, []);

  const handleNotificationClick = () => {
    setHasNewNotification(false);
    localStorage.setItem("hasNewNotification", JSON.stringify(false));
    navigate("/notifications");
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("notifications");
    navigate("/");
  };

  return (
    <>
      <header className="header">
        {isMobile && <i className="fas fa-bars menu-icon" onClick={toggleSidebar}></i>}

        <div className="logo">
          <Link to="/admin">
            <img src="/Images/Logo.png" alt="Armtronix Iot Pvt. Ltd." />
          </Link>
        </div>

        <div className="user-menu">
          {/* Install Button */}
          <div className="install-button-wrapper">
            <PWAWrapper showInstallButton={true} installButtonPosition="inline" />
          </div>
          {/* Notification Bell Icon */}
          <i title="Leave Notifications"
            className="far fa-bell notification-icon"
            onClick={handleNotificationClick}
            style={{ cursor: "pointer", fontSize: "40px", position: "relative" }}
          >
            {hasNewNotification && (
              <span
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  backgroundColor: "red",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                }}
              ></span>
            )}
          </i>

          {/* User Profile Icon */}
          <i title="Profile" className="fas fa-user-circle user-icon" onClick={toggleDropdown}></i>
          {isDropdownOpen && (
            <div className="dropdown-wrapper">
              <div className="dropdown-menu">
                <ul>
                  <li>
                    <button className="dropdownButton" onClick={() => navigate("/profile")}>
                      <i className="fas fa-user"></i> Profile
                    </button>
                  </li>
                  <li className="logout">
                    <button
                      className="dropdownButton"
                      onClick={handleLogout}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
                    >
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

      </header>

      <div className={`sidebar ${isSidebarOpen ? "show" : ""}`}>
        <ul>
          {adminNavigationItems.map((item, index) => (
            <li key={index}>
              <Link to={item.path}>
                <i className={item.icon}></i> {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default HeaderSidebar;
