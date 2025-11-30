const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Generate Plan My Day
router.get('/plan-day', aiController.generateDailyPlan);

// Calculate Time Debt Score
router.get('/time-debt', aiController.getTimeDebtScore);

// Summarize email into task
router.post('/summarize', aiController.summarizeEmail);

// Get priority score for task
router.post('/priority', aiController.calculatePriority);

module.exports = router;