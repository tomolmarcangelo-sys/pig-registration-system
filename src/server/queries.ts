import { query } from './db.js';

// Get all users
export async function getAllUsers() {
  return await query(
    'SELECT id, username, email, first_name, last_name, barangay, role, is_active FROM users'
  );
}

// Get user by ID
export async function getUserById(userId: number) {
  const rows: any = await query('SELECT * FROM users WHERE id = ?', [userId]);
  return rows[0] || null;
}

// Get all pigs
export async function getAllPigs() {
  return await query(`
    SELECT p.*, u.username as owner_name 
    FROM pigs p 
    JOIN users u ON p.user_id = u.id 
    ORDER BY p.created_at DESC
  `);
}

// Get pigs by user ID
export async function getPigsByUserId(userId: number) {
  return await query('SELECT * FROM pigs WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

// Get pig by ID
export async function getPigById(pigId: number) {
  const rows: any = await query('SELECT * FROM pigs WHERE id = ?', [pigId]);
  return rows[0] || null;
}

// Create new pig
export async function createPig(pigData: any) {
  const { user_id, name, breed, age_months, weight_kg, gender, status, purchase_date, cost, description, image_url } = pigData;
  
  const result: any = await query(
    `INSERT INTO pigs (user_id, name, breed, age_months, weight_kg, gender, status, purchase_date, cost, description, image_url) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, name, breed, age_months, weight_kg, gender, status, purchase_date, cost, description, image_url]
  );
  
  return result.insertId;
}

// Update pig
export async function updatePig(pigId: number, pigData: any) {
  const { name, breed, age_months, weight_kg, gender, status, description, image_url } = pigData;
  
  await query(
    `UPDATE pigs SET name = ?, breed = ?, age_months = ?, weight_kg = ?, gender = ?, status = ?, description = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [name, breed, age_months, weight_kg, gender, status, description, image_url, pigId]
  );
}

// Delete pig
export async function deletePig(pigId: number) {
  await query('DELETE FROM pigs WHERE id = ?', [pigId]);
}

// Get health records for a pig
export async function getHealthRecords(pigId: number) {
  return await query(
    `SELECT hr.*, u.first_name, u.last_name 
     FROM health_records hr 
     LEFT JOIN users u ON hr.veterinarian_id = u.id 
     WHERE hr.pig_id = ? 
     ORDER BY hr.record_date DESC`,
    [pigId]
  );
}

// Create health record
export async function createHealthRecord(recordData: any) {
  const { pig_id, veterinarian_id, record_type, description, diagnosis, treatment, cost, record_date, next_followup_date } = recordData;
  
  const result: any = await query(
    `INSERT INTO health_records (pig_id, veterinarian_id, record_type, description, diagnosis, treatment, cost, record_date, next_followup_date) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [pig_id, veterinarian_id, record_type, description, diagnosis, treatment, cost, record_date, next_followup_date]
  );
  
  return result.insertId;
}

// Get all barangays
export async function getBarangays() {
  return await query('SELECT * FROM barangays ORDER BY name');
}

// Get messages for user
export async function getMessages(recipientId: number, unreadOnly: boolean = false) {
  let sql = `
    SELECT m.*, u.first_name, u.last_name, u.profile_image_url 
    FROM messages m 
    JOIN users u ON m.sender_id = u.id 
    WHERE m.recipient_id = ?`;
  
  if (unreadOnly) {
    sql += ' AND m.is_read = FALSE';
  }
  
  sql += ' ORDER BY m.created_at DESC';
  
  return await query(sql, [recipientId]);
}

// Send message
export async function sendMessage(messageData: any) {
  const { sender_id, recipient_id, subject, message } = messageData;
  
  const result: any = await query(
    `INSERT INTO messages (sender_id, recipient_id, subject, message, is_read) 
     VALUES (?, ?, ?, ?, FALSE)`,
    [sender_id, recipient_id, subject, message]
  );
  
  return result.insertId;
}

// Mark message as read
export async function markMessageAsRead(messageId: number) {
  await query('UPDATE messages SET is_read = TRUE WHERE id = ?', [messageId]);
}

// Get statistics
export async function getStatistics() {
  const totalUsers: any = await query('SELECT COUNT(*) as count FROM users');
  const totalPigs: any = await query('SELECT COUNT(*) as count FROM pigs');
  const healthyPigs: any = await query("SELECT COUNT(*) as count FROM pigs WHERE status = 'healthy'");
  const sickPigs: any = await query("SELECT COUNT(*) as count FROM pigs WHERE status = 'sick'");
  
  return {
    totalUsers: totalUsers[0].count,
    totalPigs: totalPigs[0].count,
    healthyPigs: healthyPigs[0].count,
    sickPigs: sickPigs[0].count,
  };
}

// Create activity log
export async function createActivityLog(logData: any) {
  const { user_id, action, entity_type, entity_id, details, ip_address } = logData;
  
  await query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, action, entity_type, entity_id, JSON.stringify(details), ip_address]
  );
}
