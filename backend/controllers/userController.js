const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');


const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter: fileFilter
});


exports.getProfile = async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name || '',
    empId: req.user.empId,
    email: req.user.email,
    role: req.user.role,
    phone: req.user.phone || '',
    address: req.user.address || '',
    BloodGroup: req.user.BloodGroup || '',
    Designation: req.user.Designation || '',
    profileImage: req.user.profileImage || '',
    Gender: req.user.Gender || '',
    teams: req.user.teams || []
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, BloodGroup, Designation, Gender } = req.body;

    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (phone) updatedFields.phone = phone;
    if (address) updatedFields.address = address;
    if (BloodGroup) updatedFields.BloodGroup = BloodGroup;
    if (Designation) updatedFields.Designation = Designation;
    if (Gender) updatedFields.Gender = Gender;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedFields },
      { new: true }
    );

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      empId: updatedUser.empId,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone || '',
      address: updatedUser.address || '',
      BloodGroup: updatedUser.BloodGroup || '',
      Designation: updatedUser.Designation || '',
      Gender: updatedUser.Gender || '',
      profileImage: updatedUser.profileImage || '',
      teams: updatedUser.teams || []
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    );

    res.json({
      message: 'Profile image updated successfully',
      profileImage: updatedUser.profileImage
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ email: req.user.email });
    const approvedLeaves = leaveRequests.filter(leave => leave.status === 'Approved');

    const totalLeaves = 35;
    const leavesTaken = approvedLeaves.length;

    res.json({
      totalLeaves,
      leavesTaken,
      leavesRemaining: totalLeaves - leavesTaken,
      leaveHistory: leaveRequests.map(leave => ({
        id: leave._id,
        date: new Date(leave.timestamp).toISOString().split('T')[0],
        type: leave.subject,
        status: leave.status
      }))
    });
  } catch (error) {
    console.error('Fetch attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const users = await User.find({}, { password: 0 });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = user.role === "employee" ? "admin" : "employee";

    await user.save();
    res.json({ message: `User role updated to ${user.role}`, role: user.role });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error" });
  }
};



  exports.getAttendanceByUserId = async (req, res) => {
  try {
    // Validate userId format
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Find the user based on userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch leave requests for the found user's email
    const leaveRequests = await LeaveRequest.find({ email: user.email });
    const approvedLeaves = leaveRequests.filter(leave => leave.status === 'Approved');

    const totalLeaves = 35; // This would ideally be configured per role/policy
    const leavesTaken = approvedLeaves.length;

    res.json({
      totalLeaves,
      leavesTaken,
      leavesRemaining: totalLeaves - leavesTaken,
      leaveHistory: leaveRequests.map(leave => ({
        id: leave._id,
        date: new Date(leave.timestamp).toISOString().split('T')[0],
        type: leave.subject,
        status: leave.status
      }))
    });
  } catch (error) {
    console.error('Fetch attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getAttendanceByUserId1 = async (req, res) => {
  try {
    // Validate userId format
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find the user based on userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch leave requests for the user using email
    const leaveRequests = await LeaveRequest.find({ email: user.email });

    // Filter only approved leaves
    const approvedLeaves = leaveRequests.filter((leave) => leave.status === "Approved");

    // Calculate total leave days taken
    const totalLeaveDaysTaken = approvedLeaves.reduce(
      (sum, leave) => sum + (leave.totalLeaveDays || 0),
      0
    );

    const totalLeaves = 35; // Set this based on company policy

    res.json({
      totalLeaves,
      leavesTaken: totalLeaveDaysTaken,
      leavesRemaining: totalLeaves - totalLeaveDaysTaken,
      leaveHistory: leaveRequests.map((leave) => ({
        id: leave._id,
        date: new Date(leave.timestamp).toISOString().split("T")[0],
        type: leave.leaveType,
        days: leave.totalLeaveDays || 0,
        status: leave.status,
      })),
    });
  } catch (error) {
    console.error("Fetch attendance error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.deleteUser = async (req, res) => {
  try {
      if (!req.user || req.user.role !== "admin") {
          return res.status(403).json({ message: "Access denied. Admins only." });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      await user.deleteOne(); // Instead of User.deleteOne({ _id: req.params.id })

      res.json({ message: "User deleted successfully" });
  } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
};


// CHECKIN
exports.checkin = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Reset time to midnight

    const alreadyExists = await Attendance.findOne({ userId, date: today });
    if (alreadyExists) return res.status(400).json({ message: "Already checked in" });

    const newEntry = new Attendance({
      userId,
      date: today,
      checkIn: new Date(),
    });

    await newEntry.save();
    res.json({ message: "Checked in", status: "Present" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};



exports.checkout = async (req, res) => {
  try {
    const userId = req.user.id;

    const { startUTC, endUTC } = getISTStartAndEndOfToday();

    const record = await Attendance.findOne({
      userId,
      checkIn: { $gte: startUTC, $lte: endUTC },
    });

    if (!record) {
      return res.status(404).json({ message: "Check-in record not found." });
    }

    const checkOut = new Date();

    // Calculate hours worked
    const durationMs = checkOut - new Date(record.checkIn);
    const hoursWorked = durationMs / 1000 / 60 / 60;

    // Determine the status based on hours worked
    let status;
    if (hoursWorked >= 8) {
      status = 'Full Day';
    } else if (hoursWorked < 8) {
      status = 'Half Day';
    } else {
      status = 'Absent';
    }

    // Update the record with the checkout time and status
    record.checkOut = checkOut;
    record.status = status;

    // Save the updated record
    await record.save();

    res.json({
      message: "Checked out successfully.",
      status,
      hoursWorked: hoursWorked.toFixed(2),
    });
  } catch (err) {
    console.error("Error during checkout:", err);
    res.status(500).json({ message: "Server error during checkout." });
  }
};

// exports.checkin = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { latitude, longitude } = req.body;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const alreadyExists = await Attendance.findOne({ userId, date: today });
//     if (alreadyExists) return res.status(400).json({ message: "Already checked in" });

//     const newEntry = new Attendance({
//       userId,
//       date: today,
//       checkIn: new Date(),
//       checkInLocation: { latitude, longitude },
//     });

//     await newEntry.save();
//     res.json({ message: "Checked in", location: { latitude, longitude } });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// exports.checkout = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { latitude, longitude } = req.body;

//     const { startUTC, endUTC } = getISTStartAndEndOfToday();
//     const record = await Attendance.findOne({
//       userId,
//       checkIn: { $gte: startUTC, $lte: endUTC },
//     });

//     if (!record) {
//       return res.status(404).json({ message: "Check-in record not found." });
//     }

//     const checkOut = new Date();
//     const durationMs = checkOut - new Date(record.checkIn);
//     const hoursWorked = durationMs / 1000 / 60 / 60;

//     let status = 'Pending Checkout';
//     if (hoursWorked >= 8) status = 'Full Day';
//     else if (hoursWorked < 8) status = 'Half Day';
//     else status = 'Absent';

//     record.checkOut = checkOut;
//     record.checkOutLocation = { latitude, longitude };
//     record.status = status;

//     await record.save();

//     res.json({
//       message: "Checked out successfully.",
//       status,
//       hoursWorked: hoursWorked.toFixed(2),
//       location: { latitude, longitude },
//     });
//   } catch (err) {
//     console.error("Error during checkout:", err);
//     res.status(500).json({ message: "Server error during checkout." });
//   }
// };



function getISTStartAndEndOfToday() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;

  const startIST = new Date(now.getTime() + istOffset);
  startIST.setHours(0, 0, 0, 0);

  const endIST = new Date(startIST);
  endIST.setHours(23, 59, 59, 999);

  return {
    startUTC: new Date(startIST.getTime() - istOffset),
    endUTC: new Date(endIST.getTime() - istOffset),
  };
}





exports.status = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ userId, date: today });

    if (attendance) {
      return res.json({
        checkInTime: attendance.checkIn,
        checkOutTime: attendance.checkOut,
        status: attendance.status || 'Checked In',
      });
    } else {
      return res.json({ status: 'Absent' }); // ← Mark as absent if no check-in found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.attendanceHistory = async (req, res) => {
  try {
    const { userId, fromDate, toDate } = req.body;
    const { role } = req.user;  // Assuming you are passing the admin role in the token

    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    // Create the query object
    let query = { date: { $gte: from, $lte: to } };

    // If the user is an admin, fetch attendance for all users, else fetch attendance for the specific user
    if (role !== "admin" && userId) {
      query.userId = userId;  // Filter by the user's ID only if it's not an admin request
    }

    // Find attendance records for the given query
    const records = await Attendance.find(query).populate('userId', 'name email');

    res.json(records);
  } catch (err) {
    console.error("Error fetching attendance history:", err);
    res.status(500).json({ message: "Server Error" });
  }
};






exports.getAttendanceWithUserEmail = async (req, res) => {
  try {
    const { userId, fromDate, toDate } = req.body;
    const { role } = req.user;  // Get the role from the JWT token (admin or regular user)

    const from = new Date(new Date(fromDate).setUTCHours(0, 0, 0, 0));
    const to = new Date(new Date(toDate).setUTCHours(23, 59, 59, 999));
    

    // Query to fetch attendance data based on date and userId
    let query = { date: { $gte: from, $lte: to }, userId: userId };

    // If it's an admin, they can see all users' data, otherwise just the logged-in user's data
    if (role !== "admin") {
      query.userId = userId;  // Ensure only the logged-in user’s attendance is returned
    }

    // Fetch the attendance records
    const records = await Attendance.find(query).populate('userId', 'name email');

    res.json(records);  // Send back the records as JSON
  } catch (err) {
    console.error("Error fetching attendance history:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


