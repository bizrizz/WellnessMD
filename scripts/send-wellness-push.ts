/**
 * Send wellness reminder push notifications via Expo Push API.
 *
 * Run: npx ts-node scripts/send-wellness-push.ts
 *
 * Prerequisites:
 * 1. Supabase: run schema.sql (user_push_tokens, profiles.smart_alerts_enabled)
 * 2. Get tokens from: select expo_push_token from user_push_tokens upt
 *    join profiles p on p.id = upt.user_id where p.smart_alerts_enabled = true;
 *
 * This script is a template. In production, use a Supabase Edge Function
 * or cron job that queries tokens and calls Expo Push API.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { WELLNESS_NOTIFICATION_MESSAGES } = require('../constants/notificationMessages');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

async function sendPush(tokens: string[], message: (typeof WELLNESS_NOTIFICATION_MESSAGES)[0]) {
  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title: 'WellnessMD',
    body: message.body,
    data: { activityId: message.activityId },
  }));

  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });

  if (!res.ok) {
    throw new Error(`Expo Push API error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data;
}

async function main() {
  const tokens = process.env.EXPO_PUSH_TOKENS?.split(',').filter(Boolean) ?? [];
  if (tokens.length === 0) {
    console.log('Usage: EXPO_PUSH_TOKENS=ExponentPushToken[xxx],ExponentPushToken[yyy] npx ts-node scripts/send-wellness-push.ts');
    console.log('Get tokens from Supabase: select expo_push_token from user_push_tokens;');
    process.exit(1);
  }

  const msg = WELLNESS_NOTIFICATION_MESSAGES[Math.floor(Math.random() * WELLNESS_NOTIFICATION_MESSAGES.length)];
  const result = await sendPush(tokens, msg);
  console.log('Sent:', JSON.stringify(result, null, 2));
}

main().catch(console.error);
