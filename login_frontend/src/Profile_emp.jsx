import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaCamera, FaPlus, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import './Profile.css';
import './Admin.css';
import { Users } from 'lucide-react';
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa"; // Home icon
import { IoArrowBack } from "react-icons/io5"; // Back arrow
import { useNavigate } from "react-router-dom";



const backendURL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: backendURL,
});


const UserProfile = () => {
  // User state
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

  const navigate = useNavigate();
  const [showAttendance, setShowAttendance] = useState(false);
  const [showLeave, setShowLeave] = useState(false);

  const [attendance, setAttendance] = useState({
    totalLeaves: 35,
    leavesTaken: 0,
    leavesRemaining: 35,
    leaveHistory: []
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState({});
  const fileInputRef = useRef(null);

  // Task states
  const [tasks, setTasks] = useState([]);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    projectTitle: '',
    description: '',
    deadline: '',
    status: 'not-started',
    rationale: '',
    assignedTo: []
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // For admin approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [taskForApproval, setTaskForApproval] = useState(null);


  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

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

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found.");
          return;
        }

        const { fromDate, toDate } = getFinancialYearRange();

        // Decode the token to extract the user ID (assuming it's in 'id' field in the payload)
        const decodedToken = JSON.parse(atob(token.split('.')[1]));  // Decode JWT
        const userId = decodedToken.userId;  // Assuming 'id' is stored in the payload


        // Send userId to filter the attendance history for the logged-in user
        const res = await fetch(`${backendURL}/api/user/attendance/userhistory`, {
          method: "POST",  // Use POST to send the userId
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: userId,  // Filter by the logged-in user's ID
            fromDate,  // Example date range
            toDate,
          }),
        });

        const data = await res.json();
        console.log("Attendance History", data);
        setAttendanceData(data);  // Store the fetched data
      } catch (err) {
        console.error("Error fetching attendance history", err);
      }
    };


    fetchAttendanceHistory();
  }, []);


  const formatKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };




  const handleMonthChange = (event) => {
    setSelectedMonth(Number(event.target.value));
  };

  const handleYearChange = (event) => {
    setSelectedYear(Number(event.target.value));
  };

  const getMonthDateRange = (month, year) => {
    const fromDate = new Date(year, month, 1);
    const toDate = new Date(year, month + 1, 0); // last day of month
    return {
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0],
    };
  };
  
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const { fromDate, toDate } = getFinancialYearRange();

  //       const [attendanceRes, eventRes] = await Promise.all([
  //         axios.post(`${backendURL}/api/user/attendance/userhistory`, {
  //           userId: user._id,
  //           fromDate,
  //           toDate,
  //         }, {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem('token')}`,
  //           },
  //         }),
  //         axios.get(`${backendURL}/api/events`),
  //       ]);

  //       const eventsFromDB = {};
  //       eventRes.data.forEach((item) => {
  //         eventsFromDB[item.date] = item.events;
  //       });

  //       // Add Sundays
  //       const year = selectedDate.getFullYear();
  //       const month = selectedDate.getMonth();
  //       const date = new Date(year, month, 1);
  //       while (date.getMonth() === month) {
  //         if (date.getDay() === 0) {
  //           const key = formatKey(date);
  //           if (!eventsFromDB[key]) {
  //             eventsFromDB[key] = ['Holiday: Sunday'];
  //           } else if (!eventsFromDB[key].includes('Holiday: Sunday')) {
  //             eventsFromDB[key].push('Holiday: Sunday');
  //           }
  //         }
  //         date.setDate(date.getDate() + 1);
  //       }

  //       setEvents(eventsFromDB);
  //       setAttendanceData(attendanceRes.data);
  //     } catch (error) {
  //       console.error('Error fetching attendance or events:', error);
  //     }
  //   };

  //   fetchData();
  // }, [selectedDate]);

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
            userId: userId,
            fromDate,
            toDate,
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
          axios.get(`${backendURL}/api/events`)
        ]);
  
        // Populate events
        const eventsFromDB = {};
        eventRes.data.forEach((item) => {
          eventsFromDB[item.date] = item.events;
        });
  
        // Add Sundays as holidays
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
  
        // Update state
        setEvents(eventsFromDB);
        setAttendanceData(attendanceRes.data);
  
      } catch (error) {
        console.error('Error fetching attendance or events:', error);
      }
    };
  
    fetchData();
  }, [selectedMonth, selectedYear, user._id]);

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
  
        const record = attendanceData.find((rec) => {
          const recDate = new Date(rec.date);
          return recDate.toDateString() === date.toDateString();
        });
  
        if (record) {
          checkIn = record.checkIn;
          checkOut = record.checkOut;
          if (!checkOut) {
            status = 'Pending Checkout';  // Mark as present if checked in but not out
          } else {
            const hoursWorked = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
            if (hoursWorked >= 8) status = 'Full Day';
            else if (hoursWorked <8) status = 'Half Day';
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
  
  
  // Check if the selected month and year is in the future
  const isFutureMonth = new Date(selectedYear, selectedMonth) > new Date();


  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        // Fetch user profile data
        const response = await api.get('/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const userData = response.data;
        setIsAdmin(userData.role === 'admin');

        setUser({
          id: userData.id,
          name: userData.name || 'User',
          empId: userData.empId,
          email: userData.email,
          role: userData.role,
          phone: userData.phone || '',
          address: userData.address || '',
          BloodGroup: userData.BloodGroup || '',
          Designation: userData.Designation || '',
          profileImage: userData.profileImage || '',
          Gender: userData.Gender || ''
        });

        try {
          const leaveResponse = await api.get(`/leave-summary?email=${userData.email}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          // Save debug info
          setDebug({
            status: leaveResponse.status,
            statusText: leaveResponse.statusText,
            contentType: leaveResponse.headers?.['content-type'],
            dataType: typeof leaveResponse.data,
            data: leaveResponse.data
          });

          // Log the actual response to help diagnose
          console.log("Leave data received:", leaveResponse.data);

          if (leaveResponse.data) {
            // New structure with leave settings included
            const { totalLeaves, leavesRemaining, leavesTaken, leaveHistory } = leaveResponse.data;

            // Log the actual values
            console.log("Processed Leave Data:", { totalLeaves, leavesRemaining, leavesTaken, leaveHistory });

            setAttendance({
              totalLeaves,
              leavesTaken,
              leavesRemaining,
              leaveHistory: leaveHistory.map(leave => ({
                date: leave.date || "N/A",
                type: leave.type ? leave.type : "Other",  // Ensure type is not blank
                days: leave.days && leave.days > 0 ? leave.days : "N/A",  // Ensure days are not 0
                status: leave.status || "Pending"
              }))
            });

          } else if (leaveResponse.data && Array.isArray(leaveResponse.data)) {
            // Old structure with just an array of leave requests
            const leaves = leaveResponse.data;
            const approvedLeaves = leaves.filter(leave => leave.status === 'Approved');
            const totalLeaveDaysTaken = approvedLeaves.reduce((sum, leave) => sum + (leave.totalLeaveDays || 0), 0);

            setAttendance({
              totalLeaves: 35,
              leavesTaken: totalLeaveDaysTaken,
              leavesRemaining: 35 - totalLeaveDaysTaken,
              leaveHistory: leaves.map(leave => ({
                date: new Date(leave.timestamp).toISOString().split('T')[0],
                type: leave.leaveType,
                days: leave.totalLeaveDays || 0,
                status: leave.status
              }))
            });
          } else {
            console.warn('Leave data structure is unexpected:', leaveResponse.data);
            setAttendance({
              totalLeaves: 35,
              leavesTaken: 0,
              leavesRemaining: 35,
              leaveHistory: []
            });
          }
        } catch (leaveError) {
          console.error('Error fetching leave data:', leaveError);
          setDebug({
            errorMessage: leaveError.message,
            errorStack: leaveError.stack,
            errorResponse: leaveError.response?.data
          });

          setAttendance({
            totalLeaves: 35,
            leavesTaken: 0,
            leavesRemaining: 35,
            leaveHistory: []
          });
        }

        // If user is admin, fetch employees for task assignment
        if (userData.role === 'admin') {
          try {
            const employeesResponse = await api.get('/api/admin/employees', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            setEmployees(employeesResponse.data);
          } catch (err) {
            console.error('Error fetching employees:', err);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user profile');
        setDebug({
          errorMessage: error.message,
          errorStack: error.stack,
          errorResponse: error.response?.data
        });
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);


  const handleEditClick = () => {
    setIsEditing(true);
    setEditFormData({
      name: user.name,
      empId: user.empId,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      BloodGroup: user.BloodGroup || '',
      Designation: user.Designation || '',
      Gender: user.Gender || '',

    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Create a temporary URL for immediate preview
      const imageUrl = URL.createObjectURL(file);
      setUser({
        ...user,
        profileImage: imageUrl // Show temporary preview immediately
      });

      // Create form data for file upload
      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('token');

      // Upload image to server
      const response = await api.post('/api/user/profile/image', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update with the URL from the server
      setUser({
        ...user,
        profileImage: response.data.profileImage
      });

      console.log('Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setError('Failed to upload profile image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const response = await api.put('/api/user/profile', editFormData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser({
        ...user,
        name: editFormData.name,
        empId: editFormData.empId,
        email: editFormData.email,
        phone: editFormData.phone,
        address: editFormData.address,
        BloodGroup: editFormData.BloodGroup,
        Designation: editFormData.Designation,
        Gender: editFormData.Gender,

      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = `/api/tasks/assigned-to/${user.id}`; // Use the employee-specific endpoint

      const response = await api.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
    }
  };

  // Helper function to get status display name
  const getStatusDisplayName = (status) => {
    const statusMap = {
      'not-started': 'Not Yet Started',
      'started': 'Started',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'completed-pending-approval': 'Completed (Pending Approval)'
      // 'approved': 'Approved'
    };
    return statusMap[status] || status;
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    const colorMap = {
      'not-started': '#f87171', // red
      'started': '#fbbf24',     // amber
      'in-progress': '#60a5fa', // blue
      'completed': '#34d399',   // green
      'completed-pending-approval': '#8b5cf6', // purple
      'approved': '#10b981'     // emerald
    };
    return colorMap[status] || '#9ca3af'; // gray default
  };

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchTasks();
    }
  }, [activeTab, isAdmin]);

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData({
      ...taskFormData,
      [name]: value
    });
  };

  const handleAssigneeChange = (e) => {
    // Get the actual value attribute from each option element
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    console.log('Selected employee IDs:', selectedOptions);
    setTaskFormData({
      ...taskFormData,
      assignedTo: selectedOptions
    });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      // Create a clean copy of the task data
      const dataToSend = {
        ...taskFormData,
        // Make sure assignedTo only contains valid IDs
        assignedTo: taskFormData.assignedTo.filter(id =>
          // Basic check that it looks like a MongoDB ObjectId (24 character hex string)
          typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)
        )
      };

      const response = await api.post('/api/admin/tasks', dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Add new task to state
      setTasks([...tasks, response.data]);

      // Reset form
      setTaskFormData({
        projectTitle: '',
        description: '',
        deadline: '',
        status: 'not-started',
        rationale: '',
        assignedTo: []
      });
      setShowAddTaskForm(false);
    } catch (error) {
      console.error('Error adding task:', error);
      if (error.response) {
        console.error('Server error details:', error.response.data);
      }
      setError('Failed to add task');
    }
  };


  const handleEditTask = (task) => {
    console.log('Selected Task for Editing:', task); // Log selected task
    setEditingTaskId(task._id); // Ensure this is set correctly
    setTaskFormData({
      status: task.status || 'not-started',
      rationale: task.rationale || ''
    });

    setShowAddTaskForm(true);
    console.log('Editing Task ID set:', task._id);
  };


  const handleUpdateTask = async (e) => {
    e.preventDefault();

    console.log('Editing Task ID:', editingTaskId); // Debug log
    if (!editingTaskId) {
      console.error('Error: Editing Task ID is undefined');
      setError('Error: Task ID is missing.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = `/api/tasks/${editingTaskId}/update-status`;

      const dataToSend = {
        status: taskFormData.status === 'completed'
          ? 'completed-pending-approval'
          : taskFormData.status,
        rationale: taskFormData.rationale || ''
      };

      console.log('Data being sent:', dataToSend); // Debug log

      const response = await api.put(endpoint, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update task in state
      setTasks(tasks.map(task =>
        task._id === editingTaskId ? response.data : task
      ));

      setTaskFormData({ status: 'not-started', rationale: '' });
      setShowAddTaskForm(false);
      setEditingTaskId(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  const openApprovalModal = (task) => {
    setTaskForApproval(task);
    setShowApprovalModal(true);
  };
  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : "?";


  if (loading) {
    return <div style={{ textAlign: 'center', padding: '24px' }}>Loading user profile...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '24px', color: '#ef4444' }}>{error}</div>;
  }

  const lopDays = Math.max(0, (attendance?.leavesTaken || 0) - (attendance?.totalLeaves || 0));


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
    <div className="profile-wrapper" style={{ minHeight: '100vh', minWidth: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="logo12">
        <Link to="/employee">
          <img src="/Images/Logo.png" alt="Armtronix Iot Pvt. Ltd." />
        </Link>
      </div>
      <div className="profile-container" style={{ maxWidth: '80vw', minWidth: '80vw' }}>
        <div className="profile-layout">
          {/* Left sidebar */}
          <div className="profile-sidebar">
            <div className="user-avatar-container">
              <div className="user-avatar" onClick={handleProfilePictureClick} style={{ cursor: 'pointer' }}>
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} />
                ) : (
                  <div className="user-avatar-text">
                    {/* {user.name.charAt(0)} */}
                    {getInitial(user.name)}

                  </div>
                )}
              </div>

              {/* Hidden file input for profile picture */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />

              <h1 className="user-name">{user.name}</h1>
              <p className="user-role">{user.role}</p>

              <div>
                <button
                  className="edit-button"
                  onClick={handleProfilePictureClick}
                  title="Upload profile picture"
                >
                  <FaCamera />
                </button>
              </div>
            </div>

            <div className="sidebar-nav">
              <button
                className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              <button
                className={`nav-button ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                Tasks
              </button>
              <button
                className={`nav-button ${activeTab === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveTab('calendar')}
              >
                Attendence
              </button>




            </div>
            <button
              onClick={() => navigate("/employee")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                backgroundColor: "unset",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                marginTop: "10px",

              }}
            >
              <IoArrowBack size={20} />

              {/* <FaHome size={20} /> */}
              <span>Back to Home</span>

            </button>
          </div>

          {/* Main content */}
          <div className="profile-content">
            {activeTab === 'profile' && !isEditing && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 className="section-title">User Information</h2>
                  <button
                    onClick={handleEditClick}
                    className="secondary-button"
                  >
                    <FaEdit />
                    Edit Profile
                  </button>
                </div>

                <div className="info-grid">
                  <div className="info-item">
                    <p className="info-label">Name</p>
                    <p className="info-value">{user.name}</p>
                  </div>
                  <div className="info-item">
                    <p className="info-label">Employee ID</p>
                    <p className="info-value">{user.empId}</p>
                  </div>
                  <div className="info-item">
                    <p className="info-label">Email</p>
                    <p className="info-value">{user.email}</p>
                  </div>
                  <div className="info-item">
                    <p className="info-label">Phone</p>
                    <p className="info-value">{user.phone || 'Not provided'}</p>
                  </div>
                  <div className="info-item">
                    <p className="info-label">Address</p>
                    <p className="info-value">{user.address || 'Not provided'}</p>
                  </div>
                  <div className="info-item">
                    <p className="info-label">Blood Group</p>
                    <p className="info-value">{user.BloodGroup || 'Not provided'}</p>
                  </div>
                  <div className="info-item">
                    <p className="info-label">Designation</p>
                    <p className="info-value">{user.Designation || 'Not provided'}</p>
                  </div>
                  <div className="info-item">
                    <p className="info-label">Role</p>
                    <p className="info-value" style={{ textTransform: 'capitalize' }}>{user.role}</p>
                  </div>
                  <div className="info-item">
                    <p className="info-label">Gender</p>
                    <p className="info-value">{user.Gender || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && isEditing && (
              <div>
                <h2 className="section-title">Edit Profile</h2>
                <form className="edit-form" onSubmit={handleSubmit}>
                  <div className="info-grid">
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Employee ID</label>
                      <input
                        type="number"
                        name="empId"
                        value={editFormData.empId}
                        onChange={handleInputChange}
                        className="form-input"
                        disabled
                      />
                      <p className="form-hint">Employee ID cannot be changed</p>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleInputChange}
                        className="form-input"
                        disabled
                      />
                      <p className="form-hint">Email cannot be changed</p>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={editFormData.address}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Blood Group</label>
                      <input
                        type="text"
                        name="BloodGroup"
                        value={editFormData.BloodGroup}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Designation</label>
                      <input
                        type="text"
                        name="Designation"
                        value={editFormData.Designation}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select
                        name="Gender"
                        value={editFormData.Gender}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="button-group">
                    <button
                      type="submit"
                      className="primary-button"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="secondary-button"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div>
                <h2 className="section-title">Attendance & Leave Tracking</h2>



                <div className="stats-grid">
                  <div className="stat-card blue">
                    <h3 className="stat-title">Total Leaves</h3>
                    <p className="stat-value">{attendance.totalLeaves}</p>
                  </div>
                  <div className="stat-card green">
                    <h3 className="stat-title">Leaves Remaining</h3>
                    <p className="stat-value">{attendance.leavesRemaining}</p>
                  </div>
                  <div className="stat-card red">
                    <h3 className="stat-title">Leaves Taken</h3>
                    <p className="stat-value">{attendance.leavesTaken}</p>
                  </div>
                </div>

                <div className='LOP'>
                  {lopDays > 0 && (
                    <p >⚠️ LOP (Loss of Pay) Days: <span className="lop-message"> {lopDays}</span></p>
                  )}
                </div>

                <div>
                  {/* Attendance History */}
                  <h3
                    className="section-subtitle dropdown-header"
                    onClick={() => setShowAttendance(!showAttendance)}
                    style={{ cursor: "pointer" }}
                    data-arrow={showAttendance ? "▲" : "▼"}
                  >
                    Attendance History
                  </h3>
                  <div className={`dropdown-content ${showAttendance ? "open" : ""}`}>
                    <div className='monthyear'>
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                      <h3 style={{ margin: 0 }}>
                        Monthly Attendance Report ({getMonths()[selectedMonth].label} {selectedYear})
                      </h3>
                      <button onClick={handleDownload} title="Download CSV">
                        ⬇️
                      </button>
                    </div>

                    {isFutureMonth ? (
                      <p>No data available for the future month.</p>
                    ) : (
                      <div className="table-wrapper">
                        <table className="styled-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Check-In</th>
                              <th>Check-Out</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthlyReport.map((entry, idx) => (
                              <tr key={idx}>
                                <td>{entry.date}</td>
                                <td>{entry.checkIn ? new Date(entry.checkIn).toLocaleTimeString() : '-'}</td>
                                <td>{entry.checkOut ? new Date(entry.checkOut).toLocaleTimeString() : '-'}</td>
                                <td>{entry.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Leave History */}
                  <h3
                    className="section-subtitle dropdown-header"
                    onClick={() => setShowLeave(!showLeave)}
                    style={{ cursor: "pointer" }}
                    data-arrow={showLeave ? "▲" : "▼"}
                  >
                    Leave History
                  </h3>
                  <div className={`dropdown-content ${showLeave ? "open" : ""}`}>
                    {attendance.leaveHistory.length > 0 ? (
                      <div className="table-wrapper">
                        <table className="styled-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Type</th>
                              <th>Leave Days</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendance.leaveHistory.map((leave, index) => (
                              <tr key={index}>
                                <td>{leave.date || "N/A"}</td>
                                <td>{leave.type}</td>
                                <td>{leave.days}</td>
                                <td>
                                  <span className={`status-badge ${leave.status === "Approved" ? "approved"
                                      : leave.status === "Rejected" ? "rejected"
                                        : "pending"
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
                      <p className="empty-message">No leave history available.</p>
                    )}
                  </div>

                </div>

              </div>
            )}

            {activeTab === 'tasks' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 className="section-title">Tasks</h2>
                </div>

                {/* Employee Task List */}
                {tasks.length > 0 ? (
                  <div className="tasks-grid">
                    {tasks
                      .filter(task =>
                        task.assignedTo.some(assignee => assignee._id === user.id)
                      )
                      .map(task => (
                        <div key={task._id} className="task-card">
                          <div className="task-header">
                            <h3 className="task-title">{task.projectTitle}</h3>
                            <div className="task-actions">
                              {/* Allow employees to update task status */}
                              <button
                                onClick={() => handleEditTask(task)}
                                className="icon-button"
                                title="Update Status"
                              >
                                <FaEdit />
                              </button>
                            </div>
                          </div>

                          <p className="task-description">{task.description}</p>

                          {task.rationale && (
                            <div className="task-rationale">
                              <strong>Rationale:</strong> {task.rationale}
                            </div>
                          )}

                          <div className="task-details">
                            <div className="task-deadline">
                              <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
                            </div>

                            <div className="task-status">
                              <span
                                className="status-badge"
                                style={{
                                  backgroundColor: getStatusColor(task.status),
                                  color: 'white',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  display: 'inline-block'
                                }}
                              >
                                {getStatusDisplayName(task.status)}
                              </span>
                            </div>
                          </div>

                          {/* Update Status Form (for employees) */}
                          {editingTaskId === task._id && (
                            <div className="form-container">
                              <h3>Update Task Status</h3>
                              <form onSubmit={handleUpdateTask}>
                                <div className="form-group">
                                  <label className="form-label">Status</label>
                                  <select
                                    name="status"
                                    value={taskFormData.status}
                                    onChange={handleTaskInputChange}
                                    className="form-input"
                                    required
                                  >
                                    <option value="not-started">Not Yet Started</option>
                                    <option value="started">Started</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                </div>

                                <div className="form-group">
                                  <label className="form-label">Rationale</label>
                                  <textarea
                                    name="rationale"
                                    value={taskFormData.rationale}
                                    onChange={handleTaskInputChange}
                                    className="form-input"
                                    rows="2"
                                    placeholder="Explain your progress ..."
                                  />
                                </div>

                                <div className="button-group">
                                  <button type="submit" className="primary-button">
                                    Update Task
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingTaskId(null)}
                                    className="secondary-button"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="empty-message">
                    <p>No tasks assigned to you.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
