-- Migration: Add task management system for admins
-- Created: 2025-12-18

-- ============== TASKS TABLE ==============
-- Stores tasks with kanban board support
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR NOT NULL DEFAULT 'todo',
  priority VARCHAR NOT NULL DEFAULT 'medium',
  assigned_to VARCHAR,
  created_by VARCHAR NOT NULL,
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_assigned_to_idx ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS tasks_created_by_idx ON tasks(created_by);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks(created_at DESC);

-- ============== TASK COMMENTS TABLE ==============
-- Store comments/notes on tasks
CREATE TABLE IF NOT EXISTS task_comments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_task_id FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS task_comments_task_id_idx ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS task_comments_created_at_idx ON task_comments(created_at DESC);

-- ============== COMMENTS ==============
COMMENT ON TABLE tasks IS 'Admin task management with kanban board support';
COMMENT ON COLUMN tasks.status IS 'Status: todo, in_progress, review, done';
COMMENT ON COLUMN tasks.priority IS 'Priority: low, medium, high, urgent';
COMMENT ON TABLE task_comments IS 'Comments and notes on tasks';


