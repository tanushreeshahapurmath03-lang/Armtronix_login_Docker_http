import React, { useEffect, useState } from "react";
import './Admin.css';
import HeaderSidebar_admin from './HeaderSidebar_admin';
import axios from "axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const api = axios.create({
    baseURL: backendURL,
  });

  console.log(`🚀 Backend URL from .env: ${backendURL}`);


  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchAttendanceHistory = async (userId) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found.");
          return;
        }

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userRole = decodedToken.role;

        // Get current date (midnight) as ISO string
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fromDate = today.toISOString();
        const toDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(); // End of day

        const res = await fetch(`${backendURL}/api/user/attendance/history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: userRole === "admin" ? null : userId,
            fromDate,
            toDate
          }),
        });

        const data = await res.json();
        console.log("Attendance History", data);
        setAttendanceData(data);
      } catch (err) {
        console.error("Error fetching attendance history", err);
      }
    };

    fetchAttendanceHistory();
  }, []);




  useEffect(() => {
    fetchUsers();
  }, []);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${backendURL}/api/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        alert(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Error loading users.");
    }
  };

  const deleteUser = async (userId) => {
    console.log("Deleting user with ID:", userId);

    if (!userId || userId.length !== 24) {
      console.error("Invalid userId:", userId);
      setError('Invalid user ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await api.delete(`/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUsers(users.filter(user => user._id !== userId));

      // ✅ Show success message
      alert("User deleted successfully!");


      // ✅ Close the pop-up card
      closePopup();

      // ✅ Refresh the page (optional)
      // window.location.reload();

    } catch (error) {
      console.error("Error deleting user:", error.response ? error.response.data : error.message);
      setError('Failed to delete User');
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      // Fetch user profile
      const userResponse = await fetch(`${backendURL}/api/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) throw new Error("Failed to fetch user profile");
      const userData = await userResponse.json();

      // Fetch tasks assigned to the user
      const tasksResponse = await fetch(`${backendURL}/api/tasks/assigned-to/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!tasksResponse.ok) throw new Error("Failed to fetch assigned tasks");
      const tasksData = await tasksResponse.json();

      // Fetch leave summary
      const leaveSummaryResponse = await fetch(`${backendURL}/leave-summary?email=${userData.email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!leaveSummaryResponse.ok) throw new Error("Failed to fetch leave summary");
      const leaveSummaryData = await leaveSummaryResponse.json();

      console.log("Fetched Leave Summary Data:", leaveSummaryData);

      // Set the fetched user data
      setSelectedUser({
        ...userData,
        tasks: tasksData,
        attendance: {
          totalLeaves: leaveSummaryData.totalLeaves || 35,
          leavesTaken: leaveSummaryData.leavesTaken || 0,
          leavesRemaining: leaveSummaryData.leavesRemaining || 35,
          leaveHistory: leaveSummaryData.leaveHistory || [], // Ensure leave history is included
        },
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      alert(error.message || "Error loading user details.");
    }
  };

  const toggleRole = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${backendURL}/api/user/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, role: data.role } : user
          )
        );

        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, role: data.role });
        }
      } else {
        alert(data.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Error updating role.");
    }
  };

  const closePopup = () => {
    setSelectedUser(null);
  };

  const downloadLeaveHistory = async (email, from, to) => {
    try {
      const token = localStorage.getItem("token");
      const encodedEmail = encodeURIComponent(email);

      const url = `${backendURL}/leave-history/download/${encodedEmail}?from=${from}&to=${to}`;
      console.log("Requesting:", url); // Debugging

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download leave history.`);
      }

      const contentType = response.headers.get("content-type");

      // If response is JSON, check for "No leave history" message
      if (contentType && contentType.includes("application/json")) {
        const jsonResponse = await response.json();
        if (jsonResponse.message === "No leave history found in the selected date range.") {
          alert("No leave history data available for the previous financial year.");
          return;
        }
      }

      // Otherwise, proceed with downloading the file
      const blob = await response.blob();
      const fileURL = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = fileURL;
      a.download = `leave_history_${email}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("Error downloading leave history:", error);
      alert(error.message);
    }
  };

  const lopDays = Math.max(0, (selectedUser?.attendance?.leavesTaken || 0) - (selectedUser?.attendance?.totalLeaves || 0));

  useEffect(() => {
    if (selectedUser?.attendance?.leavesRemaining < 0) {
      // alert(`⚠️ LOP Days: ${Math.abs(selectedUser.attendance.leavesRemaining)}`);
    }
  }, [selectedUser?.attendance?.leavesRemaining]);

  const [monthlyReport, setMonthlyReport] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year
  const [events, setEvents] = useState({});

  const getMonths = () => {
    return [
      { value: 0, label: 'January' },
      { value: 1, label: 'February' },
      { value: 2, label: 'March' },
      { value: 3, label: 'April' },
      { value: 4, label: 'May' },
      { value: 5, label: 'June' },
      { value: 6, label: 'July' },
      { value: 7, label: 'August' },
      { value: 8, label: 'September' },
      { value: 9, label: 'October' },
      { value: 10, label: 'November' },
      { value: 11, label: 'December' },
    ];
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear]; // Current year and the last 
  };

  const getFinancialYearRange = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0 = January

    const fromDate = month < 3
      ? new Date(year - 1, 3, 1)  // April 1st of previous year
      : new Date(year, 3, 1);     // April 1st of current year

    const toDate = month < 3
      ? new Date(year, 2, 31)     // March 31st of current year
      : new Date(year + 1, 2, 31) // March 31st of next year

    return {
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0],
    };
  };

  const formatKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const getMonthDateRange = (month, year) => {
    const fromDate = new Date(year, month, 1);
    const toDate = new Date(year, month + 1, 0); // last day of month
    return {
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0],
    };
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(Number(event.target.value));
  };

  const handleYearChange = (event) => {
    setSelectedYear(Number(event.target.value));
  };
  const [user, setUser] = useState({
    id: '',
    name: '',
    empId: '',
    email: '',
    role: '',
    phone: '',
    address: '',
    profileImage: '',
    BloodGroup: '',
    Designation: '',
    Gender: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found.");
        return;
      }

      const decodedToken = JSON.parse(atob(token.split('.')[1]));  // Decode JWT
      const userId = decodedToken.userId; 

      if (!userId ) {
        console.warn("User ID not ready, retrying...");
        return;
      }
      try {

        const { fromDate, toDate } = getMonthDateRange(selectedMonth, selectedYear);

        const [attendanceRes, eventRes] = await Promise.all([
          axios.post(`${backendURL}/api/user/attendance/userhistory`, {
            userId: user.id,
            fromDate,
            toDate,
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
          axios.get(`${backendURL}/api/events`),
        ]);

        const eventsFromDB = {};
        eventRes.data.forEach((item) => {
          eventsFromDB[item.date] = item.events;
        });

        // Add Sundays
        const year = selectedYear;
        const month = selectedMonth;
        const date = new Date(year, month, 1);
        while (date.getMonth() === month) {
          if (date.getDay() === 0) {
            const key = formatKey(date);
            if (!eventsFromDB[key]) {
              eventsFromDB[key] = ['Holiday: Sunday'];
            } else if (!eventsFromDB[key].includes('Holiday: Sunday')) {
              eventsFromDB[key].push('Holiday: Sunday');
            }
          }
          date.setDate(date.getDate() + 1);
        }

        setEvents(eventsFromDB);
        setAttendanceData(attendanceRes.data);
      } catch (error) {
        // console.error('Error fetching attendance or events:', error);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear, user._id]);

  // useEffect(() => {
  //   const generateMonthlyReport = () => {
  //     const today = new Date();
  //     const year = selectedYear;
  //     const month = selectedMonth;
  //     const daysInMonth = new Date(year, month + 1, 0).getDate();
  //     const report = [];

  //     const maxDay = (today.getFullYear() === year && today.getMonth() === month)
  //       ? today.getDate()
  //       : daysInMonth;

  //     for (let day = 1; day <= maxDay; day++) {
  //       const date = new Date(year, month, day);
  //       const dateKey = formatKey(date);
  //       const isSunday = date.getDay() === 0;
  //       const coeEvents = events[dateKey] || [];

  //       let status = 'Absent';
  //       let checkIn = null;
  //       let checkOut = null;

  //       if (isSunday && coeEvents.some(e => e.toLowerCase().includes('sunday'))) {
  //         status = 'Sunday';
  //       } else if (coeEvents.some(e => e.toLowerCase().includes('holiday'))) {
  //         status = 'Holiday';
  //       } else {
  //         const record = attendanceData.find((rec) => {
  //           const recDate = new Date(rec.date);
  //           return recDate.toDateString() === date.toDateString();
  //         });

  //         if (record) {
  //           checkIn = record.checkIn;
  //           checkOut = record.checkOut;
  //           if (record.status === 'Full Day') status = 'Present';
  //           else if (record.status === 'Half Day') status = 'Half Day';
  //         }
  //       }

  //       report.push({ date: dateKey, status, checkIn, checkOut });  // include them here
  //     }

  //     setMonthlyReport(report);
  //   };

  //   if (Object.keys(events).length > 0 && attendanceData.length > 0) {
  //     generateMonthlyReport();
  //   }
  // }, [events, attendanceData, selectedMonth, selectedYear]);

    
    useEffect(() => {
      const generateMonthlyReport = () => {
        const today = new Date();
        const year = selectedYear;
        const month = selectedMonth;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const report = [];
    
        const maxDay = (today.getFullYear() === year && today.getMonth() === month)
          ? today.getDate()
          : daysInMonth;
    
        for (let day = 1; day <= maxDay; day++) {
          const date = new Date(year, month, day);
          const dateKey = formatKey(date);
          const isSunday = date.getDay() === 0;
          const coeEvents = events[dateKey] || [];
    
          let status = 'Absent';
          let checkIn = null;
          let checkOut = null;
    
          // const record = attendanceData.find((rec) => {
          //   const recDate = new Date(rec.date);
          //   return recDate.toDateString() === date.toDateString();
          // });

          const record = attendanceData.find((rec) => {
            // Convert both dates to ISO string and compare just the date part (YYYY-MM-DD)
            const recDate = new Date(rec.date).toISOString().split('T')[0];
            const targetDate = date.toISOString().split('T')[0];
            return recDate === targetDate;
          });
          
    
          if (record) {
            checkIn = record.checkIn;
            checkOut = record.checkOut;
            if (!checkOut) {
              status = 'Pending Checkout';  // Mark as present if checked in but not out
            } else {
              const hoursWorked = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
              if (hoursWorked >= 8) status = 'Full Day';
              else if (hoursWorked < 8) status = 'Half Day';
              else status = 'Absent';
            }
          }
    
          if (isSunday) {
            status = 'Sunday';
          } else if (coeEvents.some(e => e.toLowerCase().includes('holiday'))) {
            status = 'Holiday';
          }
    
          report.push({ date: dateKey, status, checkIn, checkOut });
        }
    
        setMonthlyReport(report);
      };
    
      if (Object.keys(events).length > 0 && attendanceData.length > 0) {
        generateMonthlyReport();
      }
    }, [events, attendanceData, selectedMonth, selectedYear]);
    
  const handleDownload = () => {
    const csvRows = [
      ['Date', 'Check-In', 'Check-Out', 'Status'], // header
      ...monthlyReport.map(entry => [
        entry.date,
        entry.checkIn ? new Date(entry.checkIn).toLocaleTimeString() : '-',
        entry.checkOut ? new Date(entry.checkOut).toLocaleTimeString() : '-',
        entry.status,
      ]),
    ];

    const csvContent = csvRows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_${getMonths()[selectedMonth].label}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-container">
      <HeaderSidebar_admin />
      <main className="main-content">
        <h2>Admin Dashboard - Employee Details</h2>

        <div className="employee-grid">
          {/* {users.map((user) => (
            <div key={user._id} className="employee-card" onClick={() => fetchUserDetails(user._id)}>
              {user.profileImage ? (
                <img src={user.profileImage} alt={`${user.name}'s profile`} className="employee-image" />
              ) : (
                <div className="employee-placeholder">
                  {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              <h3>{user.name}</h3>
              <p className="urole">{user.role}</p>
            </div>
          ))} */}
          {users.map((user) => {
            const today = new Date().toLocaleDateString();
            const todayAttendance = attendanceData.find(
              (record) =>
                record.userId?.email === user.email &&
                new Date(record.date).toLocaleDateString() === today
            );

            const attendanceStatus = todayAttendance?.status?.toLowerCase();

            return (
              <div key={user._id} className="employee-card" onClick={() => fetchUserDetails(user._id)}>
                <div className="image-wrapper">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={`${user.name}'s profile`} className="employee-image" />
                  ) : (
                    <div className="employee-placeholder">
                      {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}

                  {/* Status Dot Overlay */}
                  {attendanceStatus === "checked in" && <span className="status-dot green" />}
                  {attendanceStatus !== "checked in" && <span className="status-dot red" />}
                </div>
                <h3>{user.name}</h3>
                <p className="urole">{user.role}</p>
              </div>
            );
          })}

        </div>

        {/* Employee Details Popup */}
        {selectedUser && (
          <div className="popup-overlay">
            <div className="popup-card">
              <button className="close-button" onClick={closePopup}>✖</button>
              {/* <img src={selectedUser.profileImage || "/default-profile.png"} alt="Profile" className="popup-image" /> */}
              <div className="PI">
                {selectedUser.profileImage ? (
                  <img src={selectedUser.profileImage} alt="Profile" className="popup-image" />
                ) : (
                  <div className="employee-placeholder">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3>{selectedUser.name}</h3>



              <p><strong>Employee ID:</strong> {selectedUser.empId}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <p><strong>Address:</strong> {selectedUser.address}</p>
              <p><strong>Blood Group:</strong> {selectedUser.BloodGroup}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Gender:</strong> {selectedUser.Gender}</p>
              {/* Display Assigned Tasks */}
              <h4>Assigned Tasks</h4>
              {selectedUser.tasks && selectedUser.tasks.length > 0 ? (
                <ul>
                  {selectedUser.tasks.map((task, index) => (
                    <li key={index}>
                      <strong>{task.projectTitle}</strong>
                      <span className={`task-status ${task.status.toLowerCase().replace(/ /g, '-')}`}>
                        {task.status === 'not-started' ? 'Not Started' :
                          task.status === 'in-progress' ? 'In Progress' :
                            task.status === 'completed-pending-approval' ? 'Pending Approval' :
                              task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No tasks assigned.</p>
              )}

              {/* Display Attendance Details */}
              {/* <h4>Attendance Details</h4> */}

              <div className="attend">
                <h4>Monthly Attendance Report</h4>
                <div className='monthyear1'>
                  <label>Select Month: </label>
                  <select value={selectedMonth} onChange={handleMonthChange}>
                    {getMonths().map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>

                  <label>Select Year: </label>
                  <select value={selectedYear} onChange={handleYearChange}>
                    {getYears().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: 'black', textAlign: 'left' }}>
                    Attendance Report ({getMonths()[selectedMonth].label} {selectedYear})
                  </h3>
                  <button onClick={handleDownload} title="Download CSV">
                    ⬇️
                  </button>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData
                      .filter(record => record.userId && record.userId.email === selectedUser.email)
                      .map((record, idx) => (
                        <tr key={idx}>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}</td>
                          <td>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</td>
                          <td>{record.status}</td>
                        </tr>
                      ))}
                  </tbody>

                </table>
              </div>
              <div className="attendance-details">
                <p><strong>Total Leaves:</strong> {selectedUser.attendance?.totalLeaves || 0}</p>
                <p><strong>Leaves Taken:</strong> {selectedUser.attendance?.leavesTaken || 0}</p>
                <p><strong>Leaves Remaining:</strong> {selectedUser.attendance?.leavesRemaining || 0}</p>

                {lopDays > 0 && (
                  <p className="lop-message">⚠️ LOP (Loss of Pay) Days: <strong>{lopDays}</strong></p>
                )}
              </div>

              {/* Display Leave History */}
              <h4>
                Leave History
                <button
                  className="download-btn12"
                  onClick={() => downloadLeaveHistory(selectedUser.email, "2024-04-01", "2025-03-31")}
                >
                  📥 Previous Year Leave Data
                </button>

              </h4>
              {selectedUser.attendance?.leaveHistory && selectedUser.attendance.leaveHistory.length > 0 ? (
                <div className="table-container">
                  <table className="data-table12">
                    <thead className="thead12">
                      <tr className="tr12">
                        <th className="th1234">Date</th>
                        <th className="th12">Type</th>
                        <th className="th123">Days</th>
                        <th className="th12">Status</th>
                      </tr>
                    </thead>
                    <tbody className="tbody12">
                      {selectedUser.attendance.leaveHistory.map((leave, index) => (
                        <tr key={index} className="tr12">
                          <td className="tb1234">{leave.date}</td>
                          <td className="tb12">{leave.type}</td>
                          <td className="tb123">{leave.days}</td>
                          <td className="tb12">
                            <span className={`status-badge ${leave.status === 'Approved'
                              ? 'approved'
                              : leave.status === 'Rejected'
                                ? 'rejected'
                                : 'pending'
                              }`}>
                              {leave.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No leave history available.</p>
              )}

              {/* Toggle Role Button */}
              {selectedUser.role === "employee" ? (
                <button className="button1" onClick={() => toggleRole(selectedUser._id)}>Act as Admin</button>
              ) : (
                <button className="button1" onClick={() => toggleRole(selectedUser._id)}>Act as Employee</button>
              )}

              <button onClick={() => deleteUser(selectedUser._id)} className="button1 btn-danger">
                Remove Employee
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;