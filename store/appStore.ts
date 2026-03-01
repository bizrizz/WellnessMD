import { create } from 'zustand';
import { User, Institution, PGYYear, Specialty, ActivityLog, ActivityCategory } from './types';

interface QuickSignInPayload {
  name: string;
  email: string;
  pgyYear?: PGYYear;
  specialty?: Specialty;
  institution?: Institution | null;
}

interface AppState {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  currentUser: User | null;
  selectedInstitution: Institution | null;
  activityLogs: ActivityLog[];
  isDarkMode: boolean;

  signIn: (payload: QuickSignInPayload) => void;
  updateCurrentUserName: (name: string) => void;
  updateCurrentUserPGY: (pgyYear: PGYYear) => void;
  updateCurrentUserSpecialty: (specialty: Specialty) => void;
  logActivity: (activityId: string, activityTitle: string, category: ActivityCategory, durationMinutes: number) => void;
  toggleDarkMode: () => void;
  signOut: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  currentUser: null,
  selectedInstitution: null,
  activityLogs: [],
  isDarkMode: true,

  signIn: ({ name, email, pgyYear = 'PGY-1', specialty = 'Internal Medicine', institution = null }) =>
    set({
      selectedInstitution: institution,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
      currentUser: {
        id: 'user-1',
        name: name.trim(),
        role: 'resident',
        pgyYear,
        specialty,
        institution: institution?.name ?? 'WellnessMD',
        email: email.trim().toLowerCase(),
        wellnessScore: 82,
        streak: 0,
        sessionsCompleted: 0,
        stressors: [],
        goals: [],
      },
    }),

  updateCurrentUserName: (name) =>
    set((state) => {
      if (!state.currentUser) return state;
      return { currentUser: { ...state.currentUser, name: name.trim() } };
    }),

  updateCurrentUserPGY: (pgyYear) =>
    set((state) => {
      if (!state.currentUser) return state;
      return { currentUser: { ...state.currentUser, pgyYear } };
    }),

  updateCurrentUserSpecialty: (specialty) =>
    set((state) => {
      if (!state.currentUser) return state;
      return { currentUser: { ...state.currentUser, specialty } };
    }),

  logActivity: (activityId, activityTitle, category, durationMinutes) =>
    set((state) => {
      if (!state.currentUser) return state;

      const log: ActivityLog = {
        id: `log-${Date.now()}`,
        activityId,
        activityTitle,
        category,
        durationMinutes,
        completedAt: new Date(),
      };

      const newLogs = [...state.activityLogs, log];
      const sessionsCompleted = state.currentUser.sessionsCompleted + 1;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const hadActivityYesterday = state.activityLogs.some((l) => {
        const d = new Date(l.completedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === yesterday.getTime();
      });

      const hadActivityToday = state.activityLogs.some((l) => {
        const d = new Date(l.completedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });

      let streak = state.currentUser.streak;
      if (!hadActivityToday) {
        streak = hadActivityYesterday ? streak + 1 : 1;
      }

      return {
        activityLogs: newLogs,
        currentUser: { ...state.currentUser, sessionsCompleted, streak },
      };
    }),

  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  signOut: () =>
    set({
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      currentUser: null,
      selectedInstitution: null,
      activityLogs: [],
    }),
}));
