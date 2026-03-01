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
import { requestEmailOtp, updateUserProfileMetadata, verifyEmailOtp } from '../auth/authService';
import { isSupabaseConfigured } from '../supabase/client';

export default function InstitutionalSignInScreen() {
  const c = useColors();
  const s = React.useMemo(() => makeStyles(c), [c]);
  const signIn = useAppStore((s) => s.signIn);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [pgyYear, setPgyYear] = useState<PGYYear>('PGY-1');
  const [specialty, setSpecialty] = useState<Specialty>('Internal Medicine');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('');

  const isSignUp = mode === 'signup';
  const normalizedEmail = email.trim().toLowerCase();
  const isGmail = normalizedEmail.endsWith('@gmail.com');
  const hasValidName = fullName.trim().length >= 2;
  const canContinue = isSignUp ? hasValidName && isGmail : isGmail;
  const canVerify = canContinue && otpCode.trim().length === 6;

  const handleDevBypass = () => {
    signIn({
      name: fullName.trim() || 'Dev User',
      email: normalizedEmail || 'devuser@gmail.com',
      pgyYear,
      specialty,
      institution: null,
    });
  };

  const handleContinue = async () => {
    if (!canContinue || isSubmitting) return;
    if (!isSupabaseConfigured) {
      setStatusText('Supabase not configured.');
      return;
    }
    setIsSubmitting(true);
    setStatusText('');
    const { error } = await requestEmailOtp(normalizedEmail);
    if (error) {
      setStatusText(error.message);
      setIsSubmitting(false);
      return;
    }
    setOtpSent(true);
    setStatusText('Code sent — enter the 6-digit code from your email.');
    setIsSubmitting(false);
  };

  const handleVerifyCode = async () => {
    if (!canVerify || isSubmitting) return;
    setIsSubmitting(true);
    setStatusText('');
    const { error, data } = await verifyEmailOtp(normalizedEmail, otpCode.trim());
    if (error) {
      setStatusText(error.message);
      setIsSubmitting(false);
      return;
    }

    const uid = data?.user?.id;
    if (isSignUp) {
      await updateUserProfileMetadata({ full_name: fullName.trim(), pgy_year: pgyYear, specialty });
      signIn({ id: uid, name: fullName.trim(), email: normalizedEmail, pgyYear, specialty, institution: null });
    } else {
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
    setOtpSent(false);
    setOtpCode('');
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

            <Text style={s.label}>Gmail</Text>
            <TextInput
              style={s.input}
              placeholder="you@gmail.com"
              placeholderTextColor={c.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!isGmail && email.length > 0 && <Text style={s.errorText}>Please use a Gmail address.</Text>}

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

            {otpSent && (
              <>
                <Text style={s.label}>Verification code</Text>
                <TextInput
                  style={s.input}
                  placeholder="6-digit code"
                  placeholderTextColor={c.textMuted}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </>
            )}

            {statusText.length > 0 && <Text style={s.statusText}>{statusText}</Text>}
          </View>

          {/* Actions */}
          <View style={s.actions}>
            <TouchableOpacity
              style={[s.primaryBtn, !canContinue && !otpSent && s.primaryBtnDisabled, otpSent && !canVerify && s.primaryBtnDisabled]}
              activeOpacity={0.8}
              disabled={isSubmitting || !(otpSent ? canVerify : canContinue)}
              onPress={otpSent ? handleVerifyCode : handleContinue}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={c.background} />
              ) : (
                <Text style={[s.primaryBtnText, !(otpSent ? canVerify : canContinue) && s.primaryBtnTextDisabled]}>
                  {otpSent ? 'Verify & Sign In' : isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {otpSent && (
              <TouchableOpacity onPress={() => { setOtpSent(false); setOtpCode(''); setStatusText(''); }}>
                <Text style={s.linkText}>Use a different email</Text>
              </TouchableOpacity>
            )}

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
