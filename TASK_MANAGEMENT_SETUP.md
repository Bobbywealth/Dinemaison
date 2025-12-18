# Task Management System - Setup Guide

## Overview

A comprehensive task management system has been implemented for admin users, featuring both List and Kanban board views for managing tasks and projects.

## ✅ What's Been Implemented

### Backend

1. **Database Schema** (`migrations/0005_add_tasks.sql`)
   - `tasks` table with status, priority, assignment, and due dates
   - `task_comments` table for task discussions
   - Proper indexes for performance
   - Foreign key constraints

2. **Task Service** (`server/taskService.ts`)
   - Full CRUD operations for tasks
   - Task filtering and search
   - Task statistics
   - Comment management
   - User assignments with full user details

3. **API Routes** (`server/routes.ts`)
   - `GET /api/tasks` - List all tasks with filters
   - `GET /api/tasks/stats` - Get task statistics
   - `GET /api/tasks/:id` - Get single task
   - `POST /api/tasks` - Create new task
   - `PATCH /api/tasks/:id` - Update task
   - `DELETE /api/tasks/:id` - Delete task
   - `GET /api/tasks/:id/comments` - Get task comments
   - `POST /api/tasks/:id/comments` - Add comment
   - `DELETE /api/tasks/:taskId/comments/:commentId` - Delete comment
   - All routes require admin authentication

### Frontend

1. **Task Hooks** (`client/src/hooks/use-tasks.ts`)
   - React Query hooks for all task operations
   - Real-time updates with automatic refetching
   - Optimistic updates

2. **Task List View** (`client/src/components/tasks/task-list-view.tsx`)
   - Sortable table with all task details
   - Status and priority badges
   - Assigned user avatars
   - Due date with overdue indicators
   - Action menu (Edit, Delete, View)

3. **Kanban Board View** (`client/src/components/tasks/task-kanban-view.tsx`)
   - Four columns: To Do, In Progress, Review, Done
   - Drag-and-drop to change status
   - Task cards with all details
   - Visual priority indicators
   - Overdue highlighting

4. **Task Dialog** (`client/src/components/tasks/task-dialog.tsx`)
   - Create/edit task form
   - All fields: title, description, status, priority, due date
   - Form validation
   - Responsive design

5. **Main Tasks Page** (`client/src/pages/tasks.tsx`)
   - Task statistics dashboard
   - Search functionality
   - Status and priority filters
   - View toggle (List/Kanban)
   - New task button
   - Integrated with all components

6. **Admin Navigation** (`client/src/pages/dashboard/admin-dashboard.tsx`)
   - "Tasks" tab added to admin sidebar
   - Icon and routing configured
   - Only visible to admin users

## Features

### Task Management
- ✅ Create, edit, delete tasks
- ✅ Assign tasks to users
- ✅ Set due dates
- ✅ Track task status (To Do, In Progress, Review, Done)
- ✅ Set priority levels (Low, Medium, High, Urgent)
- ✅ Add descriptions to tasks
- ✅ Comment on tasks (infrastructure ready)

### Views
- ✅ **List View**: Traditional table view with sorting and filtering
- ✅ **Kanban View**: Visual board with drag-and-drop functionality
- ✅ Quick view toggle between both modes

### Filtering & Search
- ✅ Search by task title or description
- ✅ Filter by status
- ✅ Filter by priority
- ✅ Filter by assigned user (backend ready)
- ✅ Filter by creator (backend ready)

### Statistics
- ✅ Total tasks count
- ✅ Tasks by status (To Do, In Progress, Review, Done)
- ✅ Overdue tasks count
- ✅ Visual statistics cards

### User Experience
- ✅ Overdue task highlighting
- ✅ Responsive design (mobile & desktop)
- ✅ Color-coded status badges
- ✅ Color-coded priority badges
- ✅ User avatars for assignments
- ✅ Drag-and-drop in Kanban view
- ✅ Toast notifications for actions

## Setup Instructions

### 1. Run Database Migration

```bash
# Connect to your database
psql -U your_username -d dinemaison

# Run the migration
\i migrations/0005_add_tasks.sql

# Or if using Drizzle
npm run db:push
```

### 2. Verify Database Tables

```sql
-- Check tables were created
\dt tasks
\dt task_comments

-- Verify indexes
\di tasks*
\di task_comments*
```

### 3. Access the Task Manager

1. **Login as Admin**: Only admin users can access the task manager
2. **Navigate to Tasks**: Click "Tasks" in the admin dashboard sidebar
3. **Or Direct URL**: Go to `/tasks` (admin authentication required)

## Usage Guide

### Creating a Task

1. Click the "New Task" button
2. Fill in the details:
   - **Title** (required)
   - **Description** (optional)
   - **Status**: To Do, In Progress, Review, or Done
   - **Priority**: Low, Medium, High, or Urgent
   - **Due Date** (optional)
3. Click "Create Task"

### List View

- **View all tasks** in a sortable table
- **Search** tasks by title or description
- **Filter** by status or priority
- **Click row** to view/edit task
- **Use menu** (⋯) for Edit or Delete actions
- See **overdue badges** on past-due tasks

### Kanban View

- **Drag tasks** between columns to update status
- **Four columns**: To Do → In Progress → Review → Done
- **Visual cards** show all task details
- **Color-coded** priority and overdue indicators
- **Click card menu** (⋯) for more actions

### Task Details

Each task shows:
- Title and description
- Current status
- Priority level
- Assigned user (with avatar)
- Creator information
- Due date (with overdue warning if applicable)
- Creation and update timestamps

### Filtering & Searching

- **Search bar**: Type to filter by title/description
- **Status filter**: Show only tasks with specific status
- **Priority filter**: Show only tasks with specific priority
- **Clear filters**: Select "All" in dropdowns

## Database Schema

### Tasks Table

```sql
CREATE TABLE tasks (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR NOT NULL DEFAULT 'todo',
  priority VARCHAR NOT NULL DEFAULT 'medium',
  assigned_to VARCHAR,
  created_by VARCHAR NOT NULL,
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Status values**: `todo`, `in_progress`, `review`, `done`
**Priority values**: `low`, `medium`, `high`, `urgent`

### Task Comments Table

```sql
CREATE TABLE task_comments (
  id VARCHAR PRIMARY KEY,
  task_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Examples

### Create a Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "title": "Review new chef applications",
    "description": "Review and approve pending chef verifications",
    "status": "todo",
    "priority": "high",
    "dueDate": "2025-12-25"
  }'
```

### Get All Tasks

```bash
curl http://localhost:5000/api/tasks?status=in_progress&priority=high \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

### Update Task Status

```bash
curl -X PATCH http://localhost:5000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{"status": "done"}'
```

### Get Task Statistics

```bash
curl http://localhost:5000/api/tasks/stats \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

## Security

- ✅ **Admin-only access**: All task routes require admin authentication
- ✅ **Input validation**: All inputs are validated on backend
- ✅ **SQL injection protection**: Using parameterized queries
- ✅ **XSS protection**: React escapes output automatically
- ✅ **Foreign key constraints**: Maintains data integrity

## Future Enhancements

Consider adding:
1. Task templates for common workflows
2. Task dependencies (blocking tasks)
3. Task labels/tags
4. File attachments to tasks
5. Time tracking
6. Task history/audit log
7. Email notifications for task assignments
8. Recurring tasks
9. Task checklists/subtasks
10. Bulk task operations

## Troubleshooting

### "Failed to fetch tasks"
- Check that you're logged in as an admin user
- Verify database migration was run successfully
- Check browser console for error details

### Tasks not appearing
- Verify user role is "admin" in database
- Check browser network tab for API errors
- Ensure database connection is active

### Drag-and-drop not working
- Try refreshing the page
- Check browser console for JavaScript errors
- Ensure you're in Kanban view (not List view)

### Can't create tasks
- Verify all required fields are filled (title is required)
- Check that you're authenticated as admin
- Review server logs for validation errors

## Testing

### Test Task Creation
1. Go to `/tasks`
2. Click "New Task"
3. Fill in title: "Test Task"
4. Click "Create Task"
5. Verify task appears in list

### Test Kanban Board
1. Switch to Kanban view
2. Create a test task in "To Do"
3. Drag it to "In Progress"
4. Verify status updates automatically

### Test Filters
1. Create tasks with different statuses and priorities
2. Use status filter dropdown
3. Use priority filter dropdown
4. Try search functionality

### Test Statistics
1. Create several tasks with different statuses
2. Check statistics cards update
3. Create an overdue task (due date in past)
4. Verify overdue count increments

## Files Modified/Created

### New Files
- `migrations/0005_add_tasks.sql` - Database schema
- `server/taskService.ts` - Task business logic
- `shared/taskTypes.ts` - TypeScript types
- `client/src/hooks/use-tasks.ts` - React hooks
- `client/src/components/tasks/task-list-view.tsx` - List view
- `client/src/components/tasks/task-kanban-view.tsx` - Kanban view
- `client/src/components/tasks/task-dialog.tsx` - Create/edit dialog
- `client/src/pages/tasks.tsx` - Main tasks page

### Modified Files
- `server/routes.ts` - Added task API routes
- `shared/schema.ts` - Added tasks table definitions
- `client/src/App.tsx` - Added /tasks route
- `client/src/pages/dashboard/admin-dashboard.tsx` - Added Tasks nav item

## Support

For issues or questions:
1. Check this documentation
2. Review server logs for errors
3. Check browser console for frontend errors
4. Verify admin authentication
5. Ensure database migration was successful

---

**Last Updated**: December 18, 2025
**Version**: 1.0
**Status**: ✅ Complete and Ready to Use
