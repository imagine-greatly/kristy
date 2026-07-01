import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import chatRoute from './routes/chat.js';
import guestRoute from './routes/guest.js';
import historyRoute from './routes/history.js';
import weeklySummaryRoute from './routes/weeklySummary.js';
import barcodeRoute from './routes/barcode.js';
import photoRoute from './routes/photo.js';
import onboardingRoute from './routes/onboarding.js';
import weightRoute from './routes/weight.js';
import { startCron } from './cron.js';

const app = express();
const PORT = process.env.PORT || 3001;

const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(cors({ origin: origins }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'kristy' }));

app.use('/api', chatRoute);
app.use('/api/guest', guestRoute); // no auth — the try-first guest experience
app.use('/api', historyRoute);
app.use('/api', weeklySummaryRoute);
app.use('/api', barcodeRoute);
app.use('/api', photoRoute);
app.use('/api', onboardingRoute);
app.use('/api', weightRoute);

app.listen(PORT, () => {
  console.log(`[kristy] server listening on http://localhost:${PORT}`);
  startCron();
});
