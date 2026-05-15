import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Employee.css";
import "./HeaderSidebar.css";
import { io } from "socket.io-client";
import PWAWrapper from "./PWAWrapper"; // Import PWAWrapper
import { employeeNavigationItems } from "./navigationConfig"; // Import navigation config



const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const socket = io(BACKEND_URL);

const HeaderSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [latestNotification, setLatestNotification] = useState(null);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    // Load existing notifications from localStorage
    const storedNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    const hasUnseenNotifications = storedNotifications.some(notif => !notif.seen);
    setHasNewNotification(hasUnseenNotifications);
    setNotifications(storedNotifications);

    // Listen for leave status updates
    socket.on("leave_status_updated", (update) => {
      console.log("Notification received:", update);

      if (update.email === userEmail) {
        setHasNewNotification(true);
        setLatestNotification(update);

        // Store notification in localStorage
        const storedNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
        const newNotifications = [{
          id: update.id,
          status: update.status,
          message: update.message,
          timestamp: update.timestamp || new Date(),
          seen: false
        }, ...storedNotifications];

        localStorage.setItem("notifications", JSON.stringify(newNotifications));
      }
    });

    // Listen for employee-specific leave status updates
    socket.on("employee_leave_status_updated", (update) => {
      if (update.email === userEmail) {
        setHasNewNotification(true);
        setLatestNotification(update);

        // Store notification in localStorage
        const storedNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
        const newNotifications = [{
          id: update.id,
          status: update.status,
          message: update.message,
          timestamp: update.timestamp || new Date(),
          seen: false
        }, ...storedNotifications];

        localStorage.setItem("notifications", JSON.stringify(newNotifications));
      }
    });

    return () => {
      socket.off("leave_status_updated");
      socket.off("employee_leave_status_updated");
    };
  }, [userEmail]);

  const handleNotificationClick = () => {
    // Mark notifications as seen
    const storedNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    const updatedNotifications = storedNotifications.map(notif => ({ ...notif, seen: true }));
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

    setHasNewNotification(false);
    navigate("/employeenotifications");
  };

  // Toggle sidebar for mobile screens
  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  // Toggle user profile dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("notifications"); // Clear stored notifications if needed
    navigate("/"); // Redirect to login page
  };

  return (
    <>
      {/* HEADER */}
      <header className="header">
        {isMobile && <i className="fas fa-bars menu-icon" onClick={toggleSidebar}></i>}

        <div className="logo">
          <Link to="/employee">
            <img src="/Images/Logo.png" alt="Armtronix Iot Pvt. Ltd." />
          </Link>
        </div>

        <div className="user-menu">
        <div className="install-button-wrapper">
            <PWAWrapper showInstallButton={true} installButtonPosition="inline" />
          </div>
          <i title="Leave Notifications"
            className="far fa-bell notification-icon"
            onClick={handleNotificationClick}
            style={{ cursor: "pointer", fontSize: "40px", position: "relative" }}
          >
            {hasNewNotification && (
              <span
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  backgroundColor: "red",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                }}
              ></span>
            )}
          </i>

          <i title="Profile" className="fas fa-user-circle user-icon" onClick={toggleDropdown}></i>
          {isDropdownOpen && (
            <div className="dropdown-wrapper">
              <div className="dropdown-menu">
                <ul>
                  <li>
                    <button className="dropdownButton"
                      onClick={() => navigate("/profileEmp")}
                    // className="dropdown-button"
                    >
                      <i className="fas fa-user"></i> Profile
                    </button>
                  </li>
                  <li className="logout">
                    <button className="dropdownButton" onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* SIDEBAR */}
      <div className={`sidebar ${isSidebarOpen ? "show" : ""}`}>
        <ul>
          {employeeNavigationItems.map((item, index) => (
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