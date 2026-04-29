// Vercel Speed Insights
// This script initializes Speed Insights for measuring Core Web Vitals
import { injectSpeedInsights } from '@vercel/speed-insights';

injectSpeedInsights({
  debug: false
});
