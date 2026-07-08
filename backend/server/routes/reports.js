import { Router } from 'express';
import { supabase } from '../supabase.js';
import { authenticateUser } from '../middleware/auth.js';
import { generateReport } from '../services/reportGenerator.js';

const router = Router();
router.use(authenticateUser);

const mapRow = (row) => row ? {
  id: row.id,
  type: row.report_type,
  content: row.content?.recommendations?.join?.('\n') || (typeof row.content === 'string' ? row.content : JSON.stringify(row.content)),
  recommendations: row.content?.recommendations || [],
  timeWastedTasks: row.content?.timeWastedTasks || [],
  areasToFocus: row.content?.areasToFocus || [],
  incomeGrowthStatement: row.content?.incomeGrowthStatement || '',
  incomeGrowthProjections: row.content?.incomeGrowthProjections || [],
  total_activities: row.content?.total_activities,
  total_minutes: row.content?.total_minutes,
  categories_covered: row.content?.categories_covered,
  period_start: row.period_start,
  period_end: row.period_end,
  generated_at: row.generated_at
} : null;

router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;

    if (!['daily', 'weekly', 'monthly'].includes(type)) {
      return res.status(400).json({ error: 'Invalid report type. Use daily, weekly, or monthly.' });
    }

    const { data, error } = await supabase
      .from('ai_reports')
      .select('*')
      .eq('user_id', req.userId)
      .eq('report_type', type)
      .order('generated_at', { ascending: false })
      .limit(50);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ reports: (data || []).map(mapRow) });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;

    const { data, error } = await supabase
      .from('ai_reports')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .eq('report_type', type)
      .single();

    if (error) return res.status(404).json({ error: 'Report not found' });
    res.json({ report: mapRow(data) });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { type } = req.body;

    if (!['daily', 'weekly', 'monthly'].includes(type)) {
      return res.status(400).json({ error: 'Invalid report type. Use daily, weekly, or monthly.' });
    }

    const report = await generateReport(req.userId, type);
    res.status(201).json({ report: mapRow(report) });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;
