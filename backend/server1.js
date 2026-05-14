// Integrated server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Server } = require("socket.io");
const { createServer } = require("http");
const nodemailer = require("nodemailer");
require('dotenv').config();
const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
const path = require('path');
const fs = require('fs');
const app = express();
const server = createServer(app);

// Environment variables
const FRONTEND_URL = process.env.VITE_FRONTEND_URL || "http://192.168.1.220:5176";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const PORT = process.env.PORT || process.env.VITE_BACKEND_PORT || 5002;

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL, "http://192.168.1.220:5176"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, "http://192.168.1.220:5176"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow these methods
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.VITE_MONGO_URI || process.env.MONGODB_URI || 'mongodb://192.168.1.220:27017/employee-auth';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  BloodGroup: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  teams: [{ type: String, default: [] }],
  requirePasswordChange: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId || decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    console.log('Authenticated user:', user); // Add logging
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.get('/api/user/profile', authMiddleware, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name || '',
    email: req.user.email,
    role: req.user.role,
    phone: req.user.phone || '',
    address: req.user.address || '',
    BloodGroup: req.user.BloodGroup || '',
    profileImage: req.user.profileImage || '',
    teams: req.user.teams || []
  });
});

app.put('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address, BloodGroup } = req.body;

    // Update user profile
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (phone) updatedFields.phone = phone;
    if (address) updatedFields.address = address;
    if (BloodGroup) updatedFields.BloodGroup = BloodGroup;


    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedFields },
      { new: true }
    );

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone || '',
      address: updatedUser.address || '',
      BloodGroup: updatedUser.BloodGroup || '',
      profileImage: updatedUser.profileImage || '',
      teams: updatedUser.teams || []
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/user/profile/image', authMiddleware, upload.single('profileImage'), async (req, res) => {
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
});

app.get('/api/user/attendance', authMiddleware, async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ email: req.user.email });
    const approvedLeaves = leaveRequests.filter(leave => leave.status === 'Approved');

    const totalLeaves = 10; // This would ideally be configured per role/policy
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
});

const leaveSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  status: { type: String, default: "Pending" },
  timestamp: { type: Date, default: Date.now }
});

const LeaveRequest = mongoose.model("LeaveRequest", leaveSchema);

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Required role: ${allowedRoles.join(' or ')}` });
    }
    next();
  };
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      requirePasswordChange: user.requirePasswordChange,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
      requirePasswordChange: true
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    console.log('Change password request received:', req.body);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      console.log('Invalid new password:', newPassword);
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    req.user.password = hashedPassword;
    req.user.requirePasswordChange = false;

    if (!req.user.name) {
      req.user.name = 'Unknown'; // Set a default name if missing
    }

    console.log('Updating user:', req.user);
    await req.user.save();

    console.log('Password changed successfully for user:', req.user.email);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


const claimSchema = new mongoose.Schema({
  claimNumber: String,
  date: String,
  employeeName: String,
  employeeID: String,
  location: String,
  expenses: Array,
  advanceReceived: Number,
  adjustments: Number,
  cashReturned: Number,
  paymentStatus: { type: String, default: 'Pending' } // Added payment status field with default 'Pending'

});

const Claim = mongoose.model("Claim", claimSchema);

const paymentSchema = new mongoose.Schema({
  claimNumber: String,
  employeeName: String,
  paymentType: String,
  utrNumber: String,
  amount: Number,
  status: { type: String, default: 'Pending' }, // Added status field with default 'pending'
  paymentDate: { type: Date, default: Date.now } // Added payment date
});

const Payment = mongoose.model("Payment", paymentSchema);

app.post("/api/claims", async (req, res) => {
  try {
    const claimData = {
      ...req.body,
      paymentStatus: 'Pending'
    };
    
    const newClaim = new Claim(claimData);
    await newClaim.save();
    res.status(201).json({ message: "Claim saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error saving claim", error });
  }
});

app.get("/api/claims", async (req, res) => {
  try {
    const claims = await Claim.find({});
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: "Error fetching claims", error });
  }
});

app.get("/api/claims/:claimNumber", async (req, res) => {
  try {
    const claim = await Claim.findOne({ claimNumber: req.params.claimNumber });
    
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }
    
    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ message: "Error fetching claim", error });
  }
});

app.post("/api/payments", async (req, res) => {
  const { claimNumber,employeeName, paymentType, utrNumber, amount } = req.body;
  
  if (!claimNumber || !amount || (paymentType === "upi" && !utrNumber)) {
    return res.status(400).json({ message: "All fields are required!" });
  }
  
  try {
    const newPayment = new Payment({
      claimNumber,
      employeeName,
      paymentType, 
      utrNumber,
      amount,
      status: 'Completed',
      paymentDate: new Date()
    });
    
    await newPayment.save();
    
    const updatedClaim = await Claim.findOneAndUpdate(
      { claimNumber: claimNumber },
      { $set: { paymentStatus: 'Paid' } },
      { new: true }
    );
    
    if (!updatedClaim) {
      return res.status(404).json({ message: "Claim not found" });
    }
    
    res.status(201).json({ 
      message: "Payment saved successfully and claim status updated!",
      payment: newPayment,
      claim: updatedClaim
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Error processing payment", error });
  }
});

app.get("/api/payments", async (req, res) => {
  try {
    const payments = await Payment.find({});
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error });
  }
});

app.get("/api/payments/with-claims", async (req, res) => {
  try {
    const payments = await Payment.find({});
    
    const paymentPromises = payments.map(async (payment) => {
      const claim = await Claim.findOne({ claimNumber: payment.claimNumber });
      
      return {
        payment: payment.toObject(),
        claim: claim ? claim.toObject() : null
      };
    });
    
    const paymentDetails = await Promise.all(paymentPromises);
    
    res.status(200).json(paymentDetails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment details", error });
  }
});

app.get("/api/claims-with-status", async (req, res) => {
  try {
    const claims = await Claim.find({});
    
    const processedClaims = claims.map(claim => {
      const totalExpense = claim.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      return {
        ...claim.toObject(),
        totalExpense,
        paymentStatus: claim.paymentStatus || 'Pending'
      };
    });
    
    res.status(200).json(processedClaims);
  } catch (error) {
    res.status(500).json({ message: "Error fetching claims with status", error });
  }
});


app.get('/api/user', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const users = await User.find({}, { password: 0 }); // Exclude passwords for security

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.put('/api/user/:id/role', authMiddleware, async (req, res) => {
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
});


app.post("/leave", async (req, res) => {
  try {
    const newRequest = new LeaveRequest(req.body);
    const savedRequest = await newRequest.save(); // Save and retrieve the complete document

    io.emit("new_leave_request", savedRequest);

    res.status(201).json({ message: "Leave request submitted successfully!", leave: savedRequest });
  } catch (error) {
    res.status(500).json({ message: "Error submitting leave request", error });
  }
});

app.get("/leave", async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find().sort({ _id: -1 }); // Sort by newest first
    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave requests", error });
  }
});

app.post("/approve-leave", async (req, res) => {
  const { id, status } = req.body;

  try {
    const updatedLeave = await LeaveRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    io.emit("leave_status_updated", { id, status });

    res.json({ message: `Leave request ${status} successfully!`, leave: updatedLeave });
  } catch (error) {
    res.status(500).json({ message: "Error updating leave request", error });
  }
});

app.get("/employee-leave-requests", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const employeeRequests = await LeaveRequest.find({ email })
      .sort({ timestamp: -1 }) // Sort by timestamp instead of _id
      .exec();
    res.json(employeeRequests);
  } catch (error) {
    console.error("Error fetching employee leave requests:", error);
    res.status(500).json({
      message: "Error fetching employee leave requests",
      error
    });
  }
});


app.get("/leave-requests", async (req, res) => {
  try {
    const requests = await LeaveRequest.find().sort({ _id: -1 }); // Sort by newest first
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave requests", error });
  }
});


app.post("/api/leave", authMiddleware, async (req, res) => {
  try {
    const { subject, message } = req.body;

    const newRequest = new LeaveRequest({
      name: req.user.name,
      email: req.user.email,
      subject,
      message,
      status: "Pending"
    });

    const savedRequest = await newRequest.save();

    io.emit("new_leave_request", {
      id: savedRequest._id,
      name: savedRequest.name,
      email: savedRequest.email,
      subject: savedRequest.subject,
      message: savedRequest.message,
      status: savedRequest.status,
      timestamp: savedRequest.timestamp
    });

    res.status(201).json({
      message: "Leave request submitted successfully!",
      leave: savedRequest
    });
  } catch (error) {
    console.error("Error submitting leave request:", error);
    res.status(500).json({ message: "Error submitting leave request", error: error.message });
  }
});

app.get("/api/leave/all", authMiddleware, roleMiddleware(['admin', 'manager']), async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find().sort({ timestamp: -1 });
    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ message: "Error fetching leave requests", error: error.message });
  }
});

app.get("/api/leave/employee", authMiddleware, async (req, res) => {
  try {
    const employeeRequests = await LeaveRequest.find({ email: req.user.email })
      .sort({ timestamp: -1 })
      .exec();
    res.json(employeeRequests);
  } catch (error) {
    console.error("Error fetching employee leave requests:", error);
    res.status(500).json({
      message: "Error fetching employee leave requests",
      error: error.message
    });
  }
});

app.post("/api/leave/update-status", authMiddleware, roleMiddleware(['admin', 'manager']), async (req, res) => {
  const { id, status } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: "Status must be either 'Approved' or 'Rejected'" });
  }

  try {
    const updatedLeave = await LeaveRequest.findByIdAndUpdate(
      id,
      {
        status,
        timestamp: new Date() // Update timestamp when status changes
      },
      { new: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    io.emit("leave_status_updated", {
      id: updatedLeave._id,
      email: updatedLeave.email,
      status: updatedLeave.status,
      message: updatedLeave.message,
      timestamp: updatedLeave.timestamp,
      name: updatedLeave.name,
      subject: updatedLeave.subject
    });

    await sendEmail(updatedLeave.email, updatedLeave.name, status, updatedLeave.message);

    res.json({
      message: `Leave request ${status.toLowerCase()} successfully!`,
      leave: updatedLeave
    });
  } catch (error) {
    console.error("Error updating leave request:", error);
    res.status(500).json({ message: "Error updating leave request", error: error.message });
  }
});


// const taskSchema = new mongoose.Schema({
//   userId: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true},
//   projectTitle: {type: String,required: true},
//   description: {type: String,required: true},
//   deadline: {type: Date,required: true},
//   completedPercentage: {type: Number,default: 0,min: 0,max: 100},
//   createdAt: {type: Date,default: Date.now},
//   updatedAt: {type: Date,default: Date.now}
// });

// const Task = mongoose.model('Task', taskSchema);

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectTitle: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  completedPercentage: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['not-started', 'started', 'in-progress', 'completed', 'completed-pending-approval', 'approved'],
    default: 'not-started'
  },
  rationale: { type: String },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { projectTitle, description, deadline, completedPercentage } = req.body;

    const newTask = new Task({
      userId: req.user._id,
      projectTitle,
      description,
      deadline: new Date(deadline),
      completedPercentage: completedPercentage || 0
    });

    const savedTask = await newTask.save();

    await saveTaskToFile(savedTask);

    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: savedTask._id,
        projectTitle: savedTask.projectTitle,
        description: savedTask.description,
        deadline: savedTask.deadline,
        completedPercentage: savedTask.completedPercentage,
        remainingPercentage: 100 - savedTask.completedPercentage,
        createdAt: savedTask.createdAt
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ deadline: 1 });

    const formattedTasks = tasks.map(task => ({
      id: task._id,
      projectTitle: task.projectTitle,
      description: task.description,
      deadline: task.deadline,
      completedPercentage: task.completedPercentage,
      remainingPercentage: 100 - task.completedPercentage,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      id: task._id,
      projectTitle: task.projectTitle,
      description: task.description,
      deadline: task.deadline,
      completedPercentage: task.completedPercentage,
      remainingPercentage: 100 - task.completedPercentage,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { projectTitle, description, deadline, completedPercentage } = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      {
        projectTitle,
        description,
        deadline: new Date(deadline),
        completedPercentage,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await saveTaskToFile(task);

    res.json({
      id: task._id,
      projectTitle: task.projectTitle,
      description: task.description,
      deadline: task.deadline,
      completedPercentage: task.completedPercentage,
      remainingPercentage: 100 - task.completedPercentage,
      updatedAt: task.updatedAt
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.deleteOne({ _id: req.params.id });

    await deleteTaskFile(req.user._id, req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const tasksDir = path.join(__dirname, 'tasks');
if (!fs.existsSync(tasksDir)){
    fs.mkdirSync(tasksDir, { recursive: true });
}

// const saveTaskToFile = async (task) => {
//   try {
//     const user = await User.findById(task.userId);
//     if (!user) {
//       throw new Error(`User not found with ID: ${task.userId}`);
//     }
    
//     const userName = user.name || user.email.split('@')[0]; // Fallback to email username if name is empty
//     const sanitizedUserName = userName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
//     const userDir = path.join(tasksDir, sanitizedUserName);
//     if (!fs.existsSync(userDir)){
//       fs.mkdirSync(userDir, { recursive: true });
//     }
    
//     const filename = path.join(userDir, `task_${task._id.toString()}.json`);
    
//     const taskData = {
//       id: task._id.toString(),
//       userId: task.userId.toString(),
//       userName: userName,
//       projectTitle: task.projectTitle,
//       description: task.description,
//       deadline: task.deadline,
//       completedPercentage: task.completedPercentage,
//       remainingPercentage: 100 - task.completedPercentage,
//       createdAt: task.createdAt,
//       updatedAt: task.updatedAt
//     };
    
//     await fs.promises.writeFile(filename, JSON.stringify(taskData, null, 2));
//     console.log(`Successfully saved task for user ${userName} at ${filename}`);
//     return true;
//   } catch (error) {
//     console.error('Error saving task to file:', error);
//     return false;
//   }
// };

const deleteTaskFile = async (userId, taskId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }
    
    const userName = user.name || user.email.split('@')[0];
    const sanitizedUserName = userName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const filename = path.join(tasksDir, sanitizedUserName, `task_${taskId.toString()}.json`);
    if (fs.existsSync(filename)) {
      await fs.promises.unlink(filename);
      console.log(`Successfully deleted task file for ${userName}: ${filename}`);
      return true;
    } else {
      console.warn(`Task file not found: ${filename}`);
      return false;
    }
  } catch (error) {
    console.error('Error deleting task file:', error);
    return false;
  }
};

const getUserTasksFromFiles = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }
    
    const userName = user.name || user.email.split('@')[0];
    const sanitizedUserName = userName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const userDir = path.join(tasksDir, sanitizedUserName);
    
    if (!fs.existsSync(userDir)) {
      console.log(`No directory found for user: ${userName}`);
      return [];
    }
    
    const files = await fs.promises.readdir(userDir);
    const taskFiles = files.filter(file => file.startsWith('task_') && file.endsWith('.json'));
    
    const tasks = await Promise.all(taskFiles.map(async (file) => {
      try {
        const content = await fs.promises.readFile(path.join(userDir, file), 'utf8');
        return JSON.parse(content);
      } catch (err) {
        console.error(`Error reading task file ${file}:`, err);
        return null;
      }
    }));
    
    return tasks.filter(task => task !== null);
  } catch (error) {
    console.error('Error reading tasks from files:', error);
    return [];
  }
};

app.get('/api/user/:id', authMiddleware, async (req, res) => {
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
});



// GET all employees for admin (for task assignment)
app.get('/api/admin/employees', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const employees = await User.find({ _id: { $ne: req.user._id } })
      .select('id name email role');
    
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET all tasks (admin view)
app.get('/api/admin/tasks', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'id name email')
      .populate('createdBy', 'id name email')
      .sort({ deadline: 1 });

    const formattedTasks = tasks.map(task => ({
      id: task._id,
      projectTitle: task.projectTitle,
      description: task.description,
      deadline: task.deadline,
      status: task.status,
      rationale: task.rationale,
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedPercentage: task.completedPercentage
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Get admin tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST create a new task (admin only)
app.post('/api/admin/tasks', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { projectTitle, description, deadline, status, rationale, assignedTo } = req.body;

    // Validate assignedTo field
    if (!assignedTo || !Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({ message: 'At least one user must be assigned to the task' });
    }

    // Verify all assigned users exist
    const assignedUsers = await User.find({ _id: { $in: assignedTo } });
    if (assignedUsers.length !== assignedTo.length) {
      return res.status(400).json({ message: 'One or more assigned users do not exist' });
    }

    const newTask = new Task({
       userId: req.user._id, 
      projectTitle,
      description,
      deadline: new Date(deadline),
      status: status || 'not-started',
      rationale,
      assignedTo,
      createdBy: req.user._id,
      completedPercentage: status === 'completed' ? 100 : status === 'not-started' ? 0 : 50
    });

    const savedTask = await newTask.save();
    
    // Populate the needed fields
    await savedTask.populate('assignedTo', 'id name email');
    await savedTask.populate('createdBy', 'id name email');

    for (const userId of assignedTo) {
      await saveTaskToFile({
        ...savedTask.toObject(),
        userId: userId // Ensure it's explicitly set
      });
    }

    res.status(201).json({
      id: savedTask.id,
      projectTitle: savedTask.projectTitle,
      description: savedTask.description,
      deadline: savedTask.deadline,
      status: savedTask.status,
      rationale: savedTask.rationale,
      assignedTo: savedTask.assignedTo,
      createdBy: savedTask.createdBy,
      createdAt: savedTask.createdAt
    });
  } catch (error) {
    console.error('Create admin task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/admin/tasks/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { projectTitle, description, deadline, status, rationale, assignedTo } = req.body;

    // Validate assignedTo if provided
    if (assignedTo && (!Array.isArray(assignedTo) || assignedTo.length === 0)) {
      return res.status(400).json({ message: 'At least one user must be assigned to the task' });
    }

    // Validate assignedTo IDs
    if (assignedTo && assignedTo.length > 0) {
      const { ObjectId } = require('mongoose').Types;
      const isValid = assignedTo.every(id => ObjectId.isValid(id));
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid user IDs in assignedTo' });
      }

      const assignedUsers = await User.find({ _id: { $in: assignedTo } });
      if (assignedUsers.length !== assignedTo.length) {
        return res.status(400).json({ message: 'One or more assigned users do not exist' });
      }
    }

    // Validate deadline
    if (deadline && isNaN(new Date(deadline).getTime())) {
      return res.status(400).json({ message: 'Invalid deadline date' });
    }

    // Find existing task to compare changes
    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Calculate completedPercentage based on status
    let completedPercentage = existingTask.completedPercentage;
    if (status) {
      if (status === 'completed' || status === 'approved') {
        completedPercentage = 100;
      } else if (status === 'not-started') {
        completedPercentage = 0;
      } else if (status === 'started' || status === 'in-progress') {
        completedPercentage = 50;
      } else if (status === 'completed-pending-approval') {
        completedPercentage = 90;
      }
    }

    // Update task
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        projectTitle: projectTitle || existingTask.projectTitle,
        description: description || existingTask.description,
        deadline: deadline ? new Date(deadline) : existingTask.deadline,
        status: status || existingTask.status,
        rationale: rationale !== undefined ? rationale : existingTask.rationale,
        assignedTo: assignedTo || existingTask.assignedTo,
        completedPercentage,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('assignedTo', 'id name email')
     .populate('createdBy', 'id name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // If assignees changed, handle file updates
    if (assignedTo && !arraysEqual(existingTask.assignedTo.map(id => id.toString()), assignedTo)) {
      // Delete files for users no longer assigned
      const removedUsers = existingTask.assignedTo.filter(id => 
        !assignedTo.includes(id.toString())
      );
      
      for (const userId of removedUsers) {
        try {
          await deleteTaskFile(userId, task._id);
        } catch (error) {
          console.error('Error deleting task file:', error);
        }
      }
      
      // Create files for newly assigned users
      const newUsers = assignedTo.filter(id => 
        !existingTask.assignedTo.map(existingId => existingId.toString()).includes(id)
      );
      
      for (const userId of newUsers) {
        try {
          await saveTaskToFile({
            ...task.toObject(),
            userId
          });
        } catch (error) {
          console.error('Error saving task file:', error);
        }
      }
    }

    // Update task files for all current assignees
    for (const user of task.assignedTo) {
      try {
        await saveTaskToFile({
          ...task.toObject(),
          userId: user._id
        });
      } catch (error) {
        console.error('Error updating task file:', error);
      }
    }

    console.log(`Task ${task._id} updated successfully by admin ${req.user._id}`);

    res.json({
      id: task._id,
      projectTitle: task.projectTitle,
      description: task.description,
      deadline: task.deadline,
      status: task.status,
      rationale: task.rationale,
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      updatedAt: task.updatedAt,
      completedPercentage: task.completedPercentage
    });
  } catch (error) {
    console.error('Update admin task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE a specific task (admin only)
app.delete('/api/admin/tasks/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Delete task files for all assigned users
    for (const userId of task.assignedTo) {
      await deleteTaskFile(userId, task._id);
    }

    // Delete the task from database
    await Task.deleteOne({ _id: req.params.id });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete admin task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT approve task completion (admin only)
app.put('/api/admin/tasks/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { approved } = req.body;
    
    let newStatus;
    let completedPercentage;
    
    if (approved === true) {
      newStatus = 'approved';
      completedPercentage = 100;
    } else {
      newStatus = 'in-progress';
      completedPercentage = 50;
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        status: newStatus,
        completedPercentage,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('assignedTo', 'id name email')
     .populate('createdBy', 'id name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task files for all assignees
    for (const user of task.assignedTo) {
      await saveTaskToFile({
        ...task.toObject(),
        userId: user._id
      });
    }

    res.json({
      id: task._id,
      projectTitle: task.projectTitle,
      description: task.description,
      deadline: task.deadline,
      status: task.status,
      rationale: task.rationale,
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      updatedAt: task.updatedAt,
      completedPercentage: task.completedPercentage
    });
  } catch (error) {
    console.error('Approve task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update status endpoint for employees
app.put('/api/tasks/:id/update-status', authMiddleware, async (req, res) => {
  try {
    const { status, rationale } = req.body;
    const taskId = req.params.id;

    // Find the task and verify the user is assigned to it
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is assigned to this task
    if (!task.assignedTo.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not assigned to this task' });
    }

    // Calculate completedPercentage based on status
    let completedPercentage;
    if (status === 'completed' || status === 'completed-pending-approval') {
      completedPercentage = 90; // 90% for pending approval
    } else if (status === 'not-started') {
      completedPercentage = 0;
    } else if (status === 'started' || status === 'in-progress') {
      completedPercentage = 50;
    }

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        status,
        rationale: rationale !== undefined ? rationale : task.rationale,
        completedPercentage,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('assignedTo', 'id name email')
     .populate('createdBy', 'id name email');

    // Update task file
    await saveTaskToFile({
      ...updatedTask.toObject(),
      userId: req.user._id
    });

    res.json({
      id: updatedTask._id,
      projectTitle: updatedTask.projectTitle,
      description: updatedTask.description,
      deadline: updatedTask.deadline,
      status: updatedTask.status,
      rationale: updatedTask.rationale,
      assignedTo: updatedTask.assignedTo,
      createdBy: updatedTask.createdBy,
      updatedAt: updatedTask.updatedAt,
      completedPercentage: updatedTask.completedPercentage
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to compare arrays
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  for (let i = 0; i < sortedA.length; i++) {
    if (sortedA[i] !== sortedB[i]) return false;
  }
  return true;
}

// Modified task file path to handle multiple assignees
const saveTaskToFile = async (task) => {
  try {
    // If userId is an ObjectId, convert to string
    const userId = typeof task.userId === 'object' ? task.userId.toString() : task.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }
    
    const userName = user.name || user.email.split('@')[0];
    const sanitizedUserName = userName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const userDir = path.join(tasksDir, sanitizedUserName);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    const filename = path.join(userDir, `task_${task._id.toString()}.json`);
    
    // Prepare task data, handling populated fields
    const taskData = {
      id: task._id.toString(),
      userId: userId,
      userName: userName,
      projectTitle: task.projectTitle,
      description: task.description,
      deadline: task.deadline,
      status: task.status,
      rationale: task.rationale,
      completedPercentage: task.completedPercentage,
      assignedTo: Array.isArray(task.assignedTo) 
        ? task.assignedTo.map(user => typeof user === 'object' ? {
            id: user._id || user.id,
            name: user.name,
            email: user.email
          } : user)
        : [],
      createdBy: typeof task.createdBy === 'object' 
        ? {
            id: task.createdBy._id || task.createdBy.id,
            name: task.createdBy.name,
            email: task.createdBy.email
          } 
        : task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
    
    await fs.promises.writeFile(filename, JSON.stringify(taskData, null, 2));
    console.log(`Successfully saved task for user ${userName} at ${filename}`);
    return true;
  } catch (error) {
    console.error('Error saving task to file:', error);
    return false;
  }
};

// Fetch tasks assigned to a specific employee
app.get('/api/tasks/assigned-to/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate employeeId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid employee ID' });
    }

    // Find tasks where the employee is assigned
    const tasks = await Task.find({ assignedTo: id })
      .populate('assignedTo', 'id name email')
      .populate('createdBy', 'id name email')
      .sort({ deadline: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join_room", (email) => {
    socket.join(email);
    console.log(`Socket joined room: ${email}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});