import app from './masteryFeatureWrapper.js';
import { handleMilestoneComplete } from './milestoneApi.js';
import {
  enhanceSevenDayProgression,
  enhanceFourteenDayProgression,
  enhanceTwentyOneDayProgression,
} from './challengeProgression.js';

function challengeEnhancer(path) {
  if (path === '/challenge' || path === '/challenges/7-day') return enhanceSevenDayProgression;
  if (path === '/momentum' || path === '/challenges/14-day' || path === '/challenges/14-day-get-active') return enhanceFourteenDayProgression;
  if (path === '/challenges/21-day' || path === '/challenges/21-day-consistency') return enhanceTwentyOneDayProgression;
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';

    if (path === '/api/milestones/complete') {
      return handleMilestoneComplete(request, env);
    }

    const response = await app.fetch(request, env, ctx);
    if (request.method !== 'GET') return response;

    const enhance = challengeEnhancer(path);
    if (!enhance) return response;

    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return response;

    const source = enhance(await response.text());
    const headers = new Headers(response.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store');
    return new Response(source, { status: response.status, headers });
  },
};
