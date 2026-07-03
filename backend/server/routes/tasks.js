import { Router } from 'express';
import { supabase } from '../supabase.js';
import { authenticateUser } from '../middleware/auth.js';
import { autoAssignPriority } from '../services/gemini.js';

const router = Router();
router.use(authenticateUser);

router.get('/debug-priority', (req, res) => {
  const { title, deadline } = req.query;
  const result = autoAssignPriority(title || '', deadline || null, {});
  console.log(`[DEBUG] autoAssignPriority(title="${title}", deadline="${deadline}") = "${result}"`);
  res.json({ title, deadline, autoAssignPriority: result });
});

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
    const { title, deadline, priority: clientPriority } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    let priority;
    if (clientPriority) {
      priority = clientPriority.toLowerCase();
    } else {
      const { data: businessProfile } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', req.userId)
        .maybeSingle();

      priority = autoAssignPriority(title, deadline, businessProfile || {});
    }
    const capPriority = priority.charAt(0).toUpperCase() + priority.slice(1);

    console.log(`[CREATE TASK] title="${title}" autoAssign->${priority} cap->${capPriority}`);

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: req.userId,
        task_name: title,
        priority: capPriority,
        deadline: deadline || null
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    const result = mapRow(data);
    result.autoPriority = priority;
    result._debug = { autoAssignPriority: priority, storedAs: capPriority };
    console.log(`[CREATE TASK RESPONSE] priority="${result.priority}" autoPriority="${result.autoPriority}"`);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, deadline } = req.body;

    const updates = {};
    if (title !== undefined) updates.task_name = title;
    if (status !== undefined) updates.status = STATUS_MAP[status] || status;
    if (deadline !== undefined) updates.deadline = deadline;

    if (title !== undefined) {
      const { data: businessProfile } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', req.userId)
        .maybeSingle();

      const newPriority = autoAssignPriority(title, deadline, businessProfile || {});
      updates.priority = newPriority.charAt(0).toUpperCase() + newPriority.slice(1);
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Task not found' });

    const result = mapRow(data);
    if (updates.priority) result.autoPriority = updates.priority.toLowerCase();
    res.json(result);
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
