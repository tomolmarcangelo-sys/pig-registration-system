import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
  ssl: {
    rejectUnauthorized: boolean;
    ca?: Buffer | string; // Added this to the interface
  };
}

// 1. Determine if we are in production
const isProduction = process.env.NODE_ENV === 'production';

// 2. Setup the CA path (assumes aiven-ca.pem is in your project root)
const caPath = path.join(process.cwd(), 'aiven-ca.pem');

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
    // Enable strict verification in production
    rejectUnauthorized: isProduction,
    // Only attempt to read the file if we are in production or file exists
    ca: isProduction && fs.existsSync(caPath) 
        ? fs.readFileSync(caPath) 
        : undefined,
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
