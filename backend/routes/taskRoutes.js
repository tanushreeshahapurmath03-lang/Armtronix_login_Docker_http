const express = require('express');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/api/tasks', authMiddleware, taskController.createTask);
router.get('/api/tasks', authMiddleware, taskController.getTasks);
router.get('/api/tasks/:id', authMiddleware, taskController.getTaskById);
router.put('/api/tasks/:id', authMiddleware, taskController.updateTask);
router.delete('/api/tasks/:id', authMiddleware, taskController.deleteTask);
router.get('/api/admin/employees', authMiddleware, taskController.getAdminEmployees);
router.get('/api/admin/tasks', authMiddleware, taskController.getAdminTasks);
router.post('/api/admin/tasks', authMiddleware, taskController.createAdminTask);
router.put('/api/admin/tasks/:id', authMiddleware, taskController.updateAdminTask);
router.delete('/api/admin/tasks/:id', authMiddleware, taskController.deleteAdminTask);
router.put('/api/admin/tasks/:id/approve', authMiddleware, taskController.approveTask);
router.put('/api/tasks/:id/update-status', authMiddleware, taskController.updateTaskStatus);
router.get('/api/tasks/assigned-to/:id', authMiddleware, taskController.getAssignedTasks);

module.exports = router;