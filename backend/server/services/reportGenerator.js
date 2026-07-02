import { supabase } from '../supabase.js';
import { generateRecommendations } from './gemini.js';
import { getTodayString, getWeekStart, getMonthStart, subDays } from './format.js';

export async function generateReport(userId, reportType) {
  const { data: businessProfile } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!businessProfile) {
    throw new Error('No business profile found for user');
  }

  const today = new Date();
  const todayStr = getTodayString();
  const todayDateStr = todayStr;

  let periodStart, periodEnd, lookbackDays;

  switch (reportType) {
    case 'daily':
      periodStart = todayDateStr;
      periodEnd = todayDateStr;
      lookbackDays = 30;
      break;
    case 'weekly':
      periodStart = getWeekStart(today);
      periodEnd = todayDateStr;
      lookbackDays = 90;
      break;
    case 'monthly':
      periodStart = getMonthStart(today);
      periodEnd = todayDateStr;
      lookbackDays = 365;
      break;
    default:
      throw new Error('Invalid report type. Use daily, weekly, or monthly.');
  }

  const { data: periodActivities } = await supabase
    .from('daily_activities')
    .select('*')
    .eq('user_id', userId)
    .gte('date', periodStart)
    .lte('date', periodEnd)
    .order('date', { ascending: false });

  const { data: allPastActivities } = await supabase
    .from('daily_activities')
    .select('*')
    .eq('user_id', userId)
    .lt('date', periodStart)
    .gte('date', subDays(today, lookbackDays).toISOString().split('T')[0])
    .order('date', { ascending: false });

  const { data: pendingTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['Pending', 'In Progress']);

  const result = await generateRecommendations(
    businessProfile,
    periodActivities || [],
    allPastActivities || [],
    pendingTasks || []
  );

  const content = {
    ...result,
    total_activities: periodActivities?.length || 0,
    total_minutes: (periodActivities || []).reduce((sum, a) => sum + Number(a.hours_spent) * 60, 0),
    categories_covered: new Set((periodActivities || []).map(a => a.category)).size
  };

  const { data: report, error } = await supabase
    .from('ai_reports')
    .insert({
      user_id: userId,
      report_type: reportType,
      content: content,
      period_start: periodStart,
      period_end: periodEnd
    })
    .select()
    .single();

  if (error) throw error;
  return report;
}
