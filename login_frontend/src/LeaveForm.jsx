import './Employee.css';
import './Git.css';
import './LeaveForm.css';
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import HeaderSidebar from "./HeaderSidebar.jsx";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const LeaveForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    totalLeaveDays: "",
    reason: ""
  });

  const [status, setStatus] = useState("");
  const [leavesRemaining, setLeavesRemaining] = useState(null);
  const [lopDays, setLopDays] = useState(0); // LOP Days
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLeavesRemaining = async () => {
      if (!formData.email) return;

      try {
        const response = await axios.get(`${BACKEND_URL}/leave-summary?email=${formData.email}`);
        setLeavesRemaining(response.data.leavesRemaining);
        console.log("Leaves Remaining", response.data.leavesRemaining);
      } catch (error) {
        console.error("Error fetching remaining leaves:", error);
        setLeavesRemaining(0); // Default to 0 in case of an error
      }
    };

    fetchLeavesRemaining();
  }, [formData.email]); // Runs when email changes


  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const loggedInEmail = sessionStorage.getItem("loggedInUserEmail");

    if (loggedInEmail && loggedInEmail !== storedEmail) {
      localStorage.setItem("userEmail", loggedInEmail);
      setFormData(prev => ({ ...prev, email: loggedInEmail }));
    } else if (storedEmail) {
      setFormData(prev => ({ ...prev, email: storedEmail }));
    }

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // Ensure token is stored in localStorage or sessionStorage

        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const response = await axios.get(`${BACKEND_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });

        if (response.data) {
          setFormData(prev => ({
            ...prev,
            name: response.data.name,
            designation: response.data.Designation
          }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };


    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "totalLeaveDays") {
      const requestedDays = parseInt(value, 10) || 0;
      const lop = requestedDays > leavesRemaining ? requestedDays - leavesRemaining : 0;
      setLopDays(lop);
    }

    if (name === "email") {
      localStorage.setItem("userEmail", value);
    }
    if (name === "leaveType" && value === "Half Day Leave") {
      setFormData(prev => ({ ...prev, totalLeaveDays: "0.5" }));
    }
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestedDays = parseInt(formData.totalLeaveDays);
    const lopDays = requestedDays > leavesRemaining ? requestedDays - leavesRemaining : 0;

    // Allow submission even if LOP applies
    const updatedFormData = {
      ...formData,
      lopDays: lopDays, // Include LOP in request
    };

    try {
      setIsSubmitting(true); // 👈 disable submit button

      localStorage.setItem("userEmail", formData.email);
      await axios.post(`${BACKEND_URL}/leave`, updatedFormData);
      setStatus("✅ Leave request submitted successfully!");

      setTimeout(() => {
        setFormData((prev) => ({
          name: "",
          email: prev.email,
          designation: "",
          leaveType: "",
          startDate: "",
          endDate: "",
          totalLeaveDays: "",
          reason: ""
        }));
        setStatus(""); // Clear message after 5 seconds
      }, 5000);
    } catch (error) {
      console.error("Error submitting leave request:", error);
      setStatus("❌ Failed to submit leave request.");
    } finally {
      setIsSubmitting(false); // 👈 always re-enable after attempt
    }
  };

  const isSubmitDisabled = leavesRemaining === null;

  const getMinDate = () => {
    const today = new Date();

    if (formData.leaveType === "Sick Leave" || formData.leaveType === "Half Day Leave") {
      return today.toISOString().split("T")[0]; // today itself
    } else {
      today.setDate(today.getDate() + 7); // 7 days later for others
    }

    return today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  return (
    <div className="dashboard-container">
      <HeaderSidebar />
      <main className="main-content1">
        <div className='contact'>
          <div className="container">
            <h2>Leave Form</h2>
            <p>Remaining Leaves: <strong>{leavesRemaining !== null ? leavesRemaining : "Loading..."}</strong></p>

            <form className="contact-form" onSubmit={handleSubmit} method="POST">
              <div className='CF'>
                <div className="form-group1">
                  <label htmlFor="name">Employee Name:</label>
                  <input type="text" id="name" name="name" placeholder="Name" required value={formData.name} onChange={handleChange} />
                </div>

                <div className="form-group1">
                  <label htmlFor="email">Email:</label>
                  <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} />
                </div>

                <div className="form-group1">
                  <label htmlFor="designation">Designation:</label>
                  <input type="text" id="designation" name="designation" placeholder="Designation" required value={formData.designation} onChange={handleChange} />
                </div>

                <div className="form-group1">
                  <label htmlFor="leaveType">Type of Leave:</label>
                  <select id="leaveType" name="leaveType" required value={formData.leaveType} onChange={handleChange}>
                    <option value="">Select Leave Type</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Earned Leave">Earned Leave</option>
                    <option value="Restricted Leave">Restricted Leave</option>
                    <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
                    <option value="Half Day Leave">Half Day Leave</option> {/* ✅ Add this */}
                    <option value="other">Others</option>

                  </select>
                </div>


                <div className="form-group1">
                  <label htmlFor="startDate">Start Date:</label>
                  <input type="date" id="startDate" name="startDate" required value={formData.startDate} onChange={handleChange} min={getMinDate()} />
                </div>

                <div className="form-group1">
                  <label htmlFor="endDate">End Date:</label>
                  <input type="date" id="endDate" name="endDate" required value={formData.endDate} onChange={handleChange} min={getMinDate()} />
                </div>

                <div className="form-group1">
                  <label htmlFor="totalLeaveDays">Total Leave Days:</label>
                  <input
                    type="number"
                    id="totalLeaveDays"
                    name="totalLeaveDays"
                    required
                    value={formData.totalLeaveDays}
                    onChange={handleChange}
                  />
                  {lopDays > 0 && (
                    <p className="lop-message">⚠️ LOP (Loss of Pay) Days: <strong>{lopDays}</strong></p>
                  )}
                </div>

                <div className="form-group1">
                  <label htmlFor="reason">Reason for Leave:</label>
                  <textarea id="reason" name="reason" rows="2" required value={formData.reason} onChange={handleChange}></textarea>
                </div>
              </div>
              {parseInt(formData.totalLeaveDays) > leavesRemaining && <p className="error-message12">⚠️ Requested leave exceeds available balance.</p>}

              <div className="submit-button-container">
                <button
                  type="submit"
                  className={`submit-btn ${(isSubmitDisabled || isSubmitting) ? "disabled-btn" : ""}`}
                  disabled={isSubmitDisabled || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>


              </div>

            </form>

            <div className="form-footer">
              {status && <p className="status-message">{status}</p>}

              <p>
                Track your leave request status in the{" "}
                <Link to="/employeenotifications">My Leave Status</Link> page.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeaveForm;
