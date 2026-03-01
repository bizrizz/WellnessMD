import React, { useState, useMemo } from 'react';
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
import { fetchProfile, updateProfile } from '../supabase/api';

const FREQUENCY_STEPS = 5;

export default function ProfileScreen() {
  const c = useColors();
  const st = useMemo(() => makeStyles(c), [c]);
  const { currentUser, signOut, updateCurrentUserName, updateCurrentUserPGY, updateCurrentUserSpecialty, isDarkMode, toggleDarkMode } = useAppStore();
  const [smartAlertsEnabled, setSmartAlertsEnabled] = useState(true);
  const [frequencyIndex, setFrequencyIndex] = useState(3);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('06:00');

  const [showEditNameModal, setShowEditNameModal] = useState(false);
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

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile header */}
        <View style={st.profileHeader}>
          <View style={st.avatarCircle}>
            <Text style={st.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <TouchableOpacity onPress={() => { setEditableName(userName); setShowEditNameModal(true); }}>
            <Text style={st.userName}>{userName} <Ionicons name="pencil" size={13} color={c.textMuted} /></Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setEditablePGY(pgyYear); setShowEditPGYModal(true); }}>
            <Text style={st.userSub}>{pgyYear} · <Text onPress={() => { setEditableSpecialty(specialty); setShowEditSpecialtyModal(true); }}>{specialty}</Text></Text>
          </TouchableOpacity>
          <Text style={st.userEmail}>{userEmail}</Text>
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
                  onValueChange={(val) => { setSmartAlertsEnabled(val); Alert.alert('Notifications', val ? 'Enabled' : 'Disabled'); }}
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
    avatarCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    avatarText: { fontSize: 28, fontWeight: '600', color: c.background },
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

    freqBlock: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
    freqLabel: { ...Typography.small, color: c.textMuted },
    freqDots: { flexDirection: 'row', gap: 8 },
    dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: c.cardBorder },
    dotActive: { backgroundColor: c.sosBlue },

    signOutBtn: {
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.cardBorder,
      marginBottom: 12,
    },
    signOutText: { ...Typography.caption, color: c.textSecondary },
    version: { ...Typography.small, color: c.textMuted, textAlign: 'center' },

    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24 },
    modalCard: { backgroundColor: c.backgroundSecondary, borderRadius: 14, padding: 20, gap: 14 },
    modalTitle: { ...Typography.subheadline, color: c.textPrimary },
    modalInput: {
      ...Typography.body,
      color: c.textPrimary,
      backgroundColor: c.cardBackground,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    miniLabel: { ...Typography.small, color: c.textMuted },

    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: c.cardBackground },
    chipSelected: { backgroundColor: c.accentGlow },
    chipText: { ...Typography.caption, color: c.textMuted },
    chipTextSelected: { color: c.accent },

    modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
    modalCancel: { ...Typography.caption, color: c.textMuted, paddingVertical: 8 },
    modalSaveBtn: { backgroundColor: c.accent, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
    modalSaveText: { ...Typography.caption, color: c.background, fontWeight: '600' },
  });
}
