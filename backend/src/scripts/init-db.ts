import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'productivity_app';

async function initDatabase() {
  console.log('🔄 Connecting to MySQL server to initialize database...');
  console.log(`Host: ${DB_HOST}:${DB_PORT}, User: ${DB_USER}`);

  let connection;
  try {
    // 1. Connect without specific DB to create database
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
    });

    console.log('✅ Connection established.');

    // 2. Read schema.sql
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('📦 Executing schema.sql...');
    await connection.query(schemaSql);
    console.log(`✅ Schema created successfully for database "${DB_NAME}".`);

    // 3. Reconnect specifying database or use DB
    await connection.changeUser({ database: DB_NAME });

    // 4. Generate fresh bcrypt hash for demo user
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('password123', salt);

    // Upsert demo user
    const demoUserId = 'demo-user-velan-001';
    await connection.query(
      `INSERT INTO users (id, name, email, password_hash, avatar, created_at, updated_at)
       VALUES (?, 'Velan', 'velan@example.com', ?, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', NOW(), NOW())
       ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), avatar = VALUES(avatar)`,
      [demoUserId, demoPasswordHash]
    );

    // Clear existing demo tasks
    await connection.query('DELETE FROM tasks WHERE user_id = ?', [demoUserId]);

    // Insert 9 high quality demo tasks
    const tasks = [
      {
        id: 'task-demo-001',
        title: 'Complete project documentation',
        description: 'Write architecture overview, API specifications, and database schema documentation for Phase 1.',
        priority: 'high',
        status: 'in_progress',
        category: 'Work',
        due_date: new Date().toISOString().slice(0, 10),
        due_time: '17:00:00',
        estimated_minutes: 90,
        completed_at: null,
      },
      {
        id: 'task-demo-002',
        title: 'Study DBMS',
        description: 'Revise indexing strategies, query execution plans, and transaction isolation levels.',
        priority: 'high',
        status: 'todo',
        category: 'Study',
        due_date: new Date().toISOString().slice(0, 10),
        due_time: '19:00:00',
        estimated_minutes: 60,
        completed_at: null,
      },
      {
        id: 'task-demo-003',
        title: 'Practice SQL',
        description: 'Solve complex join and aggregation queries on LeetCode / HackerRank database challenges.',
        priority: 'medium',
        status: 'completed',
        category: 'Study',
        due_date: new Date().toISOString().slice(0, 10),
        due_time: '20:00:00',
        estimated_minutes: 45,
        completed_at: new Date(),
      },
      {
        id: 'task-demo-004',
        title: 'Practice Python',
        description: 'Implement asynchronous file processing and data parsing routines.',
        priority: 'medium',
        status: 'todo',
        category: 'Development',
        due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        due_time: '11:00:00',
        estimated_minutes: 60,
        completed_at: null,
      },
      {
        id: 'task-demo-005',
        title: 'Work on Smart Irrigation',
        description: 'Calibrate soil moisture sensor thresholds and test automated pump trigger logic.',
        priority: 'high',
        status: 'todo',
        category: 'Projects',
        due_date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        due_time: '15:30:00',
        estimated_minutes: 120,
        completed_at: null,
      },
      {
        id: 'task-demo-006',
        title: 'Review AI notes',
        description: 'Go through Transformer architecture, multi-head attention math, and embeddings.',
        priority: 'low',
        status: 'todo',
        category: 'Study',
        due_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
        due_time: '18:00:00',
        estimated_minutes: 45,
        completed_at: null,
      },
      {
        id: 'task-demo-007',
        title: 'Work on NLP Translator',
        description: 'Fine-tune small language model on conversational bilingual dataset.',
        priority: 'medium',
        status: 'in_progress',
        category: 'Projects',
        due_date: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
        due_time: '16:00:00',
        estimated_minutes: 90,
        completed_at: null,
      },
      {
        id: 'task-demo-008',
        title: 'Prepare presentation',
        description: 'Create clean slide deck summarizing project sprint progress and next milestones.',
        priority: 'medium',
        status: 'todo',
        category: 'Work',
        due_date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
        due_time: '14:00:00',
        estimated_minutes: 60,
        completed_at: null,
      },
      {
        id: 'task-demo-009',
        title: 'Weekly workspace clean up',
        description: 'Organize desk setup, backup local code repositories, and clear old downloads.',
        priority: 'low',
        status: 'completed',
        category: 'Personal',
        due_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        due_time: '10:00:00',
        estimated_minutes: 30,
        completed_at: new Date(Date.now() - 86400000),
      },
    ];

    for (const t of tasks) {
      await connection.query(
        `INSERT INTO tasks (id, user_id, title, description, priority, status, category, due_date, due_time, estimated_minutes, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          t.id,
          demoUserId,
          t.title,
          t.description,
          t.priority,
          t.status,
          t.category,
          t.due_date,
          t.due_time,
          t.estimated_minutes,
          t.completed_at,
        ]
      );
    }

    console.log('✅ Seed data successfully inserted!');
    console.log('👤 Demo User: velan@example.com (password: password123)');
    console.log(`📋 Inserted ${tasks.length} demo tasks.`);
  } catch (error: any) {
    console.error('❌ Database initialization error:', error.message || error.code || error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
