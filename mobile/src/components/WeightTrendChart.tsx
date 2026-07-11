// Pure-SVG weight trend line (last 30 days). Auto-scales to the data, draws
// itself in when the panel opens, and shows an empty state until there are at
// least two entries. Ported from the web Sidebar's WeightTrendChart.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import Svg, { Line, Path, Circle } from 'react-native-svg';
import { colors, fonts } from '../theme';
import { trendPoints, buildChart, type Unit } from '../lib/weightChart';
import type { WeightEntry } from '../lib/types';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const GOLD = colors.accentGold;

// Approximate the path length by summing segment distances (react-native-svg
// has no getTotalLength) — enough to drive the stroke-dash draw-in.
function pathLength(coords: { x: number; y: number }[]): number {
  let len = 0;
  for (let i = 1; i < coords.length; i++) {
    len += Math.hypot(coords[i].x - coords[i - 1].x, coords[i].y - coords[i - 1].y);
  }
  return len || 1;
}

interface Props {
  history: WeightEntry[];
  unit: Unit;
  active: boolean;
}

export default function WeightTrendChart({ history, unit, active }: Props) {
  const [width, setWidth] = useState(240);
  const H = 72;

  const points = useMemo(() => trendPoints(history, unit, 30), [history, unit]);
  const chart = useMemo(() => buildChart(points, { w: width, h: H }), [points, width]);

  const progress = useRef(new Animated.Value(0)).current;
  const [len, setLen] = useState(1);

  useEffect(() => {
    if (!chart.ok || !chart.coords) return;
    setLen(pathLength(chart.coords));
    progress.setValue(active ? 0 : 1);
    if (active) {
      Animated.timing(progress, { toValue: 1, duration: 1100, useNativeDriver: false }).start();
    } else {
      progress.setValue(1);
    }
  }, [active, chart.ok, chart.d, chart.coords, progress]);

  if (!chart.ok) {
    return (
      <Text style={styles.empty}>Log your weight to see your trend</Text>
    );
  }

  const dashoffset = progress.interpolate({ inputRange: [0, 1], outputRange: [len, 0] });
  const dotOpacity = progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 1] });

  return (
    <View style={{ marginTop: 4 }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Svg width="100%" height={H} viewBox={`0 0 ${width} ${H}`}>
        <Line x1={0} y1={H - 0.5} x2={width} y2={H - 0.5} stroke="rgba(201,168,76,0.12)" strokeWidth={1} />
        <AnimatedPath
          d={chart.d}
          fill="none"
          stroke={GOLD}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={len}
          strokeDashoffset={dashoffset}
        />
        {chart.coords!.map((c, i) => (
          <AnimatedDot key={i} cx={c.x} cy={c.y} opacity={dotOpacity} />
        ))}
      </Svg>
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>weight trend</Text>
        <Text style={styles.footerLabel}>30 days</Text>
      </View>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
function AnimatedDot({ cx, cy, opacity }: { cx: number; cy: number; opacity: Animated.AnimatedInterpolation<number> }) {
  return <AnimatedCircle cx={cx} cy={cy} r={2.2} fill={GOLD} opacity={opacity} />;
}

const styles = StyleSheet.create({
  empty: { color: colors.textMuted, fontSize: 11, fontStyle: 'italic', fontFamily: fonts.ui },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  footerLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 0.2, fontFamily: fonts.ui },
});
