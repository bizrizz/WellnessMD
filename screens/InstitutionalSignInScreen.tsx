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
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../components/theme/useColors';
import { ColorPalette } from '../components/theme/colors';
import { Typography } from '../components/theme/typography';
import { PGYYear, PGY_YEARS, Specialty, SPECIALTIES } from '../store/types';
import { useAppStore } from '../store/appStore';
import { updateUserProfileMetadata, signUpWithEmail, signInWithEmail } from '../auth/authService';
import { isSupabaseConfigured } from '../supabase/client';

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
      signIn({ id: uid, name: fullName.trim(), email: normalizedEmail, pgyYear, specialty, institution: null });
    } else {
      const { data, error } = await signInWithEmail(normalizedEmail, password);
      if (error) {
        setStatusText(error.message);
        setIsSubmitting(false);
        return;
      }
      const uid = data?.user?.id;
      const meta = data?.user?.user_metadata ?? {};
      signIn({
        id: uid,
        name: typeof meta.full_name === 'string' ? meta.full_name : 'Wellness User',
        email: data?.user?.email ?? normalizedEmail,
        pgyYear: meta.pgy_year ?? 'PGY-1',
        specialty: meta.specialty ?? 'Internal Medicine',
        institution: null,
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
            <Text style={s.welcomeTitle}>WellnessMD</Text>
            <Text style={s.welcomeSub}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
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
                <ActivityIndicator size="small" color={c.background} />
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
    scroll: { paddingHorizontal: 24, paddingBottom: 40 },

    welcomeBlock: { marginTop: 48, marginBottom: 36 },
    welcomeTitle: { ...Typography.title, color: c.textPrimary, marginBottom: 6 },
    welcomeSub: { ...Typography.body, color: c.textSecondary },

    formBlock: { gap: 8 },
    label: { ...Typography.caption, color: c.textMuted, marginTop: 10 },
    input: {
      ...Typography.body,
      color: c.textPrimary,
      backgroundColor: c.cardBackground,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    errorText: { ...Typography.small, color: c.urgentRed },
    statusText: { ...Typography.small, color: c.textSecondary, marginTop: 4 },

    chipRow: { gap: 8, paddingVertical: 4 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 4 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: c.cardBackground,
    },
    chipSelected: { backgroundColor: c.accentGlow },
    chipText: { ...Typography.caption, color: c.textMuted },
    chipTextSelected: { color: c.accent },

    actions: { marginTop: 28, gap: 12, alignItems: 'center' },
    primaryBtn: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 15,
      borderRadius: 10,
      backgroundColor: c.accent,
    },
    primaryBtnDisabled: { backgroundColor: c.cardBorder },
    primaryBtnText: { ...Typography.subheadline, color: c.background, fontWeight: '600' },
    primaryBtnTextDisabled: { color: c.textMuted },

    linkText: { ...Typography.caption, color: c.accent },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    switchText: { ...Typography.caption, color: c.textMuted },
    switchAction: { ...Typography.caption, color: c.accent, fontWeight: '600' },
    devBtn: {
      marginTop: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    devBtnText: { ...Typography.small, color: c.textMuted, letterSpacing: 1 },
  });
}
