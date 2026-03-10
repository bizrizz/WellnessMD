import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../components/theme/useColors';
import { ColorPalette } from '../components/theme/colors';
import { Typography } from '../components/theme/typography';
import { PGYYear, PGY_YEARS, Specialty, SPECIALTIES } from '../store/types';
import { useAppStore } from '../store/appStore';
import { updateUserProfileMetadata, signUpWithEmail, signInWithEmail, signInWithGoogle } from '../auth/authService';
import { isSupabaseConfigured } from '../supabase/client';
import { fetchProfile, updateProfile } from '../supabase/api';
import { validateEmail, validatePassword, validateName } from '../utils/validation';

type Step = 'choose' | 'email' | 'profile';

export default function InstitutionalSignInScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const s = React.useMemo(() => makeStyles(c, insets), [c, insets]);
  const signIn = useAppStore((s) => s.signIn);
  const setOauthFlowInProgress = useAppStore((s) => s.setOauthFlowInProgress);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<Step>('choose');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pgyYear, setPgyYear] = useState<PGYYear>('PGY-1');
  const [specialty, setSpecialty] = useState<Specialty>('Internal Medicine');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  // After auth, we hold user data for the profile step
  const [pendingUser, setPendingUser] = useState<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null>(null);

  const isSignUp = mode === 'signup';
  const normalizedEmail = email.trim().toLowerCase();
  const isValidEmail = normalizedEmail.includes('@') && normalizedEmail.includes('.');
  const hasValidName = fullName.trim().length >= 2;
  const hasPassword = password.length >= 6;
  const canSubmitEmail = isSignUp
    ? hasValidName && isValidEmail && hasPassword
    : isValidEmail && hasPassword;

  const goBack = () => {
    setStep('choose');
    setPendingUser(null);
    setStatusText('');
  };

  const switchMode = () => {
    setMode(isSignUp ? 'signin' : 'signup');
    setStep('choose');
    setPendingUser(null);
    setStatusText('');
  };

  const handleChooseEmail = () => {
    setStep('email');
    setStatusText('');
  };

  const handleChooseGoogle = async () => {
    if (!isSupabaseConfigured) {
      setStatusText('Supabase not configured.');
      return;
    }
    setIsGoogleLoading(true);
    setStatusText('');
    setOauthFlowInProgress(true);
    const { data, error } = await signInWithGoogle();
    setIsGoogleLoading(false);
    if (error) {
      setOauthFlowInProgress(false);
      setStatusText(error.message);
      return;
    }
    if (!data?.user) {
      setOauthFlowInProgress(false);
      return;
    }
    const meta = data.user.user_metadata ?? {};
    const { data: profile } = await fetchProfile(data.user.id);
    const name = (typeof meta.full_name === 'string' ? meta.full_name : meta.name) || profile?.full_name || 'Wellness User';
    const hasCompleteProfile = profile?.pgy_year && profile?.specialty;

    // Sign up with Google: always show PGY + specialty onboarding (same as email sign up)
    // Sign in with Google: only show if returning user never completed it
    if (isSignUp || !hasCompleteProfile) {
      setPendingUser({
        id: data.user.id,
        name,
        email: data.user.email ?? 'unknown@gmail.com',
        avatarUrl: profile?.avatar_url ?? null,
      });
      setPgyYear((profile?.pgy_year as PGYYear) ?? 'PGY-1');
      setSpecialty((profile?.specialty as Specialty) ?? 'Internal Medicine');
      setStep('profile');
      setOauthFlowInProgress(false);
    } else {
      setOauthFlowInProgress(false);
      signIn({
        id: data.user.id,
        name,
        email: data.user.email ?? 'unknown@gmail.com',
        pgyYear: (meta.pgy_year as PGYYear) ?? profile?.pgy_year ?? 'PGY-1',
        specialty: (meta.specialty as Specialty) ?? profile?.specialty ?? 'Internal Medicine',
        institution: null,
        avatarUrl: profile?.avatar_url ?? null,
      });
    }
  };

  const handleEmailSubmit = async () => {
    if (!canSubmitEmail || isSubmitting) return;
    if (!isSupabaseConfigured) {
      setStatusText('Supabase not configured.');
      return;
    }
    if (isSignUp) {
      const nameCheck = validateName(fullName);
      if (!nameCheck.valid) {
        setStatusText(nameCheck.error);
        return;
      }
    }
    const emailCheck = validateEmail(normalizedEmail);
    if (!emailCheck.valid) {
      setStatusText(emailCheck.error);
      return;
    }
    const passwordCheck = validatePassword(password, { forSignUp: isSignUp });
    if (!passwordCheck.valid) {
      setStatusText(passwordCheck.error);
      return;
    }
    setIsSubmitting(true);
    setStatusText('');

    if (isSignUp) {
      const { data, error } = await signUpWithEmail(normalizedEmail, password);
      if (error) {
        setStatusText(error.message);
        setIsSubmitting(false);
        return;
      }
      const uid = data?.user?.id;
      await updateUserProfileMetadata({ full_name: fullName.trim() });
      setPendingUser({
        id: uid!,
        name: fullName.trim(),
        email: normalizedEmail,
        avatarUrl: null,
      });
      setStep('profile');
    } else {
      const { data, error } = await signInWithEmail(normalizedEmail, password);
      if (error) {
        setStatusText(error.message);
        setIsSubmitting(false);
        return;
      }
      const uid = data?.user?.id;
      const meta = data?.user?.user_metadata ?? {};
      const { data: profile } = await fetchProfile(uid ?? '');
      signIn({
        id: uid,
        name: typeof meta.full_name === 'string' ? meta.full_name : (profile?.full_name ?? 'Wellness User'),
        email: data?.user?.email ?? normalizedEmail,
        pgyYear: meta.pgy_year ?? profile?.pgy_year ?? 'PGY-1',
        specialty: meta.specialty ?? profile?.specialty ?? 'Internal Medicine',
        institution: null,
        avatarUrl: profile?.avatar_url ?? null,
      });
    }
    setIsSubmitting(false);
  };

  const handleProfileComplete = async () => {
    if (!pendingUser) return;
    setIsSubmitting(true);
    setStatusText('');
    setOauthFlowInProgress(false);
    const { error } = await updateProfile(pendingUser.id, { pgy_year: pgyYear, specialty });
    if (!error) {
      await updateUserProfileMetadata({ pgy_year: pgyYear, specialty });
    }
    setIsSubmitting(false);
    if (error) {
      setStatusText(error.message ?? 'Could not save profile');
      return;
    }
    signIn({
      id: pendingUser.id,
      name: pendingUser.name,
      email: pendingUser.email,
      pgyYear,
      specialty,
      institution: null,
      avatarUrl: pendingUser.avatarUrl,
    });
  };

  // —— Step: Choose Email or Google ——
  if (step === 'choose') {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <ScrollView contentContainerStyle={s.scrollChoose} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.welcomeBlock}>
            <Text style={s.welcomeTitle}>
              {isSignUp ? "Let's get started" : 'Welcome back'}
            </Text>
            <Text style={s.welcomeSub}>
              {isSignUp
                ? 'Create your account to track your wellness journey'
                : 'Sign in to pick up where you left off'}
            </Text>
          </View>

          <View style={s.actions}>
            <TouchableOpacity style={s.primaryBtn} onPress={handleChooseEmail} activeOpacity={0.8}>
              <Ionicons name="mail-outline" size={22} color={c.cardDarkText} />
              <Text style={s.primaryBtnText}>Continue with Email</Text>
            </TouchableOpacity>

            {isSupabaseConfigured && (
              <View style={s.spacer} />
            )}
            {isSupabaseConfigured && (
              <TouchableOpacity
                style={s.googleBtn}
                onPress={handleChooseGoogle}
                disabled={isGoogleLoading}
                activeOpacity={0.8}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator size="small" color={c.textSecondary} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={20} color="#4285F4" />
                    <Text style={s.googleBtnText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <View style={s.spacerLg} />
            <TouchableOpacity onPress={switchMode} style={s.switchRow}>
              <Text style={s.switchText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <Text style={s.switchAction}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // —— Step: Email form ——
  if (step === 'email') {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={s.scrollForm} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={goBack} style={s.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="arrow-back" size={24} color={c.textPrimary} />
            </TouchableOpacity>

            <View style={s.welcomeBlock}>
              <Text style={s.welcomeTitle}>
                {isSignUp ? 'Create account' : 'Sign in'}
              </Text>
              <Text style={s.welcomeSub}>
                {isSignUp ? 'Enter your details to get started' : 'Enter your email and password'}
              </Text>
            </View>

            <View style={s.formBlockWithSpacing}>
              {isSignUp && (
                <>
                  <Text style={s.label}>Your name</Text>
                  <TextInput
                    style={s.input}
                    placeholder="e.g. Alex Kim"
                    placeholderTextColor={c.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    maxLength={100}
                  />
                </>
              )}

              <Text style={s.label}>Email</Text>
              <TextInput
                style={s.input}
                placeholder="you@email.com"
                placeholderTextColor={c.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={254}
              />

              <Text style={s.label}>Password</Text>
              <TextInput
                style={s.input}
                placeholder="Min 6 characters"
                placeholderTextColor={c.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                maxLength={128}
              />

              {statusText.length > 0 && <Text style={s.statusText}>{statusText}</Text>}
            </View>

            <View style={s.actions}>
              <TouchableOpacity
                style={[s.primaryBtn, !canSubmitEmail && s.primaryBtnDisabled]}
                activeOpacity={0.8}
                disabled={isSubmitting || !canSubmitEmail}
                onPress={handleEmailSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={c.cardDarkText} />
                ) : (
                  <Text style={[s.primaryBtnText, !canSubmitEmail && s.primaryBtnTextDisabled]}>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // —— Step: Profile (PGY + Specialty) ——
  if (step === 'profile') {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <ScrollView contentContainerStyle={s.scrollForm} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={goBack} style={s.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={24} color={c.textPrimary} />
          </TouchableOpacity>

          <View style={s.welcomeBlock}>
            <Text style={s.welcomeTitle}>Almost there</Text>
            <Text style={s.welcomeSub}>
              Tell us a bit about your training
            </Text>
          </View>

          <View style={s.formBlockWithSpacing}>
            <Text style={s.label}>Training year</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
              {PGY_YEARS.map((yr) => (
                <TouchableOpacity
                  key={yr}
                  style={[s.chip, pgyYear === yr && s.chipSelected]}
                  onPress={() => setPgyYear(yr)}
                >
                  <Text style={[s.chipText, pgyYear === yr && s.chipTextSelected]}>{yr}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.label}>Specialty</Text>
            <View style={s.chipWrap}>
              {SPECIALTIES.map((sp) => (
                <TouchableOpacity
                  key={sp}
                  style={[s.chip, specialty === sp && s.chipSelected]}
                  onPress={() => setSpecialty(sp)}
                >
                  <Text style={[s.chipText, specialty === sp && s.chipTextSelected]}>{sp}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {statusText.length > 0 && <Text style={s.statusText}>{statusText}</Text>}
          </View>

          <View style={s.actions}>
            <TouchableOpacity
              style={s.primaryBtn}
              activeOpacity={0.8}
              disabled={isSubmitting}
              onPress={handleProfileComplete}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={c.cardDarkText} />
              ) : (
                <Text style={s.primaryBtnText}>Complete</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

function makeStyles(c: ColorPalette, insets: { top: number; bottom: number }) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    flex: { flex: 1 },
    scrollChoose: {
      flexGrow: 1,
      paddingHorizontal: 32,
      paddingTop: 48,
      paddingBottom: Math.max(40, insets.bottom + 24),
      justifyContent: 'center',
    },
    scrollForm: {
      flexGrow: 1,
      paddingHorizontal: 32,
      paddingTop: 24,
      paddingBottom: Math.max(48, insets.bottom + 32),
    },

    backBtn: { position: 'absolute', top: insets.top + 8, left: 20, zIndex: 10, padding: 8 },

    welcomeBlock: { marginTop: 56, marginBottom: 44, alignItems: 'center' },
    welcomeTitle: { fontSize: 28, fontWeight: '600', color: c.textPrimary, letterSpacing: -0.3, fontFamily: 'Playfair Display', marginBottom: 12 },
    welcomeSub: { ...Typography.body, fontSize: 15, color: c.textSecondary, lineHeight: 24, textAlign: 'center', fontFamily: 'Lato', maxWidth: 300, paddingHorizontal: 16 },

    formBlock: { gap: 16 },
    formBlockWithSpacing: { gap: 16, marginBottom: 8 },
    label: { ...Typography.caption, color: c.textMuted, marginTop: 16, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: {
      ...Typography.body,
      color: c.textPrimary,
      backgroundColor: c.cardBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.cardBorder,
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    statusText: { ...Typography.small, color: c.urgentRed, marginTop: 12 },

    chipRow: { gap: 10, paddingVertical: 8 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingVertical: 8 },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: c.cardBackground,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    chipSelected: { backgroundColor: c.cardDark, borderColor: c.cardDark },
    chipText: { ...Typography.caption, color: c.textMuted },
    chipTextSelected: { color: c.cardDarkText },

    spacer: { height: 16 },
    spacerLg: { height: 28 },

    actions: { marginTop: 36, gap: 16, alignItems: 'center', width: '100%' },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      width: '100%',
      paddingVertical: 18,
      borderRadius: 16,
      backgroundColor: c.cardDark,
    },
    primaryBtnDisabled: { backgroundColor: c.cardBorder },
    primaryBtnText: { ...Typography.subheadline, color: c.cardDarkText, fontWeight: '600' },
    primaryBtnTextDisabled: { color: c.textMuted },

    switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    switchText: { ...Typography.caption, color: c.textMuted },
    switchAction: { ...Typography.caption, color: c.accent, fontWeight: '600' },

    googleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      width: '100%',
      paddingVertical: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.cardBorder,
      backgroundColor: c.cardBackground,
    },
    googleBtnText: { ...Typography.subheadline, color: c.textPrimary, fontWeight: '600' },
  });
}
