import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useColors } from './theme/useColors';

const { width, height } = Dimensions.get('window');

function LoadingDots({ dotColor }: { dotColor: string }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -8,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      );
    };
    const a1 = bounce(dot1, 0);
    const a2 = bounce(dot2, 150);
    const a3 = bounce(dot3, 300);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, { backgroundColor: dotColor, transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.dot, { backgroundColor: dotColor, transform: [{ translateY: dot2 }], opacity: 0.7 }]} />
      <Animated.View style={[styles.dot, { backgroundColor: dotColor, transform: [{ translateY: dot3 }], opacity: 0.5 }]} />
    </View>
  );
}

type SplashScreenProps = {
  onComplete: () => void;
};

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const c = useColors();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(12)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const bg1Opacity = useRef(new Animated.Value(0)).current;
  const bg1Scale = useRef(new Animated.Value(0.6)).current;
  const bg2Opacity = useRef(new Animated.Value(0)).current;
  const bg2Scale = useRef(new Animated.Value(0.6)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const enterDelay = 50;
    const exitStart = 2400;
    const completeAt = 2750;

    const enterTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(taglineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(taglineTranslateY, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
      }, 300);

      setTimeout(() => {
        Animated.timing(dotsOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      }, 800);

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(bg1Opacity, { toValue: 0.6, duration: 800, useNativeDriver: true }),
          Animated.timing(bg1Scale, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]).start();
      }, 100);

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(bg2Opacity, { toValue: 0.5, duration: 800, useNativeDriver: true }),
          Animated.timing(bg2Scale, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]).start();
      }, 200);
    }, enterDelay);

    const exitTimer = setTimeout(() => {
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }, exitStart);

    const completeTimer = setTimeout(onComplete, completeAt);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <Animated.View style={[styles.container, { backgroundColor: c.background, opacity: exitOpacity }]}>
      {/* Decorative background circles */}
      <Animated.View
        style={[
          styles.bgCircle1,
          {
            backgroundColor: c.backgroundSecondary,
            opacity: bg1Opacity,
            transform: [{ scale: bg1Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bgCircle2,
          {
            backgroundColor: c.backgroundSecondary,
            opacity: bg2Opacity,
            transform: [{ scale: bg2Scale }],
          },
        ]}
      />

      {/* Main content — logo is just WellnessMD */}
      <View style={styles.content}>
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }, { translateY: logoTranslateY }],
            marginBottom: 20,
          }}
        >
          <Text style={[styles.logo, { color: c.textPrimary }]}>WellnessMD</Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslateY }],
            marginBottom: 24,
          }}
        >
          <Text style={[styles.tagline, { color: c.textMuted }]}>Made for Residents, by Residents.</Text>
        </Animated.View>

        <Animated.View style={{ opacity: dotsOpacity }}>
          <LoadingDots dotColor={c.accent} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    minHeight: height,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  logo: {
    fontSize: 42,
    fontFamily: 'Playfair Display',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    fontFamily: 'Lato',
    letterSpacing: 2,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
