import React from 'react';
import { Link } from 'react-router-dom';
import './Employee.css';
import HeaderSidebar_admin from "./HeaderSidebar_admin.jsx";


const Attendance = () => {
  return (
    <div className="dashboard-container">
      <HeaderSidebar_admin />
      <main className="main-content">
        <h2>Rules and Regulations</h2>
        <p>1. Employees must adhere to company policies at all times.</p>
        <p>2. Punctuality and attendance are mandatory.</p>
        <p>3. Confidential company information should not be shared externally.</p>
        <p>4. Workplace ethics and professionalism must be maintained.</p>
        <p>5. Any issues should be reported to HR immediately.</p>
      </main>
    </div>
  );
};

export default Attendance;
