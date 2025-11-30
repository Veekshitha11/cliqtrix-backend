// Priority Scoring Algorithm (0-100)
class PriorityScorer {
  
  calculateScore(task, crmData = null) {
    let score = 50; // Base score
    
    // Factor 1: Urgency based on due date (30 points)
    score += this.getUrgencyScore(task.dueDate);
    
    // Factor 2: Keyword importance (20 points)
    score += this.getKeywordScore(task.title, task.description);
    
    // Factor 3: Sender importance from CRM (25 points)
    if (crmData) {
      score += this.getSenderScore(crmData);
    }
    
    // Factor 4: Task complexity (15 points)
    score += this.getComplexityScore(task.estimatedTime);
    
    // Factor 5: Category weight (10 points)
    score += this.getCategoryScore(task.category);
    
    // Normalize to 0-100
    score = Math.min(100, Math.max(0, score));
    
    return {
      score: Math.round(score),
      priority: this.getPriorityLabel(score),
      factors: {
        urgency: this.getUrgencyScore(task.dueDate),
        keywords: this.getKeywordScore(task.title, task.description),
        sender: crmData ? this.getSenderScore(crmData) : 0,
        complexity: this.getComplexityScore(task.estimatedTime),
        category: this.getCategoryScore(task.category)
      }
    };
  }
  
  getUrgencyScore(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const hoursUntilDue = (due - now) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 0) return 30; // Overdue - max urgency
    if (hoursUntilDue < 24) return 25; // Due today
    if (hoursUntilDue < 48) return 20; // Due tomorrow
    if (hoursUntilDue < 72) return 15; // Due in 3 days
    if (hoursUntilDue < 168) return 10; // Due this week
    
    return 5; // Due later
  }
  
  getKeywordScore(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    let score = 0;
    
    const urgentKeywords = ['urgent', 'asap', 'critical', 'emergency', 'immediately'];
    const importantKeywords = ['important', 'priority', 'deadline', 'required'];
    const actionKeywords = ['approve', 'sign', 'review', 'submit', 'complete'];
    
    urgentKeywords.forEach(word => {
      if (text.includes(word)) score += 8;
    });
    
    importantKeywords.forEach(word => {
      if (text.includes(word)) score += 5;
    });
    
    actionKeywords.forEach(word => {
      if (text.includes(word)) score += 3;
    });
    
    return Math.min(20, score);
  }
  
  getSenderScore(crmData) {
    const engagementScore = crmData.engagementScore || 50;
    const dealValue = crmData.dealValue || 0;
    
    let score = 0;
    
    // Engagement score (0-15 points)
    score += (engagementScore / 100) * 15;
    
    // Deal value (0-10 points)
    if (dealValue > 100000) score += 10;
    else if (dealValue > 50000) score += 7;
    else if (dealValue > 10000) score += 4;
    
    return Math.min(25, score);
  }
  
  getComplexityScore(estimatedTime) {
    // Longer tasks get slightly higher priority to avoid procrastination
    if (estimatedTime > 180) return 15; // 3+ hours
    if (estimatedTime > 120) return 12; // 2-3 hours
    if (estimatedTime > 60) return 9;   // 1-2 hours
    if (estimatedTime > 30) return 6;   // 30-60 min
    
    return 3; // Short tasks
  }
  
  getCategoryScore(category) {
    const weights = {
      urgent: 10,
      work: 8,
      communication: 7,
      finance: 9,
      admin: 5,
      general: 3
    };
    
    return weights[category] || 5;
  }
  
  getPriorityLabel(score) {
    if (score >= 80) return 'critical';
    if (score >= 65) return 'high';
    if (score >= 45) return 'medium';
    return 'low';
  }
}

module.exports = new PriorityScorer();