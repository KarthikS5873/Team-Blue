import { Router } from 'express';
import { supabase } from '../supabase.js';
import { authenticateUser } from '../middleware/auth.js';
import { generateRecommendations, generateTaskPriorities, autoAssignPriority } from '../services/gemini.js';
import { aggregateByCategory } from '../services/format.js';

const router = Router();
router.use(authenticateUser);

router.post('/recommendations', async (req, res) => {
  try {
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', req.userId)
      .single();

    if (!businessProfile) {
      return res.status(400).json({ error: 'Complete onboarding first' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const { data: todayActivities } = await supabase
      .from('daily_activities')
      .select('*')
      .eq('user_id', req.userId)
      .eq('date', todayStr);

    const { data: pastActivities } = await supabase
      .from('daily_activities')
      .select('*')
      .eq('user_id', req.userId)
      .lt('date', todayStr)
      .order('date', { ascending: false })
      .limit(200);

    const { data: pendingTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.userId)
      .in('status', ['Pending', 'In Progress']);

    const result = await generateRecommendations(
      businessProfile,
      todayActivities || [],
      pastActivities || [],
      pendingTasks || []
    );

    res.json(result);
  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({
      error: 'Failed to generate recommendations',
      recommendations: [
        'Log more activities to get personalized AI insights.',
        'Complete your daily activity log for today.',
        'Set your business goals in settings.'
      ],
      taskPriorities: { high: [], medium: [], low: [] },
      todayFocus: 'Log your activities to receive tailored recommendations.',
      weekFocus: 'Complete your profile and start tracking daily.'
    });
  }
});

router.post('/prioritize', async (req, res) => {
  try {
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', req.userId)
      .single();

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.userId);

    if (!tasks || tasks.length === 0) {
      return res.json({ high: [], medium: [], low: [] });
    }

    let aiResult = null;
    try {
      aiResult = await generateTaskPriorities(
        businessProfile || { business_name: 'My Business', business_type: 'Freelancer', role: 'Freelancer', location: '', goal: '' },
        tasks
      );
    } catch (aiErr) {
      console.warn('Gemini prioritization failed, using local logic:', aiErr.message);
    }

    const nameToPriority = {};
    if (aiResult) {
      for (const p of ['high', 'medium', 'low']) {
        for (const name of (aiResult[p] || [])) {
          nameToPriority[name.toLowerCase().trim()] = p;
        }
      }
    }

    const updatedCounts = { high: 0, medium: 0, low: 0 };

    for (const task of tasks) {
      const taskNameLower = (task.task_name || '').toLowerCase().trim();
      let priority = nameToPriority[taskNameLower];
      if (!priority) {
        priority = autoAssignPriority(task.task_name, task.deadline, businessProfile);
      }

      const caps = priority.charAt(0).toUpperCase() + priority.slice(1);
      if (caps !== task.priority) {
        await supabase
          .from('tasks')
          .update({ priority: caps })
          .eq('id', task.id)
          .eq('user_id', req.userId);
      }

      updatedCounts[priority]++;
    }

    res.json({
      high: updatedCounts.high,
      medium: updatedCounts.medium,
      low: updatedCounts.low,
      message: `${updatedCounts.high + updatedCounts.medium + updatedCounts.low} tasks prioritized`
    });
  } catch (error) {
    console.error('AI prioritize error:', error);
    res.status(500).json({ error: 'Failed to prioritize tasks' });
  }
});

export default router;
