import cron from 'node-cron';
import { supabase } from '../supabase.js';
import { generateReport } from '../services/reportGenerator.js';

export function startScheduler() {
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Generating daily reports...');
    await generateReportsForAllUsers('daily');
  });

  cron.schedule('0 9 * * 1', async () => {
    console.log('[CRON] Generating weekly reports...');
    await generateReportsForAllUsers('weekly');
  });

  cron.schedule('0 10 1 * *', async () => {
    console.log('[CRON] Generating monthly reports...');
    await generateReportsForAllUsers('monthly');
  });

  cron.schedule('0 3 * * *', async () => {
    console.log('[CRON] Cleaning up old reports...');
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    const { error } = await supabase
      .from('ai_reports')
      .delete()
      .lt('generated_at', cutoff.toISOString());

    if (error) {
      console.error('[CRON] Cleanup error:', error.message);
    } else {
      console.log('[CRON] Old reports cleaned successfully.');
    }
  });

  console.log('[CRON] Scheduler started.');
}

async function generateReportsForAllUsers(reportType) {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('onboarding_completed', true);

    if (!users || users.length === 0) {
      console.log(`[CRON] No users to generate ${reportType} reports for.`);
      return;
    }

    console.log(`[CRON] Generating ${reportType} reports for ${users.length} users...`);

    for (const user of users) {
      try {
        await generateReport(user.id, reportType);
      } catch (error) {
        console.error(`[CRON] Failed to generate ${reportType} report for user ${user.id}:`, error.message);
      }
    }

    console.log(`[CRON] ${reportType} report generation complete.`);
  } catch (error) {
    console.error(`[CRON] Error fetching users for ${reportType} reports:`, error.message);
  }
}
