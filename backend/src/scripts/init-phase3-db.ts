import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3307;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'productivity_app';

export async function migratePhase3() {
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

    // 1. Create Projects Table
    console.log('📦 Creating projects table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`projects\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT DEFAULT NULL,
        \`status\` ENUM('planning', 'active', 'completed', 'archived') NOT NULL DEFAULT 'planning',
        \`priority\` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
        \`start_date\` DATE DEFAULT NULL,
        \`due_date\` DATE DEFAULT NULL,
        \`color\` VARCHAR(50) DEFAULT 'indigo',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_projects_user_id\` (\`user_id\`),
        KEY \`idx_projects_user_status\` (\`user_id\`, \`status\`),
        KEY \`idx_projects_user_priority\` (\`user_id\`, \`priority\`),
        KEY \`idx_projects_user_due_date\` (\`user_id\`, \`due_date\`),
        CONSTRAINT \`fk_projects_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\` ) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Safe Alter tasks table to add project_id column if not exists
    console.log('📦 Checking and altering tasks table for project_id...');
    const [cols]: any = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tasks' AND COLUMN_NAME = 'project_id'
    `, [DB_NAME]);

    if (cols.length === 0) {
      console.log('➕ Adding project_id column to tasks table...');
      await connection.query(`
        ALTER TABLE \`tasks\` 
        ADD COLUMN \`project_id\` VARCHAR(36) DEFAULT NULL AFTER \`user_id\`,
        ADD KEY \`idx_tasks_project_id\` (\`project_id\`),
        ADD CONSTRAINT \`fk_tasks_project_id\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\` (\`id\`) ON DELETE SET NULL;
      `);
      console.log('✅ Added project_id to tasks.');
    } else {
      console.log('ℹ️ project_id column already exists in tasks table.');
    }

    // 3. Create Subjects Table
    console.log('📦 Creating subjects table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`subjects\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`code\` VARCHAR(50) DEFAULT NULL,
        \`color\` VARCHAR(50) DEFAULT 'blue',
        \`target_hours\` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_subjects_user_id\` (\`user_id\`),
        CONSTRAINT \`fk_subjects_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Create Study Sessions Table
    console.log('📦 Creating study_sessions table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`study_sessions\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`subject_id\` VARCHAR(36) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`date\` DATE NOT NULL,
        \`start_time\` TIME NOT NULL,
        \`end_time\` TIME NOT NULL,
        \`duration_minutes\` INT UNSIGNED NOT NULL,
        \`notes\` TEXT DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_study_sessions_user_id\` (\`user_id\`),
        KEY \`idx_study_sessions_user_date\` (\`user_id\`, \`date\`),
        KEY \`idx_study_sessions_subject_id\` (\`subject_id\`),
        CONSTRAINT \`fk_study_sessions_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_study_sessions_subject_id\` FOREIGN KEY (\`subject_id\`) REFERENCES \`subjects\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Create Daily Reviews Table
    console.log('📦 Creating daily_reviews table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`daily_reviews\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`review_date\` DATE NOT NULL,
        \`what_went_well\` TEXT DEFAULT NULL,
        \`challenges\` TEXT DEFAULT NULL,
        \`learned\` TEXT DEFAULT NULL,
        \`improvements\` TEXT DEFAULT NULL,
        \`mood\` ENUM('great', 'good', 'okay', 'difficult', 'bad') NOT NULL DEFAULT 'good',
        \`rating\` TINYINT UNSIGNED NOT NULL DEFAULT 3,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_daily_reviews_user_date\` (\`user_id\`, \`review_date\`),
        KEY \`idx_daily_reviews_user_id\` (\`user_id\`),
        CONSTRAINT \`fk_daily_reviews_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Create Morning Plans Table
    console.log('📦 Creating morning_plans table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`morning_plans\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`plan_date\` DATE NOT NULL,
        \`priority_1\` VARCHAR(255) NOT NULL,
        \`priority_2\` VARCHAR(255) DEFAULT NULL,
        \`priority_3\` VARCHAR(255) DEFAULT NULL,
        \`priority_1_task_id\` VARCHAR(36) DEFAULT NULL,
        \`priority_2_task_id\` VARCHAR(36) DEFAULT NULL,
        \`priority_3_task_id\` VARCHAR(36) DEFAULT NULL,
        \`planned_study_minutes\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`planned_focus_minutes\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`notes\` TEXT DEFAULT NULL,
        \`intention\` TEXT DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_morning_plans_user_date\` (\`user_id\`, \`plan_date\`),
        KEY \`idx_morning_plans_user_id\` (\`user_id\`),
        CONSTRAINT \`fk_morning_plans_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_morning_plans_task_1\` FOREIGN KEY (\`priority_1_task_id\`) REFERENCES \`tasks\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`fk_morning_plans_task_2\` FOREIGN KEY (\`priority_2_task_id\`) REFERENCES \`tasks\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`fk_morning_plans_task_3\` FOREIGN KEY (\`priority_3_task_id\`) REFERENCES \`tasks\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('🎉 All Phase 3 database tables and relations created successfully!');
  } catch (err: any) {
    console.error('❌ Phase 3 Migration error:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  migratePhase3();
}
