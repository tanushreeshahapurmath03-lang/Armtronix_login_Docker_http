

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Employee.css';
import HeaderSidebar_admin from "./HeaderSidebar_admin.jsx";

const HelpGuide = () => {

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);


  return (
    <div className="dashboard-container">
      <HeaderSidebar_admin />
      <main className="main-content1">
        {/* <h1 className="portal-title">🤖 Personalized AI/GPT Portal</h1> */}

        <h2>Do you need help using the website?</h2>
        <p>This guide will help you navigate and use the different features available on the platform.</p>

        <section className='e1'>
          <h3>1. Admin Dashboard</h3>
          <p><strong>Purpose:</strong> Central hub for accessing company resources.</p>
          <p><strong>How to Use:</strong></p>
          <ul>
            <li>Displays a welcome message and profile icon.</li>
            <li>Click the profile icon to view User Profile or Log out.</li>
            <li>Sidebar allows navigation to Git, Cloudflare, AI/GPT, Annotation, Claim Form, and Leave Form.</li>
            <li>Main content area shows company policies.</li>
          </ul>
          <p><strong>Key Features:</strong></p>
          <ul>
            <li>Easy access to different tools and resources.</li>
            <li>Company policies and guidelines displayed.</li>
            <li>Quick logout option.</li>
          </ul>
        </section>

        <section className='e1'>
          <h3>2. Git Portal</h3>
          <p><strong>Purpose:</strong> Manage Git repositories and collaborate on code.</p>
          <p><strong>How to Use:</strong></p>
          <ul>
            <li>Overview of Git and version control.</li>
            <li>Comprehensive list of Git commands.</li>
            <li>Direct access to GitHub via a button.</li>
          </ul>
          <p><strong>Key Features:</strong></p>
          <ul>
            <li>Secure and centralized repository management.</li>
            <li>Branching, merging, and issue tracking.</li>
            <li>CI/CD integration for automation.</li>
          </ul>
        </section>

        <section className='e1'>
          <h3>3. Cloudflare Portal</h3>
          <p><strong>Purpose:</strong> Manage security, DNS, and optimize web performance.</p>
          <p><strong>How to Use:</strong></p>
          <ul>
            <li>Real-time traffic monitoring.</li>
            <li>Custom security policies and DDoS protection.</li>
            <li>Easy DNS and SSL management.</li>
          </ul>
          <p><strong>Key Features:</strong></p>
          <ul>
            <li>Advanced security controls.</li>
            <li>CDN optimization for performance.</li>
            <li>Seamless integration with websites.</li>
          </ul>
        </section>

        <section className='e1'>
          <h3>4. AI/GPT Portal</h3>
          <p><strong>Purpose:</strong> AI-powered automation and intelligent content generation.</p>
          <p><strong>How to Use:</strong></p>
          <ul>
            <li>Automate tasks and analyze structured & unstructured data.</li>
            <li>Generate reports and train AI models.</li>
            <li>Multi-language support for AI-based tasks.</li>
          </ul>
          <p><strong>Key Features:</strong></p>
          <ul>
            <li>AI-powered document and report generation.</li>
            <li>Smart chatbots for automation.</li>
            <li>Custom AI model training for specific tasks.</li>
          </ul>
        </section>

        <section className='e1'>
          <h3>5. Annotation Portal</h3>
          <p><strong>Purpose:</strong> Label and annotate data for AI model training.</p>
          <p><strong>How to Use:</strong></p>
          <ul>
            <li>Multi-format annotation (text, images, videos).</li>
            <li>AI-assisted labeling for efficiency.</li>
            <li>Data export in JSON, CSV, XML formats.</li>
          </ul>
          <p><strong>Key Features:</strong></p>
          <ul>
            <li>Collaborative workflow support.</li>
            <li>Integration with machine learning pipelines.</li>
            <li>Advanced annotation tools.</li>
          </ul>
        </section>

        <section className='e1'>
          <h3>6. Claim Form Functionalities for Employees</h3>
          <p><strong>Purpose:</strong> Allows employees to submit reimbursement requests for official expenses.</p>
          <p><strong>How to Use:</strong></p>
          <ul>
            <li>Claim number is auto-generated and non-editable.</li>
            <li>Enter details such as date, employee name, ID, and location.</li>
            <li>Add multiple expense entries with purpose, quantity, unit price, and total amount.</li>
            <li>Include advance received, adjustments, and cash returned for final amount calculation.</li>
            <li>Download the filled claim form as a PDF.</li>
            <li>Submit the claim for approval with required signatures.</li>
          </ul>
          <p><strong>Key Features:</strong></p>
          <ul>
            <li>Automated claim numbering format (CF/24-25/XX).</li>
            <li>Auto-calculated total expenses.</li>
            <li>Ability to add multiple expenses in one form.</li>
            <li>Downloadable PDF with company logo.</li>
            <li>Approval section for submitted, approved, and received signatures.</li>
          </ul>

          <h4> * Claim Form Payment processing Functionality for Admin</h4>
          <p><strong>Purpose:</strong> Allows admins to manage, track, and process submitted claims.</p>
          <p><strong>How to Use:</strong></p>
          <ul>
            <li>View all submitted claims with details like claim number, employee name, total expense, and payment status.</li>
            <li>Process pending claims by selecting payment type (Cash/Online).</li>
            <li>Enter UTR number for online payments and confirm transaction details.</li>
            <li>Mark claims as paid to update the status.</li>
            <li>Ensure validation checks prevent incomplete submissions.</li>
          </ul>
          <p><strong>Key Features:</strong></p>
          <ul>
            <li>Role-based access control (Employees submit, Admins process).</li>
            <li>Automated claim tracking with real-time status updates.</li>
            <li>Secure payment processing with UTR verification.</li>
            <li>Error handling for missing or invalid data.</li>
          </ul>
        </section>

        <section className='e1'>
          <h3>7. Leave Form Functionalities for Admin</h3>
          <p><strong>Purpose:</strong> Allows admins to manage, review, and process employee leave requests. Additionally, admins can submit their own leave requests.</p>

          <p><strong>How to Use (For Reviewing and Managing Leave Requests):</strong></p>
          <ul>
            <li>View all submitted leave requests with employee details.</li>
            <li>Filter leave requests based on their status (Pending, Approved, Rejected).</li>
            <li>Click on a leave request to review the details, including employee name, email, subject, and reason for leave.</li>
            <li>Approve or reject the leave request with an optional comment.</li>
            <li>Update leave records and notify the employee of the decision.</li>
          </ul>

          <p><strong>How to Use (For Submitting a Leave Request as an Admin):</strong></p>
          <ul>
            <li>Enter your <strong>Name</strong> and <strong>Email</strong> (auto-filled if available).</li>
            <li>Provide a <strong>Subject</strong> describing the leave request.</li>
            <li>Enter the <strong>Reason for Leave</strong> in the provided text area.</li>
            <li>Click the <strong>"Submit"</strong> button to send the leave request for approval.</li>
            <li>Track your leave request status in the <Link to="/notifications">My Leave Status</Link> page.</li>
          </ul>

          <p><strong>Key Features:</strong></p>
          <ul>
            <li><strong>Role-based access:</strong> Admins can both submit and manage leave requests.</li>
            <li><strong>Leave request tracking:</strong> View and filter employee leave requests.</li>
            <li><strong>Email notifications:</strong> Employees receive automatic updates on their leave status.</li>
            <li><strong>Data validation:</strong> Ensures all required fields are filled before processing a leave request.</li>
            <li><strong>Secure leave management:</strong> Prevents unauthorized modifications to leave records.</li>
          </ul>
        </section>

        <section className='e1'>
          <h3>8. Employee Registration Functionality for Admin</h3>
          <p><strong>Purpose:</strong> Allows admins to register new employees in the system.</p>

          <p><strong>How to Use:</strong></p>
          <ul>
            <li>Navigate to the <strong>Employee Registration</strong> page.</li>
            <li>Select the <strong>Role</strong> as <strong>Employee</strong> from the dropdown menu.</li>
            <li>Enter the employee’s <strong>Full Name</strong> in the input field.</li>
            <li>Provide the employee’s <strong>Email Address</strong> (this will be used for login).</li>
            <li>Create a <strong>Password</strong> and enter it in the password field.</li>
            <li>Confirm the password by re-entering it in the <strong>Confirm Password</strong> field.</li>
            <li>Click the <strong>"Register"</strong> button to submit the details and create the employee account.</li>
            <li>Upon successful registration, a <strong>confirmation message</strong> will be displayed.</li>
          </ul>

          <p><strong>Key Features:</strong></p>
          <ul>
            <li><strong>Role-based Registration:</strong> Admins can assign employees specific roles.</li>
            <li><strong>Email Validation:</strong> Ensures only valid email formats are accepted.</li>
            <li><strong>Password Confirmation:</strong> Prevents errors by requiring password re-entry.</li>
            <li><strong>Success Notification:</strong> Admins receive a confirmation message after successful registration.</li>
            <li><strong>Security Measures:</strong> Ensures passwords are securely stored and hashed in the backend.</li>
          </ul>

          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>Ensure the <strong>Email</strong> provided is correct, as it will be used for employee login.</li>
            <li><strong>Passwords must match</strong> in both fields to complete the registration.</li>
            <li>Admins can only register <strong>employees</strong>; separate access is required for admin registration.</li>
          </ul>
        </section>

        <section className='e1'>
          <h3>9. Employee Profile Details Functionality for Admin</h3>
          <p><strong>Purpose:</strong> Allows admins to view detailed profiles of employees and manage their roles.</p>

          <p><strong>How to Use:</strong></p>
          <ul>
            <li>Navigate to the <strong>Admin Dashboard</strong> to see the list of all employees.</li>
            <li>Each employee is displayed as a <strong>profile card</strong> containing their name, role, and profile image.</li>
            <li>Click on an employee’s card to open a <strong>profile details popup</strong>.</li>
            <li>In the popup, the admin can view details such as:
              <ul>
                <li><strong>Name</strong></li>
                <li><strong>Email</strong></li>
                <li><strong>Phone Number</strong></li>
                <li><strong>Address</strong></li>
                <li><strong>Blood Group</strong></li>
                <li><strong>Role (Employee/Admin)</strong></li>
              </ul>
            </li>
            <li>To close the popup, click the <strong>"✖"</strong> button.</li>
          </ul>

          <p><strong>Key Features:</strong></p>
          <ul>
            <li><strong>Employee List:</strong> Displays all employees in a structured grid format.</li>
            <li><strong>Detailed Employee Profile:</strong> Provides complete personal and role-related information.</li>
            <li><strong>Profile Image Support:</strong> Displays employee profile pictures (default image if unavailable).</li>
            <li><strong>Popup View:</strong> Allows quick access to employee details without navigating away.</li>
            <li><strong>Role Management:</strong> Admins can switch employee roles between "Employee" and "Admin" using a toggle button.</li>
          </ul>

          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>Only <strong>Admins</strong> have access to view and manage employee details.</li>
            <li>Ensure role changes are intentional, as switching roles affects user permissions.</li>
            <li>Employee details are fetched securely using an authorization token.</li>
          </ul>
        </section>

        <section className='e1'>
          <h3>10. Notifications Functionality for Employees & Admins</h3>

          <p><strong>Purpose:</strong> The notifications system enables <strong>employees</strong> to track the status of their leave requests and allows <strong>admins</strong> to review, approve, or reject them in real time.</p>

          <p><strong>For Employees:</strong></p>
          <ul>
            <li>Employees can submit <strong>leave requests</strong>, which will be recorded in the system.</li>
            <li>Once a leave request is submitted, it appears in the <strong>notifications panel</strong>.</li>
            <li>Each notification contains:
              <ul>
                <li>The <strong>employee’s name</strong> who submitted the request.</li>
                <li>The <strong>reason for leave</strong>.</li>
                <li>The <strong>current status</strong> of the request (<strong>Pending, Approved, Rejected</strong>).</li>
              </ul>
            </li>
            <li>Employees will receive <strong>real-time updates</strong> when their leave request is approved or rejected.</li>
          </ul>

          <p><strong>For Admins:</strong></p>
          <ul>
            <li>Admins can <strong>view all submitted leave requests</strong> in the notifications panel.</li>
            <li>Each leave request displays:
              <ul>
                <li>The <strong>employee’s name</strong>.</li>
                <li>The <strong>leave reason</strong> provided.</li>
                <li>The <strong>current status</strong> of the request.</li>
              </ul>
            </li>
            <li>If a leave request is marked as <strong>"Pending"</strong>, the admin has two options:
              <ul>
                <li>Click <strong>"Approve"</strong> to accept the leave request.</li>
                <li>Click <strong>"Reject"</strong> to decline the request.</li>
              </ul>
            </li>
            <li>Upon approval or rejection, the system <strong>sends real-time updates</strong> to the employee.</li>
          </ul>

          <p><strong>Key Features:</strong></p>
          <ul>
            <li><strong>Real-time Updates:</strong> Employees are notified immediately when their leave status changes.</li>
            <li><strong>Admin Controls:</strong> Admins can review and take action on leave requests directly from the notifications panel.</li>
            <li><strong>Status Tracking:</strong> Employees can track the status of submitted leave requests (<strong>Pending, Approved, Rejected</strong>).</li>
            <li><strong>WebSocket Integration:</strong> The system uses <strong>Socket.IO</strong> to push real-time updates without requiring a page refresh.</li>
          </ul>

          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>Once a leave request is <strong>approved or rejected</strong>, it cannot be modified.</li>
            <li>Only <strong>Pending requests</strong> can be acted upon by admins.</li>
            <li>Employees should check the <strong>notifications panel</strong> regularly for updates on their leave status.</li>
          </ul>
        </section>


        <section className='e1'>
          <h3>11. Profile Management for Admin</h3>

          <p><strong>Purpose:</strong> The profile management system allows <strong>admins</strong> to view and update employee details, manage their attendance, and assign tasks.</p>

          <p><strong>How to Use:</strong></p>
          <ul>
            <li>Navigate to the <strong>Profile</strong> section in the admin panel.</li>
            <li>Click on an <strong>employee profile</strong> to view their complete details.</li>
            <li>Admins can see the following information:
              <ul>
                <li><strong>Employee Name</strong></li>
                <li><strong>Email Address</strong></li>
                <li><strong>Phone Number</strong></li>
                <li><strong>Home Address</strong></li>
                <li><strong>Blood Group</strong></li>
                <li><strong>Profile Picture</strong> (if uploaded)</li>
                <li><strong>Current Role</strong> (Employee/Admin)</li>
              </ul>
            </li>
            <li>Admins can also view an <strong>employee’s attendance records</strong> and <strong>task assignments</strong>.</li>
          </ul>

          <p><strong>Admin Actions:</strong></p>
          <ul>
            <li><strong>Edit Profile:</strong> Click the <strong>"Edit Profile"</strong> button to update an employee's details.</li>
            <li><strong>Update Contact Information:</strong> Modify an employee's <strong>phone number</strong> and <strong>address</strong>.</li>
            <li><strong>Change Profile Picture:</strong> Upload or update an employee's profile image.</li>
            <li><strong>Manage Attendance:</strong> Track <strong>total leaves</strong>, <strong>leaves taken</strong>, and <strong>remaining leaves</strong>.</li>
            <li><strong>Assign & Review Tasks:</strong> Admins can assign <strong>new tasks</strong> and review their completion status.</li>
          </ul>

          <p><strong>Key Features:</strong></p>
          <ul>
            <li><strong>Detailed Employee Information:</strong> View and manage complete employee profiles.</li>
            <li><strong>Attendance Tracking:</strong> Monitor an employee’s leave balance and leave history.</li>
            <li><strong>Task Assignment:</strong> Assign projects and track progress directly from the profile page.</li>
            <li><strong>Secure Role-Based Access:</strong> Only admins can modify employee details.</li>
            <li><strong>Profile Picture Upload:</strong> Employees can upload or update their profile images.</li>
          </ul>

          <p><strong>Important Notes:</strong></p>
          <ul>
            <li><strong>Email addresses cannot be changed</strong> after account creation.</li>
            <li>Only <strong>admins</strong> have permission to edit employee profiles.</li>
            <li>Task assignments and leave tracking are integrated with the <strong>task management</strong> and <strong>attendance system</strong>.</li>
          </ul>
        </section>


        <section className='e1'>
          <h3>Final Notes</h3>
          <p>Use the sidebar for navigation, click the profile icon to manage account or log out, and explore the various portals for enhanced productivity.</p>
        </section>
      </main>
    </div>

  );
};

export default HelpGuide;
