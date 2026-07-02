import { Router } from 'express';
import { supabase } from '../supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();
router.use(authenticateUser);

const STATUS_MAP = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };
const STATUS_REVERSE = { 'Pending': 'pending', 'In Progress': 'in-progress', 'Completed': 'completed', 'Cancelled': 'cancelled' };

const mapRow = (row) => row ? {
  id: row.id,
  title: row.task_name,
  priority: row.priority?.toLowerCase?.() || 'medium',
  status: STATUS_REVERSE[row.status] || row.status?.toLowerCase?.() || 'pending',
  deadline: row.deadline,
  created_at: row.created_at
} : null;

router.get('/', async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (status) {
      const statuses = status.split(',').map(s => STATUS_MAP[s.trim()] || s.trim());
      query = query.in('status', statuses);
    }
    if (priority) query = query.eq('priority', priority.charAt(0).toUpperCase() + priority.slice(1));

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ tasks: (data || []).map(mapRow) });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, priority, duration_minutes } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const capPriority = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Medium';

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: req.userId,
        task_name: title,
        priority: capPriority,
        deadline: null
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(mapRow(data));
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, priority, status, deadline } = req.body;

    const updates = {};
    if (title !== undefined) updates.task_name = title;
    if (priority !== undefined) updates.priority = priority.charAt(0).toUpperCase() + priority.slice(1);
    if (status !== undefined) updates.status = STATUS_MAP[status] || status;
    if (deadline !== undefined) updates.deadline = deadline;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Task not found' });
    res.json(mapRow(data));
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
