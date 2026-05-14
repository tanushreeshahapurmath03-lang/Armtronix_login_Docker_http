const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.post('/profile/image', authMiddleware, upload.single('profileImage'), userController.uploadProfileImage);
router.get('/attendance', authMiddleware, userController.getAttendance);
router.get('/', authMiddleware, userController.getAllUsers);
router.put('/:id/role', authMiddleware, userController.updateUserRole);
router.get('/:id', authMiddleware, userController.getUserById);
router.get('/attendance/:userId', authMiddleware, userController.getAttendanceByUserId1);
router.delete("/:id", authMiddleware,userController.deleteUser);
router.post('/attendance/checkin',authMiddleware,userController.checkin);
router.post('/attendance/checkout',authMiddleware,userController.checkout);
router.post('/attendance/status',userController.status);
router.post('/attendance/history', authMiddleware, userController.attendanceHistory);
router.post('/attendance/userhistory', authMiddleware, userController.getAttendanceWithUserEmail);

module.exports = router;