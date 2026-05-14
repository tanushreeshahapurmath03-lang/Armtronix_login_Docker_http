
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Employee.css";
import "./HeaderSidebar_admin.css";
import axios from "axios";
import { io } from "socket.io-client";
import PWAWrapper from "./PWAWrapper"; // Import PWAWrapper



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
          <li><Link to="/git1"><i className="fab fa-git-alt"></i> Git</Link></li>
          <li><Link to="/cloudflare1"><i className="fas fa-cloud"></i> Cloudflare</Link></li>
          <li><Link to="/aigpt1"><i className="fas fa-robot"></i>AI/GPT</Link></li>
          <li><Link to="/annotation1"><i className="fas fa-tags"></i>Annotation</Link></li>
          <li><Link to="/claimform1"><i className="fas fa-file-invoice-dollar"></i>Claim Form</Link></li>
          <li><Link to="/leaveform1"><i className="fas fa-calendar"></i> Leave Form</Link></li>
          <li><Link to="/register"><i className="fas fa-user-plus"></i> RegisterEmp</Link></li>
          <li><Link to="/admindashboard"><i className="fas fa-users"></i> Emp Details</Link></li>
          <li><Link to="/leavesettings"><i className="fas fa-sliders-h"></i>Set Leave</Link></li>
          <li><Link to="/help1"><i className="fas fa-question-circle"></i> Help/Guide</Link></li>
          <li><Link to="/coe"><i className="fas fa-calendar-alt"></i> COE</Link></li>

        </ul>
      </div>
    </>
  );
};

export default HeaderSidebar;
