import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Employee.css';
import './Git.css';
import HeaderSidebar_admin from "./HeaderSidebar_admin.jsx";

const Annotation = () => {

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="dashboard-container">
      <HeaderSidebar_admin />
      <main className="main-content">
        {/* <div className="portal-container"> */}
        <h1 className="portal-title">🖍️ Personalized Annotation Portal</h1>
        <p className="portal-description">
          Our <strong>Annotation Portal</strong> is designed to streamline data labeling, AI model training,
          and dataset management. It provides an intuitive interface for annotating images, text, videos, and
          documents with precision.
        </p>

        <h2 className="portal-section-title">📌 Key Features</h2>
        <ul className="portal-feature-list">
          <li>✅ <strong>Multi-Format Annotation</strong> – Label images, text, and videos effortlessly.</li>
          <li>✅ <strong>AI-Assisted Labeling</strong> – Boost efficiency with AI-powered suggestions.</li>
          <li>✅ <strong>Collaborative Workflow</strong> – Assign tasks, track progress, and ensure quality control.</li>
          <li>✅ <strong>Advanced Annotation Tools</strong> – Use bounding boxes, polygons, and keypoints.</li>
          <li>✅ <strong>Data Export & Integration</strong> – Export data in JSON, CSV, XML, and integrate with ML pipelines.</li>
          <li>✅ <strong>User Role Management</strong> – Control permissions for annotators, reviewers, and admins.</li>
        </ul>

        <p className="portal-footer">
          With our <strong>Annotation Portal</strong>, you can efficiently <strong>annotate, review, and manage</strong> datasets
          for high-quality AI model training and data processing.
        </p>
        {/* </div> */}


        <div className="github-button-container">
          <a href="https://annotate.armtronix.net" target="_blank" rel="noopener noreferrer" className="github-button">
            Annotation <i className="fas fa-arrow-up" style={{ transform: "rotate(45deg)", color: "white" }}></i>
          </a>
        </div>
      </main>
    </div>

  );
};

export default Annotation;
