// routes/ai.js
const express = require('express');
const router = express.Router();

const {
  getDailyPlan,
  getTimeDebt
} = require('../controllers/aiController');

// AI endpoints
router.get('/plan-day', getDailyPlan);
router.get('/time-debt', getTimeDebt);

module.exports = router;
