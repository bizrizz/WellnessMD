import {
  Institution,
  WellnessActivity,
  Intervention,
  CommunityPost,
  Resource,
} from './types';

export const sampleInstitutions: Institution[] = [
  { id: '1', name: 'Toronto General Hospital', location: 'Toronto, ON', icon: 'business', color: '#4ADE80' },
  { id: '2', name: 'McGill University Health Centre', location: 'Montreal, QC', icon: 'school', color: '#22C55E' },
  { id: '3', name: 'Vancouver General Hospital', location: 'Vancouver, BC', icon: 'medkit', color: '#16A34A' },
  { id: '4', name: 'The Ottawa Hospital', location: 'Ottawa, ON', icon: 'heart', color: '#15803D' },
  { id: '5', name: 'Kingston Health Sciences Centre', location: 'Kingston, ON', icon: 'library', color: '#166534' },
  { id: '6', name: 'Sunnybrook Health Sciences Centre', location: 'Toronto, ON', icon: 'sunny', color: '#4ADE80' },
  { id: '7', name: "Queen's University School of Medicine", location: 'Kingston, ON', icon: 'school', color: '#22C55E' },
  { id: '8', name: 'University of Toronto Medicine', location: 'Toronto, ON', icon: 'book', color: '#16A34A' },
];

export const sampleActivities: WellnessActivity[] = [
  {
    id: 'a1',
    title: '5-min Breathing',
    category: 'FOCUS',
    duration: 5,
    steps: [
      { id: 's1', name: 'Prepare', subtitle: 'Get Comfortable', description: 'Find a quiet space and sit comfortably. Close your eyes gently.', durationSeconds: 30 },
      { id: 's2', name: 'Box Breathing', subtitle: '4-4-4-4', description: 'Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat.', durationSeconds: 60 },
      { id: 's3', name: 'Deep Breathing', subtitle: 'Belly Breaths', description: 'Place hand on belly. Breathe deeply into your diaphragm.', durationSeconds: 90 },
      { id: 's4', name: 'Release', subtitle: 'Let Go', description: 'Allow your breathing to return to normal. Notice how you feel.', durationSeconds: 45 },
    ],
  },
  {
    id: 'a2',
    title: 'Quick Stretching',
    category: 'PHYSICAL',
    duration: 8,
    steps: [
      { id: 's5', name: 'Neck Rolls', subtitle: 'Release Tension', description: 'Gently roll your head in circles, 5 times each direction.', durationSeconds: 45 },
      { id: 's6', name: 'Shoulder Shrugs', subtitle: 'Open Chest', description: 'Raise shoulders to ears, hold 3 seconds, release. Repeat 8 times.', durationSeconds: 40 },
      { id: 's7', name: 'Mountain Pose', subtitle: 'Tadasana', description: 'Stand with feet together, arms at your sides. Ground your feet firmly into the earth and lengthen your spine.', durationSeconds: 45 },
      { id: 's8', name: 'Forward Fold', subtitle: 'Uttanasana', description: 'Exhale and fold forward from hips. Let head hang heavy.', durationSeconds: 60 },
      { id: 's9', name: 'Cat-Cow', subtitle: 'Spinal Flow', description: 'On hands and knees, alternate between arching and rounding spine.', durationSeconds: 60 },
      { id: 's10', name: "Child's Pose", subtitle: 'Rest', description: 'Kneel and fold forward, arms extended. Breathe deeply.', durationSeconds: 60 },
      { id: 's11', name: 'Seated Twist', subtitle: 'Spine Reset', description: 'Sit cross-legged, twist gently to each side. Hold 30 seconds each.', durationSeconds: 60 },
      { id: 's12', name: 'Final Rest', subtitle: 'Integration', description: 'Lie flat and breathe. Notice the effects of your practice.', durationSeconds: 60 },
    ],
  },
  {
    id: 'a3',
    title: 'Rapid Reset',
    category: 'MINDFULNESS',
    duration: 3,
    steps: [
      { id: 's13', name: 'Pause', subtitle: 'Stop', description: 'Wherever you are, pause completely. Take one deep breath.', durationSeconds: 20 },
      { id: 's14', name: 'Notice', subtitle: 'Observe', description: 'Notice 3 things you can see right now without judgment.', durationSeconds: 40 },
      { id: 's15', name: 'Ground', subtitle: 'Feel', description: 'Feel your feet on the ground. Notice the weight of your body.', durationSeconds: 40 },
      { id: 's16', name: 'Breathe', subtitle: 'Release', description: 'Take 5 slow, deep breaths. You are present. You are capable.', durationSeconds: 80 },
    ],
  },
];

export const sampleInterventions: Intervention[] = [
  { id: 'i1', name: 'Power Nap', duration: '20m', effectiveness: 85 },
  { id: 'i2', name: 'Deep Breathing', duration: '5m', effectiveness: 72 },
  { id: 'i3', name: 'Hydration Target', duration: 'ongoing', effectiveness: 50 },
];

export const samplePosts: CommunityPost[] = [
  {
    id: 'p1',
    category: 'Residency Life',
    title: 'How to handle your first 24-hour shift?',
    author: 'Dr. Anonymous',
    isAnonymous: true,
    timeAgo: '2h ago',
    content: 'The transition to long shifts can be daunting. Here are some strategies that helped me survive my first one...',
    likes: 24,
    comments: 12,
    imageUrl: 'hospital_hallway',
  },
  {
    id: 'p2',
    category: 'Mental Health',
    title: 'Med school burnout is hitting hard this week.',
    author: 'Student Doctor',
    isAnonymous: false,
    timeAgo: '5h ago',
    content: "I feel like I'm drowning in flashcards and clinical rotations. Does anyone have tips for reclaiming...",
    likes: 156,
    comments: 48,
  },
  {
    id: 'p3',
    category: 'Study Tips',
    title: 'Anki Deck for Step 2 CK?',
    author: 'FutureMD_2025',
    isAnonymous: false,
    timeAgo: '12h ago',
    content: 'Looking for the most updated deck for clinical rotations and Step 2. Is AnKing still the gold standard or is there something newer?',
    likes: 9,
    comments: 21,
  },
];

export const sampleResources: Resource[] = [
  {
    id: 'r1',
    title: 'Physician Support Program',
    category: 'Mental Health',
    description: 'Confidential 24/7 counseling for physicians and residents. Free and anonymous.',
    contactInfo: '1-888-667-3747',
    link: 'https://www.physiciansupportprogram.ca',
  },
  {
    id: 'r2',
    title: 'Crisis Text Line',
    category: 'Mental Health',
    description: 'Text HOME to 741741 to connect with a trained crisis counselor.',
    contactInfo: 'Text HOME to 741741',
  },
  {
    id: 'r3',
    title: 'Mindfulness-Based Stress Reduction (MBSR)',
    category: 'Mental Health',
    description: 'Evidence-based program proven to reduce burnout in healthcare workers.',
    link: 'https://www.umassmed.edu/cfm/mindfulness-based-programs/mbsr-courses/',
  },
  {
    id: 'r4',
    title: 'Meal Planning for Busy Residents',
    category: 'Nutrition',
    description: 'Simple, batch-friendly recipes designed for residents with limited time and energy.',
  },
  {
    id: 'r5',
    title: 'Hydration & Performance',
    category: 'Nutrition',
    description: 'How proper hydration during long shifts improves cognitive function and reduces fatigue.',
  },
  {
    id: 'r6',
    title: 'Sleep Nutrition Guide',
    category: 'Nutrition',
    description: 'Foods that promote better sleep quality for shift workers and post-call recovery.',
  },
  {
    id: 'r7',
    title: 'Chaplaincy & Spiritual Care',
    category: 'Spiritual Support',
    description: 'Most hospitals offer non-denominational spiritual support services for staff and trainees.',
  },
  {
    id: 'r8',
    title: 'Reflective Practice Groups',
    category: 'Spiritual Support',
    description: 'Facilitated group sessions for processing difficult patient encounters and moral distress.',
  },
  {
    id: 'r9',
    title: 'Resident Wellness Office',
    category: 'Institutional Support',
    description: 'Your program likely has a dedicated wellness lead. Reach out for accommodations or support.',
  },
  {
    id: 'r10',
    title: 'PARO Wellness Resources',
    category: 'Institutional Support',
    description: 'Professional Association of Residents of Ontario — wellness grants, advocacy, and peer support.',
    link: 'https://www.myparo.ca',
  },
];
