import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Polyline,
  Circle,
  type NumberProp,
} from 'react-native-svg';
import { colors, radii, shadows } from '../../shared/theme/placeholder-theme';
import {
  EVEREST_TRAIL_COORDINATES,
  EVEREST_TRAIL_BOUNDS,
} from '../../shared/everest-trail-coordinates';
import {
  projectTrailToPixels,
  interpolateProgress,
  type PixelPoint,
} from '../../utils/geo-projection';

interface TrailMapViewProps {
  progressMeters: number;
  totalMeters: number;
  unlockedMilestoneIds: string[];
  width: number;
  height: number;
}

const MILESTONE_RADIUS = 4;
const PROGRESS_RADIUS = 6;

export function TrailMapView({
  progressMeters,
  totalMeters,
  unlockedMilestoneIds,
  width,
  height,
}: TrailMapViewProps): React.JSX.Element {
  const fraction = totalMeters > 0 ? Math.min(progressMeters / totalMeters, 1) : 0;

  const { completedPoints, remainingPoints, milestonePixels, progressPoint } =
    useMemo(() => {
      const pixels = projectTrailToPixels(
        EVEREST_TRAIL_COORDINATES,
        EVEREST_TRAIL_BOUNDS,
        width,
        height,
      );

      // Split trail into completed / remaining segments
      const totalSegments = pixels.length - 1;
      const exactIndex = fraction * totalSegments;
      const splitIndex = Math.floor(exactIndex);
      const splitFraction = exactIndex - splitIndex;

      // Interpolated progress position
      const progPt = interpolateProgress(pixels, fraction);

      // Completed portion: all points up to splitIndex + the interpolated point
      const completed: PixelPoint[] = [];
      for (let i = 0; i <= splitIndex && i < pixels.length; i++) {
        completed.push(pixels[i]!);
      }
      completed.push(progPt);

      // Remaining portion: from the interpolated point onwards
      const remaining: PixelPoint[] = [progPt];
      for (let i = splitIndex + 1; i < pixels.length; i++) {
        remaining.push(pixels[i]!);
      }

      // Milestone positions
      const msPixels = EVEREST_TRAIL_COORDINATES
        .map((coord, i) =>
          coord.milestoneSlug
            ? { slug: coord.milestoneSlug, pixel: pixels[i]! }
            : null,
        )
        .filter(Boolean) as Array<{ slug: string; pixel: PixelPoint }>;

      return {
        completedPoints: completed,
        remainingPoints: remaining,
        milestonePixels: msPixels,
        progressPoint: progPt,
      };
    }, [width, height, fraction]);

  const toPolylinePoints = (pts: PixelPoint[]): string =>
    pts.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={styles.wrapper}>
      <Svg width={width} height={height}>
        {/* Background fill — placeholder for satellite image */}
        <Circle
          cx={(width / 2) as NumberProp}
          cy={(height / 2) as NumberProp}
          r={0 as NumberProp}
          fill="none"
        />

        {/* Remaining trail (dashed) */}
        {remainingPoints.length > 1 && (
          <Polyline
            points={toPolylinePoints(remainingPoints)}
            fill="none"
            stroke={colors.sage}
            strokeWidth={3}
            strokeOpacity={0.4}
            strokeDasharray="6,4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Completed trail (solid) */}
        {completedPoints.length > 1 && (
          <Polyline
            points={toPolylinePoints(completedPoints)}
            fill="none"
            stroke={colors.accent}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Milestone dots */}
        {milestonePixels.map((ms) => {
          const unlocked = unlockedMilestoneIds.includes(ms.slug);
          return (
            <Circle
              key={ms.slug}
              cx={ms.pixel.x as NumberProp}
              cy={ms.pixel.y as NumberProp}
              r={MILESTONE_RADIUS as NumberProp}
              fill={unlocked ? colors.accent : colors.sage}
              fillOpacity={unlocked ? 1 : 0.3}
              stroke={colors.background}
              strokeWidth={1.5}
            />
          );
        })}

        {/* Progress marker */}
        <Circle
          cx={progressPoint.x as NumberProp}
          cy={progressPoint.y as NumberProp}
          r={PROGRESS_RADIUS as NumberProp}
          fill={colors.accent}
          stroke={colors.card}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    opacity: 0.95,
    ...shadows.md,
  },
});
