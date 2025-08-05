const Reminder = require('../models/Reminder');
const WhatsAppService = require('../utils/whatsappService');

class ReminderController {
    static async createReminder(req, res) {
        try {
            const reminderData = {
                user_id: req.user.id,
                customer_name: req.body.customer_name,
                customer_phone: req.body.customer_phone,
                amount: req.body.amount,
                due_date: req.body.due_date,
                notes: req.body.notes
            };

            const reminder = await Reminder.create(reminderData);
            res.status(201).json({ success: true, reminder });
        } catch (error) {
            console.error('Error creating reminder:', error);
            res.status(500).json({ success: false, message: 'Error creating reminder' });
        }
    }

    static async getUserReminders(req, res) {
        try {
            const reminders = await Reminder.findByUserId(req.user.id);
            res.json({ success: true, reminders });
        } catch (error) {
            console.error('Error fetching reminders:', error);
            res.status(500).json({ success: false, message: 'Error fetching reminders' });
        }
    }

    static async updateReminderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const reminder = await Reminder.updateStatus(id, status);
            res.json({ success: true, reminder });
        } catch (error) {
            console.error('Error updating reminder:', error);
            res.status(500).json({ success: false, message: 'Error updating reminder' });
        }
    }

    static async sendManualReminder(req, res) {
        try {
            const { id } = req.params;
            const reminder = await Reminder.findById(id);

            if (!reminder) {
                return res.status(404).json({ success: false, message: 'Reminder not found' });
            }

            const message = WhatsAppService.generatePaymentReminder(
                reminder.customer_name,
                reminder.amount,
                reminder.due_date
            );

            const result = await WhatsAppService.sendMessage(
                req.user.whatsapp_number,
                reminder.customer_phone,
                message
            );

            if (result.success) {
                await Reminder.recordReminder(id);
                res.json({ success: true, message: 'Reminder sent successfully' });
            } else {
                res.status(500).json({ success: false, message: 'Failed to send reminder' });
            }
        } catch (error) {
            console.error('Error sending reminder:', error);
            res.status(500).json({ success: false, message: 'Error sending reminder' });
        }
    }
}

module.exports = ReminderController;
