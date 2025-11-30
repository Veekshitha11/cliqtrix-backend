const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Get all tasks
router.get('/', taskController.getAllTasks);

// Get single task by ID
router.get('/:id', taskController.getTaskById);

// Create new task from email
router.post('/create', taskController.createTask);

// Update task priority
router.patch('/:id/priority', taskController.updatePriority);

// Mark task as complete
router.patch('/:id/complete', taskController.completeTask);

module.exports = router;