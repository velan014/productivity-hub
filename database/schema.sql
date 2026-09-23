-- ==========================================================
-- Personal Productivity App - Database Schema (Phase 1)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `productivity_app` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `productivity_app`;

-- ----------------------------------------------------------
-- Table: users
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(500) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: tasks
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tasks` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    `status` ENUM('todo', 'in_progress', 'completed') NOT NULL DEFAULT 'todo',
    `category` VARCHAR(50) DEFAULT 'General',
    `due_date` DATE DEFAULT NULL,
    `due_time` TIME DEFAULT NULL,
    `estimated_minutes` INT UNSIGNED DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `completed_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_tasks_user_id` (`user_id`),
    KEY `idx_tasks_user_status` (`user_id`, `status`),
    KEY `idx_tasks_user_due_date` (`user_id`, `due_date`),
    KEY `idx_tasks_user_priority` (`user_id`, `priority`),
    CONSTRAINT `fk_tasks_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: goals (Phase 2)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `goals` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `category` VARCHAR(50) DEFAULT 'General',
    `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    `status` ENUM('active', 'completed', 'paused') NOT NULL DEFAULT 'active',
    `progress` INT NOT NULL DEFAULT 0,
    `start_date` DATE DEFAULT NULL,
    `target_date` DATE DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `completed_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_goals_user_id` (`user_id`),
    KEY `idx_goals_user_status` (`user_id`, `status`),
    KEY `idx_goals_user_target_date` (`user_id`, `target_date`),
    KEY `idx_goals_user_priority` (`user_id`, `priority`),
    CONSTRAINT `fk_goals_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: habits (Phase 2)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `habits` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `category` VARCHAR(50) DEFAULT 'General',
    `frequency` ENUM('daily', 'weekly') NOT NULL DEFAULT 'daily',
    `target_count` INT NOT NULL DEFAULT 1,
    `color` VARCHAR(50) DEFAULT 'emerald',
    `icon` VARCHAR(50) DEFAULT 'Repeat',
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_habits_user_id` (`user_id`),
    KEY `idx_habits_user_active` (`user_id`, `active`),
    CONSTRAINT `fk_habits_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: habit_logs (Phase 2)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `habit_logs` (
    `id` VARCHAR(36) NOT NULL,
    `habit_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `log_date` DATE NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT TRUE,
    `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_habit_log_date` (`habit_id`, `log_date`),
    KEY `idx_habit_logs_user_date` (`user_id`, `log_date`),
    KEY `idx_habit_logs_habit_id` (`habit_id`),
    CONSTRAINT `fk_habit_logs_habit_id` FOREIGN KEY (`habit_id`) REFERENCES `habits` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_habit_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: focus_sessions (Phase 2)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `focus_sessions` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `task_id` VARCHAR(36) DEFAULT NULL,
    `mode` ENUM('focus', 'short_break', 'long_break') NOT NULL DEFAULT 'focus',
    `planned_minutes` INT NOT NULL DEFAULT 25,
    `actual_minutes` INT NOT NULL DEFAULT 25,
    `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ended_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `completed` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_focus_user_started` (`user_id`, `started_at`),
    KEY `idx_focus_user_task` (`user_id`, `task_id`),
    CONSTRAINT `fk_focus_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_focus_task_id` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: notes (Phase 2)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notes` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL DEFAULT 'Untitled Note',
    `content` MEDIUMTEXT DEFAULT NULL,
    `category` VARCHAR(50) DEFAULT 'General',
    `is_pinned` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_notes_user_id` (`user_id`),
    KEY `idx_notes_user_updated` (`user_id`, `updated_at`),
    KEY `idx_notes_user_pinned` (`user_id`, `is_pinned`),
    CONSTRAINT `fk_notes_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- Phase 3 Schema Additions
-- ==========================================================

-- ----------------------------------------------------------
-- Table: projects (Phase 3)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `projects` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `status` ENUM('planning', 'active', 'completed', 'archived') NOT NULL DEFAULT 'planning',
    `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    `start_date` DATE DEFAULT NULL,
    `due_date` DATE DEFAULT NULL,
    `color` VARCHAR(50) DEFAULT 'indigo',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_projects_user_id` (`user_id`),
    KEY `idx_projects_user_status` (`user_id`, `status`),
    KEY `idx_projects_user_priority` (`user_id`, `priority`),
    KEY `idx_projects_user_due_date` (`user_id`, `due_date`),
    CONSTRAINT `fk_projects_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: subjects (Phase 3)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `subjects` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) DEFAULT NULL,
    `color` VARCHAR(50) DEFAULT 'blue',
    `target_hours` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_subjects_user_id` (`user_id`),
    CONSTRAINT `fk_subjects_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: study_sessions (Phase 3)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `study_sessions` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `subject_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `duration_minutes` INT UNSIGNED NOT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_study_sessions_user_id` (`user_id`),
    KEY `idx_study_sessions_user_date` (`user_id`, `date`),
    KEY `idx_study_sessions_subject_id` (`subject_id`),
    CONSTRAINT `fk_study_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_study_sessions_subject_id` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: daily_reviews (Phase 3)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `daily_reviews` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `review_date` DATE NOT NULL,
    `what_went_well` TEXT DEFAULT NULL,
    `challenges` TEXT DEFAULT NULL,
    `learned` TEXT DEFAULT NULL,
    `improvements` TEXT DEFAULT NULL,
    `mood` ENUM('great', 'good', 'okay', 'difficult', 'bad') NOT NULL DEFAULT 'good',
    `rating` TINYINT UNSIGNED NOT NULL DEFAULT 3,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_daily_reviews_user_date` (`user_id`, `review_date`),
    KEY `idx_daily_reviews_user_id` (`user_id`),
    CONSTRAINT `fk_daily_reviews_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: morning_plans (Phase 3)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `morning_plans` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `plan_date` DATE NOT NULL,
    `priority_1` VARCHAR(255) NOT NULL,
    `priority_2` VARCHAR(255) DEFAULT NULL,
    `priority_3` VARCHAR(255) DEFAULT NULL,
    `priority_1_task_id` VARCHAR(36) DEFAULT NULL,
    `priority_2_task_id` VARCHAR(36) DEFAULT NULL,
    `priority_3_task_id` VARCHAR(36) DEFAULT NULL,
    `planned_study_minutes` INT UNSIGNED NOT NULL DEFAULT 0,
    `planned_focus_minutes` INT UNSIGNED NOT NULL DEFAULT 0,
    `notes` TEXT DEFAULT NULL,
    `intention` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_morning_plans_user_date` (`user_id`, `plan_date`),
    KEY `idx_morning_plans_user_id` (`user_id`),
    CONSTRAINT `fk_morning_plans_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_morning_plans_task_1` FOREIGN KEY (`priority_1_task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_morning_plans_task_2` FOREIGN KEY (`priority_2_task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_morning_plans_task_3` FOREIGN KEY (`priority_3_task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- Phase 4 Schema Additions
-- ==========================================================

-- ----------------------------------------------------------
-- Table: user_gamification (Phase 4)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_gamification` (
    `user_id` VARCHAR(36) NOT NULL,
    `xp` INT UNSIGNED NOT NULL DEFAULT 0,
    `level` INT UNSIGNED NOT NULL DEFAULT 1,
    `total_completed_tasks` INT UNSIGNED NOT NULL DEFAULT 0,
    `total_focus_minutes` INT UNSIGNED NOT NULL DEFAULT 0,
    `total_study_minutes` INT UNSIGNED NOT NULL DEFAULT 0,
    `current_streak` INT UNSIGNED NOT NULL DEFAULT 0,
    `longest_streak` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    CONSTRAINT `fk_gamification_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: achievements (Phase 4)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `achievements` (
    `id` VARCHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(50) NOT NULL,
    `category` VARCHAR(50) NOT NULL DEFAULT 'general',
    `xp_reward` INT UNSIGNED NOT NULL DEFAULT 20,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_achievements_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: user_achievements (Phase 4)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_achievements` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `achievement_id` VARCHAR(36) NOT NULL,
    `earned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_achievement` (`user_id`, `achievement_id`),
    KEY `idx_user_achievements_user` (`user_id`),
    CONSTRAINT `fk_user_achievements_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_achievements_ach` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: notification_preferences (Phase 4)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notification_preferences` (
    `user_id` VARCHAR(36) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT FALSE,
    `morning_plan_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `habit_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `study_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `focus_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `daily_review_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    CONSTRAINT `fk_notification_pref_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



