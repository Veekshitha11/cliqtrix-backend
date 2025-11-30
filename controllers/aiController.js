const mockData = require('../data/mockData.json');
const aiEngine = require('../utils/aiEngine');
const priorityScorer = require('../utils/priorityScorer');
const timeDebtCalculator = require('../utils/timeDebtCalculator');

let tasks = [...mockData.tasks];

class AIController {
  
  // GET /api/ai/plan-day
  async generateDailyPlan(req, res) {
    try {
      const plan = aiEngine.generateDailyPlan(tasks);
      
      res.json({
        success: true,
        plan
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // GET /api/ai/time-debt
  async getTimeDebtScore(req, res) {
    try {
      const timeDebt = timeDebtCalculator.calculate(tasks);
      
      res.json({
        success: true,
        timeDebt
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // POST /api/ai/summarize
  async summarizeEmail(req, res) {
    try {
      const { emailContent } = req.body;
      
      if (!emailContent) {
        return res.status(400).json({
          success: false,
          error: 'Email content is required'
        });
      }
      
      const summary = aiEngine.summarizeEmail(emailContent);
      
      res.json({
        success: true,
        summary
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // POST /api/ai/priority
  async calculatePriority(req, res) {
    try {
      const { task, crmData } = req.body;
      
      if (!task) {
        return res.status(400).json({
          success: false,
          error: 'Task data is required'
        });
      }
      
      const priorityResult = priorityScorer.calculateScore(task, crmData);
      
      res.json({
        success: true,
        priority: priorityResult
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AIController();