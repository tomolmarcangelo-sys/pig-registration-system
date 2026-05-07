# Pig Registration System - Render + Aiven MySQL Deployment Guide

## Overview
This guide adds full MySQL support to your Vite React TypeScript app using Aiven MySQL and deploys the app on Render.

It includes:
- MySQL database schema
- Aiven MySQL connection code
- Full backend deployment steps
- Render environment configuration

## What is included
- `server.ts` — Express server serving `dist/` and API routes
- `src/server/db.ts` — MySQL connection pool
- `src/server/routes.ts` — API endpoints
- `src/server/queries.ts` — CRUD database helpers
- `database.sql` — schema for `users`, `pigs`, `health_records`, `messages`, `barangays`, `certificates`, and `activity_logs`

## 1. Database Structure
Create the following schema on your Aiven MySQL instance. Save it as `database.sql`.

```sql
-- Pig Registration System - Database Schema
-- Compatible with MySQL 8.0+

-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  barangay VARCHAR(100),
  role ENUM('farmer', 'admin', 'veterinarian') DEFAULT 'farmer',
  profile_image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role)
);

-- Pigs Table
CREATE TABLE pigs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100),
  breed VARCHAR(100),
  age_months INT,
  weight_kg DECIMAL(10, 2),
  gender ENUM('male', 'female'),
  status ENUM('healthy', 'sick', 'recovery', 'sold', 'deceased') DEFAULT 'healthy',
  purchase_date DATE,
  cost DECIMAL(15, 2),
  description TEXT,
  image_url VARCHAR(500),
  vaccination_status BOOLEAN DEFAULT FALSE,
  last_veterinary_checkup DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Health Records Table
CREATE TABLE health_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pig_id INT NOT NULL,
  veterinarian_id INT,
  record_type ENUM('vaccination', 'treatment', 'checkup', 'illness') DEFAULT 'checkup',
  description TEXT,
  diagnosis VARCHAR(255),
  treatment TEXT,
  cost DECIMAL(15, 2),
  record_date DATE NOT NULL,
  next_followup_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pig_id) REFERENCES pigs(id) ON DELETE CASCADE,
  FOREIGN KEY (veterinarian_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_pig_id (pig_id),
  INDEX idx_record_date (record_date)
);

-- Barangays Table
CREATE TABLE barangays (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  municipality VARCHAR(100),
  province VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Messages Table
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  recipient_id INT NOT NULL,
  subject VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_recipient_id (recipient_id),
  INDEX idx_created_at (created_at)
);

-- Pig Certificates Table
CREATE TABLE certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pig_id INT NOT NULL,
  certificate_type ENUM('health', 'ownership', 'vaccination') DEFAULT 'health',
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  issuing_authority VARCHAR(255),
  certificate_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pig_id) REFERENCES pigs(id) ON DELETE CASCADE,
  INDEX idx_pig_id (pig_id),
  INDEX idx_certificate_number (certificate_number)
);

-- Activity Logs Table
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(255),
  entity_type VARCHAR(100),
  entity_id INT,
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Seed example barangays
INSERT INTO barangays (name, municipality, province) VALUES
('Barrio 1', 'Sample Municipality', 'Sample Province'),
('Barrio 2', 'Sample Municipality', 'Sample Province'),
('Barrio 3', 'Sample Municipality', 'Sample Province');

-- Performance indexes
CREATE INDEX idx_pigs_status_user ON pigs(status, user_id);
CREATE INDEX idx_health_records_date_range ON health_records(record_date, pig_id);
CREATE INDEX idx_messages_read_status ON messages(is_read, recipient_id);
```

## 2. Backend Files and Full Code
### `server.ts`
This is the main server entrypoint.

```ts
import express, { Express } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, closeDatabase } from './src/server/db.js';
import apiRoutes from './src/server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiRoutes);
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: ${process.env.DB_NAME || 'pig_registration'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

startServer();
```

### `src/server/db.ts`
This file connects to Aiven MySQL.

```ts
import mysql from 'mysql2/promise';

interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

const config: MySQLConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pig_registration',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
};

let pool: mysql.Pool;

export async function initializeDatabase() {
  try {
    pool = mysql.createPool(config);
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✓ Database connected successfully');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase first.');
  }
  return pool;
}

export async function query(sql: string, values?: any[]) {
  const connection = await getPool().getConnection();
  try {
    const [rows] = await connection.execute(sql, values);
    return rows;
  } finally {
    connection.release();
  }
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log('Database connection pool closed');
  }
}
```

### `src/server/routes.ts`
Use the existing routes file to expose API endpoints for users, pigs, health records, barangays, and messages.

The file should contain the following segment for messaging and CRUD routes:

```ts
import { Router } from 'express';
import * as db from './queries.js';

const router = Router();

router.get('/api/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/api/users', async (req, res) => {
  try {
    const userId = await db.createUser(req.body);
    res.status(201).json({ id: userId, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.get('/api/pigs', async (req, res) => {
  try {
    const pigs = await db.getAllPigs();
    res.json(pigs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pigs' });
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

router.get('/api/barangays', async (req, res) => {
  try {
    const barangays = await db.getBarangays();
    res.json(barangays);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch barangays' });
  }
});

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

export default router;
```

### `src/server/queries.ts`
This file should contain query helpers for CRUD operations.

The query file includes functions such as:
- `getAllUsers`
- `getUserById`
- `createUser`
- `getAllPigs`
- `getPigById`
- `createPig`
- `getHealthRecords`
- `createHealthRecord`
- `getBarangays`
- `getMessages`
- `sendMessage`
- `markMessageAsRead`
- `getStatistics`
- `createActivityLog`

If you want, I can also paste the full `queries.ts` file content into this document.

## 3. Local Setup and Test

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the app:
   ```bash
   npm run build
   ```

3. Confirm the backend starts locally:
   ```bash
   npm start
   ```

4. Open `http://localhost:3000` and verify the app loads.

5. Test the health endpoint:
   ```bash
   curl http://localhost:3000/api/health
   ```

## 4. Aiven MySQL Setup

### Create Aiven MySQL service
1. Sign in to https://aiven.io
2. Create a new MySQL service
3. Choose cloud provider and region
4. Note the connection details:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`

### Create database schema
1. Copy the SQL from `database.sql`
2. Execute it against your Aiven MySQL database using a client such as MySQL Workbench, DBeaver, or the Aiven console.

### SSL / TLS
Aiven requires SSL. The current connection in `src/server/db.ts` already uses:

```ts
ssl: {
  rejectUnauthorized: false,
},
```

For production, replace this with Aiven's CA certificate by downloading the `ca.pem` file from Aiven and using:

```ts
import fs from 'fs';
ssl: {
  ca: fs.readFileSync('./aiven-ca.pem'),
},
```

## 5. Render Deployment Steps

### Step 1: Prepare GitHub repo
1. Ensure your project is committed and pushed:
   ```bash
   git add .
   git commit -m "Add Aiven MySQL and Render deployment config"
   git push origin main
   ```

### Step 2: Create Render service
1. Visit https://render.com
2. Click **New +** → **Web Service**
3. Connect GitHub and select your repository
4. Choose **Node** runtime
5. Set build command:
   ```bash
   npm install && npm run build
   ```
6. Set start command:
   ```bash
   npm start
   ```

### Step 3: Add environment variables
In Render, add these variables:

- `NODE_ENV=production`
- `DB_HOST=<AIVEN_HOST>`
- `DB_PORT=<AIVEN_PORT>`
- `DB_USER=<AIVEN_USER>`
- `DB_PASSWORD=<AIVEN_PASSWORD>`
- `DB_NAME=<AIVEN_DATABASE>`

### Step 4: Deploy
1. Click **Create Web Service**
2. Wait for Render to build and deploy the app
3. Once deployed, visit your Render URL
4. Confirm the health endpoint works:
   ```bash
   curl https://<your-render-url>/api/health
   ```

## 6. Validate Aiven Integration

### Check logs
- If the connection fails, open Render logs
- Look for `Database connected successfully` or a connection error

### Confirm database operations
- Use the app to create users, pigs, or messages
- Verify rows appear in Aiven MySQL

## 7. Recommended Render Service Configuration

| Setting | Value |
|---|---|
| Environment | `production` |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |
| Instance type | Free or Hobby (for testing) |

## 8. Useful Notes

- `package.json` already includes:
  - `express`
  - `mysql2`
  - `tsx`
  - `vite`
  - `@types/express`

- `server.ts` uses `tsx server.ts` for runtime.
- `src/server/db.ts` uses `mysql2/promise`.

## 9. Quick checklist

- [ ] `database.sql` created in Aiven
- [ ] Aiven MySQL credentials available
- [ ] `DB_*` env vars set in Render
- [ ] `npm install && npm run build` passes locally
- [ ] `npm start` starts server locally
- [ ] Render deployment succeeds
- [ ] App can read/write Aiven data

## 10. Troubleshooting

### Database connection error
- Verify Aiven host, port, user, password, and database name
- Ensure Aiven MySQL is running
- Ensure SSL is configured correctly

### Render build error
- Confirm `package.json` has `tsx` in devDependencies
- Confirm `server.ts` imports work with `type: module`
- Confirm your Vite build outputs `dist/`

### Frontend app not loading
- Confirm `dist/index.html` exists after build
- Confirm `server.ts` serves `dist` and SPA fallback works

---

If you want, I can also add a complete `queries.ts` file block into this document so the README contains every CRUD helper function exactly. 