const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');

// Get CRM data by email
router.get('/:email', crmController.getCRMData);

// Get ranked contacts
router.get('/ranked/all', crmController.getRankedContacts);

// Get contact engagement score
router.get('/:email/score', crmController.getEngagementScore);

module.exports = router;