import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Institution, PGYYear, Specialty, ActivityLog, ActivityCategory, MoodLog, MoodValue } from './types';

export const THEME_STORAGE_KEY = 'wellness-dark-mode';

interface QuickSignInPayload {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  pgyYear?: PGYYear;
  specialty?: Specialty;
  institution?: Institution | null;
}

interface AppState {
  isAuthenticated: boolean;
  oauthFlowInProgress: boolean;
  hasCompletedOnboarding: boolean;
  currentUser: User | null;
  selectedInstitution: Institution | null;
  activityLogs: ActivityLog[];
  moodLogs: MoodLog[];
  isDarkMode: boolean;

  signIn: (payload: QuickSignInPayload) => void;
  setOauthFlowInProgress: (value: boolean) => void;
  updateCurrentUserName: (name: string) => void;
  updateCurrentUserPGY: (pgyYear: PGYYear) => void;
  updateCurrentUserSpecialty: (specialty: Specialty) => void;
  updateAvatarUrl: (url: string | null) => void;
  logActivity: (activityId: string, activityTitle: string, category: ActivityCategory, durationMinutes: number) => void;
  hydrateActivityLogs: (logs: ActivityLog[]) => void;
  logMood: (mood: MoodValue) => void;
  hydrateMoodLogs: (logs: MoodLog[]) => void;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  signOut: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  oauthFlowInProgress: false,
  hasCompletedOnboarding: false,
  currentUser: null,
  selectedInstitution: null,
  activityLogs: [],
  moodLogs: [],
  isDarkMode: true,

  signIn: ({ id, name, email, pgyYear = 'PGY-1', specialty = 'Internal Medicine', institution = null, avatarUrl }) =>
    set({
      selectedInstitution: institution,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
      currentUser: {
        id: id ?? `local-${Date.now()}`,
        name: name.trim(),
        avatarUrl: avatarUrl ?? null,
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

  setOauthFlowInProgress: (value) => set({ oauthFlowInProgress: value }),

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

  updateAvatarUrl: (avatarUrl) =>
    set((state) => {
      if (!state.currentUser) return state;
      return { currentUser: { ...state.currentUser, avatarUrl } };
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

  hydrateActivityLogs: (logs) =>
    set((state) => {
      if (!state.currentUser) return { activityLogs: logs };
      return {
        activityLogs: logs,
        currentUser: { ...state.currentUser, sessionsCompleted: logs.length },
      };
    }),

  logMood: (mood) =>
    set((state) => {
      const log: MoodLog = {
        id: `mood-${Date.now()}`,
        mood,
        loggedAt: new Date(),
      };
      return { moodLogs: [log, ...state.moodLogs] };
    }),

  hydrateMoodLogs: (logs) => set({ moodLogs: logs }),

  toggleDarkMode: () =>
    set((state) => {
      const next = !state.isDarkMode;
      AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return { isDarkMode: next };
    }),

  setDarkMode: (value) => {
    AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(value)).catch(() => {});
    set({ isDarkMode: value });
  },

  signOut: () =>
    set({
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      currentUser: null,
      selectedInstitution: null,
      activityLogs: [],
      moodLogs: [],
    }),
}));
