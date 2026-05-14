import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Employee.css';
import HeaderSidebar from "./HeaderSidebar.jsx";

const HelpGuide = () => {

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);


  return (
    <div className="dashboard-container">
      <HeaderSidebar />
      <main className="main-content1">

        <h2>Do you need help using the website?</h2>
        <p>This guide will help you navigate and use the different features available on the platform.</p>

        <section className='e1'>
          <h3>1. Employee Dashboard</h3>
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
        </section>

        <section className='e1'>
          <h3>7. Leave Form Functionalities for Employees</h3>
          <p><strong>Purpose:</strong> Allows employees to submit leave requests and track their status.</p>

          <p><strong>How to Use:</strong></p>
          <ul>
            <li>Enter your <strong>Name</strong> in the provided field.</li>
            <li>Your <strong>Email</strong> is automatically pre-filled from local storage. You can update it if needed.</li>
            <li>Provide a <strong>Subject</strong> describing the nature of the leave request.</li>
            <li>Enter the <strong>Reason for Leave</strong> in the textarea field.</li>
            <li>Click the <strong>"Submit"</strong> button to send your leave request for approval.</li>
            <li>After submission, a status message will indicate whether the request was successfully submitted.</li>
          </ul>

          <p><strong>Key Features:</strong></p>
          <ul>
            <li><strong>Auto-filled email:</strong> The system remembers your email from previous logins.</li>
            <li><strong>Email validation:</strong> Ensures only valid email formats are accepted.</li>
            <li><strong>Real-time status updates:</strong> A success or failure message appears after submitting the request.</li>
            <li><strong>Leave Tracking:</strong> Employees can track the status of their leave requests on the <Link to="/employeenotifications">My Leave Status</Link> page.</li>
          </ul>
        </section>

        <section className='e1'>
          <h3>8. Notifications Functionality for Employees & Admins</h3>

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
          <h3>9. Employee Profile Management</h3>

          <p><strong>Purpose:</strong> The employee profile system allows employees to view and update their personal details, track attendance, and manage assigned tasks.</p>

          <p><strong>How to Use:</strong></p>
          <ul>
            <li>Navigate to the <strong>Profile</strong> section in the employee dashboard.</li>
            <li>Employees can view the following information:
              <ul>
                <li><strong>Name</strong></li>
                <li><strong>Email Address</strong> (non-editable)</li>
                <li><strong>Phone Number</strong></li>
                <li><strong>Home Address</strong></li>
                <li><strong>Blood Group</strong></li>
                <li><strong>Profile Picture</strong> (if uploaded)</li>
                <li><strong>Assigned Tasks</strong></li>
                <li><strong>Attendance & Leave Tracking</strong></li>
              </ul>
            </li>
            <li>Click the <strong>"Edit Profile"</strong> button to update personal details like phone number, address, and blood group.</li>
            <li>Click on the <strong>camera icon</strong> to upload or change the profile picture.</li>
          </ul>

          <p><strong>Attendance & Leave Tracking:</strong></p>
          <ul>
            <li>Employees can view their <strong>Total Leaves</strong>, <strong>Leaves Taken</strong>, and <strong>Leaves Remaining</strong>.</li>
            <li>The <strong>Leave History</strong> section displays all past leave requests along with their <strong>status (Approved, Rejected, Pending)</strong>.</li>
          </ul>

          <p><strong>Task Management:</strong></p>
          <ul>
            <li>The <strong>Tasks</strong> section displays all assigned tasks.</li>
            <li>Each task includes:
              <ul>
                <li><strong>Project Title</strong></li>
                <li><strong>Description</strong></li>
                <li><strong>Deadline</strong></li>
                <li><strong>Current Status</strong> (Not Started, In Progress, Completed, etc.)</li>
                <li><strong>Rationale</strong> (if provided)</li>
              </ul>
            </li>
            <li>Employees can update the task <strong>status</strong> and provide a <strong>rationale</strong> for progress.</li>
            <li>Tasks marked as <strong>"Completed"</strong> go into <strong>"Pending Approval"</strong> status, awaiting admin verification.</li>
          </ul>

          <p><strong>Key Features:</strong></p>
          <ul>
            <li><strong>Profile Management:</strong> Employees can update their personal details.</li>
            <li><strong>Profile Picture Upload:</strong> Employees can upload a new profile image.</li>
            <li><strong>Attendance Tracking:</strong> Employees can monitor leave balances and leave history.</li>
            <li><strong>Task Management:</strong> Employees can track and update assigned tasks.</li>
            <li><strong>Secure Access:</strong> Only employees can modify their own profile details.</li>
          </ul>

          <p><strong>Important Notes:</strong></p>
          <ul>
            <li><strong>Email addresses cannot be changed</strong> after account creation.</li>
            <li><strong>Task updates require approval</strong> before being marked as completed.</li>
            <li>Employees should regularly update task status to keep admins informed of progress.</li>
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
