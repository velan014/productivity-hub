import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'productivity_app';

export async function migratePhase4() {
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

    // 1. Create User Gamification Table
    console.log('📦 Creating user_gamification table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`user_gamification\` (
        \`user_id\` VARCHAR(36) NOT NULL,
        \`xp\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`level\` INT UNSIGNED NOT NULL DEFAULT 1,
        \`total_completed_tasks\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`total_focus_minutes\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`total_study_minutes\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`current_streak\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`longest_streak\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`user_id\`),
        CONSTRAINT \`fk_gamification_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Create Achievements Table
    console.log('📦 Creating achievements table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`achievements\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`code\` VARCHAR(50) NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`description\` VARCHAR(255) NOT NULL,
        \`icon\` VARCHAR(50) NOT NULL,
        \`category\` VARCHAR(50) NOT NULL DEFAULT 'general',
        \`xp_reward\` INT UNSIGNED NOT NULL DEFAULT 20,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_achievements_code\` (\`code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Create User Achievements Table
    console.log('📦 Creating user_achievements table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`user_achievements\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`achievement_id\` VARCHAR(36) NOT NULL,
        \`earned_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_user_achievement\` (\`user_id\`, \`achievement_id\`),
        KEY \`idx_user_achievements_user\` (\`user_id\`),
        CONSTRAINT \`fk_user_achievements_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_user_achievements_ach\` FOREIGN KEY (\`achievement_id\`) REFERENCES \`achievements\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Create Notification Preferences Table
    console.log('📦 Creating notification_preferences table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`notification_preferences\` (
        \`user_id\` VARCHAR(36) NOT NULL,
        \`enabled\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`morning_plan_enabled\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`habit_enabled\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`study_enabled\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`focus_enabled\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`daily_review_enabled\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`user_id\`),
        CONSTRAINT \`fk_notification_pref_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Seed Catalog of Achievements
    console.log('🌱 Seeding initial achievements catalog...');
    const defaultAchievements = [
      { code: 'first_task', name: 'First Step', description: 'Complete your first task', icon: 'CheckCircle2', category: 'tasks', xp_reward: 20 },
      { code: 'task_master', name: 'Task Master', description: 'Complete 25 total tasks', icon: 'CheckSquare', category: 'tasks', xp_reward: 50 },
      { code: 'centurion_tasks', name: 'Centurion', description: 'Complete 100 total tasks', icon: 'Zap', category: 'tasks', xp_reward: 150 },
      { code: 'focused_mind', name: 'Focused Mind', description: 'Complete 5 Pomodoro focus sessions', icon: 'Timer', category: 'focus', xp_reward: 30 },
      { code: 'deep_work_champ', name: 'Deep Work Champion', description: 'Accumulate 300 minutes of deep focus time', icon: 'Flame', category: 'focus', xp_reward: 75 },
      { code: 'study_starter', name: 'Study Starter', description: 'Log your first subject study session', icon: 'BookOpen', category: 'study', xp_reward: 25 },
      { code: 'scholar', name: 'Scholar', description: 'Complete 10 total hours of subject study', icon: 'GraduationCap', category: 'study', xp_reward: 80 },
      { code: 'streak_builder', name: 'Consistency Master', description: 'Maintain a 7-day habit streak', icon: 'Repeat', category: 'habits', xp_reward: 60 },
      { code: 'project_finisher', name: 'Project Finisher', description: 'Successfully complete a project', icon: 'FolderGit2', category: 'projects', xp_reward: 100 },
      { code: 'daily_reviewer', name: 'Reflective Mind', description: 'Complete 7 daily evening reviews', icon: 'Moon', category: 'review', xp_reward: 50 },
      { code: 'early_planner', name: 'Morning Architect', description: 'Create 5 morning productivity plans', icon: 'Sun', category: 'planning', xp_reward: 50 },
      { code: 'goal_crusher', name: 'Goal Crusher', description: 'Reach 100% completion on a goal', icon: 'Target', category: 'goals', xp_reward: 100 },
    ];

    for (const ach of defaultAchievements) {
      const [existing]: any = await connection.query('SELECT id FROM achievements WHERE code = ?', [ach.code]);
      if (existing.length === 0) {
        await connection.query(`
          INSERT INTO achievements (id, code, name, description, icon, category, xp_reward)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [uuidv4(), ach.code, ach.name, ach.description, ach.icon, ach.category, ach.xp_reward]);
      }
    }

    console.log('🎉 Phase 4 Database Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  migratePhase4()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
