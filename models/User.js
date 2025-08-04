const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT id, username, email, full_name, phone_number, role, is_approved, is_active, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }
  
  static async findByIdWithPassword(id) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user with password by ID:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async updateRole(userId, newRole) {
    try {
      // Validate role
      const validRoles = ['user', 'admin'];
      if (!validRoles.includes(newRole)) {
        throw new Error('Invalid role specified');
      }
      
      const result = await db.query(
        'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, email, full_name, phone_number, role, is_approved, is_active, created_at, updated_at',
        [newRole, userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  static async findByPhoneNumber(phoneNumber) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE phone_number = $1',
        [phoneNumber]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by phone number:', error);
      throw error;
    }
  }

  static async create({ username, email, password, full_name, phone_number = null, role = 'user', is_approved = false, email_verified = false }) {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await db.query(
        'INSERT INTO users (username, email, password, full_name, phone_number, role, is_approved, email_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, username, email, full_name, phone_number, role, is_approved, is_active, email_verified, created_at, updated_at',
        [username, email, hashedPassword, full_name, phone_number, role, is_approved, email_verified]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    try {
      const allowedUpdates = ['full_name', 'email', 'is_approved', 'is_active'];
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;
      
      // Build dynamic update query
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key) && updates[key] !== undefined) {
          updateFields.push(`${key} = $${paramIndex}`);
          updateValues.push(updates[key]);
          paramIndex++;
        }
      });
      
      // Add updated_at timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      
      // Add user ID at the end of parameters
      updateValues.push(id);
      
      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING id, username, email, full_name, role, is_approved, is_active, created_at, updated_at
      `;
      
      const result = await db.query(query, updateValues);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await db.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async getPendingUsers() {
    try {
      const result = await db.query(
        'SELECT id, username, email, full_name, phone_number, role, is_approved, is_active, email_verified, created_at, updated_at FROM users WHERE is_approved = false AND role != $1 ORDER BY created_at DESC',
        ['admin']
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting pending users:', error);
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      const result = await db.query(
        'SELECT id, username, email, full_name, phone_number, role, is_approved, is_active, email_verified, created_at, updated_at FROM users ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }
  
  static async getApprovedUsers() {
    try {
      const result = await db.query(
        'SELECT id, username, email, full_name, phone_number, role, is_approved, is_active, email_verified, created_at, updated_at FROM users WHERE is_approved = true ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting approved users:', error);
      throw error;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }
}

module.exports = User;
