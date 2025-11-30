const mockData = require('../data/mockData.json');

let contacts = [...mockData.crmContacts]; // In-memory store

class CRMController {
  
  // GET /api/crm/:email
  async getCRMData(req, res) {
    try {
     const email = decodeURIComponent(req.params.email).toLowerCase();
      const contact = contacts.find(c => c.email.toLowerCase() === email);
      
      if (!contact) {
        return res.status(404).json({
          success: false,
          error: 'Contact not found',
          email
        });
      }
      
      // Calculate recency score
      const lastContactDate = new Date(contact.lastContact);
      const daysSinceContact = Math.floor((new Date() - lastContactDate) / (1000 * 60 * 60 * 24));
      
      const enrichedContact = {
        ...contact,
        daysSinceLastContact: daysSinceContact,
        recencyScore: this.calculateRecencyScore(daysSinceContact),
        priorityLevel: this.getPriorityLevel(contact.engagementScore, contact.dealValue)
      };
      
      res.json({
        success: true,
        contact: enrichedContact
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // GET /api/crm/ranked/all
  async getRankedContacts(req, res) {
    try {
      const rankedContacts = contacts
        .map(contact => {
          const lastContactDate = new Date(contact.lastContact);
          const daysSinceContact = Math.floor((new Date() - lastContactDate) / (1000 * 60 * 60 * 24));
          
          return {
            ...contact,
            daysSinceLastContact: daysSinceContact,
            recencyScore: this.calculateRecencyScore(daysSinceContact),
            priorityLevel: this.getPriorityLevel(contact.engagementScore, contact.dealValue),
            overallScore: this.calculateOverallScore(contact, daysSinceContact)
          };
        })
        .sort((a, b) => b.overallScore - a.overallScore);
      
      res.json({
        success: true,
        count: rankedContacts.length,
        contacts: rankedContacts
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // GET /api/crm/:email/score
  async getEngagementScore(req, res) {
    try {
      const email = req.params.email.toLowerCase();
      const contact = contacts.find(c => c.email.toLowerCase() === email);
      
      if (!contact) {
        return res.status(404).json({ success: false, error: 'Contact not found' });
      }
      
      const lastContactDate = new Date(contact.lastContact);
      const daysSinceContact = Math.floor((new Date() - lastContactDate) / (1000 * 60 * 60 * 24));
      
      const score = {
        engagementScore: contact.engagementScore,
        recencyScore: this.calculateRecencyScore(daysSinceContact),
        valueScore: this.calculateValueScore(contact.dealValue),
        overallScore: this.calculateOverallScore(contact, daysSinceContact),
        recommendation: this.generateRecommendation(contact, daysSinceContact)
      };
      
      res.json({ success: true, score });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Helper methods
  calculateRecencyScore(daysSinceContact) {
    if (daysSinceContact <= 7) return 100;
    if (daysSinceContact <= 14) return 80;
    if (daysSinceContact <= 30) return 60;
    if (daysSinceContact <= 60) return 40;
    return 20;
  }
  
  calculateValueScore(dealValue) {
    if (dealValue >= 100000) return 100;
    if (dealValue >= 50000) return 80;
    if (dealValue >= 25000) return 60;
    if (dealValue >= 10000) return 40;
    return 20;
  }
  
  calculateOverallScore(contact, daysSinceContact) {
    const engagementWeight = 0.4;
    const recencyWeight = 0.3;
    const valueWeight = 0.3;
    
    const overallScore = 
      (contact.engagementScore * engagementWeight) +
      (this.calculateRecencyScore(daysSinceContact) * recencyWeight) +
      (this.calculateValueScore(contact.dealValue) * valueWeight);
    
    return Math.round(overallScore);
  }
  
  getPriorityLevel(engagementScore, dealValue) {
    if (engagementScore >= 80 && dealValue >= 50000) return 'critical';
    if (engagementScore >= 70 || dealValue >= 25000) return 'high';
    if (engagementScore >= 50 || dealValue >= 10000) return 'medium';
    return 'low';
  }
  
  generateRecommendation(contact, daysSinceContact) {
    if (daysSinceContact > 30 && contact.engagementScore > 70) {
      return 'High-value contact needs follow-up - been more than 30 days';
    }
    
    if (contact.dealValue > 50000 && daysSinceContact > 14) {
      return 'Major deal opportunity - schedule check-in call';
    }
    
    if (contact.engagementScore < 40) {
      return 'Low engagement - consider re-engagement campaign';
    }
    
    if (daysSinceContact <= 7) {
      return 'Recently contacted - maintain momentum';
    }
    
    return 'Regular follow-up recommended';
  }
}


module.exports = new CRMController();
