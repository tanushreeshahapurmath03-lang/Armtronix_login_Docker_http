import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Employee.css';
import './Git.css';
import HeaderSidebar from "./HeaderSidebar.jsx";

const Aigpt = () => {

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="dashboard-container">
      <HeaderSidebar />
      <main className="main-content">
        {/* <div className="portal-container"> */}
        <h1 className="portal-title">🤖 Personalized AI/GPT Portal</h1>
        <p className="portal-description">
          The <strong>AI/GPT Portal</strong> is a smart automation and AI-powered content generation platform,
          built to enhance productivity, automate workflows, and provide intelligent insights tailored to your business.
        </p>

        <h2 className="portal-section-title">📌 Key Features</h2>
        <ul className="portal-feature-list">
          <li>✅ <strong>AI-Powered Content Generation</strong> – Automate reports, emails, and documentation.</li>
          <li>✅ <strong>Intelligent Chatbots</strong> – Provide instant responses and automate customer interactions.</li>
          <li>✅ <strong>Data Analysis & Insights</strong> – Process and interpret structured & unstructured data.</li>
          <li>✅ <strong>Custom Model Training</strong> – Fine-tune AI models for domain-specific tasks.</li>
          <li>✅ <strong>Seamless Integrations</strong> – Connect AI with CRM, ERP, and internal tools.</li>
          <li>✅ <strong>Multi-Language Support</strong> – Generate and process content in multiple languages.</li>
        </ul>

        <p className="portal-footer">
          Our <strong>AI/GPT Portal</strong> empowers teams to work smarter by automating repetitive tasks, analyzing data,
          and unlocking AI-driven innovation.
        </p>


        <div className="github-button-container">
          <a href="https://ai.armtronix.net" target="_blank" rel="noopener noreferrer" className="github-button">
            AI/GPT <i className="fas fa-arrow-up" style={{ transform: "rotate(45deg)", color: "white" }}></i>
          </a>
        </div>
        {/* </div> */}
      </main>
    </div>

  );
};

export default Aigpt;
