//download excel sheet without from and to date

// exports.exportLeaveHistory = async (req, res) => {
//   try {
//     const { email } = req.params;  // Get email from request parameters

//     // Find leave requests using email
//     const leaveHistory = await LeaveRequest.find({ email }).sort({ timestamp: -1 });

//     if (leaveHistory.length === 0) {
//       return res.status(404).json({ message: "No leave history found." });
//     }

//     const workbook = new excelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Leave History");

//     // Define columns
//     worksheet.columns = [
//       { header: "Date", key: "timestamp", width: 20 },
//       { header: "Leave Type", key: "leaveType", width: 20 },
//       { header: "Total Days", key: "totalLeaveDays", width: 15 },
//       { header: "Start Date", key: "startDate", width: 15 },
//       { header: "End Date", key: "endDate", width: 15 },
//       { header: "Status", key: "status", width: 15 },
//       { header: "Reason", key: "reason", width: 40 }
//     ];

//     // Add rows
//     leaveHistory.forEach(leave => {
//       worksheet.addRow({
//         timestamp: new Date(leave.timestamp).toISOString().split("T")[0], // Format date
//         leaveType: leave.leaveType,
//         totalLeaveDays: leave.totalLeaveDays,
//         startDate: new Date(leave.startDate).toISOString().split("T")[0],
//         endDate: new Date(leave.endDate).toISOString().split("T")[0],
//         status: leave.status,
//         reason: leave.reason
//       });
//     });

//     // Set response headers
//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     res.setHeader("Content-Disposition", `attachment; filename=leave_history_${email}.xlsx`);

//     // Send the file in response
//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error("Error exporting leave history:", error);
//     res.status(500).json({ message: "Error exporting leave history." });
//   }
// };













//includes from and to date

// exports.exportLeaveHistory = async (req, res) => {
//   try {
//     const { email } = req.params;
//     const { from, to } = req.query;

//     // Convert date range to JavaScript Date objects
//     const fromDate = new Date(from);
//     const toDate = new Date(to);

//     // Validate date range
//     if (isNaN(fromDate) || isNaN(toDate)) {
//       return res.status(400).json({ message: "Invalid date range." });
//     }

//     // Find leave requests in the given date range
//     const leaveHistory = await LeaveRequest.find({
//       email,
//       startDate: { $gte: fromDate },
//       endDate: { $lte: toDate },
//     }).sort({ timestamp: -1 });

//     if (leaveHistory.length === 0) {
//       return res.status(404).json({ message: "No leave history found." });
//     }

//     const workbook = new excelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Leave History");

//     // Define columns
//     worksheet.columns = [
//       { header: "Date", key: "timestamp", width: 20 },
//       { header: "Leave Type", key: "leaveType", width: 20 },
//       { header: "Total Days", key: "totalLeaveDays", width: 15 },
//       { header: "Start Date", key: "startDate", width: 15 },
//       { header: "End Date", key: "endDate", width: 15 },
//       { header: "Status", key: "status", width: 15 },
//       { header: "Reason", key: "reason", width: 40 }
//     ];

//     // Add rows
//     leaveHistory.forEach(leave => {
//       worksheet.addRow({
//         timestamp: new Date(leave.timestamp).toISOString().split("T")[0],
//         leaveType: leave.leaveType,
//         totalLeaveDays: leave.totalLeaveDays,
//         startDate: new Date(leave.startDate).toISOString().split("T")[0],
//         endDate: new Date(leave.endDate).toISOString().split("T")[0],
//         status: leave.status,
//         reason: leave.reason
//       });
//     });

//     // Set response headers
//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     res.setHeader("Content-Disposition", `attachment; filename=leave_history_${email}.xlsx`);

//     // Send the file in response
//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error("Error exporting leave history:", error);
//     res.status(500).json({ message: "Error exporting leave history." });
//   }
// };







// exports.exportLeaveHistory = async (req, res) => {
//   try {
//     const { email } = req.params;  // Get email from request parameters

//     // Find leave requests using email
//     const leaveHistory = await LeaveRequest.find({ email }).sort({ timestamp: -1 });

//     if (leaveHistory.length === 0) {
//       return res.status(404).json({ message: "No leave history found." });
//     }

//     const workbook = new excelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Leave History");

//     // Define columns
//     worksheet.columns = [
//       { header: "Date", key: "timestamp", width: 20 },
//       { header: "Leave Type", key: "leaveType", width: 20 },
//       { header: "Total Days", key: "totalLeaveDays", width: 15 },
//       { header: "Start Date", key: "startDate", width: 15 },
//       { header: "End Date", key: "endDate", width: 15 },
//       { header: "Status", key: "status", width: 15 },
//       { header: "Reason", key: "reason", width: 40 }
//     ];

//     // Add rows
//     leaveHistory.forEach(leave => {
//       worksheet.addRow({
//         timestamp: new Date(leave.timestamp).toISOString().split("T")[0], // Format date
//         leaveType: leave.leaveType,
//         totalLeaveDays: leave.totalLeaveDays,
//         startDate: new Date(leave.startDate).toISOString().split("T")[0],
//         endDate: new Date(leave.endDate).toISOString().split("T")[0],
//         status: leave.status,
//         reason: leave.reason
//       });
//     });

//     // Set response headers
//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     res.setHeader("Content-Disposition", `attachment; filename=leave_history_${email}.xlsx`);

//     // Send the file in response
//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error("Error exporting leave history:", error);
//     res.status(500).json({ message: "Error exporting leave history." });
//   }
// };

