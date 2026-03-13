import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../../shared/theme/placeholder-theme';
import Svg, {
  Path,
  Circle,
  Line,
  Defs,
  LinearGradient,
  Stop,
  type NumberProp,
} from 'react-native-svg';

export interface ElevationPoint {
  distanceMeters: number;
  altitudeMeters: number;
  label?: string;
  isMilestone?: boolean;
}

interface ElevationProfileProps {
  elevationData: ElevationPoint[];
  progressMeters: number;
  totalMeters: number;
  width: number;
  height: number;
}

const PADDING = { top: 20, bottom: 30, left: 10, right: 10 };
const MARKER_RADIUS = 4;
const PROGRESS_RADIUS = 6;

export function ElevationProfile({
  elevationData,
  progressMeters,
  totalMeters,
  width,
  height,
}: ElevationProfileProps): React.JSX.Element {
  const chartWidth = width - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  const { pathD, fillD, milestonePoints, progressPoint, minAlt, maxAlt } =
    useMemo(() => {
      if (elevationData.length === 0) {
        return {
          pathD: '',
          fillD: '',
          milestonePoints: [],
          progressPoint: { x: PADDING.left, y: height - PADDING.bottom },
          minAlt: 0,
          maxAlt: 1,
        };
      }

      const altitudes = elevationData.map((p) => p.altitudeMeters);
      const mAlt = Math.min(...altitudes);
      const xAlt = Math.max(...altitudes);
      const altRange = xAlt - mAlt || 1;

      const toX = (dist: number): number =>
        PADDING.left + (dist / totalMeters) * chartWidth;

      const toY = (alt: number): number =>
        PADDING.top + chartHeight - ((alt - mAlt) / altRange) * chartHeight;

      const points = elevationData.map((p) => ({
        x: toX(p.distanceMeters),
        y: toY(p.altitudeMeters),
        ...p,
      }));

      let d = `M ${points[0]?.x ?? 0} ${points[0]?.y ?? 0}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]!;
        const curr = points[i]!;
        const cpx = (prev.x + curr.x) / 2;
        d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
      }

      const lastPoint = points[points.length - 1]!;
      const firstPoint = points[0]!;
      const bottomY = height - PADDING.bottom;
      const fD = `${d} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;

      const mPoints = points.filter((p) => p.isMilestone);

      // Interpolate progress position
      let pX = PADDING.left;
      let pY = height - PADDING.bottom;
      const clampedProgress = Math.min(progressMeters, totalMeters);
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]!;
        const curr = points[i]!;
        if (
          clampedProgress >= prev.distanceMeters &&
          clampedProgress <= curr.distanceMeters
        ) {
          const segRange = curr.distanceMeters - prev.distanceMeters;
          const t = segRange === 0 ? 0 : (clampedProgress - prev.distanceMeters) / segRange;
          pX = prev.x + t * (curr.x - prev.x);
          pY = prev.y + t * (curr.y - prev.y);
          break;
        }
      }
      if (clampedProgress >= totalMeters && points.length > 0) {
        pX = lastPoint.x;
        pY = lastPoint.y;
      }

      return {
        pathD: d,
        fillD: fD,
        milestonePoints: mPoints,
        progressPoint: { x: pX, y: pY },
        minAlt: mAlt,
        maxAlt: xAlt,
      };
    }, [elevationData, progressMeters, totalMeters, width, height, chartWidth, chartHeight]);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accentDeep} stopOpacity={0.6} />
            <Stop offset="1" stopColor={colors.accentDeep} stopOpacity={0.05} />
          </LinearGradient>
        </Defs>

        {/* Filled area under the curve */}
        <Path d={fillD} fill="url(#fillGrad)" />

        {/* Elevation line */}
        <Path
          d={pathD}
          stroke={colors.accentDeep}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Milestone markers */}
        {milestonePoints.map((p, i) => (
          <Circle
            key={i}
            cx={p.x as NumberProp}
            cy={p.y as NumberProp}
            r={MARKER_RADIUS}
            fill={colors.mutedText}
            stroke={colors.background}
            strokeWidth={1.5}
          />
        ))}

        {/* Progress marker */}
        <Circle
          cx={progressPoint.x as NumberProp}
          cy={progressPoint.y as NumberProp}
          r={PROGRESS_RADIUS}
          fill="#D4451A"
          stroke={colors.background}
          strokeWidth={2}
        />

        {/* Baseline */}
        <Line
          x1={PADDING.left}
          y1={height - PADDING.bottom}
          x2={width - PADDING.right}
          y2={height - PADDING.bottom}
          stroke={colors.sage}
          strokeWidth={0.5}
          strokeDasharray="4,4"
        />
      </Svg>

      {/* Altitude labels */}
      <View style={styles.altLabels}>
        <Text style={styles.altText}>
          {Math.round(maxAlt).toLocaleString()}m
        </Text>
        <Text style={styles.altText}>
          {Math.round(minAlt).toLocaleString()}m
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  altLabels: {
    position: 'absolute',
    right: 4,
    top: 12,
    bottom: 28,
    justifyContent: 'space-between',
  },
  altText: {
    fontSize: 9,
    color: colors.mutedText,
    fontWeight: '600',
  },
});
