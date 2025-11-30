// AI Engine for email summarization and task generation
class AIEngine {
  
  // Summarize email into task title and description
  summarizeEmail(emailContent) {
    const text = emailContent.toLowerCase();
    
    // Extract action verbs
    const actionVerbs = ['review', 'send', 'prepare', 'schedule', 'respond', 'complete', 'analyze', 'update', 'submit', 'follow up'];
    let title = '';
    
    for (const verb of actionVerbs) {
      if (text.includes(verb)) {
        const sentences = emailContent.split(/[.!?]/);
        const relevantSentence = sentences.find(s => s.toLowerCase().includes(verb));
        if (relevantSentence) {
          title = relevantSentence.trim().substring(0, 60);
          break;
        }
      }
    }
    
    if (!title) {
      title = emailContent.split(/[.!?]/)[0].substring(0, 60);
    }
    
    // Generate description
    const description = emailContent.substring(0, 150).trim() + '...';
    
    // Extract due date hints
    const dueDateMatch = text.match(/(?:by|before|due)\s+(\w+\s+\d+)/i);
    let dueDate = null;
    if (dueDateMatch) {
      dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 2); // Default 2 days from now
    }
    
    // Estimate time based on complexity
    const wordCount = emailContent.split(' ').length;
    let estimatedTime = 30; // minutes
    if (wordCount > 200) estimatedTime = 120;
    else if (wordCount > 100) estimatedTime = 60;
    
    return {
      title: this.cleanTitle(title),
      description,
      estimatedTime,
      dueDate: dueDate || this.getDefaultDueDate(),
      category: this.categorizeTask(emailContent)
    };
  }
  
  cleanTitle(title) {
    return title
      .replace(/^(hi|hello|dear|subject:)/i, '')
      .trim()
      .replace(/^\W+/, '')
      .substring(0, 80);
  }
  
  categorizeTask(content) {
    const text = content.toLowerCase();
    
    if (text.match(/meeting|call|schedule|sync/)) return 'communication';
    if (text.match(/report|analysis|review|data/)) return 'work';
    if (text.match(/urgent|asap|important|critical/)) return 'urgent';
    if (text.match(/invoice|payment|expense/)) return 'finance';
    if (text.match(/document|file|attachment/)) return 'admin';
    
    return 'general';
  }
  
  getDefaultDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 3); // 3 days from now
    return date.toISOString();
  }
  
  // Generate daily plan
  generateDailyPlan(tasks) {
    const now = new Date();
    const todayTasks = tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate.toDateString() === now.toDateString() && t.status !== 'completed';
    });
    
    const sortedTasks = todayTasks.sort((a, b) => b.priorityScore - a.priorityScore);
    
    const plan = {
      date: now.toISOString().split('T')[0],
      totalTasks: sortedTasks.length,
      totalMinutes: sortedTasks.reduce((sum, t) => sum + t.estimatedTime, 0),
      schedule: this.createSchedule(sortedTasks),
      recommendation: this.generateRecommendation(sortedTasks)
    };
    
    return plan;
  }
  
  createSchedule(tasks) {
    let currentTime = new Date();
    currentTime.setHours(9, 0, 0, 0); // Start at 9 AM
    
    return tasks.map(task => {
      const startTime = new Date(currentTime);
      currentTime.setMinutes(currentTime.getMinutes() + task.estimatedTime + 15); // +15 min break
      
      return {
        task: task.title,
        priority: task.priority,
        startTime: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        duration: task.estimatedTime,
        id: task.id
      };
    });
  }
  
  generateRecommendation(tasks) {
    const highPriorityCount = tasks.filter(t => t.priority === 'high').length;
    
    if (tasks.length === 0) return 'No tasks scheduled for today. Great job!';
    if (highPriorityCount > 3) return 'Heavy day ahead. Focus on top 3 high-priority tasks first.';
    if (tasks.length > 8) return 'Consider delegating some tasks to reduce workload.';
    
    return 'Balanced schedule. Start with high-priority items.';
  }
}

module.exports = new AIEngine();