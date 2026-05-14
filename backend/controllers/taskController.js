const Task = require('../models/Task');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const tasksDir = path.join(__dirname, '../tasks');
if (!fs.existsSync(tasksDir)) {
  fs.mkdirSync(tasksDir, { recursive: true });
}

exports.createTask = async (req, res) => {
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
};

exports.getTasks = async (req, res) => {
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
};

exports.getTaskById = async (req, res) => {
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
};

exports.updateTask = async (req, res) => {
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
};

exports.deleteTask = async (req, res) => {
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
};

exports.getAdminEmployees = async (req, res) => {
  try {
    const employees = await User.find({ _id: { $ne: req.user._id } })
      .select('id name email role');

    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAdminTasks = async (req, res) => {
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
};

exports.createAdminTask = async (req, res) => {
  try {
    const { projectTitle, description, deadline, status, rationale, assignedTo } = req.body;

    if (!assignedTo || !Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({ message: 'At least one user must be assigned to the task' });
    }

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

    await savedTask.populate('assignedTo', 'id name email');
    await savedTask.populate('createdBy', 'id name email');

    for (const userId of assignedTo) {
      await saveTaskToFile({
        ...savedTask.toObject(),
        userId: userId
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
};

// exports.updateAdminTask = async (req, res) => {
//   try {
//     const { projectTitle, description, deadline, status, rationale, assignedTo } = req.body;

//     if (assignedTo && (!Array.isArray(assignedTo) || assignedTo.length === 0)) {
//       return res.status(400).json({ message: 'At least one user must be assigned to the task' });
//     }

//     if (assignedTo && assignedTo.length > 0) {
//       const { ObjectId } = require('mongoose').Types;
//       const isValid = assignedTo.every(id => ObjectId.isValid(id));
//       if (!isValid) {
//         return res.status(400).json({ message: 'Invalid user IDs in assignedTo' });
//       }

//       const assignedUsers = await User.find({ _id: { $in: assignedTo } });
//       if (assignedUsers.length !== assignedTo.length) {
//         return res.status(400).json({ message: 'One or more assigned users do not exist' });
//       }
//     }

//     if (deadline && isNaN(new Date(deadline).getTime())) {
//       return res.status(400).json({ message: 'Invalid deadline date' });
//     }

//     const existingTask = await Task.findById(req.params.id);
//     if (!existingTask) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     let completedPercentage = existingTask.completedPercentage;
//     if (status) {
//       if (status === 'completed' || status === 'approved') {
//         completedPercentage = 100;
//       } else if (status === 'not-started') {
//         completedPercentage = 0;
//       } else if (status === 'started' || status === 'in-progress') {
//         completedPercentage = 50;
//       } else if (status === 'completed-pending-approval') {
//         completedPercentage = 90;
//       }
//     }

//     // const task = await Task.findByIdAndUpdate(
//     //   req.params.id,
//     //   {
//     //     projectTitle: projectTitle || existingTask.projectTitle,
//     //     description: description || existingTask.description,
//     //     deadline: deadline ? new Date(deadline) : existingTask.deadline,
//     //     status: status || existingTask.status,
//     //     rationale: rationale !== undefined ? rationale : existingTask.rationale,
//     //     assignedTo: assignedTo || existingTask.assignedTo,
//     //     completedPercentage,
//     //     updatedAt: new Date()
//     //   },
//     //   { new: true }
//     // ).populate('assignedTo', 'id name email')
//     //  .populate('createdBy', 'id name email');

//     // In the updateAdminTask function
//     const task = await Task.findByIdAndUpdate(
//       req.params.id,
//       {
//         projectTitle: projectTitle || existingTask.projectTitle,
//         description: description || existingTask.description,
//         deadline: deadline ? new Date(deadline) : existingTask.deadline,
//         status: status || existingTask.status,
//         rationale: rationale !== undefined ? rationale : existingTask.rationale,
//         // Only update assignedTo if it's explicitly provided and not empty
//         assignedTo: assignedTo && assignedTo.length > 0 ? assignedTo : existingTask.assignedTo,
//         completedPercentage,
//         updatedAt: new Date()
//       },
//       { new: true }
//     ).populate('assignedTo', 'id name email')
//       .populate('createdBy', 'id name email');

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     if (assignedTo && !arraysEqual(existingTask.assignedTo.map(id => id.toString()), assignedTo)) {
//       const removedUsers = existingTask.assignedTo.filter(id =>
//         !assignedTo.includes(id.toString())
//       );

//       for (const userId of removedUsers) {
//         try {
//           await deleteTaskFile(userId, task._id);
//         } catch (error) {
//           console.error('Error deleting task file:', error);
//         }
//       }

//       const newUsers = assignedTo.filter(id =>
//         !existingTask.assignedTo.map(existingId => existingId.toString()).includes(id)
//       );

//       for (const userId of newUsers) {
//         try {
//           await saveTaskToFile({
//             ...task.toObject(),
//             userId
//           });
//         } catch (error) {
//           console.error('Error saving task file:', error);
//         }
//       }
//     }

//     for (const user of task.assignedTo) {
//       try {
//         await saveTaskToFile({
//           ...task.toObject(),
//           userId: user._id
//         });
//       } catch (error) {
//         console.error('Error updating task file:', error);
//       }
//     }

//     res.json({
//       id: task._id,
//       projectTitle: task.projectTitle,
//       description: task.description,
//       deadline: task.deadline,
//       status: task.status,
//       rationale: task.rationale,
//       assignedTo: task.assignedTo,
//       createdBy: task.createdBy,
//       updatedAt: task.updatedAt,
//       completedPercentage: task.completedPercentage
//     });
//   } catch (error) {
//     console.error('Update admin task error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

exports.updateAdminTask = async (req, res) => {
  try {
    const { projectTitle, description, deadline, status, rationale, assignedTo } = req.body;

    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only validate assignedTo if it's provided
    if (assignedTo !== undefined) {
      if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
        return res.status(400).json({ message: 'At least one user must be assigned to the task' });
      }

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

    // Create update object with undefined checks for all fields
    const updateData = {
      projectTitle: projectTitle !== undefined ? projectTitle : existingTask.projectTitle,
      description: description !== undefined ? description : existingTask.description,
      deadline: deadline ? new Date(deadline) : existingTask.deadline,
      status: status !== undefined ? status : existingTask.status,
      rationale: rationale !== undefined ? rationale : existingTask.rationale,
      // Only update assignedTo if explicitly provided
      ...(assignedTo !== undefined && { assignedTo }),
      completedPercentage,
      updatedAt: new Date()
    };

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('assignedTo', 'id name email')
      .populate('createdBy', 'id name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (assignedTo && !arraysEqual(existingTask.assignedTo.map(id => id.toString()), assignedTo)) {
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
};

exports.deleteAdminTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    for (const userId of task.assignedTo) {
      await deleteTaskFile(userId, task._id);
    }

    await Task.deleteOne({ _id: req.params.id });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete admin task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.approveTask = async (req, res) => {
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
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, rationale } = req.body;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!task.assignedTo.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not assigned to this task' });
    }

    let completedPercentage;
    if (status === 'completed' || status === 'completed-pending-approval') {
      completedPercentage = 90;
    } else if (status === 'not-started') {
      completedPercentage = 0;
    } else if (status === 'started' || status === 'in-progress') {
      completedPercentage = 50;
    }

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
};

exports.getAssignedTasks = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid employee ID' });
    }

    const tasks = await Task.find({ assignedTo: id })
      .populate('assignedTo', 'id name email')
      .populate('createdBy', 'id name email')
      .sort({ deadline: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const saveTaskToFile = async (task) => {
  try {
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

const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  for (let i = 0; i < sortedA.length; i++) {
    if (sortedA[i] !== sortedB[i]) return false;
  }
  return true;
};