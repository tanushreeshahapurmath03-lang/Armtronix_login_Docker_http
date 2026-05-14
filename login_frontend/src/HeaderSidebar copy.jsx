import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Employee.css";
import "./HeaderSidebar.css";
// import { logout } from "./services/authService.js";
import { useNavigate } from "react-router-dom";

const HeaderSidebar = () => {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  return (
    <>
      {/* HEADER */}
      <header className="header">
        {isMobile && <i className="fas fa-bars menu-icon" onClick={toggleSidebar}></i>}

        <div className="logo">
          <Link to="/employee">
            <img src="/Images/Logo.png" alt="Company Logo" />
          </Link>
        </div>

        {/* <h1 className="wel">Welcome User</h1> */}

        <div className="user-menu">
          <i className="fas fa-user-circle user-icon" onClick={toggleDropdown}></i>
          {isDropdownOpen && (
            <div className="dropdown-wrapper">
              <div className="dropdown-menu">
                <ul>
                  <li><i className="fas fa-user"></i> Profile</li>
                  <li className="logout"><i className="fas fa-sign-out-alt"></i>
                    <button onClick={() => { logout(); navigate("/login"); }}>Logout</button>
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
          <li><Link to="/git"><i className="fab fa-git-alt"></i> Git</Link></li>
          <li><Link to="/cloudflare"><i className="fas fa-cloud"></i> Cloudflare</Link></li>
          <li><Link to="/aigpt"><i className="fas fa-robot"></i> AI/GPT</Link></li>
          <li><Link to="/annotation"><i className="fas fa-tags"></i> Annotation</Link></li>
          <li><Link to="/claimform"><i className="fas fa-file-invoice-dollar"></i> Claim Form</Link></li>
          <li><Link to="/leaveform"><i className="fas fa-calendar-alt"></i> Leave Form</Link></li>
          <li><Link to="/help"><i className="fas fa-question-circle"></i> Help/Guide</Link></li>
        </ul>
      </div>
    </>
  );
};

export default HeaderSidebar;
