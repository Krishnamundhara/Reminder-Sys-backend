const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runMigration() {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, 'create_reminders_table.sql'),
            'utf8'
        );

        await db.query(sql);
        console.log('Reminders table created successfully');
    } catch (error) {
        console.error('Error creating reminders table:', error);
        throw error;
    }
}

runMigration().catch(console.error);
