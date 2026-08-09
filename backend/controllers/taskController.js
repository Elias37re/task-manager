const pool = require('../config/db');

// @desc    Get all user tasks (with search, filter, and sort options)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  const userId = req.user.id;
  const { search, status, priority, sortBy, order } = req.query;

  try {
    let queryText = 'SELECT * FROM tasks WHERE user_id = $1';
    const queryParams = [userId];
    let paramIndex = 2;

    // Apply Search Filter (Title or Description)
    if (search) {
      queryText += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Apply Status Filter
    if (status && status !== 'all') {
      queryText += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Apply Priority Filter
    if (priority && priority !== 'all') {
      queryText += ` AND priority = $${paramIndex}`;
      queryParams.push(priority);
      paramIndex++;
    }

    // Apply Sorting
    let sortColumn = 'created_at';
    let sortOrder = 'DESC';

    if (sortBy === 'due_date') {
      sortColumn = 'due_date';
      // Put NULL dates last
      queryText += ` ORDER BY CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date`;
      sortOrder = order === 'asc' ? 'ASC' : 'DESC';
      queryText += ` ${sortOrder}`;
    } else {
      if (sortBy === 'priority') {
        // Custom order: high -> medium -> low
        queryText += ` ORDER BY CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
          ELSE 4 END`;
        sortOrder = order === 'desc' ? 'DESC' : 'ASC';
        queryText += ` ${sortOrder}`;
      } else {
        // Default sort: created_at or title
        if (sortBy === 'title') {
          sortColumn = 'title';
        }
        sortOrder = order === 'asc' ? 'ASC' : 'DESC';
        queryText += ` ORDER BY ${sortColumn} ${sortOrder}`;
      }
    }

    const tasksResult = await pool.query(queryText, queryParams);
    res.json(tasksResult.rows);
  } catch (err) {
    console.error('Fetch Tasks Error:', err.message);
    res.status(500).json({ message: 'Server error when fetching tasks' });
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  try {
    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.json(taskResult.rows[0]);
  } catch (err) {
    console.error('Fetch Task By ID Error:', err.message);
    res.status(500).json({ message: 'Server error when fetching task details' });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  const userId = req.user.id;
  const { title, description, status, priority, due_date } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const newTaskResult = await pool.query(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        title,
        description || '',
        status || 'pending',
        priority || 'medium',
        due_date || null
      ]
    );

    res.status(201).json(newTaskResult.rows[0]);
  } catch (err) {
    console.error('Create Task Error:', err.message);
    res.status(500).json({ message: 'Server error when creating task' });
  }
};

// @desc    Update an existing task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;
  const { title, description, status, priority, due_date } = req.body;

  try {
    // Check if task exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    // Build update dynamic query to only update provided fields
    let queryText = 'UPDATE tasks SET updated_at = NOW()';
    const queryParams = [];
    let paramIndex = 1;

    if (title !== undefined) {
      queryText += `, title = $${paramIndex}`;
      queryParams.push(title);
      paramIndex++;
    }
    if (description !== undefined) {
      queryText += `, description = $${paramIndex}`;
      queryParams.push(description);
      paramIndex++;
    }
    if (status !== undefined) {
      queryText += `, status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    if (priority !== undefined) {
      queryText += `, priority = $${paramIndex}`;
      queryParams.push(priority);
      paramIndex++;
    }
    if (due_date !== undefined) {
      queryText += `, due_date = $${paramIndex}`;
      queryParams.push(due_date || null);
      paramIndex++;
    }

    queryText += ` WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`;
    queryParams.push(taskId, userId);

    const updatedTaskResult = await pool.query(queryText, queryParams);
    res.json(updatedTaskResult.rows[0]);
  } catch (err) {
    console.error('Update Task Error:', err.message);
    res.status(500).json({ message: 'Server error when updating task' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  try {
    const deleteResult = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [taskId, userId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.json({ message: 'Task deleted successfully', id: taskId });
  } catch (err) {
    console.error('Delete Task Error:', err.message);
    res.status(500).json({ message: 'Server error when deleting task' });
  }
};
