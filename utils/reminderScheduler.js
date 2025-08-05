const Reminder = require('../models/Reminder');
const WhatsAppService = require('../utils/whatsappService');

async function sendAutomaticReminders() {
    try {
        // Get all pending reminders that need to be sent
        const pendingReminders = await Reminder.findPendingReminders();

        for (const reminder of pendingReminders) {
            const message = WhatsAppService.generatePaymentReminder(
                reminder.customer_name,
                reminder.amount,
                reminder.due_date
            );

            const result = await WhatsAppService.sendMessage(
                reminder.sender_number,
                reminder.customer_phone,
                message
            );

            if (result.success) {
                await Reminder.recordReminder(reminder.id);
                console.log(`Reminder sent successfully for ID: ${reminder.id}`);
            } else {
                console.error(`Failed to send reminder for ID: ${reminder.id}`);
            }

            // Add a small delay between messages to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error('Error in automatic reminders:', error);
    }
}

// Schedule the task to run every 6 hours
setInterval(sendAutomaticReminders, 6 * 60 * 60 * 1000);

// Export for manual triggering if needed
module.exports = { sendAutomaticReminders };
