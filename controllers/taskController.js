const mockData = require('../data/mockData.json');
const aiEngine = require('../utils/aiEngine');
const priorityScorer = require('../utils/priorityScorer');

let tasks = [...mockData.tasks]; // In-memory store (use DB in production)

class TaskController {
  
  // GET /api/tasks
  async getAllTasks(req, res) {
    try {
      const { status, priority, sortBy } = req.query;
      
      let filtered = [...tasks];
      
      if (status) {
        filtered = filtered.filter(t => t.status === status);
      }
      
      if (priority) {
        filtered = filtered.filter(t => t.priority === priority);
      }
      
      if (sortBy === 'priority') {
        filtered.sort((a, b) => b.priorityScore - a.priorityScore);
      } else if (sortBy === 'dueDate') {
        filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      }
      
      res.json({
        success: true,
        count: filtered.length,
        tasks: filtered
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // GET /api/tasks/:id
  async getTaskById(req, res) {
    try {
      const task = tasks.find(t => t.id === req.params.id);
      
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      
      res.json({ success: true, task });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // POST /api/tasks/create
  async createTask(req, res) {
    try {
      const { emailContent, fromEmail, senderName } = req.body;
      
      if (!emailContent) {
        return res.status(400).json({ success: false, error: 'Email content required' });
      }
      
      // Use AI to summarize email
      const summary = aiEngine.summarizeEmail(emailContent);
      
      const newTask = {
        id: `task_${Date.now()}`,
        title: summary.title,
        description: summary.description,
        estimatedTime: summary.estimatedTime,
        dueDate: summary.dueDate,
        category: summary.category,
        status: 'pending',
        fromEmail: fromEmail || 'unknown@email.com',
        senderName: senderName || 'Unknown',
        createdAt: new Date().toISOString()
      };
      
      // Calculate priority score
      const priorityResult = priorityScorer.calculateScore(newTask);
      newTask.priority = priorityResult.priority;
      newTask.priorityScore = priorityResult.score;
      
      tasks.push(newTask);
      
      res.json({
        success: true,
        message: 'Task created successfully',
        task: newTask
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // PATCH /api/tasks/:id/priority
  async updatePriority(req, res) {
    try {
      const task = tasks.find(t => t.id === req.params.id);
      
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      
      const { priority, priorityScore } = req.body;
      
      if (priority) task.priority = priority;
      if (priorityScore) task.priorityScore = priorityScore;
      
      res.json({ success: true, task });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // PATCH /api/tasks/:id/complete
  async completeTask(req, res) {
    try {
      const task = tasks.find(t => t.id === req.params.id);
      
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      
      res.json({
        success: true,
        message: 'Task marked as complete',
        task
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new TaskController();