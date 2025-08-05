const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runMigration() {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, 'add_whatsapp_number_column.sql'),
            'utf8'
        );

        await db.query(sql);
        console.log('WhatsApp number column added successfully');
    } catch (error) {
        console.error('Error adding WhatsApp number column:', error);
        throw error;
    }
}

runMigration().catch(console.error);
