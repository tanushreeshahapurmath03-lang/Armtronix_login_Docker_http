const express = require('express');
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/api/leave/update-status', authMiddleware, leaveController.updateLeaveStatus);
router.post("/leave", leaveController.submitLeaveRequest);
router.get("/leave", leaveController.getAllLeaveRequests);
router.post("/approve-leave", leaveController.approveLeave);
router.get("/employee-leave-requests", leaveController.getEmployeeLeaveRequests);
router.get("/leave-requests", leaveController.getAllLeaveRequests);
router.get("/api/leave/employee",  authMiddleware, leaveController.leaveEmployee);
router.get("/api/leave/admin", authMiddleware, leaveController.leaveAdmin);
router.get("/leave-summary", leaveController.getLeaveSummary);
router.get("/leave-history/download/:email", leaveController.exportLeaveHistory);
router.get('/leave/settings',authMiddleware, leaveController.getLeaveSettings);
router.post('/leave/settings',authMiddleware, leaveController.updateLeaveSettings);
router.post('/leave/reset',authMiddleware, leaveController.resetLeaves);
router.get("/api/leave/auto-approve-leaves", leaveController.autoApprovePendingLeaves);

module.exports = router;