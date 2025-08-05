const express = require('express');
const router = express.Router();
const ReminderController = require('../controllers/reminderController');
const { authenticateToken, requireApproved } = require('../utils/authMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireApproved);

// Create a new reminder
router.post('/', ReminderController.createReminder);

// Get all reminders for the current user
router.get('/', ReminderController.getUserReminders);

// Update reminder status
router.patch('/:id/status', ReminderController.updateReminderStatus);

// Send a manual reminder
router.post('/:id/send', ReminderController.sendManualReminder);

module.exports = router;
