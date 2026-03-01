import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ColorPalette } from '../components/theme/colors';
import { useColors } from '../components/theme/useColors';
import { Typography } from '../components/theme/typography';
import AppCard from '../components/AppCard';
import { useAppStore } from '../store/appStore';
import { getRoleDescription, PGYYear, PGY_YEARS, Specialty, SPECIALTIES } from '../store/types';
import { signOut as signOutSupabase, updateUserProfileMetadata } from '../auth/authService';
import { isSupabaseConfigured } from '../supabase/client';
import { fetchProfile, updateProfile, updateProfileAvatar, uploadAvatar, savePushToken, removeAllPushTokensForUser } from '../supabase/api';
import { registerForPushNotificationsAsync } from '../utils/pushNotifications';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'expo-image';

const FREQUENCY_STEPS = 5;

export default function ProfileScreen() {
  const c = useColors();
  const st = useMemo(() => makeStyles(c), [c]);
  const { currentUser, signOut, updateCurrentUserName, updateCurrentUserPGY, updateCurrentUserSpecialty, updateAvatarUrl, isDarkMode, toggleDarkMode } = useAppStore();
  const activityLogs = useAppStore((s) => s.activityLogs);
  const moodLogs = useAppStore((s) => s.moodLogs);
  const [smartAlertsEnabled, setSmartAlertsEnabled] = useState(true);
  const [smartAlertsLoading, setSmartAlertsLoading] = useState(false);
  const [frequencyIndex, setFrequencyIndex] = useState(3);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('06:00');

  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showEditPGYModal, setShowEditPGYModal] = useState(false);
  const [showEditSpecialtyModal, setShowEditSpecialtyModal] = useState(false);
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);

  const [editableName, setEditableName] = useState(currentUser?.name ?? '');
  const [editablePGY, setEditablePGY] = useState<PGYYear>(currentUser?.pgyYear ?? 'PGY-1');
  const [editableSpecialty, setEditableSpecialty] = useState<Specialty>(currentUser?.specialty ?? 'Internal Medicine');
  const [editableQuietStart, setEditableQuietStart] = useState(quietHoursStart);
  const [editableQuietEnd, setEditableQuietEnd] = useState(quietHoursEnd);

  const userName = currentUser?.name ?? 'User';
  const pgyYear = currentUser?.pgyYear ?? 'PGY-1';
  const specialty = currentUser?.specialty ?? 'Internal Medicine';
  const userEmail = currentUser?.email ?? '';
  const roleDesc = getRoleDescription(pgyYear, specialty);

  const uid = currentUser?.id ?? null;
  const isReal = isSupabaseConfigured && uid && !uid.startsWith('local-');

  useEffect(() => {
    if (!isReal) return;
    fetchProfile(uid!).then(({ data }) => {
      if (data?.smart_alerts_enabled === false) setSmartAlertsEnabled(false);
      else if (data?.smart_alerts_enabled === true) setSmartAlertsEnabled(true);
    });
  }, [uid, isReal]);

  const handleSaveName = async () => {
    if (editableName.trim().length < 2) return;
    updateCurrentUserName(editableName);
    setShowEditNameModal(false);
    if (isReal) {
      updateProfile(uid!, { full_name: editableName.trim() });
      updateUserProfileMetadata({ full_name: editableName.trim() });
    }
  };
  const handleSavePGY = async () => {
    updateCurrentUserPGY(editablePGY);
    setShowEditPGYModal(false);
    if (isReal) {
      updateProfile(uid!, { pgy_year: editablePGY });
      updateUserProfileMetadata({ pgy_year: editablePGY });
    }
  };
  const handleSaveSpecialty = async () => {
    updateCurrentUserSpecialty(editableSpecialty);
    setShowEditSpecialtyModal(false);
    if (isReal) {
      updateProfile(uid!, { specialty: editableSpecialty });
      updateUserProfileMetadata({ specialty: editableSpecialty });
    }
  };
  const handleSaveQuietHours = () => {
    setQuietHoursStart(editableQuietStart);
    setQuietHoursEnd(editableQuietEnd);
    setShowQuietHoursModal(false);
    if (isReal) {
      updateProfile(uid!, { reminder_time_preference: `${editableQuietStart}-${editableQuietEnd}` });
    }
  };
  const handleSignOut = async () => {
    await signOutSupabase();
    signOut();
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to photos to change your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
      // Convert HEIC to JPEG on iPhone (default .current keeps HEIC, which fails to upload/display)
      preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Automatic,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.uri || !uid) return;
    setUploadingPhoto(true);
    let uploadSource: { base64: string } | { uri: string };
    try {
      const resized = await ImageManipulator.manipulateAsync(asset.uri, [
        { resize: { width: 400, height: 400 } },
      ], { base64: true, compress: 0.85, format: ImageManipulator.SaveFormat.JPEG });
      uploadSource = resized.base64 ? { base64: resized.base64 } : { uri: resized.uri };
    } catch {
      uploadSource = asset.base64 ? { base64: asset.base64 } : { uri: asset.uri };
    }
    const { url, error } = await uploadAvatar(uid, uploadSource);
    setUploadingPhoto(false);
    if (error) {
      Alert.alert('Upload failed', String(error));
      return;
    }
    if (url) {
      updateAvatarUrl(url);
      if (isReal) {
        const { error: updateError } = await updateProfileAvatar(uid, url);
        if (updateError) {
          Alert.alert('Upload ok, save failed', String(updateError?.message ?? updateError) || 'Profile could not be updated.');
        }
      }
    }
  };

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile header */}
        <View style={st.profileHeader}>
          <TouchableOpacity onPress={handlePickPhoto} style={st.avatarTouch} disabled={uploadingPhoto}>
            <View style={st.avatarCircle}>
              <Text style={st.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
              {currentUser?.avatarUrl ? (
                <Image
                  source={{ uri: currentUser.avatarUrl }}
                  style={st.avatarImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : null}
              {uploadingPhoto && (
                <View style={st.avatarOverlay}>
                  <ActivityIndicator size="small" color={c.cardDarkText} />
                </View>
              )}
            </View>
            {!uploadingPhoto && (
              <View style={st.avatarBadge}>
                <Ionicons name="camera" size={12} color={c.cardDarkText} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setEditableName(userName); setShowEditNameModal(true); }}>
            <Text style={st.userName}>{userName} <Ionicons name="pencil" size={13} color={c.textMuted} /></Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setEditablePGY(pgyYear); setShowEditPGYModal(true); }}>
            <Text style={st.userSub}>{pgyYear} · <Text onPress={() => { setEditableSpecialty(specialty); setShowEditSpecialtyModal(true); }}>{specialty}</Text></Text>
          </TouchableOpacity>
          <Text style={st.userEmail}>{userEmail}</Text>
        </View>

        {/* Analytics */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>ANALYTICS</Text>
          <AppCard style={st.card}>
            <View style={st.analyticsRow}>
              <View style={st.analyticsStat}>
                <Ionicons name="flame-outline" size={20} color={c.warm} />
                <Text style={st.analyticsValue}>{currentUser?.streak ?? 0}</Text>
                <Text style={st.analyticsLabel}>day streak</Text>
              </View>
              <View style={st.dividerVertical} />
              <View style={st.analyticsStat}>
                <Ionicons name="checkmark-done-outline" size={20} color={c.accent} />
                <Text style={st.analyticsValue}>{currentUser?.sessionsCompleted ?? 0}</Text>
                <Text style={st.analyticsLabel}>sessions</Text>
              </View>
              <View style={st.dividerVertical} />
              <View style={st.analyticsStat}>
                <Ionicons name="time-outline" size={20} color={c.sosBlue} />
                <Text style={st.analyticsValue}>{activityLogs.reduce((s, l) => s + l.durationMinutes, 0)}</Text>
                <Text style={st.analyticsLabel}>min total</Text>
              </View>
              <View style={st.dividerVertical} />
              <View style={st.analyticsStat}>
                <Ionicons name="happy-outline" size={20} color={c.cardPeach} />
                <Text style={st.analyticsValue}>{moodLogs.length}</Text>
                <Text style={st.analyticsLabel}>mood check-ins</Text>
              </View>
            </View>
          </AppCard>
        </View>

        {/* Notifications */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>NOTIFICATIONS</Text>
          <AppCard style={st.card}>
            <Row
              st={st}
              left={<Ionicons name="notifications-outline" size={18} color={c.warm} />}
              title="Smart alerts"
              right={
                <Switch
                  value={smartAlertsEnabled}
                  onValueChange={async (val) => {
                    setSmartAlertsEnabled(val);
                    if (!isReal) return;
                    setSmartAlertsLoading(true);
                    try {
                      if (val) {
                        const token = await registerForPushNotificationsAsync();
                        if (token) {
                          const { error: saveErr } = await savePushToken(uid!, token);
                          if (saveErr) throw saveErr;
                          const { error: updateErr } = await updateProfile(uid!, { smart_alerts_enabled: true });
                          if (updateErr) throw updateErr;
                        } else {
                          setSmartAlertsEnabled(false);
                          Alert.alert('Notifications', 'Permission denied. Enable in Settings.');
                        }
                      } else {
                        const { error: removeErr } = await removeAllPushTokensForUser(uid!);
                        if (removeErr) throw removeErr;
                        const { error: updateErr } = await updateProfile(uid!, { smart_alerts_enabled: false });
                        if (updateErr) throw updateErr;
                      }
                    } catch (e) {
                      setSmartAlertsEnabled(!val);
                      const msg = e instanceof Error ? e.message : String(e);
                      Alert.alert('Error', `Could not update notifications: ${msg}`);
                    } finally {
                      setSmartAlertsLoading(false);
                    }
                  }}
                  disabled={smartAlertsLoading}
                  trackColor={{ false: c.cardBorder, true: c.accent }}
                  thumbColor="#FFF"
                />
              }
            />
            <View style={st.divider} />
            <View style={st.freqBlock}>
              <Text style={st.freqLabel}>Frequency</Text>
              <View style={st.freqDots}>
                {Array.from({ length: FREQUENCY_STEPS }).map((_, i) => (
                  <TouchableOpacity key={i} onPress={() => setFrequencyIndex(i)}>
                    <View style={[st.dot, i <= frequencyIndex && st.dotActive]} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={st.divider} />
            <TouchableOpacity onPress={() => { setEditableQuietStart(quietHoursStart); setEditableQuietEnd(quietHoursEnd); setShowQuietHoursModal(true); }}>
              <Row
                st={st}
                left={<Ionicons name="moon-outline" size={18} color={c.sosBlue} />}
                title="Quiet hours"
                subtitle={`${quietHoursStart} – ${quietHoursEnd}`}
                right={<Ionicons name="chevron-forward" size={16} color={c.textMuted} />}
              />
            </TouchableOpacity>
          </AppCard>
        </View>

        {/* Preferences */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>PREFERENCES</Text>
          <AppCard style={st.card}>
            <Row
              st={st}
              left={<Ionicons name="contrast-outline" size={18} color="#9F8FEF" />}
              title="Dark mode"
              right={
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: c.cardBorder, true: c.accent }}
                  thumbColor="#FFF"
                />
              }
            />
            <View style={st.divider} />
            <TouchableOpacity onPress={() => Alert.alert('Privacy', 'Data is stored locally for this demo. In production, data is secured via Supabase RLS.')}>
              <Row
                st={st}
                left={<Ionicons name="lock-closed-outline" size={18} color={c.accent} />}
                title="Privacy & data"
                right={<Ionicons name="chevron-forward" size={16} color={c.textMuted} />}
              />
            </TouchableOpacity>
          </AppCard>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={st.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
          <Text style={st.signOutText}>Sign out</Text>
        </TouchableOpacity>
        <Text style={st.version}>WellnessMD v1.0.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* --- Modals --- */}
      <ModalWrapper st={st} visible={showEditNameModal} onClose={() => setShowEditNameModal(false)} title="Edit name">
        <TextInput style={st.modalInput} value={editableName} onChangeText={setEditableName} placeholder="Name" placeholderTextColor={c.textMuted} autoCapitalize="words" />
        <ModalButtons st={st} onCancel={() => setShowEditNameModal(false)} onSave={handleSaveName} />
      </ModalWrapper>

      <ModalWrapper st={st} visible={showEditPGYModal} onClose={() => setShowEditPGYModal(false)} title="Training year">
        <View style={st.chipWrap}>
          {PGY_YEARS.map((yr) => (
            <TouchableOpacity key={yr} style={[st.chip, editablePGY === yr && st.chipSelected]} onPress={() => setEditablePGY(yr)}>
              <Text style={[st.chipText, editablePGY === yr && st.chipTextSelected]}>{yr}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <ModalButtons st={st} onCancel={() => setShowEditPGYModal(false)} onSave={handleSavePGY} />
      </ModalWrapper>

      <ModalWrapper st={st} visible={showEditSpecialtyModal} onClose={() => setShowEditSpecialtyModal(false)} title="Specialty">
        <ScrollView style={{ maxHeight: 300 }}>
          <View style={st.chipWrap}>
            {SPECIALTIES.map((sp) => (
              <TouchableOpacity key={sp} style={[st.chip, editableSpecialty === sp && st.chipSelected]} onPress={() => setEditableSpecialty(sp)}>
                <Text style={[st.chipText, editableSpecialty === sp && st.chipTextSelected]}>{sp}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <ModalButtons st={st} onCancel={() => setShowEditSpecialtyModal(false)} onSave={handleSaveSpecialty} />
      </ModalWrapper>

      <ModalWrapper st={st} visible={showQuietHoursModal} onClose={() => setShowQuietHoursModal(false)} title="Quiet hours">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={st.miniLabel}>From</Text>
            <TextInput style={st.modalInput} value={editableQuietStart} onChangeText={setEditableQuietStart} placeholder="22:00" placeholderTextColor={c.textMuted} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={st.miniLabel}>To</Text>
            <TextInput style={st.modalInput} value={editableQuietEnd} onChangeText={setEditableQuietEnd} placeholder="06:00" placeholderTextColor={c.textMuted} />
          </View>
        </View>
        <ModalButtons st={st} onCancel={() => setShowQuietHoursModal(false)} onSave={handleSaveQuietHours} />
      </ModalWrapper>
    </SafeAreaView>
  );
}

function Row({ left, title, subtitle, right, st }: { left: React.ReactNode; title: string; subtitle?: string; right?: React.ReactNode; st: ReturnType<typeof makeStyles> }) {
  return (
    <View style={st.row}>
      {left}
      <View style={{ flex: 1 }}>
        <Text style={st.rowTitle}>{title}</Text>
        {subtitle ? <Text style={st.rowSub}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

function ModalWrapper({ visible, onClose, title, children, st }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode; st: ReturnType<typeof makeStyles> }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={st.overlay}>
        <View style={st.modalCard}>
          <Text style={st.modalTitle}>{title}</Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function ModalButtons({ onCancel, onSave, st }: { onCancel: () => void; onSave: () => void; st: ReturnType<typeof makeStyles> }) {
  return (
    <View style={st.modalBtnRow}>
      <TouchableOpacity onPress={onCancel}><Text style={st.modalCancel}>Cancel</Text></TouchableOpacity>
      <TouchableOpacity style={st.modalSaveBtn} onPress={onSave}><Text style={st.modalSaveText}>Save</Text></TouchableOpacity>
    </View>
  );
}

function makeStyles(c: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scroll: { paddingHorizontal: 24, paddingTop: 20 },

    profileHeader: { alignItems: 'center', marginBottom: 28, gap: 4 },
    avatarTouch: { position: 'relative', marginBottom: 6 },
    avatarCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.cardDark,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      overflow: 'hidden' as const,
    },
    avatarImage: { position: 'absolute', width: 72, height: 72, borderRadius: 36 },
    avatarOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
    avatarBadge: { position: 'absolute', right: 0, bottom: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: c.cardDark, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 28, fontWeight: '600', color: c.cardDarkText, fontFamily: 'Playfair Display' },
    userName: { ...Typography.headline, color: c.textPrimary },
    userSub: { ...Typography.body, color: c.textSecondary },
    userEmail: { ...Typography.small, color: c.textMuted, marginTop: 2 },

    section: { marginBottom: 24, gap: 10 },
    sectionLabel: { ...Typography.small, color: c.textMuted, letterSpacing: 1 },

    card: { padding: 4 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
    rowTitle: { ...Typography.body, color: c.textPrimary },
    rowSub: { ...Typography.small, color: c.textMuted, marginTop: 1 },
    divider: { height: 1, backgroundColor: c.cardBorder, marginHorizontal: 14 },
    dividerVertical: { width: 1, backgroundColor: c.cardBorder, marginVertical: 4 },
    analyticsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 16, paddingHorizontal: 8 },
    analyticsStat: { alignItems: 'center', gap: 4, flex: 1 },
    analyticsValue: { ...Typography.headline, color: c.textPrimary },
    analyticsLabel: { ...Typography.small, color: c.textSecondary },

    freqBlock: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
    freqLabel: { ...Typography.small, color: c.textMuted },
    freqDots: { flexDirection: 'row', gap: 8 },
    dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: c.cardBorder },
    dotActive: { backgroundColor: c.sosBlue },

    signOutBtn: {
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.cardBorder,
      marginBottom: 12,
    },
    signOutText: { ...Typography.caption, color: c.textSecondary },
    version: { ...Typography.small, color: c.textMuted, textAlign: 'center' },

    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24 },
    modalCard: { backgroundColor: c.backgroundSecondary, borderRadius: 16, padding: 20, gap: 14 },
    modalTitle: { ...Typography.subheadline, color: c.textPrimary },
    modalInput: {
      ...Typography.body,
      color: c.textPrimary,
      backgroundColor: c.cardBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.cardBorder,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    miniLabel: { ...Typography.small, color: c.textMuted },

    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: c.cardBackground, borderWidth: 1, borderColor: c.cardBorder },
    chipSelected: { backgroundColor: c.cardDark, borderColor: c.cardDark },
    chipText: { ...Typography.caption, color: c.textMuted },
    chipTextSelected: { color: c.cardDarkText },

    modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
    modalCancel: { ...Typography.caption, color: c.textMuted, paddingVertical: 8 },
    modalSaveBtn: { backgroundColor: c.cardDark, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
    modalSaveText: { ...Typography.caption, color: c.cardDarkText, fontWeight: '600' },
  });
}
