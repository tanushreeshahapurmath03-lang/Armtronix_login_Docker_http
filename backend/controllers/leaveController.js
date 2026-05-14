const LeaveRequest = require('../models/LeaveRequest');
const LeaveSetting= require('../models/LeaveSettings');
const express = require('express');
const { sendLeaveNotification, sendLeaveNotificationToAdmin } = require("./mailer");
const { Server } = require("socket.io");
const { createServer } = require("http");
require('dotenv').config();
const path = require("path");
const fs = require("fs");
const excelJS = require("exceljs");
const app = express();
const server = createServer(app);
const FRONTEND_URL = process.env.VITE_FRONTEND_URL || "http://192.168.1.220:5176";
const mongoose = require('mongoose');
const cron = require('node-cron');
// const io = require('../socket'); // Import socket instance

const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL, "http://192.168.1.220:5176"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

const users = {}; // Store connected users


io.on("connection", (socket) => {
  socket.on("register", (email) => {
    users[email] = socket.id; // Store user socket ID
  });

  socket.on("disconnect", () => {
    const userEmail = Object.keys(users).find((key) => users[key] === socket.id);
    if (userEmail) delete users[userEmail];
  });
});


// Submit a new leave request
exports.submitLeaveRequest = async (req, res) => {
  try {
    const newRequest = new LeaveRequest(req.body);
    const savedRequest = await newRequest.save();

    io.emit("new_leave_request", savedRequest);

    // Send email notification to Admin
    await sendLeaveNotificationToAdmin(savedRequest);

    res.status(201).json({ message: "Leave request submitted successfully!", leave: savedRequest });
  } catch (error) {
    res.status(500).json({ message: "Error submitting leave request", error });
  }
};

// Get all leave requests
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find().sort({ _id: -1 });
    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave requests", error });
  }
};

exports.approveLeave = async (req, res) => {
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

    // If the leave is approved, update the user's leave settings
    if (status === 'Approved') {
      // Find the user's leave settings
      const userLeaveSetting = await LeaveSetting.findOne({ email: updatedLeave.email });
      
      if (userLeaveSetting) {
        // IMPORTANT: Only increment the leavesTaken counter
        userLeaveSetting.leavesTaken += updatedLeave.totalLeaveDays || 0;
        await userLeaveSetting.save();
      }
    }

    // Send real-time update to the frontend
    io.emit("leave_status_updated", { id, status });

    // Send email notification to the employee
    await sendLeaveNotification({
      email: updatedLeave.email,
      name: updatedLeave.name,
      status: status,
      designation: updatedLeave.designation, 
      leaveType: updatedLeave.leaveType,
      startDate: updatedLeave.startDate,
      endDate: updatedLeave.endDate,
      totalLeaveDays: updatedLeave.totalLeaveDays,
      reason: updatedLeave.reason
    });
  
    res.json({ message: `Leave request ${status} successfully!`, leave: updatedLeave });
  } catch (error) {
    res.status(500).json({ message: "Error updating leave request", error });
  }
};

exports.getEmployeeLeaveRequests = async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const employeeRequests = await LeaveRequest.find({ email })
      .sort({ timestamp: -1 })
      .select("timestamp subject status leaveType totalLeaveDays  startDate endDate reason") // Ensure leaveType is included
      .exec();
    res.json(employeeRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee leave requests", error });
  }
};


exports.updateLeaveStatus = async (req, res) => {
  const { id, status } = req.body;

  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be either 'Approved' or 'Rejected'" });
  }

  try {
    const updatedLeave = await LeaveRequest.findByIdAndUpdate(
      id,
      { status, timestamp: new Date() },
      { new: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Fetch all approved leaves for the same employee
    const approvedLeaves = await LeaveRequest.find({ email: updatedLeave.email, status: "Approved" });

    // Calculate total approved leave days
    const totalApprovedLeaveDays = approvedLeaves.reduce((sum, leave) => sum + (leave.totalLeaveDays || 0), 0);

    // Assume totalLeavesAvailable is 35 (Can be fetched from DB if needed)
    // const totalLeavesAvailable = 35;
    const leavesTaken = totalApprovedLeaveDays;
    const leavesRemaining = LeaveSetting.totalLeaves - totalApprovedLeaveDays; 


    // Find all leave requests for the same employee
    const employeeLeaveHistory = await LeaveRequest.find({ email: updatedLeave.email })
      .sort({ timestamp: -1 })  // Sort by most recent first
      .select("timestamp subject status leaveType totalLeaveDays");

    const employeeSocketId = users[updatedLeave.email];
    if (employeeSocketId) {
      io.to(employeeSocketId).emit("leave_status_updated", {
        email: updatedLeave.email,
        leavesTaken,
        leavesRemaining,
        leaveHistory: employeeLeaveHistory,  // Send entire leave history of the employee
      });
    }

    res.json({
      message: `Leave request ${status.toLowerCase()} successfully!`,
      leave: updatedLeave,
      leavesTaken,
      leavesRemaining
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating leave request", error: error.message });
  }
};

exports.leaveRequest = async (req, res) => {
  try {
    const requests = await LeaveRequest.find().sort({ _id: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave requests", error });
  }
};



exports.leaveEmployee = async (req, res) => {
  try {

    console.log("leaveEmployee function is being called");

    // Fetch leave requests history
    const employeeRequests = await LeaveRequest.find({ email: req.user.email })
      .sort({ timestamp: -1 })
      .exec();
    
    // Initialize variables
    let totalLeaves = 35; // Default value
    let leavesTaken = 0;
    let leavesRemaining = 35;
    
    // Check if there's a custom leave setting for this user
    const userLeaveSetting = await LeaveSetting.findOne({ email: req.user.email }).lean();
    
    if (userLeaveSetting) {
      // Use values directly from database settings
      totalLeaves = userLeaveSetting.totalLeaves ;
      leavesTaken = userLeaveSetting.leavesTaken || 0;
      
      // Calculate leavesRemaining based on the leavesTaken
      leavesRemaining = totalLeaves - leavesTaken;
    } else {
      // Use global setting if no user-specific setting exists
      const globalSetting = await LeaveSetting.findOne({ isGlobal: true });
      if (globalSetting) {
        totalLeaves = globalSetting.totalLeaves ;
      }
      
      // Calculate leaves taken from approved requests
      const approvedRequests = employeeRequests.filter(request => request.status === 'Approved');
      leavesTaken = approvedRequests.reduce((sum, request) => sum + (request.totalLeaveDays || 0), 0);
      leavesRemaining = totalLeaves - leavesTaken;
    }
    
    // Return both the leave history and current balance
    res.json({
      leaveSettings: {
        totalLeaves,
        leavesRemaining,
        leavesTaken
      },
      leaveHistory: employeeRequests

      
    });
    console.log("Sending response:", {
      totalLeaves,
      leavesTaken,
      leavesRemaining,
    });
    
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee leave requests", error: error.message });
  }
};


exports.leaveAdmin = async (req, res) => {
  try {
    console.log("leaveAdmin function is being called");

    // Ensure only admins can access this route
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Fetch leave requests for the logged-in admin
    const adminRequests = await LeaveRequest.find({ email: req.user.email })
      .sort({ timestamp: -1 })
      .exec();

    // Initialize leave values
    let totalLeaves = 40; // Admins may have a different quota
    let leavesTaken = 0;
    let leavesRemaining = totalLeaves;

    // Check for admin-specific leave settings
    const adminLeaveSetting = await LeaveSetting.findOne({ email: req.user.email }).lean();

    if (adminLeaveSetting) {
      totalLeaves = adminLeaveSetting.totalLeaves;
      leavesTaken = adminLeaveSetting.leavesTaken || 0;
      leavesRemaining = totalLeaves - leavesTaken;
    } else {
      // Use global admin settings if no user-specific setting is found
      const globalAdminSetting = await LeaveSetting.findOne({ isGlobal: true, role: "admin" });
      if (globalAdminSetting) {
        totalLeaves = globalAdminSetting.totalLeaves;
      }

      // Calculate leaves taken from approved requests
      const approvedRequests = adminRequests.filter(request => request.status === "Approved");
      leavesTaken = approvedRequests.reduce((sum, request) => sum + (request.totalLeaveDays || 0), 0);
      leavesRemaining = totalLeaves - leavesTaken;
    }

    // Return leave details for the admin
    res.json({
      leaveSettings: {
        totalLeaves,
        leavesRemaining,
        leavesTaken
      },
      leaveHistory: adminRequests
    });

    console.log("Sending response:", {
      totalLeaves,
      leavesTaken,
      leavesRemaining
    });

  } catch (error) {
    console.error("Error fetching admin leave requests:", error);
    res.status(500).json({ message: "Error fetching admin leave requests", error: error.message });
  }
};


exports.getLeaveSummary = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    console.log(`Fetching leave summary for: ${email}`);

    // Get the user's leave settings
    let leaveSetting = await LeaveSetting.findOne({ email });

    if (!leaveSetting) {
      leaveSetting = new LeaveSetting({
        email,
        leavesTaken: 0,
        totalLeaves: 30, // Set default
        lastResetDate: new Date(), // Reset date as today's date
      });
      await leaveSetting.save();
    }

    // Fetch leave history (All statuses, but only those submitted after lastResetDate)
    const leaveHistory = await LeaveRequest.find({
      email,
      startDate: { $gte: leaveSetting.lastResetDate }, // ✅ Only fetch leaves after reset
    })
      .sort({ startDate: -1 }) // Sort from newest to oldest
      .select("startDate leaveType totalLeaveDays status") // Select only needed fields
      .lean();

    // ✅ Calculate `leavesTaken` based only on `Approved` leaves after reset date
    const leavesTaken = leaveHistory
      .filter(leave => leave.status === "Approved") // ✅ Only approved leaves
      .reduce((sum, leave) => sum + (leave.totalLeaveDays || 0), 0);

    // Format leave history for frontend
    const formattedLeaveHistory = leaveHistory.map(leave => ({
      date: new Date(leave.startDate).toISOString().split("T")[0],
      type: leave.leaveType,
      days: leave.totalLeaveDays,
      status: leave.status,
    }));

    console.log("Filtered Leave History:", formattedLeaveHistory);
    console.log("Updated Leaves Taken:", leavesTaken);

    res.json({
      email,
      totalLeaves: leaveSetting.totalLeaves,
      leavesTaken, // ✅ Now correctly calculated
      leavesRemaining: leaveSetting.totalLeaves - leavesTaken,
      leaveHistory: formattedLeaveHistory, // ✅ Now correctly filtered
    });

  } catch (error) {
    console.error("Error fetching leave summary:", error);
    res.status(500).json({ message: "Error fetching leave summary", error });
  }
};

exports.exportLeaveHistory = async (req, res) => {
  try {
    const { email } = req.params; 
    const { from, to } = req.query; 

    // Parse dates
    const startDate = from ? new Date(from) : new Date("2000-01-01");
    const endDate = to ? new Date(to) : new Date();

    // Find leave requests
    const leaveHistory = await LeaveRequest.find({
      email,
      startDate: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: -1 });

    // Handle case when no leave history is found
    if (leaveHistory.length === 0) {
      return res.status(200).json({ message: "No leave history found in the selected date range." });
    }

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Leave History");

    worksheet.columns = [
      { header: "Date", key: "timestamp", width: 20 },
      { header: "Leave Type", key: "leaveType", width: 20 },
      { header: "Total Days", key: "totalLeaveDays", width: 15 },
      { header: "Start Date", key: "startDate", width: 15 },
      { header: "End Date", key: "endDate", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Reason", key: "reason", width: 40 }
    ];

    // Add rows
    leaveHistory.forEach(leave => {
      worksheet.addRow({
        timestamp: new Date(leave.timestamp).toISOString().split("T")[0], 
        leaveType: leave.leaveType,
        totalLeaveDays: leave.totalLeaveDays,
        startDate: new Date(leave.startDate).toISOString().split("T")[0],
        endDate: new Date(leave.endDate).toISOString().split("T")[0],
        status: leave.status,
        reason: leave.reason
      });
    });

    // Set response headers
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=leave_history_${email}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting leave history:", error);
    res.status(500).json({ message: "Error exporting leave history." });
  }
};


exports.getLeaveSettings = async (req, res) => {
  try {
    const leaveSetting = await LeaveSetting.findOne(); // Fetch settings
    if (!leaveSetting) {
      return res.status(404).json({ message: "Leave settings not found" });
    }

    res.status(200).json({ 
      totalLeaves: leaveSetting.totalLeaves
    });

  } catch (error) {
    console.error("Error fetching leave settings:", error);
    res.status(500).json({ message: "Error fetching leave settings", error });
  }
};

exports.resetLeaves = async (req, res) => {
  try {
    const { resetType, email, totalLeaves } = req.body;
    
    // Set reset date to today at midnight (start of day)
    const resetDate = new Date();
    resetDate.setHours(0, 0, 0, 0);
    
    console.log(`Reset Date: ${resetDate}`);

    if (resetType === "single") {
      if (!email) {
        return res.status(400).json({ message: "Email is required for individual reset." });
      }

      let userSettings = await LeaveSetting.findOneAndUpdate(
        { email },
        { 
          $set: { 
            totalLeaves, 
            leavesTaken: 0, 
            lastResetDate: resetDate  // Using the normalized date
          } 
        },
        { new: true, upsert: true }
      );

      // Force save to ensure changes are written to database
      await userSettings.save();

      // Verify in database that leaves are reset
      const verifySettings = await LeaveSetting.findOne({ email });
      console.log(`Verified settings after reset: ${JSON.stringify(verifySettings)}`);

      return res.json({ 
        message: `✅ Successfully reset leaves for ${email}`, 
        userSettings: {
          ...userSettings.toObject(),
          leavesRemaining: totalLeaves
        }
      });

    } else if (resetType === "all") {
      if (!totalLeaves) {
        return res.status(400).json({ message: "Total leaves are required for reset." });
      }

      // Update or create global setting
      let globalSetting = await LeaveSetting.findOneAndUpdate(
        { isGlobal: true },
        { $set: { totalLeaves, lastResetDate: resetDate } },
        { new: true, upsert: true }
      );

      // Reset all individual user settings
      const updateResult = await LeaveSetting.updateMany(
        { email: { $exists: true, $ne: null } },
        { 
          $set: { 
            totalLeaves, 
            leavesTaken: 0, 
            lastResetDate: resetDate 
          } 
        }
      );

      console.log(`Reset all employees result: ${JSON.stringify(updateResult)}`);

      return res.json({ 
        message: "✅ Successfully reset leaves for all employees", 
        globalSetting,
        updateCount: updateResult.modifiedCount
      });
    } else {
      return res.status(400).json({ message: "Invalid reset type. Use 'single' or 'all'." });
    }

  } catch (error) {
    console.error("❌ Error resetting leaves:", error);
    res.status(500).json({ 
      message: "Error resetting leaves", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.updateLeaveSettings = async (req, res) => {
  try {
    const { totalLeaves } = req.body;
    
    if (!totalLeaves) {
      return res.status(400).json({ message: "totalLeaves is required" });
    }

    const leaveSetting = await LeaveSetting.findOneAndUpdate(
      {}, // Update the first document found
      { totalLeaves },
      { new: true, upsert: true } // Create if it doesn't exist
    );

    res.status(200).json({ 
      message: "Leave settings updated",
      totalLeaves: leaveSetting.totalLeaves
    });

  } catch (error) {
    console.error("Error updating leave settings:", error);
    res.status(500).json({ message: "Error updating leave settings", error });
  }
};

// const autoApprovePendingLeaves = async () => {
//   try {
//     let currentDate = new Date();
//     currentDate.setDate(currentDate.getDate() + 1); // Tomorrow's date
//     currentDate.setHours(0, 0, 0, 0); // Normalize time to start of the day

//     console.log("🔍 Checking pending leaves for auto-approval on:", currentDate.toISOString());

//     // Find pending leave requests where startDate is exactly tomorrow
//     const pendingLeaves = await LeaveRequest.find({
//       status: "Pending",
//       startDate: { 
//         $gte: new Date(currentDate.setHours(0, 0, 0, 0)), 
//         $lt: new Date(currentDate.setHours(23, 59, 59, 999)) // Full day range
//       }
//     });

//     console.log("📋 Found pending leave requests:", pendingLeaves.length);

//     if (pendingLeaves.length === 0) {
//       console.log("✅ No pending leaves to auto-approve.");
//       return;
//     }

//     // Update leave status to 'Approved' and set `autoApproved: true`
//     const result = await LeaveRequest.updateMany(
//       { _id: { $in: pendingLeaves.map((leave) => leave._id) } },
//       { $set: { status: "Approved", autoApproved: true } } // ✅ Set autoApproved flag
//     );

//     console.log(`✅ ${result.modifiedCount} leave requests auto-approved.`);

//     // Emit event for real-time updates
//     pendingLeaves.forEach((leave) => {
//       io.emit("auto_approved_leave", { id: leave._id, status: "Approved", autoApproved: true });
//       console.log(`📢 Emitted auto_approved_leave event for leave ID: ${leave._id}`);
//     });
    
//   } catch (error) {
//     console.error("❌ Error auto-approving pending leaves:", error);
//   }
// };

// Express route to trigger auto-approval manually

const autoApprovePendingLeaves = async () => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Start of tomorrow

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(tomorrow.getDate() + 1); // For less-than comparison

    console.log("🔍 Auto-approving leaves with startDate:", now.toISOString(), "or", tomorrow.toISOString());

    const pendingLeaves = await LeaveRequest.find({
      status: "Pending",
      startDate: {
        $gte: now,       // StartDate is today or later
        $lt: dayAfter    // But not beyond tomorrow
      }
    });

    console.log("📋 Found pending leave requests:", pendingLeaves.length);

    if (pendingLeaves.length === 0) {
      console.log("✅ No pending leaves to auto-approve.");
      return;
    }

    const result = await LeaveRequest.updateMany(
      { _id: { $in: pendingLeaves.map((leave) => leave._id) } },
      { $set: { status: "Approved", autoApproved: true } }
    );

    console.log(`✅ ${result.modifiedCount} leave requests auto-approved.`);

    pendingLeaves.forEach((leave) => {
      io.emit("auto_approved_leave", {
        id: leave._id,
        status: "Approved",
        autoApproved: true
      });
      console.log(`📢 Emitted auto_approved_leave for ID: ${leave._id}`);
    });

  } catch (error) {
    console.error("❌ Error auto-approving pending leaves:", error);
  }
};


exports.autoApprovePendingLeaves = async (req, res) => {
  try {
    await autoApprovePendingLeaves();
    res.status(200).json({ message: "Auto-approval process completed." });
  } catch (error) {
    console.error("❌ API Error auto-approving pending leaves:", error);
    res.status(500).json({ message: "Error auto-approving pending leaves", error });
  }
};

cron.schedule("*/1 * * * *", async () => {  // Runs every 1 minute
  console.log("⏳ Running auto-approve cron job...");
  await autoApprovePendingLeaves();
});

// cron.schedule("0 */2 * * *", async () => {  // Runs every 2 hours
//   console.log("⏳ Running auto-approve cron job at", new Date().toISOString());
//   await autoApprovePendingLeaves();
// });