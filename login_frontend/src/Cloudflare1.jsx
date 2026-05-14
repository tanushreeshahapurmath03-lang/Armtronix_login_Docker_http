import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Employee.css';
import './Git.css';
import HeaderSidebar_admin from "./HeaderSidebar_admin.jsx";


const Cloudflare = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="dashboard-container">
      <HeaderSidebar_admin />

      <main className="main-content">
        {/* <div className="portal-container"> */}
        <h1 className="portal-title">🔒 Personalized Cloudflare Portal</h1>
        <p className="portal-description">
          Our <strong>Cloudflare Portal</strong> is a centralized solution for optimizing web security,
          performance, and reliability. It empowers teams to seamlessly manage DNS settings, firewall rules,
          and CDN optimizations—all within a unified interface.
        </p>

        <h2 className="portal-section-title">📌 Key Features</h2>
        <ul className="portal-feature-list">
          <li>✅ <strong>Real-time Traffic Insights</strong> – Monitor and analyze website performance and security.</li>
          <li>✅ <strong>Custom Security Policies</strong> – Configure firewalls, DDoS protection, and bot management.</li>
          <li>✅ <strong>Optimized Content Delivery</strong> – Leverage Cloudflare’s global CDN for faster load times.</li>
          <li>✅ <strong>DNS & SSL Management</strong> – Simplify domain configuration and SSL security.</li>
          <li>✅ <strong>Role-Based Access Control</strong> – Define permissions for different user roles.</li>
          <li>✅ <strong>API & Automation</strong> – Integrate with Cloudflare’s API for automated workflows.</li>
        </ul>

        <p className="portal-footer">
          Enhance security, optimize web performance, and streamline network management with our
          <strong> Cloudflare Portal</strong>—a tailored solution for your business needs.
        </p>
        {/* </div> */}



        <div className="github-button-container">
          <a href="https://armtronix.cloudflareaccess.com/" target="_blank" rel="noopener noreferrer" className="github-button">
            Cloudflare <i className="fas fa-arrow-up" style={{ transform: "rotate(45deg)", color: "white" }}></i>
          </a>
        </div>
      </main>
    </div>

  );
};

export default Cloudflare;
