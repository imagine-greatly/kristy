// Animated SVG progress ring. Mirrors the web MacroRing: the fill animates via
// stroke-dashoffset (~0.6s ease). react-native-svg + RN Animated (JS-driven,
// since strokeDashoffset isn't a native-driver prop).
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface MacroRingProps {
  size?: number;
  stroke?: number;
  value?: number;
  goal?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}

export default function MacroRing({
  size = 56,
  stroke = 6,
  value = 0,
  goal = 1,
  color = colors.accentGold,
  track = colors.ringTrack,
  children,
}: MacroRingProps) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  const offset = circumference * (1 - pct);

  const anim = useRef(new Animated.Value(circumference)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: offset,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [offset, circumference, anim]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={anim}
        />
      </Svg>
      {children}
    </View>
  );
}
