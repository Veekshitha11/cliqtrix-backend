// Time Debt Score Calculator
class TimeDebtCalculator {
  
  calculate(tasks) {
    const now = new Date();
    
    let totalPendingMinutes = 0;
    let totalOverdueMinutes = 0;
    let highPriorityOverdue = 0;
    let taskBreakdown = {
      overdue: [],
      dueToday: [],
      dueThisWeek: [],
      dueLater: []
    };
    
    tasks.filter(t => t.status !== 'completed').forEach(task => {
      const dueDate = new Date(task.dueDate);
      const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
      
      totalPendingMinutes += task.estimatedTime;
      
      // Categorize tasks
      if (hoursUntilDue < 0) {
        totalOverdueMinutes += task.estimatedTime;
        taskBreakdown.overdue.push(task);
        if (task.priority === 'high' || task.priority === 'critical') {
          highPriorityOverdue++;
        }
      } else if (hoursUntilDue < 24) {
        taskBreakdown.dueToday.push(task);
      } else if (hoursUntilDue < 168) {
        taskBreakdown.dueThisWeek.push(task);
      } else {
        taskBreakdown.dueLater.push(task);
      }
    });
    
    // Calculate score (0-100, higher is better)
    let score = 100;
    
    // Penalty for overdue minutes
    score -= (totalOverdueMinutes / 60) * 2; // -2 per hour overdue
    
    // Penalty for high workload
    const totalHours = totalPendingMinutes / 60;
    if (totalHours > 40) score -= 20;
    else if (totalHours > 20) score -= 10;
    
    // Penalty for high priority overdue
    score -= highPriorityOverdue * 5;
    
    // Bonus for good planning (tasks spread out)
    if (taskBreakdown.dueToday.length <= 3 && taskBreakdown.overdue.length === 0) {
      score += 10;
    }
    
    score = Math.max(0, Math.min(100, score));
    
    return {
      score: Math.round(score),
      status: this.getStatusLabel(score),
      totalPendingMinutes,
      totalOverdueMinutes,
      totalPendingHours: Math.round(totalPendingMinutes / 60 * 10) / 10,
      totalOverdueHours: Math.round(totalOverdueMinutes / 60 * 10) / 10,
      highPriorityOverdue,
      breakdown: {
        overdue: taskBreakdown.overdue.length,
        dueToday: taskBreakdown.dueToday.length,
        dueThisWeek: taskBreakdown.dueThisWeek.length,
        dueLater: taskBreakdown.dueLater.length
      },
      recommendation: this.generateRecommendation(score, taskBreakdown, totalOverdueMinutes),
      risks: this.identifyRisks(taskBreakdown, totalPendingMinutes)
    };
  }
  
  getStatusLabel(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'concerning';
    return 'critical';
  }
  
  generateRecommendation(score, breakdown, overdueMinutes) {
    if (score >= 80) {
      return 'Great job! Your task management is on track.';
    }
    
    if (breakdown.overdue.length > 0) {
      return `You have ${breakdown.overdue.length} overdue task(s). Prioritize these immediately.`;
    }
    
    if (breakdown.dueToday.length > 5) {
      return 'Heavy workload today. Consider rescheduling lower-priority items.';
    }
    
    if (overdueMinutes > 300) {
      return 'Significant time debt detected. Focus on clearing overdue items.';
    }
    
    return 'Stay focused on high-priority tasks to maintain good time management.';
  }
  
  identifyRisks(breakdown, totalMinutes) {
    const risks = [];
    
    if (breakdown.overdue.length > 3) {
      risks.push('Multiple overdue tasks may impact credibility');
    }
    
    if (breakdown.dueToday.length > 6) {
      risks.push('Overloaded schedule may lead to missed deadlines');
    }
    
    if (totalMinutes > 2400) { // More than 40 hours
      risks.push('Excessive workload detected - consider delegation');
    }
    
    const highPriorityCount = [...breakdown.overdue, ...breakdown.dueToday]
      .filter(t => t.priority === 'high' || t.priority === 'critical').length;
    
    if (highPriorityCount > 4) {
      risks.push('Multiple high-priority items need immediate attention');
    }
    
    return risks.length > 0 ? risks : ['No significant risks detected'];
  }
}

module.exports = new TimeDebtCalculator();