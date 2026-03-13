import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Image } from 'react-native';
import { useCeremonyStore } from '../../stores/useCeremonyStore';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { colors, radii, typography, shadows } from '../../shared/theme/placeholder-theme';
import { PrimaryButton } from '../../components/shared/PrimaryButton';
import { getMilestoneImage } from '../../shared/assets/milestone-images';
import { useRouteContent } from '../../shared/content/RouteContentContext';
import { APP_STRINGS } from '../../shared/content/strings';
import { formatElevation } from '../../utils/units';

const HERO_HEIGHT = 280;

export function MilestoneCeremonyScreen(): React.JSX.Element | null {
  const routeContent = useRouteContent();
  const activeCeremony = useCeremonyStore((s) => s.activeCeremony);
  const dismissCeremony = useCeremonyStore((s) => s.dismissCeremony);
  const milestones = useJourneyStore((s) => s.milestones);
  const [visibleLines, setVisibleLines] = useState(0);

  // Look up matching MilestoneDoc for elevationMeters and facts
  const milestoneDoc = useMemo(() => {
    if (!activeCeremony) return null;
    return milestones.find((m) => m.titleSlug === activeCeremony.milestoneSlug) ?? null;
  }, [activeCeremony?.milestoneSlug, milestones]);

  useEffect(() => {
    if (!activeCeremony) {
      setVisibleLines(0);
      return;
    }
    setVisibleLines(0);
    // Reveal dialogue lines one by one
    const totalLines = activeCeremony.dialogueLines.length;
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setVisibleLines(current);
      if (current >= totalLines) {
        clearInterval(timer);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [activeCeremony?.milestoneSlug]);

  if (!activeCeremony) return null;

  const milestoneImage = getMilestoneImage(activeCeremony.milestoneSlug);
  const allLinesVisible = visibleLines >= activeCeremony.dialogueLines.length;

  const actionLabel =
    APP_STRINGS.ceremony.actionLabels[activeCeremony.nextAction] ??
    activeCeremony.nextAction;

  const elevationMeters = milestoneDoc?.elevationMeters ?? activeCeremony.altitudeMeters;
  const facts = milestoneDoc?.facts ?? [];

  const handleAction = () => {
    dismissCeremony();
    // Navigation handled by RootNavigator watching useCeremonyStore.lastDismissedAction
  };

  return (
    <Modal visible animationType="fade" onRequestClose={handleAction}>
      <View style={styles.container}>
        {/* Hero area with milestone image */}
        <View style={styles.heroArea}>
          {milestoneImage ? (
            <Image source={milestoneImage} style={styles.heroImage} resizeMode="cover" />
          ) : null}
          <View style={styles.heroOverlay}>
            <Text style={styles.arrivedLabel}>
              {APP_STRINGS.ceremony.arrivedLabel}
            </Text>
            <Text style={styles.heroLocationName}>
              {activeCeremony.milestoneName}
            </Text>
            <Text style={styles.heroElevation}>
              {formatElevation(elevationMeters)}
            </Text>
          </View>
        </View>

        {/* Scrollable ceremony content */}
        <ScrollView
          style={styles.contentArea}
          contentContainerStyle={styles.contentInner}
        >
          <Text style={styles.nepaliName}>{activeCeremony.nepaliName}</Text>

          {/* Guide's Dialogue */}
          <View style={styles.dialogueContainer}>
            {activeCeremony.dialogueLines.slice(0, visibleLines).map((line, i) => (
              <View
                key={`${activeCeremony.milestoneSlug}-${i}`}
                style={styles.dialogueLineWrapper}
              >
                <Text style={styles.dialogueLine}>&ldquo;{line}&rdquo;</Text>
              </View>
            ))}
            {!allLinesVisible && (
              <Text style={styles.typingIndicator}>...</Text>
            )}
          </View>

          <Text style={styles.guideAttribution}>
            {routeContent.guide.attribution}
          </Text>

          {/* Facts section */}
          {facts.length > 0 && (
            <View style={styles.factsContainer}>
              <Text style={styles.factsHeader}>Did you know?</Text>
              {facts.map((fact, i) => (
                <Text
                  key={`fact-${i}`}
                  style={styles.factItem}
                >
                  • {fact}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Fixed footer action button */}
        {allLinesVisible && (
          <View style={styles.footer}>
            <PrimaryButton
              label={actionLabel}
              onPress={handleAction}
              variant="accent"
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heroArea: {
    height: HERO_HEIGHT,
    backgroundColor: colors.primary,
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 24,
  },
  arrivedLabel: {
    ...typography.label,
    color: colors.sage,
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroLocationName: {
    ...typography.heading,
    fontSize: 28,
    fontWeight: '800',
    color: colors.background,
    marginBottom: 4,
  },
  heroElevation: {
    ...typography.label,
    color: colors.sage,
  },
  contentArea: { flex: 1 },
  contentInner: { padding: 24, paddingBottom: 24 },
  nepaliName: {
    fontSize: 18,
    fontStyle: 'italic',
    color: colors.mutedText,
    marginBottom: 24,
  },
  dialogueContainer: { marginBottom: 16 },
  dialogueLineWrapper: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: 12,
    marginBottom: 12,
  },
  dialogueLine: {
    ...typography.body,
    color: colors.accentDeep,
    fontStyle: 'italic',
  },
  typingIndicator: {
    fontSize: 20,
    color: colors.sage,
    letterSpacing: 4,
  },
  guideAttribution: {
    ...typography.label,
    color: colors.mutedText,
    marginBottom: 24,
  },
  factsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  factsHeader: {
    ...typography.label,
    color: colors.mutedText,
    marginBottom: 12,
  },
  factItem: {
    ...typography.body,
    color: colors.text,
    marginBottom: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
    backgroundColor: colors.background,
    ...shadows.sm,
  },
});
