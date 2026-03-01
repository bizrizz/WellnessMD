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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../components/theme/useColors';
import { ColorPalette } from '../components/theme/colors';
import { Typography } from '../components/theme/typography';
import { PGYYear, PGY_YEARS, Specialty, SPECIALTIES } from '../store/types';
import { useAppStore } from '../store/appStore';
import { updateUserProfileMetadata, signUpWithEmail, signInWithEmail } from '../auth/authService';
import { isSupabaseConfigured } from '../supabase/client';
import { fetchProfile } from '../supabase/api';

export default function InstitutionalSignInScreen() {
  const c = useColors();
  const s = React.useMemo(() => makeStyles(c), [c]);
  const signIn = useAppStore((s) => s.signIn);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pgyYear, setPgyYear] = useState<PGYYear>('PGY-1');
  const [specialty, setSpecialty] = useState<Specialty>('Internal Medicine');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('');

  const isSignUp = mode === 'signup';
  const normalizedEmail = email.trim().toLowerCase();
  const isValidEmail = normalizedEmail.includes('@') && normalizedEmail.includes('.');
  const hasValidName = fullName.trim().length >= 2;
  const hasPassword = password.length >= 6;
  const canSubmit = isSignUp
    ? hasValidName && isValidEmail && hasPassword
    : isValidEmail && hasPassword;

  const handleDevBypass = () => {
    signIn({
      name: fullName.trim() || 'Dev User',
      email: normalizedEmail || 'devuser@gmail.com',
      pgyYear,
      specialty,
      institution: null,
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    if (!isSupabaseConfigured) {
      setStatusText('Supabase not configured.');
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
      await updateUserProfileMetadata({ full_name: fullName.trim(), pgy_year: pgyYear, specialty });
      const { data: profile } = await fetchProfile(uid ?? '');
      signIn({
        id: uid,
        name: fullName.trim(),
        email: normalizedEmail,
        pgyYear,
        specialty,
        institution: null,
        avatarUrl: profile?.avatar_url ?? null,
      });
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

  const switchMode = () => {
    setMode(isSignUp ? 'signin' : 'signup');
    setStatusText('');
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Welcome */}
          <View style={s.welcomeBlock}>
            <Text style={s.welcomeTitle}>
              {isSignUp ? "Let's get started" : 'Welcome back'}
            </Text>
            <Text style={s.welcomeSub}>
              {isSignUp ? 'Create your account to track your wellness journey' : 'Sign in to pick up where you left off'}
            </Text>
          </View>

          {/* Form */}
          <View style={s.formBlock}>

            {/* Name — sign up only */}
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
            />

            {/* PGY + Specialty — sign up only */}
            {isSignUp && (
              <>
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
              </>
            )}

            {statusText.length > 0 && <Text style={s.statusText}>{statusText}</Text>}
          </View>

          {/* Actions */}
          <View style={s.actions}>
            <TouchableOpacity
              style={[s.primaryBtn, !canSubmit && s.primaryBtnDisabled]}
              activeOpacity={0.8}
              disabled={isSubmitting || !canSubmit}
              onPress={handleSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={c.cardDarkText} />
              ) : (
                <Text style={[s.primaryBtnText, !canSubmit && s.primaryBtnTextDisabled]}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={switchMode} style={s.switchRow}>
              <Text style={s.switchText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <Text style={s.switchAction}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            {__DEV__ && (
              <TouchableOpacity style={s.devBtn} onPress={handleDevBypass}>
                <Text style={s.devBtnText}>DEV BYPASS</Text>
              </TouchableOpacity>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(c: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    flex: { flex: 1 },
    scroll: { paddingHorizontal: 28, paddingBottom: 40 },

    welcomeBlock: { marginTop: 56, marginBottom: 40, alignItems: 'center' },
    welcomeTitle: { fontSize: 28, fontWeight: '600', color: c.textPrimary, letterSpacing: -0.3, fontFamily: 'Playfair Display', marginBottom: 8 },
    welcomeSub: { ...Typography.body, fontSize: 15, color: c.textSecondary, lineHeight: 22, textAlign: 'center', fontFamily: 'Lato', maxWidth: 280 },

    formBlock: { gap: 8 },
    label: { ...Typography.caption, color: c.textMuted, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: {
      ...Typography.body,
      color: c.textPrimary,
      backgroundColor: c.cardBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.cardBorder,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    errorText: { ...Typography.small, color: c.urgentRed },
    statusText: { ...Typography.small, color: c.urgentRed, marginTop: 4 },

    chipRow: { gap: 8, paddingVertical: 4 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 4 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: c.cardBackground,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    chipSelected: { backgroundColor: c.cardDark, borderColor: c.cardDark },
    chipText: { ...Typography.caption, color: c.textMuted },
    chipTextSelected: { color: c.cardDarkText },

    actions: { marginTop: 32, gap: 14, alignItems: 'center' },
    primaryBtn: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: c.cardDark,
    },
    primaryBtnDisabled: { backgroundColor: c.cardBorder },
    primaryBtnText: { ...Typography.subheadline, color: c.cardDarkText, fontWeight: '600' },
    primaryBtnTextDisabled: { color: c.textMuted },

    linkText: { ...Typography.caption, color: c.accent },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    switchText: { ...Typography.caption, color: c.textMuted },
    switchAction: { ...Typography.caption, color: c.accent, fontWeight: '600' },
    devBtn: {
      marginTop: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    devBtnText: { ...Typography.small, color: c.textMuted, letterSpacing: 1 },
  });
}
