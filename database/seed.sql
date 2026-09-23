-- ==========================================================
-- Personal Productivity App - Seed Data (Phase 1)
-- ==========================================================

USE `productivity_app`;

-- Clear existing demo data
DELETE FROM `tasks` WHERE `user_id` = 'demo-user-velan-001';
DELETE FROM `users` WHERE `id` = 'demo-user-velan-001';

-- Insert Sample Demo User
-- Password: password123 (bcrypt hash: $2a$10$wT2Hl7jHqy2K3Wq9eK1EuuY0lU4Z8iN/Qx0b0Q3mE0y1Z7J2X0K.e)
-- We will also ensure the backend auto-hashes if initialized via script
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `avatar`, `created_at`, `updated_at`)
VALUES (
    'demo-user-velan-001',
    'Velan',
    'velan@example.com',
    '$2b$10$VfW2d5Uo5aG2kOkmFv3zCOq2lI3T8L6P/5u9z1W2Z4Y8R0K1M3L5K',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    NOW(),
    NOW()
);

-- Insert Sample Tasks for Demo User
INSERT INTO `tasks` (`id`, `user_id`, `title`, `description`, `priority`, `status`, `category`, `due_date`, `due_time`, `estimated_minutes`, `created_at`, `updated_at`, `completed_at`)
VALUES 
(
    'task-demo-001',
    'demo-user-velan-001',
    'Complete project documentation',
    'Write architecture overview, API specifications, and database schema documentation for Phase 1.',
    'high',
    'in_progress',
    'Work',
    CURDATE(),
    '17:00:00',
    90,
    NOW(),
    NOW(),
    NULL
),
(
    'task-demo-002',
    'demo-user-velan-001',
    'Study DBMS',
    'Revise indexing strategies, query execution plans, and transaction isolation levels.',
    'high',
    'todo',
    'Study',
    CURDATE(),
    '19:00:00',
    60,
    NOW(),
    NOW(),
    NULL
),
(
    'task-demo-003',
    'demo-user-velan-001',
    'Practice SQL',
    'Solve complex join and aggregation queries on LeetCode / HackerRank database challenges.',
    'medium',
    'completed',
    'Study',
    CURDATE(),
    '20:00:00',
    45,
    NOW(),
    NOW(),
    NOW()
),
(
    'task-demo-004',
    'demo-user-velan-001',
    'Practice Python',
    'Implement asynchronous file processing and data parsing routines.',
    'medium',
    'todo',
    'Development',
    DATE_ADD(CURDATE(), INTERVAL 1 DAY),
    '11:00:00',
    60,
    NOW(),
    NOW(),
    NULL
),
(
    'task-demo-005',
    'demo-user-velan-001',
    'Work on Smart Irrigation',
    'Calibrate soil moisture sensor thresholds and test automated pump trigger logic.',
    'high',
    'todo',
    'Projects',
    DATE_ADD(CURDATE(), INTERVAL 2 DAY),
    '15:30:00',
    120,
    NOW(),
    NOW(),
    NULL
),
(
    'task-demo-006',
    'demo-user-velan-001',
    'Review AI notes',
    'Go through Transformer architecture, multi-head attention math, and embeddings.',
    'low',
    'todo',
    'Study',
    DATE_ADD(CURDATE(), INTERVAL 3 DAY),
    '18:00:00',
    45,
    NOW(),
    NOW(),
    NULL
),
(
    'task-demo-007',
    'demo-user-velan-001',
    'Work on NLP Translator',
    'Fine-tune small language model on conversational bilingual dataset.',
    'medium',
    'in_progress',
    'Projects',
    DATE_ADD(CURDATE(), INTERVAL 4 DAY),
    '16:00:00',
    90,
    NOW(),
    NOW(),
    NULL
),
(
    'task-demo-008',
    'demo-user-velan-001',
    'Prepare presentation',
    'Create clean slide deck summarizing project sprint progress and next milestones.',
    'medium',
    'todo',
    'Work',
    DATE_ADD(CURDATE(), INTERVAL 5 DAY),
    '14:00:00',
    60,
    NOW(),
    NOW(),
    NULL
),
(
    'task-demo-009',
    'demo-user-velan-001',
    'Weekly workspace clean up',
    'Organize desk setup, backup local code repositories, and clear old downloads.',
    'low',
    'completed',
    'Personal',
    DATE_SUB(CURDATE(), INTERVAL 1 DAY),
    '10:00:00',
    30,
    NOW(),
    NOW(),
    DATE_SUB(NOW(), INTERVAL 1 DAY)
);
