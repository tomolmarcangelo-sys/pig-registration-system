import { Router } from 'express';
import * as db from './queries.js';

const router = Router();

// ===== USERS ENDPOINTS =====

router.get('/api/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.getUserById(parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ===== PIGS ENDPOINTS =====

router.get('/api/pigs', async (req, res) => {
  try {
    const pigs = await db.getAllPigs();
    res.json(pigs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pigs' });
  }
});

router.get('/api/pigs/user/:userId', async (req, res) => {
  try {
    const pigs = await db.getPigsByUserId(parseInt(req.params.userId));
    res.json(pigs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pigs' });
  }
});

router.get('/api/pigs/:id', async (req, res) => {
  try {
    const pig = await db.getPigById(parseInt(req.params.id));
    if (!pig) return res.status(404).json({ error: 'Pig not found' });
    res.json(pig);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pig' });
  }
});

router.post('/api/pigs', async (req, res) => {
  try {
    const pigId = await db.createPig(req.body);
    res.status(201).json({ id: pigId, message: 'Pig created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pig' });
  }
});

router.put('/api/pigs/:id', async (req, res) => {
  try {
    await db.updatePig(parseInt(req.params.id), req.body);
    res.json({ message: 'Pig updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pig' });
  }
});

router.delete('/api/pigs/:id', async (req, res) => {
  try {
    await db.deletePig(parseInt(req.params.id));
    res.json({ message: 'Pig deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pig' });
  }
});

// ===== HEALTH RECORDS ENDPOINTS =====

router.get('/api/health-records/:pigId', async (req, res) => {
  try {
    const records = await db.getHealthRecords(parseInt(req.params.pigId));
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
});

router.post('/api/health-records', async (req, res) => {
  try {
    const recordId = await db.createHealthRecord(req.body);
    res.status(201).json({ id: recordId, message: 'Health record created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create health record' });
  }
});

// ===== BARANGAYS ENDPOINTS =====

router.get('/api/barangays', async (req, res) => {
  try {
    const barangays = await db.getBarangays();
    res.json(barangays);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch barangays' });
  }
});

// ===== MESSAGES ENDPOINTS =====

router.get('/api/messages/:userId', async (req, res) => {
  try {
    const unread = req.query.unread === 'true';
    const messages = await db.getMessages(parseInt(req.params.userId), unread);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/api/messages', async (req, res) => {
  try {
    const messageId = await db.sendMessage(req.body);
    res.status(201).json({ id: messageId, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.put('/api/messages/:id/read', async (req, res) => {
  try {
    await db.markMessageAsRead(parseInt(req.params.id));
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// ===== STATISTICS ENDPOINTS =====

router.get('/api/statistics', async (req, res) => {
  try {
    const stats = await db.getStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ===== ACTIVITY LOG ENDPOINTS =====

router.post('/api/activity-log', async (req, res) => {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    await db.createActivityLog({
      ...req.body,
      ip_address: clientIp,
    });
    res.status(201).json({ message: 'Activity logged' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

export default router;
