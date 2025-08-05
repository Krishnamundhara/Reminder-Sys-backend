const db = require('../config/db');

class Reminder {
    static async create(reminderData) {
        const {
            user_id,
            customer_name,
            customer_phone,
            amount,
            due_date,
            notes
        } = reminderData;

        try {
            const result = await db.query(
                `INSERT INTO reminders 
                (user_id, customer_name, customer_phone, amount, due_date, notes)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [user_id, customer_name, customer_phone, amount, due_date, notes]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error creating reminder:', error);
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const result = await db.query(
                'SELECT * FROM reminders WHERE user_id = $1 ORDER BY due_date DESC',
                [userId]
            );
            return result.rows;
        } catch (error) {
            console.error('Error finding reminders:', error);
            throw error;
        }
    }

    static async updateStatus(id, status) {
        try {
            const result = await db.query(
                `UPDATE reminders 
                SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *`,
                [status, id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error updating reminder status:', error);
            throw error;
        }
    }

    static async recordReminder(id) {
        try {
            const result = await db.query(
                `UPDATE reminders 
                SET last_reminded_at = CURRENT_TIMESTAMP,
                    reminder_count = reminder_count + 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *`,
                [id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error recording reminder:', error);
            throw error;
        }
    }

    static async findPendingReminders() {
        try {
            const result = await db.query(
                `SELECT r.*, u.whatsapp_number as sender_number 
                FROM reminders r
                JOIN users u ON r.user_id = u.id
                WHERE r.payment_status = 'PENDING'
                AND (r.last_reminded_at IS NULL 
                     OR r.last_reminded_at < CURRENT_TIMESTAMP - INTERVAL '24 hours')
                AND r.due_date <= CURRENT_DATE + INTERVAL '7 days'
                ORDER BY r.due_date ASC`
            );
            return result.rows;
        } catch (error) {
            console.error('Error finding pending reminders:', error);
            throw error;
        }
    }
}

module.exports = Reminder;
