import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useColors } from '../components/theme/useColors';
import { ColorPalette } from '../components/theme/colors';
import { Typography } from '../components/theme/typography';
import { sampleActivities } from '../store/mockData';
import { ActivityStep } from '../store/types';
import { useAppStore } from '../store/appStore';

type ActivityGuideRouteProp = RouteProp<RootStackParamList, 'ActivityGuide'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ActivityGuideScreen() {
  const c = useColors();
  const s = React.useMemo(() => makeStyles(c), [c]);
  const navigation = useNavigation<NavProp>();
  const route = useRoute<ActivityGuideRouteProp>();
  const { activityId } = route.params;
  const logActivity = useAppStore((st) => st.logActivity);

  const activity = sampleActivities.find((a) => a.id === activityId);

  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef(true);

  const steps = activity?.steps ?? [];
  const step: ActivityStep | undefined = steps[currentStep];
  const progress = steps.length > 0 ? (currentStep + 1) / steps.length : 0;
  const isLastStep = currentStep === steps.length - 1;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (duration: number) => {
      stopTimer();
      setTimeRemaining(duration);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (!isPlayingRef.current) return prev;
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    },
    [stopTimer],
  );

  useEffect(() => {
    if (step) startTimer(step.durationSeconds);
    return stopTimer;
  }, [currentStep, step, startTimer, stopTimer]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (timeRemaining === 0 && step && isPlayingRef.current) {
      if (currentStep < steps.length - 1) {
        setCurrentStep((s) => s + 1);
      }
    }
  }, [timeRemaining, currentStep, steps.length, step]);

  const togglePlayPause = () => setIsPlaying((p) => !p);

  const finishActivity = () => {
    if (activity) {
      logActivity(activity.id, activity.title, activity.category, activity.duration);
    }
    navigation.goBack();
  };

  const nextStep = () => (isLastStep ? finishActivity() : setCurrentStep((st) => st + 1));
  const previousStep = () => { if (currentStep > 0) setCurrentStep((st) => st - 1); };

  if (!activity || !step) {
    return (
      <View style={s.errorContainer}>
        <Text style={s.errorText}>Activity not found</Text>
      </View>
    );
  }

  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="close" size={22} color={c.textSecondary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{activity.title}</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Progress bar */}
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Step info */}
      <View style={s.stepMeta}>
        <Text style={s.stepLabel}>Step {currentStep + 1} of {steps.length}</Text>
        <Text style={s.stepName}>{step.name}</Text>
      </View>

      {/* Content area */}
      <View style={s.contentArea}>
        <View style={s.iconCircle}>
          <MaterialCommunityIcons name="yoga" size={48} color={c.accent} />
        </View>
        <Text style={s.stepSubtitle}>{step.subtitle}</Text>
        <Text style={s.stepDescription}>{step.description}</Text>
      </View>

      {/* Timer */}
      <View style={s.timerBlock}>
        <Text style={s.timerText}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </Text>
      </View>

      {/* Controls */}
      <View style={s.controls}>
        <View style={s.secondaryRow}>
          <TouchableOpacity onPress={previousStep} disabled={currentStep === 0} style={{ opacity: currentStep > 0 ? 1 : 0.3 }}>
            <Text style={s.secondaryText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePlayPause} style={s.playBtn}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color={c.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={nextStep}>
            <Text style={s.secondaryText}>{isLastStep ? 'Done' : 'Skip'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.primaryBtn} onPress={nextStep}>
          <Text style={s.primaryBtnText}>{isLastStep ? 'Finish' : 'Next step'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(c: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background },
    errorText: { ...Typography.body, color: c.textSecondary },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 14,
    },
    headerTitle: { ...Typography.caption, color: c.textSecondary },

    progressBar: { height: 3, backgroundColor: c.cardBorder, marginHorizontal: 24 },
    progressFill: { height: 3, backgroundColor: c.accent, borderRadius: 2 },

    stepMeta: { paddingHorizontal: 24, paddingTop: 24, gap: 4 },
    stepLabel: { ...Typography.small, color: c.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },
    stepName: { ...Typography.headline, color: c.textPrimary },

    contentArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: c.accentGlow,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    stepSubtitle: { ...Typography.subheadline, color: c.textSecondary },
    stepDescription: { ...Typography.body, color: c.textSecondary, textAlign: 'center', lineHeight: 22 },

    timerBlock: { alignItems: 'center', paddingVertical: 12 },
    timerText: {
      fontSize: 44,
      fontWeight: '300',
      color: c.textPrimary,
      fontVariant: ['tabular-nums'],
      letterSpacing: 2,
    },

    controls: { paddingHorizontal: 24, paddingBottom: 32, gap: 16 },
    secondaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    secondaryText: { ...Typography.caption, color: c.textMuted },
    playBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.cardBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtn: {
      alignItems: 'center',
      paddingVertical: 15,
      borderRadius: 10,
      backgroundColor: c.accent,
    },
    primaryBtnText: { ...Typography.subheadline, color: c.background, fontWeight: '600' },
  });
}
