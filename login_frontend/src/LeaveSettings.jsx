import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderSidebar_admin from "./HeaderSidebar_admin";
import "./LeaveSettings.css";




const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const LeaveSettings = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [totalLeaves, setTotalLeaves] = useState(35);
    const [leavesTaken, setLeavesTaken] = useState(0);
    const [resetType, setResetType] = useState("single");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [globalTotalLeaves, setGlobalTotalLeaves] = useState(35);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
          headers: { Authorization: `Bearer ${token}` }
        };
    };

    useEffect(() => {
        const fetchEmployees = async () => {
          try {
            const response = await axios.get(`${BACKEND_URL}/api/user`, getAuthHeaders());
            setEmployees(response.data || []);
          } catch (error) {
            setMessage("Error fetching employees");
          }
        };

        const fetchLeaveSettings = async () => {
          try {
            const response = await axios.get(`${BACKEND_URL}/leave/settings`, getAuthHeaders());
            if (response.data?.totalLeaves) {
              setGlobalTotalLeaves(response.data.totalLeaves);
            }
          } catch (error) {
            console.error("Error fetching leave settings:", error);
          }
        };

        fetchEmployees();
        fetchLeaveSettings();
    }, []);

    const handleEmployeeChange = async (e) => {
        const email = e.target.value;
        setSelectedEmployee(email);

        if (email) {
            try {
                const response = await axios.get(
                    `${BACKEND_URL}/leave-summary?email=${email}`, 
                    getAuthHeaders()
                );
                const { leavesTaken } = response.data;
                setLeavesTaken(leavesTaken);
            } catch (error) {
                console.error("Error fetching employee leave summary:", error);
            }
        }
    };

  
  // ✅ Fetch updated leave data

  // const handleResetSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setMessage("");
  
  //   try {
  //     console.log(`Resetting leaves for ${resetType === "single" ? selectedEmployee : "all employees"}...`);
  
  //     const requestData = resetType === "single"
  //       ? { resetType: "single", email: selectedEmployee, totalLeaves }
  //       : { resetType: "all", totalLeaves: globalTotalLeaves };
  
  //     const response = await axios.post(`${BACKEND_URL}/leave/reset`, requestData, getAuthHeaders());
  //     console.log("Reset API Response:", response.data);
  
  //     setMessage(response.data.message);
      
  //     // Force refetching after a delay to ensure DB is updated
  //     setTimeout(async () => {
  //       if (resetType === "single" && selectedEmployee) {
  //         try {
  //           const refreshResponse = await axios.get(
  //             `${BACKEND_URL}/leave-summary?email=${selectedEmployee}&t=${Date.now()}`, 
  //             getAuthHeaders()
  //           );
  //           console.log("Refreshed Leave Summary:", refreshResponse.data);
  //           setLeavesTaken(refreshResponse.data.leavesTaken || 0); // Ensure we get 0 if undefined
  //         } catch (err) {
  //           console.error("Error refreshing data:", err);
  //         }
  //       }
  //     }, 1500);
  
  //   } catch (error) {
  //     console.error("Error resetting leaves:", error);
  //     setMessage("❌ Error resetting leaves. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
  
    try {
      console.log(`Resetting leaves for ${resetType === "single" ? selectedEmployee : "all employees"}...`);
  
      const requestData = resetType === "single"
        ? { resetType: "single", email: selectedEmployee, totalLeaves }
        : { resetType: "all", totalLeaves: globalTotalLeaves };
  
      const response = await axios.post(`${BACKEND_URL}/leave/reset`, requestData, getAuthHeaders());
      console.log("Reset API Response:", response.data);
  
      setMessage(response.data.message);
      
      // After reset, use the values from the reset response directly
      if (resetType === "single" && response.data.userSettings) {
        setLeavesTaken(0); // Explicitly set to 0 to match the reset
      }
      
      // Force refresh after a short delay to ensure latest data
      setTimeout(async () => {
        if (resetType === "single" && selectedEmployee) {
          try {
            // Add cache-busting query parameter
            const refreshResponse = await axios.get(
              `${BACKEND_URL}/leave-summary?email=${selectedEmployee}&t=${Date.now()}`, 
              getAuthHeaders()
            );
            console.log("Refreshed Leave Summary:", refreshResponse.data);
            
            // Update state with refreshed data
            setLeavesTaken(refreshResponse.data.leavesTaken || 0);
          } catch (err) {
            console.error("Error refreshing data:", err);
          }
        }
      }, 1000);
  
    } catch (error) {
      console.error("Error resetting leaves:", error);
      setMessage("❌ Error resetting leaves. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaveSummary = async (email) => {
    try {
      console.log(`Fetching updated leave summary for: ${email}`);
      const response = await axios.get(`${BACKEND_URL}/leave-summary?email=${email}`, getAuthHeaders());
      console.log("Updated Leave Summary:", response.data);
      setLeavesTaken(response.data.leavesTaken);
    } catch (error) {
      console.error("Error fetching updated leave summary:", error);
    }
  };
  
  // ✅ Fetch global leave settings
  const fetchGlobalLeaveSettings = async () => {
    try {
      console.log("Fetching updated global leave settings...");
      const response = await axios.get(`${BACKEND_URL}/leave/settings`, getAuthHeaders());
      console.log("Updated Global Leave Settings:", response.data);
      setGlobalTotalLeaves(response.data.totalLeaves);
    } catch (error) {
      console.error("Error fetching global leave settings:", error);
    }
  };
  
  

    return (
        <div className="dashboard-container">
            <HeaderSidebar_admin />
            <main className="main-content1">
                <div className="content-container">
                    <div className="leave-settings-container">
                        <h1>Leave Settings</h1>

                        {/* Reset Leaves Section */}
                        <div className="settings-section">
                            <h2>Reset Employee Leaves</h2>
                            <div className="reset-type-selector">
                                <button
                                    className={resetType === "single" ? "active" : ""}
                                    onClick={() => setResetType("single")}
                                >
                                    Reset Individual Employee
                                </button>
                                <button
                                    className={resetType === "all" ? "active" : ""}
                                    onClick={() => setResetType("all")}
                                >
                                    Reset All Employees
                                </button>
                            </div>

                            <form onSubmit={handleResetSubmit}>
                                {resetType === "single" && (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="employee">Select Employee:</label>
                                            <select id="employee" value={selectedEmployee} onChange={handleEmployeeChange}>
                                                <option value="">Select an employee</option>
                                                {employees.map((employee) => (
                                                    <option key={employee._id} value={employee.email}>
                                                        {employee.name} ({employee.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="totalLeaves">Total Leaves:</label>
                                            <input type="number" id="totalLeaves" value={totalLeaves} onChange={(e) => setTotalLeaves(parseInt(e.target.value))} min="0" />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="leavesTaken">Leaves Taken:</label>
                                            <input type="number" id="leavesTaken" value={leavesTaken} onChange={(e) => setLeavesTaken(parseInt(e.target.value))} min="0" max={totalLeaves} />
                                        </div>
                                    </>
                                )}

                                {resetType === "all" && (
                                    <div className="form-group">
                                        <label htmlFor="globalTotalLeaves">Total Annual Leaves:</label>
                                        <input type="number" id="globalTotalLeaves" value={globalTotalLeaves} onChange={(e) => setGlobalTotalLeaves(parseInt(e.target.value))} min="0" />
                                    </div>
                                )}

                                <button type="submit" className="submit-btn1" disabled={isLoading}>
                                    {isLoading ? "Resetting..." : "Reset Leaves"}
                                </button>
                            </form>
                        </div>

                        {message && <div className="message">{message}</div>}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LeaveSettings;
