import { Router } from 'express';
import { supabase } from '../supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();
router.use(authenticateUser);

const mapRow = (row) => row ? {
  id: row.id,
  title: row.activity_name,
  category: row.category,
  duration_minutes: row.hours_spent * 60,
  description: row.result,
  activity_date: row.date,
  created_at: row.created_at
} : null;

router.get('/', async (req, res) => {
  try {
    const { date, startDate, endDate, category, limit } = req.query;
    let query = supabase
      .from('daily_activities')
      .select('*')
      .eq('user_id', req.userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (date) query = query.eq('date', date);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    if (category) query = query.eq('category', category);
    if (limit) query = query.limit(parseInt(limit));

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ activities: (data || []).map(mapRow) });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, category, duration_minutes, description, activity_date } = req.body;

    if (!title || !category || duration_minutes === undefined) {
      return res.status(400).json({ error: 'title, category, and duration_minutes are required' });
    }

    const { data, error } = await supabase
      .from('daily_activities')
      .insert({
        user_id: req.userId,
        activity_name: title,
        category,
        hours_spent: parseFloat(duration_minutes) / 60,
        result: description || null,
        date: activity_date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(mapRow(data));
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, duration_minutes, description, activity_date } = req.body;

    const updates = {};
    if (title !== undefined) updates.activity_name = title;
    if (category !== undefined) updates.category = category;
    if (duration_minutes !== undefined) updates.hours_spent = parseFloat(duration_minutes) / 60;
    if (description !== undefined) updates.result = description;
    if (activity_date !== undefined) updates.date = activity_date;

    const { data, error } = await supabase
      .from('daily_activities')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Activity not found' });
    res.json(mapRow(data));
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('daily_activities')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
