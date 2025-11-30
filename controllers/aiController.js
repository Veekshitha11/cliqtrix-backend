// controllers/aiController.js
const mockTasks = require('../data/mockData.json');
require('dotenv').config();

module.exports = {
  
  // ============================
  // PLAN DAY (AI or fallback)
  // ============================
  getDailyPlan: async (req, res) => {
    try {
      const tasks = mockTasks.tasks;
      
      const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedTime, 0);

      // Create a simple timeline schedule
      let currentTime = 9; // 9 AM start
      const schedule = tasks.map(t => {
        const start = `${currentTime}:00`;
        currentTime += Math.round(t.estimatedTime / 60);
        
        return {
          task: t.title,
          duration: t.estimatedTime,
          priority: t.priority,
          startTime: start
        };
      });

      return res.json({
        success: true,
        plan: {
          totalTasks: tasks.length,
          totalMinutes,
          recommendation:
            totalMinutes > 300
              ? "Your day is tightly packed — start with high priority tasks."
              : "You have a manageable day — spread tasks evenly.",
          schedule
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: "Failed to generate plan." });
    }
  },

  // ============================
  // TIME DEBT (AI or fallback)
  // ============================
  getTimeDebt: async (req, res) => {
    try {
      const tasks = mockTasks.tasks;

      const pending = tasks.filter(t => t.status === "pending");
      
      const overdue = pending.filter(
        t => new Date(t.dueDate) < new Date()
      );
      
      const totalPendingHours = Math.round(
        pending.reduce((sum, t) => sum + t.estimatedTime, 0) / 60
      );
      
      const totalOverdueHours = Math.round(
        overdue.reduce((sum, t) => sum + t.estimatedTime, 0) / 60
      );

      const score = Math.max(
        0,
        100 - (totalPendingHours * 2 + totalOverdueHours * 5)
      );

      const status =
        score >= 80 ? "Excellent" :
        score >= 60 ? "Moderate" :
        "High Time Debt";

      return res.json({
        success: true,
        timeDebt: {
          score,
          status,
          totalPendingHours,
          totalOverdueHours,
          recommendation:
            score >= 80
              ? "You’re doing great. Maintain your pace!"
              : score >= 60
              ? "Try finishing overdue tasks first."
              : "You need to reduce overdue tasks immediately.",
          breakdown: {
            overdue: overdue.length,
            dueToday: tasks.filter(
              t => new Date(t.dueDate).toDateString() === new Date().toDateString()
            ).length,
            dueThisWeek: tasks.length
          }
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: "Failed to calculate time debt." });
    }
  }

};
