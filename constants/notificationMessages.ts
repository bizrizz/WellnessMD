/**
 * Wellness notification messages for push reminders.
 * Each maps to an activity (a1, a2, a3) so tapping opens the right screen.
 */

export interface WellnessNotificationMessage {
  body: string;
  activityId: 'a1' | 'a2' | 'a3';
}

export const WELLNESS_NOTIFICATION_MESSAGES: WellnessNotificationMessage[] = [
  // 5-min Breathing (a1)
  { body: 'Time for a 5-minute breather.', activityId: 'a1' },
  { body: 'Pause and breathe. Just 5 minutes can reset your nervous system.', activityId: 'a1' },
  { body: 'Your body could use some deep breaths right now.', activityId: 'a1' },
  { body: 'Step away for a quick breathing break?', activityId: 'a1' },
  { body: 'Box breathing: 4 in, 4 hold, 4 out. Ready when you are.', activityId: 'a1' },
  { body: 'A few minutes of mindful breathing can change your whole shift.', activityId: 'a1' },
  { body: 'Breathe. You’ve got this.', activityId: 'a1' },
  { body: '5 minutes of calm is just a tap away.', activityId: 'a1' },

  // Quick Stretching (a2)
  { body: 'Ready for a quick stretch? Your body will thank you.', activityId: 'a2' },
  { body: 'Release that shoulder tension—8 minutes of stretching awaits.', activityId: 'a2' },
  { body: 'Your neck and back could use some love right now.', activityId: 'a2' },
  { body: 'Quick stretch break? Neck, shoulders, spine—all in 8 minutes.', activityId: 'a2' },
  { body: 'Stand up, stretch it out. You deserve it.', activityId: 'a2' },
  { body: 'Tight? A quick stretch can make a big difference.', activityId: 'a2' },
  { body: 'Cat-cow, child’s pose, and more. Your back is calling.', activityId: 'a2' },
  { body: '8 minutes to loosen up. Worth it.', activityId: 'a2' },

  // Rapid Reset (a3)
  { body: 'Take a short mindfulness break.', activityId: 'a3' },
  { body: '3 minutes to ground yourself. Pause, notice, breathe.', activityId: 'a3' },
  { body: 'Quick reset: Notice. Ground. Breathe.', activityId: 'a3' },
  { body: 'Feeling scattered? A 3-minute reset could help.', activityId: 'a3' },
  { body: 'You are present. You are capable. Take 3 minutes to feel it.', activityId: 'a3' },
  { body: 'Mindfulness doesn’t need hours. Try 3 minutes.', activityId: 'a3' },
  { body: 'Wherever you are—pause, breathe, come back.', activityId: 'a3' },
  { body: 'A moment of stillness is waiting for you.', activityId: 'a3' },
];
