// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { FaEdit, FaCamera } from 'react-icons/fa';
// import './Profile.css';
// import './Admin.css';
// import { FaPlus, FaTrash } from 'react-icons/fa';

// const api = axios.create({
//   baseURL: 'http://localhost:5002',
// });

// const UserProfile = () => {

//   const [user, setUser] = useState({
//     name: '',
//     email: '',
//     role: '',
//     phone: '',
//     address: '',
//     profileImage: '',
//     BloodGroup: ''
//   });

//   const [attendance, setAttendance] = useState({
//     totalLeaves: 10,
//     leavesTaken: 0,
//     leavesRemaining: 10,
//     leaveHistory: []
//   });

//   const [activeTab, setActiveTab] = useState('profile');
//   const [isEditing, setIsEditing] = useState(false);
//   const [editFormData, setEditFormData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [debug, setDebug] = useState({});
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     const token = localStorage.getItem('token');

//     if (!token) {
//       setError('Authentication required');
//       setLoading(false);
//       return;
//     }

//     const fetchUserProfile = async () => {
//       try {
//         // Fetch user profile data
//         const response = await api.get('/api/user/profile', {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });

//         setUser({
//           ...user,
//           id: response.data.id,
//           name: response.data.name || 'User',
//           email: response.data.email,
//           role: response.data.role,
//           phone: response.data.phone || '',
//           address: response.data.address || '',
//           BloodGroup: response.data.BloodGroup || '',
//           profileImage: response.data.profileImage || ''
//         });

//         // Fetch leave requests
//         try {
//           const leaveResponse = await api.get('/api/leave/employee', {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           });

//           // Save debug info
//           setDebug({
//             status: leaveResponse.status,
//             statusText: leaveResponse.statusText,
//             contentType: leaveResponse.headers?.['content-type'],
//             dataType: typeof leaveResponse.data,
//             data: leaveResponse.data
//           });

//           // Check if it's actually an array
//           if (leaveResponse.data && Array.isArray(leaveResponse.data)) {
//             const leaves = leaveResponse.data;
//             const approvedLeaves = leaves.filter(leave => leave.status === 'Approved');

//             setAttendance({
//               totalLeaves: 10,
//               leavesTaken: approvedLeaves.length,
//               leavesRemaining: 10 - approvedLeaves.length,
//               leaveHistory: leaves.map(leave => ({
//                 date: new Date(leave.timestamp).toISOString().split('T')[0],
//                 type: leave.subject,
//                 status: leave.status
//               }))
//             });
//           } else {
//             // If not an array, use default values
//             console.warn('Leave data is not an array:', leaveResponse.data);
//             setAttendance({
//               totalLeaves: 10,
//               leavesTaken: 0,
//               leavesRemaining: 10,
//               leaveHistory: []
//             });
//           }
//         } catch (leaveError) {
//           console.error('Error fetching leave data:', leaveError);
//           // Save debug info for the error
//           setDebug({
//             errorMessage: leaveError.message,
//             errorStack: leaveError.stack,
//             errorResponse: leaveError.response?.data
//           });

//           // Continue with default values for attendance
//           setAttendance({
//             totalLeaves: 10,
//             leavesTaken: 0,
//             leavesRemaining: 10,
//             leaveHistory: []
//           });
//         }

//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//         setError('Failed to load user profile');
//         setDebug({
//           errorMessage: error.message,
//           errorStack: error.stack,
//           errorResponse: error.response?.data
//         });
//         setLoading(false);
//       }
//     };

//     fetchUserProfile();
//   }, []);

//   const handleEditClick = () => {
//     setIsEditing(true);
//     setEditFormData({
//       name: user.name,
//       email: user.email,
//       phone: user.phone || '',
//       address: user.address || '',
//       BloodGroup: user.BloodGroup || '',
//     });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData({
//       ...editFormData,
//       [name]: value
//     });
//   };

//   const handleProfilePictureClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       // Create a temporary URL for immediate preview
//       const imageUrl = URL.createObjectURL(file);
//       setUser({
//         ...user,
//         profileImage: imageUrl // Show temporary preview immediately
//       });

//       // Create form data for file upload
//       const formData = new FormData();
//       formData.append('profileImage', file);

//       const token = localStorage.getItem('token');

//       // Upload image to server
//       const response = await api.post('/api/user/profile/image', formData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       // Update with the URL from the server
//       setUser({
//         ...user,
//         profileImage: response.data.profileImage
//       });

//       console.log('Profile image updated successfully');
//     } catch (error) {
//       console.error('Error uploading profile image:', error);
//       setError('Failed to upload profile image');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem('token');

//       // Here you would typically send the updated data to the server
//       // Example (commented out):

//       const response = await api.put('/api/user/profile', editFormData, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       setUser({
//         ...user,
//         name: editFormData.name,
//         email: editFormData.email,
//         phone: editFormData.phone,
//         address: editFormData.address,
//         BloodGroup: editFormData.BloodGroup,
//       });

//       setIsEditing(false);
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       setError('Failed to update profile');
//     }
//   };


//   // Add this new state to your existing state variables
//   const [tasks, setTasks] = useState([]);
//   const [showAddTaskForm, setShowAddTaskForm] = useState(false);
//   const [taskFormData, setTaskFormData] = useState({
//     projectTitle: '',
//     description: '',
//     deadline: '',
//     completedPercentage: 0
//   });
//   const [editingTaskId, setEditingTaskId] = useState(null);

//   // Add this function to fetch tasks
//   const fetchTasks = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await api.get('/api/tasks', {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       setTasks(response.data);
//     } catch (error) {
//       console.error('Error fetching tasks:', error);
//       setError('Failed to load tasks');
//     }
//   };

//   // Add this to your useEffect to fetch tasks when the tasks tab is selected
//   useEffect(() => {
//     if (activeTab === 'tasks') {
//       fetchTasks();
//     }
//   }, [activeTab]);

//   // Add these handler functions
//   const handleTaskInputChange = (e) => {
//     const { name, value } = e.target;
//     setTaskFormData({
//       ...taskFormData,
//       [name]: value
//     });
//   };

//   const handleAddTask = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem('token');
//       const response = await api.post('/api/tasks', taskFormData, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       // Add new task to state
//       setTasks([...tasks, response.data.task]);

//       // Reset form
//       setTaskFormData({
//         projectTitle: '',
//         description: '',
//         deadline: '',
//         completedPercentage: 0
//       });
//       setShowAddTaskForm(false);
//     } catch (error) {
//       console.error('Error adding task:', error);
//       setError('Failed to add task');
//     }
//   };

//   const handleEditTask = (task) => {
//     setTaskFormData({
//       projectTitle: task.projectTitle,
//       description: task.description,
//       deadline: new Date(task.deadline).toISOString().split('T')[0],
//       completedPercentage: task.completedPercentage
//     });
//     setEditingTaskId(task.id);
//     setShowAddTaskForm(true);
//   };

//   const handleUpdateTask = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem('token');
//       const response = await api.put(`/api/tasks/${editingTaskId}`, taskFormData, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       // Update task in state
//       setTasks(tasks.map(task =>
//         task.id === editingTaskId ? response.data : task
//       ));

//       // Reset form
//       setTaskFormData({
//         projectTitle: '',
//         description: '',
//         deadline: '',
//         completedPercentage: 0
//       });
//       setShowAddTaskForm(false);
//       setEditingTaskId(null);
//     } catch (error) {
//       console.error('Error updating task:', error);
//       setError('Failed to update task');
//     }
//   };

//   const handleDeleteTask = async (taskId) => {
//     if (!window.confirm('Are you sure you want to delete this task?')) {
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       await api.delete(`/api/tasks/${taskId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       // Remove task from state
//       setTasks(tasks.filter(task => task.id !== taskId));
//     } catch (error) {
//       console.error('Error deleting task:', error);
//       setError('Failed to delete task');
//     }
//   };

//   if (loading) {
//     return <div style={{ textAlign: 'center', padding: '24px' }}>Loading user profile...</div>;
//   }

//   if (error) {
//     return <div style={{ textAlign: 'center', padding: '24px', color: '#ef4444' }}>{error}</div>;
//   }



//   return (
//     <div className="profile-wrapper" style={{ minHeight: '100vh', minWidth: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//       <div className="profile-container" style={{ maxWidth: '80vw', minWidth: '80vw' }}>
//         <div className="profile-layout">
//           {/* Left sidebar */}
//           <div className="profile-sidebar">
//             <div className="user-avatar-container">
//               <div className="user-avatar" onClick={handleProfilePictureClick} style={{ cursor: 'pointer' }}>
//                 {user.profileImage ? (
//                   <img src={user.profileImage} alt={user.name} />
//                 ) : (
//                   <div className="user-avatar-text">
//                     {user.name.charAt(0)}
//                   </div>
//                 )}
//               </div>

//               {/* Hidden file input for profile picture */}
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 accept="image/*"
//                 onChange={handleFileChange}
//               />

//               <h1 className="user-name">{user.name}</h1>
//               <p className="user-role">{user.role}</p>

//               <div>
//                 <button
//                   className="edit-button"
//                   onClick={handleProfilePictureClick}
//                   title="Upload profile picture"
//                 >
//                   <FaCamera />
//                 </button>
//               </div>
//             </div>

//             <div className="sidebar-nav">
//               <button
//                 className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('profile')}
//               >
//                 Profile
//               </button>
//               <button
//                 className={`nav-button ${activeTab === 'tasks' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('tasks')}
//               >
//                 Tasks
//               </button>
//               <button
//                 className={`nav-button ${activeTab === 'calendar' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('calendar')}
//               >
//                 Attendence
//               </button>
//               <button
//                 className={`nav-button ${activeTab === 'files' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('files')}
//               >
//                 Files
//               </button>
//             </div>
//           </div>

//           {/* Main content */}
//           <div className="profile-content">
//             {activeTab === 'profile' && !isEditing && (
//               <div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//                   <h2 className="section-title">User Information</h2>
//                   <button
//                     onClick={handleEditClick}
//                     className="secondary-button"
//                   >
//                     <FaEdit />
//                     Edit Profile
//                   </button>
//                 </div>

//                 <div className="info-grid">
//                   <div className="info-item">
//                     <p className="info-label">Name</p>
//                     <p className="info-value">{user.name}</p>
//                   </div>
//                   <div className="info-item">
//                     <p className="info-label">Email</p>
//                     <p className="info-value">{user.email}</p>
//                   </div>
//                   <div className="info-item">
//                     <p className="info-label">Phone</p>
//                     <p className="info-value">{user.phone || 'Not provided'}</p>
//                   </div>
//                   <div className="info-item">
//                     <p className="info-label">Address</p>
//                     <p className="info-value">{user.address || 'Not provided'}</p>
//                   </div>
//                   <div className="info-item">
//                     <p className="info-label">Blood Group</p>
//                     <p className="info-value">{user.BloodGroup || 'Not provided'}</p>
//                   </div>
//                   <div className="info-item">
//                     <p className="info-label">Role</p>
//                     <p className="info-value" style={{ textTransform: 'capitalize' }}>{user.role}</p>
//                   </div>
//                 </div>

//                 {/* {process.env.NODE_ENV === 'development' && renderDebugPanel()} */}
//               </div>
//             )}

//             {activeTab === 'profile' && isEditing && (
//               <div>
//                 <h2 className="section-title">Edit Profile</h2>
//                 <form className="edit-form" onSubmit={handleSubmit}>
//                   <div className="info-grid">
//                     <div className="form-group">
//                       <label className="form-label">Name</label>
//                       <input
//                         type="text"
//                         name="name"
//                         value={editFormData.name}
//                         onChange={handleInputChange}
//                         className="form-input"
//                       />
//                     </div>
//                     <div className="form-group">
//                       <label className="form-label">Email</label>
//                       <input
//                         type="email"
//                         name="email"
//                         value={editFormData.email}
//                         onChange={handleInputChange}
//                         className="form-input"
//                         disabled
//                       />
//                       <p className="form-hint">Email cannot be changed</p>
//                     </div>
//                     <div className="form-group">
//                       <label className="form-label">Phone</label>
//                       <input
//                         type="text"
//                         name="phone"
//                         value={editFormData.phone}
//                         onChange={handleInputChange}
//                         className="form-input"
//                       />
//                     </div>
//                     <div className="form-group">
//                       <label className="form-label">Address</label>
//                       <input
//                         type="text"
//                         name="address"
//                         value={editFormData.address}
//                         onChange={handleInputChange}
//                         className="form-input"
//                       />
//                     </div>
//                     <div className="form-group">
//                       <label className="form-label">Blood Group</label>
//                       <input
//                         type="text"
//                         name="BloodGroup"
//                         value={editFormData.BloodGroup}
//                         onChange={handleInputChange}
//                         className="form-input"
//                       />
//                     </div>
//                   </div>

//                   <div className="button-group">
//                     <button
//                       type="submit"
//                       className="primary-button"
//                     >
//                       Save Changes
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setIsEditing(false)}
//                       className="secondary-button"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             )}

//             {activeTab === 'calendar' && (
//               <div>
//                 <h2 className="section-title">Attendance & Leave Tracking</h2>

//                 <div className="stats-grid">
//                   <div className="stat-card blue">
//                     <h3 className="stat-title">Total Leaves</h3>
//                     <p className="stat-value">{attendance.totalLeaves}</p>
//                   </div>
//                   <div className="stat-card green">
//                     <h3 className="stat-title">Leaves Remaining</h3>
//                     <p className="stat-value">{attendance.leavesRemaining}</p>
//                   </div>
//                   <div className="stat-card red">
//                     <h3 className="stat-title">Leaves Taken</h3>
//                     <p className="stat-value">{attendance.leavesTaken}</p>
//                   </div>
//                 </div>

//                 <h3 className="section-subtitle">Leave History</h3>
//                 {attendance.leaveHistory.length > 0 ? (
//                   <div className="table-container">
//                     <table className="data-table">
//                       <thead className="table-header">
//                         <tr>
//                           <th>Date</th>
//                           <th>Type</th>
//                           <th>Status</th>
//                         </tr>
//                       </thead>
//                       <tbody className="table-body">
//                         {attendance.leaveHistory.map((leave, index) => (
//                           <tr key={index}>
//                             <td>{leave.date}</td>
//                             <td>{leave.type}</td>
//                             <td>
//                               <span className={`status-badge ${leave.status === 'Approved'
//                                   ? 'approved'
//                                   : leave.status === 'Rejected'
//                                     ? 'rejected'
//                                     : 'pending'
//                                 }`}>
//                                 {leave.status}
//                               </span>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <div>
//                     <p className="empty-message">No leave history available.</p>
//                     {/* {process.env.NODE_ENV === 'development' && renderDebugPanel()} */}
//                   </div>
//                 )}
//               </div>
//             )}


//             {activeTab === 'tasks' && (
//               <div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//                   <h2 className="section-title">Tasks</h2>
//                   <button
//                     onClick={() => {
//                       setTaskFormData({
//                         projectTitle: '',
//                         description: '',
//                         deadline: '',
//                         completedPercentage: 0
//                       });
//                       setEditingTaskId(null);
//                       setShowAddTaskForm(!showAddTaskForm);
//                     }}
//                     // className={showAddTaskForm ? "secondary-button" : "primary-button"}
//                     className="secondary-button" 
//                     >
//                     {showAddTaskForm ? 'Cancel' : <><FaPlus /> Add Task</>}
//                   </button>
//                 </div>

//                 {showAddTaskForm && (
//                   <div className="form-container">
//                     <h3>{editingTaskId ? 'Edit Task' : 'Add New Task'}</h3>
//                     <form onSubmit={editingTaskId ? handleUpdateTask : handleAddTask}>
//                       <div className="form-group">
//                         <label className="form-label">Project Title</label>
//                         <input
//                           type="text"
//                           name="projectTitle"
//                           value={taskFormData.projectTitle}
//                           onChange={handleTaskInputChange}
//                           className="form-input"
//                           required
//                         />
//                       </div>

//                       <div className="form-group">
//                         <label className="form-label">Description</label>
//                         <textarea
//                           name="description"
//                           value={taskFormData.description}
//                           onChange={handleTaskInputChange}
//                           className="form-input"
//                           rows="3"
//                           required
//                         />
//                       </div>

//                       <div className="form-group">
//                         <label className="form-label">Deadline</label>
//                         <input
//                           type="date"
//                           name="deadline"
//                           value={taskFormData.deadline}
//                           onChange={handleTaskInputChange}
//                           className="form-input"
//                           required
//                         />
//                       </div>

//                       <div className="form-group">
//                         <label className="form-label">
//                           Completed: {taskFormData.completedPercentage}%
//                         </label>
//                         <input
//                           type="range"
//                           name="completedPercentage"
//                           value={taskFormData.completedPercentage}
//                           onChange={handleTaskInputChange}
//                           min="0"
//                           max="100"
//                           step="5"
//                           className="form-input"
//                         />
//                       </div>

//                       <div className="button-group">
//                         <button type="submit" className="primary-button">
//                           {editingTaskId ? 'Update Task' : 'Create Task'}
//                         </button>
//                       </div>
//                     </form>
//                   </div>
//                 )}

//                 {tasks.length > 0 ? (
//                   <div className="tasks-grid">
//                     {tasks.map(task => (
//                       <div key={task.id} className="task-card">
//                         <div className="task-header">
//                           <h3 className="task-title">{task.projectTitle}</h3>
//                           <div className="task-actions">
//                             <button
//                               onClick={() => handleEditTask(task)}
//                               className="icon-button"
//                               title="Edit Task"
//                             >
//                               <FaEdit />
//                             </button>
//                             <button
//                               onClick={() => handleDeleteTask(task.id)}
//                               className="icon-button delete"
//                               title="Delete Task"
//                             >
//                               <FaTrash />
//                             </button>
//                           </div>
//                         </div>

//                         <p className="task-description">{task.description}</p>

//                         <div className="task-details">
//                           <div className="task-deadline">
//                             <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
//                           </div>

//                           <div className="task-progress">
//                             <div className="progress-label">
//                               <span>Progress: {task.completedPercentage}%</span>
//                               <span>Remaining: {task.remainingPercentage}%</span>
//                             </div>
//                             <div className="progress-bar">
//                               <div
//                                 className="progress-fill"
//                                 style={{ width: `${task.completedPercentage}%` }}
//                               ></div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="empty-message">
//                     <p>No tasks found. Click 'Add Task' to create your first task.</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'files' && (
//               <div>
//                 <h2 className="section-title">Files</h2>
//                 <p className="empty-message">File management functionality will be displayed here.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProfile;



// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { FaEdit, FaCamera } from 'react-icons/fa';
// import './Profile.css';
// import './Admin.css';
// import { FaPlus, FaTrash } from 'react-icons/fa';

// const api = axios.create({
//   baseURL: 'http://localhost:5002',
// });

// const UserProfile = () => {
//   // All other state variables remain the same
//   const [user, setUser] = useState({
//     name: '',
//     email: '',
//     role: '',
//     phone: '',
//     address: '',
//     profileImage: '',
//     BloodGroup: ''
//   });

//   const [attendance, setAttendance] = useState({
//     totalLeaves: 10,
//     leavesTaken: 0,
//     leavesRemaining: 10,
//     leaveHistory: []
//   });

//   const [activeTab, setActiveTab] = useState('profile');
//   const [isEditing, setIsEditing] = useState(false);
//   const [editFormData, setEditFormData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [debug, setDebug] = useState({});
//   const fileInputRef = useRef(null);

//   // Modified task state to include status and rationale
//   const [tasks, setTasks] = useState([]);
//   const [showAddTaskForm, setShowAddTaskForm] = useState(false);
//   const [taskFormData, setTaskFormData] = useState({
//     projectTitle: '',
//     description: '',
//     deadline: '',
//     status: 'not-started', // New status field instead of completedPercentage
//     rationale: '' // New rationale field
//   });
//   const [editingTaskId, setEditingTaskId] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem('token');

//     if (!token) {
//       setError('Authentication required');
//       setLoading(false);
//       return;
//     }

//     const fetchUserProfile = async () => {
//       try {
//         // Fetch user profile data
//         const response = await api.get('/api/user/profile', {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });

//         setUser({
//           ...user,
//           id: response.data.id,
//           name: response.data.name || 'User',
//           email: response.data.email,
//           role: response.data.role,
//           phone: response.data.phone || '',
//           address: response.data.address || '',
//           BloodGroup: response.data.BloodGroup || '',
//           profileImage: response.data.profileImage || ''
//         });

//         // Fetch leave requests
//         try {
//           const leaveResponse = await api.get('/api/leave/employee', {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           });

//           // Save debug info
//           setDebug({
//             status: leaveResponse.status,
//             statusText: leaveResponse.statusText,
//             contentType: leaveResponse.headers?.['content-type'],
//             dataType: typeof leaveResponse.data,
//             data: leaveResponse.data
//           });

//           // Check if it's actually an array
//           if (leaveResponse.data && Array.isArray(leaveResponse.data)) {
//             const leaves = leaveResponse.data;
//             const approvedLeaves = leaves.filter(leave => leave.status === 'Approved');

//             setAttendance({
//               totalLeaves: 10,
//               leavesTaken: approvedLeaves.length,
//               leavesRemaining: 10 - approvedLeaves.length,
//               leaveHistory: leaves.map(leave => ({
//                 date: new Date(leave.timestamp).toISOString().split('T')[0],
//                 type: leave.subject,
//                 status: leave.status
//               }))
//             });
//           } else {
//             // If not an array, use default values
//             console.warn('Leave data is not an array:', leaveResponse.data);
//             setAttendance({
//               totalLeaves: 10,
//               leavesTaken: 0,
//               leavesRemaining: 10,
//               leaveHistory: []
//             });
//           }
//         } catch (leaveError) {
//           console.error('Error fetching leave data:', leaveError);
//           // Save debug info for the error
//           setDebug({
//             errorMessage: leaveError.message,
//             errorStack: leaveError.stack,
//             errorResponse: leaveError.response?.data
//           });

//           // Continue with default values for attendance
//           setAttendance({
//             totalLeaves: 10,
//             leavesTaken: 0,
//             leavesRemaining: 10,
//             leaveHistory: []
//           });
//         }

//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//         setError('Failed to load user profile');
//         setDebug({
//           errorMessage: error.message,
//           errorStack: error.stack,
//           errorResponse: error.response?.data
//         });
//         setLoading(false);
//       }
//     };

//     fetchUserProfile();
//   }, []);

//   const handleEditClick = () => {
//     setIsEditing(true);
//     setEditFormData({
//       name: user.name,
//       email: user.email,
//       phone: user.phone || '',
//       address: user.address || '',
//       BloodGroup: user.BloodGroup || '',
//     });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData({
//       ...editFormData,
//       [name]: value
//     });
//   };

//   const handleProfilePictureClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       // Create a temporary URL for immediate preview
//       const imageUrl = URL.createObjectURL(file);
//       setUser({
//         ...user,
//         profileImage: imageUrl // Show temporary preview immediately
//       });

//       // Create form data for file upload
//       const formData = new FormData();
//       formData.append('profileImage', file);

//       const token = localStorage.getItem('token');

//       // Upload image to server
//       const response = await api.post('/api/user/profile/image', formData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       // Update with the URL from the server
//       setUser({
//         ...user,
//         profileImage: response.data.profileImage
//       });

//       console.log('Profile image updated successfully');
//     } catch (error) {
//       console.error('Error uploading profile image:', error);
//       setError('Failed to upload profile image');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem('token');

//       const response = await api.put('/api/user/profile', editFormData, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       setUser({
//         ...user,
//         name: editFormData.name,
//         email: editFormData.email,
//         phone: editFormData.phone,
//         address: editFormData.address,
//         BloodGroup: editFormData.BloodGroup,
//       });

//       setIsEditing(false);
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       setError('Failed to update profile');
//     }
//   };

//   // Task management functions
//   const fetchTasks = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await api.get('/api/tasks', {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       // Convert completedPercentage to status if the API still returns the old format
//       const formattedTasks = response.data.map(task => {
//         // Map the task to include status and rationale if they don't exist
//         return {
//           ...task,
//           status: task.status || mapPercentageToStatus(task.completedPercentage),
//           rationale: task.rationale || ''
//         };
//       });

//       setTasks(formattedTasks);
//     } catch (error) {
//       console.error('Error fetching tasks:', error);
//       setError('Failed to load tasks');
//     }
//   };

//   // Helper function to map completedPercentage to status
//   const mapPercentageToStatus = (percentage) => {
//     if (percentage === 0) return 'not-started';
//     if (percentage < 50) return 'started';
//     if (percentage < 100) return 'in-progress';
//     return 'completed';
//   };

//   // Helper function to get status display name
//   const getStatusDisplayName = (status) => {
//     const statusMap = {
//       'not-started': 'Not Yet Started',
//       'started': 'Started',
//       'in-progress': 'In Progress',
//       'completed': 'Completed'
//     };
//     return statusMap[status] || status;
//   };

//   // Helper function to get status color
//   const getStatusColor = (status) => {
//     const colorMap = {
//       'not-started': '#f87171', // red
//       'started': '#fbbf24',     // amber
//       'in-progress': '#60a5fa', // blue
//       'completed': '#34d399'    // green
//     };
//     return colorMap[status] || '#9ca3af'; // gray default
//   };

//   useEffect(() => {
//     if (activeTab === 'tasks') {
//       fetchTasks();
//     }
//   }, [activeTab]);

//   const handleTaskInputChange = (e) => {
//     const { name, value } = e.target;
//     setTaskFormData({
//       ...taskFormData,
//       [name]: value
//     });
//   };

//   const handleAddTask = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem('token');
//       const response = await api.post('/api/tasks', taskFormData, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       // Add new task to state
//       setTasks([...tasks, response.data.task || response.data]);

//       // Reset form
//       setTaskFormData({
//         projectTitle: '',
//         description: '',
//         deadline: '',
//         status: 'not-started',
//         rationale: ''
//       });
//       setShowAddTaskForm(false);
//     } catch (error) {
//       console.error('Error adding task:', error);
//       setError('Failed to add task');
//     }
//   };

//   const handleEditTask = (task) => {
//     setTaskFormData({
//       projectTitle: task.projectTitle,
//       description: task.description,
//       deadline: new Date(task.deadline).toISOString().split('T')[0],
//       status: task.status || 'not-started',
//       rationale: task.rationale || ''
//     });
//     setEditingTaskId(task.id);
//     setShowAddTaskForm(true);
//   };

//   const handleUpdateTask = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem('token');
//       const response = await api.put(`/api/tasks/${editingTaskId}`, taskFormData, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       // Update task in state
//       setTasks(tasks.map(task =>
//         task.id === editingTaskId ? {...response.data, status: response.data.status || taskFormData.status, rationale: response.data.rationale || taskFormData.rationale} : task
//       ));

//       // Reset form
//       setTaskFormData({
//         projectTitle: '',
//         description: '',
//         deadline: '',
//         status: 'not-started',
//         rationale: ''
//       });
//       setShowAddTaskForm(false);
//       setEditingTaskId(null);
//     } catch (error) {
//       console.error('Error updating task:', error);
//       setError('Failed to update task');
//     }
//   };

//   const handleDeleteTask = async (taskId) => {
//     if (!window.confirm('Are you sure you want to delete this task?')) {
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       await api.delete(`/api/tasks/${taskId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       // Remove task from state
//       setTasks(tasks.filter(task => task.id !== taskId));
//     } catch (error) {
//       console.error('Error deleting task:', error);
//       setError('Failed to delete task');
//     }
//   };

//   if (loading) {
//     return <div style={{ textAlign: 'center', padding: '24px' }}>Loading user profile...</div>;
//   }

//   if (error) {
//     return <div style={{ textAlign: 'center', padding: '24px', color: '#ef4444' }}>{error}</div>;
//   }

//   return (
//     <div className="profile-wrapper" style={{ minHeight: '100vh', minWidth: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//       <div className="profile-container" style={{ maxWidth: '80vw', minWidth: '80vw' }}>
//         <div className="profile-layout">
//           {/* Left sidebar */}
//           <div className="profile-sidebar">
//             <div className="user-avatar-container">
//               <div className="user-avatar" onClick={handleProfilePictureClick} style={{ cursor: 'pointer' }}>
//                 {user.profileImage ? (
//                   <img src={user.profileImage} alt={user.name} />
//                 ) : (
//                   <div className="user-avatar-text">
//                     {user.name.charAt(0)}
//                   </div>
//                 )}
//               </div>

//               {/* Hidden file input for profile picture */}
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 accept="image/*"
//                 onChange={handleFileChange}
//               />

//               <h1 className="user-name">{user.name}</h1>
//               <p className="user-role">{user.role}</p>

//               <div>
//                 <button
//                   className="edit-button"
//                   onClick={handleProfilePictureClick}
//                   title="Upload profile picture"
//                 >
//                   <FaCamera />
//                 </button>
//               </div>
//             </div>

//             <div className="sidebar-nav">
//               <button
//                 className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('profile')}
//               >
//                 Profile
//               </button>
//               <button
//                 className={`nav-button ${activeTab === 'tasks' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('tasks')}
//               >
//                 Tasks
//               </button>
//               <button
//                 className={`nav-button ${activeTab === 'calendar' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('calendar')}
//               >
//                 Attendence
//               </button>
//               <button
//                 className={`nav-button ${activeTab === 'files' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('files')}
//               >
//                 Files
//               </button>
//             </div>
//           </div>

//           {/* Main content */}
//           <div className="profile-content">
//             {activeTab === 'profile' && !isEditing && (
//               <div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//                   <h2 className="section-title">User Information</h2>
//                   <button
//                     onClick={handleEditClick}
//                     className="secondary-button"
//                   >
//                     <FaEdit />
//                     Edit Profile
//                   </button>
//                 </div>

//                 <div className="info-grid">
//                   <div className="info-item">
//                     <p className="info-label">Name</p>
//                     <p className="info-value">{user.name}</p>
//                   </div>
//                   <div className="info-item">
//                     <p className="info-label">Email</p>
//                     <p className="info-value">{user.email}</p>
//                   </div>
//                   <div className="info-item">
//                     <p className="info-label">Phone</p>
//                     <p className="info-value">{user.phone || 'Not provided'}</p>
//                   </div>
//                   <div className="info-item">
//                     <p className="info-label">Address</p>
//                     <p className="info-value">{user.address || 'Not provided'}</p>
//                   </div>
//                   <div className="info-item">
//                     <p className="info-label">Blood Group</p>
//                     <p className="info-value">{user.BloodGroup || 'Not provided'}</p>
//                   </div>
//                   <div className="info-item">
//                     <p className="info-label">Role</p>
//                     <p className="info-value" style={{ textTransform: 'capitalize' }}>{user.role}</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'profile' && isEditing && (
//               <div>
//                 <h2 className="section-title">Edit Profile</h2>
//                 <form className="edit-form" onSubmit={handleSubmit}>
//                   <div className="info-grid">
//                     <div className="form-group">
//                       <label className="form-label">Name</label>
//                       <input
//                         type="text"
//                         name="name"
//                         value={editFormData.name}
//                         onChange={handleInputChange}
//                         className="form-input"
//                       />
//                     </div>
//                     <div className="form-group">
//                       <label className="form-label">Email</label>
//                       <input
//                         type="email"
//                         name="email"
//                         value={editFormData.email}
//                         onChange={handleInputChange}
//                         className="form-input"
//                         disabled
//                       />
//                       <p className="form-hint">Email cannot be changed</p>
//                     </div>
//                     <div className="form-group">
//                       <label className="form-label">Phone</label>
//                       <input
//                         type="text"
//                         name="phone"
//                         value={editFormData.phone}
//                         onChange={handleInputChange}
//                         className="form-input"
//                       />
//                     </div>
//                     <div className="form-group">
//                       <label className="form-label">Address</label>
//                       <input
//                         type="text"
//                         name="address"
//                         value={editFormData.address}
//                         onChange={handleInputChange}
//                         className="form-input"
//                       />
//                     </div>
//                     <div className="form-group">
//                       <label className="form-label">Blood Group</label>
//                       <input
//                         type="text"
//                         name="BloodGroup"
//                         value={editFormData.BloodGroup}
//                         onChange={handleInputChange}
//                         className="form-input"
//                       />
//                     </div>
//                   </div>

//                   <div className="button-group">
//                     <button
//                       type="submit"
//                       className="primary-button"
//                     >
//                       Save Changes
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setIsEditing(false)}
//                       className="secondary-button"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             )}

//             {activeTab === 'calendar' && (
//               <div>
//                 <h2 className="section-title">Attendance & Leave Tracking</h2>

//                 <div className="stats-grid">
//                   <div className="stat-card blue">
//                     <h3 className="stat-title">Total Leaves</h3>
//                     <p className="stat-value">{attendance.totalLeaves}</p>
//                   </div>
//                   <div className="stat-card green">
//                     <h3 className="stat-title">Leaves Remaining</h3>
//                     <p className="stat-value">{attendance.leavesRemaining}</p>
//                   </div>
//                   <div className="stat-card red">
//                     <h3 className="stat-title">Leaves Taken</h3>
//                     <p className="stat-value">{attendance.leavesTaken}</p>
//                   </div>
//                 </div>

//                 <h3 className="section-subtitle">Leave History</h3>
//                 {attendance.leaveHistory.length > 0 ? (
//                   <div className="table-container">
//                     <table className="data-table">
//                       <thead className="table-header">
//                         <tr>
//                           <th>Date</th>
//                           <th>Type</th>
//                           <th>Status</th>
//                         </tr>
//                       </thead>
//                       <tbody className="table-body">
//                         {attendance.leaveHistory.map((leave, index) => (
//                           <tr key={index}>
//                             <td>{leave.date}</td>
//                             <td>{leave.type}</td>
//                             <td>
//                               <span className={`status-badge ${leave.status === 'Approved'
//                                   ? 'approved'
//                                   : leave.status === 'Rejected'
//                                     ? 'rejected'
//                                     : 'pending'
//                                 }`}>
//                                 {leave.status}
//                               </span>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <div>
//                     <p className="empty-message">No leave history available.</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'tasks' && (
//               <div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//                   <h2 className="section-title">Tasks</h2>
//                   <button
//                     onClick={() => {
//                       setTaskFormData({
//                         projectTitle: '',
//                         description: '',
//                         deadline: '',
//                         status: 'not-started',
//                         rationale: ''
//                       });
//                       setEditingTaskId(null);
//                       setShowAddTaskForm(!showAddTaskForm);
//                     }}
//                     className="secondary-button" 
//                   >
//                     {showAddTaskForm ? 'Cancel' : <><FaPlus /> Add Task</>}
//                   </button>
//                 </div>

//                 {showAddTaskForm && (
//                   <div className="form-container">
//                     <h3>{editingTaskId ? 'Edit Task' : 'Add New Task'}</h3>
//                     <form onSubmit={editingTaskId ? handleUpdateTask : handleAddTask}>
//                       <div className="form-group">
//                         <label className="form-label">Project Title</label>
//                         <input
//                           type="text"
//                           name="projectTitle"
//                           value={taskFormData.projectTitle}
//                           onChange={handleTaskInputChange}
//                           className="form-input"
//                           required
//                         />
//                       </div>

//                       <div className="form-group">
//                         <label className="form-label">Description</label>
//                         <textarea
//                           name="description"
//                           value={taskFormData.description}
//                           onChange={handleTaskInputChange}
//                           className="form-input"
//                           rows="3"
//                           required
//                         />
//                       </div>

//                       <div className="form-group">
//                         <label className="form-label">Deadline</label>
//                         <input
//                           type="date"
//                           name="deadline"
//                           value={taskFormData.deadline}
//                           onChange={handleTaskInputChange}
//                           className="form-input"
//                           required
//                         />
//                       </div>

//                       <div className="form-group">
//                         <label className="form-label">Status</label>
//                         <select
//                           name="status"
//                           value={taskFormData.status}
//                           onChange={handleTaskInputChange}
//                           className="form-input"
//                           required
//                         >
//                           <option value="not-started">Not Yet Started</option>
//                           <option value="started">Started</option>
//                           <option value="in-progress">In Progress</option>
//                           <option value="completed">Completed</option>
//                         </select>
//                       </div>

//                       <div className="form-group">
//                         <label className="form-label">Rationale</label>
//                         <textarea
//                           name="rationale"
//                           value={taskFormData.rationale}
//                           onChange={handleTaskInputChange}
//                           className="form-input"
//                           rows="2"
//                           placeholder="Provide reasoning or context for this task..."
//                         />
//                       </div>

//                       <div className="button-group">
//                         <button type="submit" className="primary-button">
//                           {editingTaskId ? 'Update Task' : 'Create Task'}
//                         </button>
//                       </div>
//                     </form>
//                   </div>
//                 )}

//                 {tasks.length > 0 ? (
//                   <div className="tasks-grid">
//                     {tasks.map(task => (
//                       <div key={task.id} className="task-card">
//                         <div className="task-header">
//                           <h3 className="task-title">{task.projectTitle}</h3>
//                           <div className="task-actions">
//                             <button
//                               onClick={() => handleEditTask(task)}
//                               className="icon-button"
//                               title="Edit Task"
//                             >
//                               <FaEdit />
//                             </button>
//                             <button
//                               onClick={() => handleDeleteTask(task.id)}
//                               className="icon-button delete"
//                               title="Delete Task"
//                             >
//                               <FaTrash />
//                             </button>
//                           </div>
//                         </div>

//                         <p className="task-description">{task.description}</p>

//                         {task.rationale && (
//                           <div className="task-rationale">
//                             <strong>Rationale:</strong> {task.rationale}
//                           </div>
//                         )}

//                         <div className="task-details">
//                           <div className="task-deadline">
//                             <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
//                           </div>

//                           <div className="task-status">
//                             <span 
//                               className="status-badge" 
//                               style={{ 
//                                 backgroundColor: getStatusColor(task.status),
//                                 color: 'white',
//                                 padding: '4px 8px',
//                                 borderRadius: '4px',
//                                 display: 'inline-block'
//                               }}
//                             >
//                               {getStatusDisplayName(task.status)}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="empty-message">
//                     <p>No tasks found. Click 'Add Task' to create your first task.</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'files' && (
//               <div>
//                 <h2 className="section-title">Files</h2>
//                 <p className="empty-message">File management functionality will be displayed here.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProfile;








///////////////////////////////////////////////////////////////////////////////////////////////////////////////

