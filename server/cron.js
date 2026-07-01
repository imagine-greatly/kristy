import cron from 'node-cron';
import { generateAllWeeklySummaries } from './lib/weekly.js';

// Every Sunday at 8:00am, generate weekly summaries for all users.
export function startCron() {
  cron.schedule('0 8 * * 0', async () => {
    console.log('[kristy] Sunday 8am — generating weekly summaries…');
    try {
      await generateAllWeeklySummaries();
    } catch (err) {
      console.error('[kristy] weekly cron failed:', err.message);
    }
  });
  console.log('[kristy] weekly summary cron scheduled (Sun 8:00am).');
}
