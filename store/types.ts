export type UserRole = 'resident';

export type PGYYear = 'PGY-1' | 'PGY-2' | 'PGY-3' | 'PGY-4' | 'PGY-5' | 'Fellow';

export const PGY_YEARS: PGYYear[] = ['PGY-1', 'PGY-2', 'PGY-3', 'PGY-4', 'PGY-5', 'Fellow'];

export const SPECIALTIES = [
  'Internal Medicine',
  'Surgery',
  'Pediatrics',
  'Emergency Medicine',
  'Family Medicine',
  'Psychiatry',
  'Anesthesia',
  'Radiology',
  'Obstetrics & Gynecology',
  'Neurology',
  'Orthopedics',
  'Other',
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

export function getRoleDescription(pgyYear: PGYYear, specialty: Specialty): string {
  return `${pgyYear} ${specialty}`;
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string | null;
  role: UserRole;
  pgyYear: PGYYear;
  specialty: Specialty;
  institution: string;
  email: string;
  wellnessScore: number;
  streak: number;
  sessionsCompleted: number;
  stressors: string[];
  goals: string[];
}

export interface Institution {
  id: string;
  name: string;
  location: string;
  icon: string;
  color: string;
}

export type ActivityCategory = 'FOCUS' | 'PHYSICAL' | 'MINDFULNESS' | 'RECOVERY';

export const ActivityCategoryColors: Record<ActivityCategory, string> = {
  FOCUS: '#4ADE80',
  PHYSICAL: '#3B82F6',
  MINDFULNESS: '#A855F7',
  RECOVERY: '#F59E0B',
};

export interface ActivityStep {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  durationSeconds: number;
}

export interface WellnessActivity {
  id: string;
  title: string;
  category: ActivityCategory;
  duration: number;
  steps: ActivityStep[];
}

export interface Intervention {
  id: string;
  name: string;
  duration: string;
  effectiveness: number;
}

export type PostCategory =
  | 'All'
  | 'Residency Life'
  | 'Study Tips'
  | 'Mental Health'
  | 'Physical Health';

export const PostCategoryColors: Record<PostCategory, string> = {
  All: '#3B82F6',
  'Residency Life': '#22C55E',
  'Study Tips': '#F59E0B',
  'Mental Health': '#A855F7',
  'Physical Health': '#EF4444',
};

export const POST_CATEGORIES: PostCategory[] = [
  'All',
  'Residency Life',
  'Study Tips',
  'Mental Health',
  'Physical Health',
];

export interface CommunityPost {
  id: string;
  category: PostCategory;
  title: string;
  author: string;
  isAnonymous: boolean;
  timeAgo: string;
  content: string;
  likes: number;
  comments: number;
  imageUrl?: string;
}

export interface ActivityLog {
  id: string;
  activityId: string;
  activityTitle: string;
  category: ActivityCategory;
  durationMinutes: number;
  completedAt: Date;
}

export type MoodValue = 'Happy' | 'Calm' | 'Relax' | 'Focus';

export interface MoodLog {
  id: string;
  mood: MoodValue;
  loggedAt: Date;
}

export type ResourceCategory = 'Mental Health' | 'Nutrition' | 'Spiritual Support' | 'Institutional Support';

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'Mental Health',
  'Nutrition',
  'Spiritual Support',
  'Institutional Support',
];

export const ResourceCategoryIcons: Record<ResourceCategory, string> = {
  'Mental Health': 'heart-outline',
  'Nutrition': 'nutrition',
  'Spiritual Support': 'leaf-outline',
  'Institutional Support': 'business-outline',
};

export interface Resource {
  id: string;
  title: string;
  category: ResourceCategory;
  description: string;
  contactInfo?: string;
  link?: string;
}
