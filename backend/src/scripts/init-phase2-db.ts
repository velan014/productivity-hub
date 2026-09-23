import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3307;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'productivity_app';

async function migratePhase2() {
  console.log('🔄 Connecting to MySQL server on port', DB_PORT);
  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true,
    });

    console.log(`✅ Connected to database "${DB_NAME}".`);

    // Create Goals Table
    console.log('📦 Creating goals table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`goals\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`description\` TEXT DEFAULT NULL,
        \`category\` VARCHAR(50) DEFAULT 'General',
        \`priority\` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
        \`status\` ENUM('active', 'completed', 'paused') NOT NULL DEFAULT 'active',
        \`progress\` INT NOT NULL DEFAULT 0,
        \`start_date\` DATE DEFAULT NULL,
        \`target_date\` DATE DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`completed_at\` TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_goals_user_id\` (\`user_id\`),
        KEY \`idx_goals_user_status\` (\`user_id\`, \`status\`),
        KEY \`idx_goals_user_target_date\` (\`user_id\`, \`target_date\`),
        KEY \`idx_goals_user_priority\` (\`user_id\`, \`priority\`),
        CONSTRAINT \`fk_goals_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create Habits Table
    console.log('📦 Creating habits table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`habits\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT DEFAULT NULL,
        \`category\` VARCHAR(50) DEFAULT 'General',
        \`frequency\` ENUM('daily', 'weekly') NOT NULL DEFAULT 'daily',
        \`target_count\` INT NOT NULL DEFAULT 1,
        \`color\` VARCHAR(50) DEFAULT 'emerald',
        \`icon\` VARCHAR(50) DEFAULT 'Repeat',
        \`active\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_habits_user_id\` (\`user_id\`),
        KEY \`idx_habits_user_active\` (\`user_id\`, \`active\`),
        CONSTRAINT \`fk_habits_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create Habit Logs Table
    console.log('📦 Creating habit_logs table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`habit_logs\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`habit_id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`log_date\` DATE NOT NULL,
        \`completed\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`completed_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_habit_log_date\` (\`habit_id\`, \`log_date\`),
        KEY \`idx_habit_logs_user_date\` (\`user_id\`, \`log_date\`),
        KEY \`idx_habit_logs_habit_id\` (\`habit_id\`),
        CONSTRAINT \`fk_habit_logs_habit_id\` FOREIGN KEY (\`habit_id\`) REFERENCES \`habits\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_habit_logs_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create Focus Sessions Table
    console.log('📦 Creating focus_sessions table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`focus_sessions\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`task_id\` VARCHAR(36) DEFAULT NULL,
        \`mode\` ENUM('focus', 'short_break', 'long_break') NOT NULL DEFAULT 'focus',
        \`planned_minutes\` INT NOT NULL DEFAULT 25,
        \`actual_minutes\` INT NOT NULL DEFAULT 25,
        \`started_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`ended_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`completed\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_focus_user_started\` (\`user_id\`, \`started_at\`),
        KEY \`idx_focus_user_task\` (\`user_id\`, \`task_id\`),
        CONSTRAINT \`fk_focus_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_focus_task_id\` FOREIGN KEY (\`task_id\`) REFERENCES \`tasks\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create Notes Table
    console.log('📦 Creating notes table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`notes\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL DEFAULT 'Untitled Note',
        \`content\` MEDIUMTEXT DEFAULT NULL,
        \`category\` VARCHAR(50) DEFAULT 'General',
        \`is_pinned\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_notes_user_id\` (\`user_id\`),
        KEY \`idx_notes_user_updated\` (\`user_id\`, \`updated_at\`),
        KEY \`idx_notes_user_pinned\` (\`user_id\`, \`is_pinned\`),
        CONSTRAINT \`fk_notes_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ All Phase 2 tables created successfully without modifying existing tables or data!');

    // Optional demo user additions if tables are empty for demo user
    const demoUserId = 'demo-user-velan-001';
    const [existingGoals]: any = await connection.query('SELECT COUNT(*) as count FROM goals WHERE user_id = ?', [demoUserId]);
    if (existingGoals[0].count === 0) {
      console.log('🌱 Populating initial Phase 2 demo data for Velan...');
      
      // Goals
      await connection.query(`
        INSERT INTO goals (id, user_id, title, description, category, priority, status, progress, start_date, target_date, created_at)
        VALUES 
        ('goal-demo-1', ?, 'Complete Full Stack Certification', 'Finish React, Node.js, and Database modules with high distinction.', 'Career', 'high', 'active', 65, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NOW()),
        ('goal-demo-2', ?, 'Read 12 Technical Books This Year', 'Cover Distributed Systems, Clean Architecture, and AI engineering topics.', 'Learning', 'medium', 'active', 40, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY), NOW()),
        ('goal-demo-3', ?, 'Build Personal Productivity Ecosystem', 'Design, test, and ship Phase 1 and Phase 2 modules seamlessly.', 'Projects', 'high', 'active', 85, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), NOW())
      `, [demoUserId, demoUserId, demoUserId]);

      // Habits
      await connection.query(`
        INSERT INTO habits (id, user_id, name, description, category, frequency, target_count, color, icon, active, created_at)
        VALUES 
        ('habit-demo-1', ?, 'Study 1 hour', 'Focused study on software engineering or DBMS topics.', 'Study', 'daily', 1, 'emerald', 'BookOpen', 1, NOW()),
        ('habit-demo-2', ?, 'Exercise 30 mins', 'Morning cardio or strength training routine.', 'Health', 'daily', 1, 'cyan', 'Activity', 1, NOW()),
        ('habit-demo-3', ?, 'Read 20 pages', 'Non-fiction or software architecture book.', 'Learning', 'daily', 1, 'amber', 'BookMarked', 1, NOW()),
        ('habit-demo-4', ?, 'Practice coding', 'Solve at least 1 algorithm challenge or build a feature.', 'Development', 'daily', 1, 'indigo', 'Code', 1, NOW()),
        ('habit-demo-5', ?, 'Drink 2.5L water', 'Stay hydrated throughout work sprints.', 'Health', 'daily', 1, 'blue', 'Droplet', 1, NOW())
      `, [demoUserId, demoUserId, demoUserId, demoUserId, demoUserId]);

      // Habit Logs for yesterday and today
      await connection.query(`
        INSERT INTO habit_logs (id, habit_id, user_id, log_date, completed, completed_at)
        VALUES 
        ('log-demo-1', 'habit-demo-1', ?, CURDATE(), 1, NOW()),
        ('log-demo-2', 'habit-demo-2', ?, CURDATE(), 1, NOW()),
        ('log-demo-3', 'habit-demo-1', ?, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, NOW()),
        ('log-demo-4', 'habit-demo-2', ?, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, NOW()),
        ('log-demo-5', 'habit-demo-3', ?, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, NOW()),
        ('log-demo-6', 'habit-demo-4', ?, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, NOW()),
        ('log-demo-7', 'habit-demo-1', ?, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, NOW()),
        ('log-demo-8', 'habit-demo-2', ?, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, NOW())
      `, [demoUserId, demoUserId, demoUserId, demoUserId, demoUserId, demoUserId, demoUserId, demoUserId]);

      // Focus Sessions
      await connection.query(`
        INSERT INTO focus_sessions (id, user_id, task_id, mode, planned_minutes, actual_minutes, started_at, ended_at, completed)
        VALUES 
        ('focus-demo-1', ?, 'task-demo-001', 'focus', 25, 25, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 95 MINUTE), 1),
        ('focus-demo-2', ?, 'task-demo-002', 'focus', 25, 25, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 35 MINUTE), 1)
      `, [demoUserId, demoUserId]);

      // Notes
      await connection.query(`
        INSERT INTO notes (id, user_id, title, content, category, is_pinned, created_at, updated_at)
        VALUES 
        ('note-demo-1', ?, 'Productivity App Architecture Notes', 'Phase 2 Architecture:\n- Goals: Long-term targets with progress tracking (0-100%)\n- Habits: Daily/Weekly consistency streaks and logs\n- Calendar: Unified timeline view across tasks, habits, and focus\n- Focus: Reliable timestamp-based Pomodoro timer\n- Notes: Fast dual-pane markdown notes', 'Work', 1, NOW(), NOW()),
        ('note-demo-2', ?, 'Database Indexing Guidelines', 'Remember to always index (user_id, status) and (user_id, date) compound filters for optimal B-Tree performance on multi-tenant tables.', 'Study', 0, NOW(), NOW())
      `, [demoUserId, demoUserId]);

      console.log('✅ Demo data created for Velan.');
    }
  } catch (err: any) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migratePhase2();
