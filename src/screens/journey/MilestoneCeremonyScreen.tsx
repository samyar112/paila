import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useCeremonyStore } from '../../stores/useCeremonyStore';
import { colors, radii, typography } from '../../shared/theme/placeholder-theme';
import { PEMBA_ATTRIBUTION } from '../../shared/data/pemba-dialogue';
import { PrimaryButton } from '../../components/shared/PrimaryButton';
import { getMilestoneImage } from '../../shared/assets/milestone-images';

export function MilestoneCeremonyScreen(): React.JSX.Element | null {
  const activeCeremony = useCeremonyStore((s) => s.activeCeremony);
  const dismissCeremony = useCeremonyStore((s) => s.dismissCeremony);
  const [visibleLines, setVisibleLines] = useState(0);

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

  const actionLabel = activeCeremony.nextAction === 'complete'
    ? 'You Made It'
    : activeCeremony.nextAction === 'paywall'
      ? "See What's Ahead"
      : 'Continue Journey';

  const handleAction = () => {
    dismissCeremony();
    // Navigation handled by RootNavigator watching useCeremonyStore.lastDismissedAction
  };

  return (
    <Modal visible animationType="fade" onRequestClose={handleAction}>
      <View style={styles.container}>
        {/* Hero Image */}
        <View style={styles.heroArea}>
          {milestoneImage ? (
            <Image source={milestoneImage} style={styles.heroImage} resizeMode="cover" />
          ) : null}
          <View style={styles.heroOverlay}>
            <Text style={styles.altitudeBadge}>
              {activeCeremony.altitudeMeters.toLocaleString()}m
            </Text>
          </View>
        </View>

        {/* Ceremony Content */}
        <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentInner}>
          <Text style={styles.arrivedLabel}>YOU HAVE ARRIVED AT</Text>
          <Text style={styles.milestoneName}>{activeCeremony.milestoneName}</Text>
          <Text style={styles.nepaliName}>{activeCeremony.nepaliName}</Text>

          {/* Pemba's Dialogue */}
          <View style={styles.dialogueContainer}>
            {activeCeremony.dialogueLines.slice(0, visibleLines).map((line, i) => (
              <Text key={i} style={styles.dialogueLine}>"{line}"</Text>
            ))}
            {!allLinesVisible && (
              <Text style={styles.typingIndicator}>...</Text>
            )}
          </View>

          <Text style={styles.pembaName}>{PEMBA_ATTRIBUTION}</Text>

          {/* Action Button */}
          {allLinesVisible && (
            <PrimaryButton
              label={actionLabel}
              onPress={handleAction}
              variant={activeCeremony.nextAction === 'complete' ? 'accent' : 'primary'}
            />
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heroArea: {
    height: '40%',
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
    backgroundColor: colors.overlayLight,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 24,
  },
  altitudeBadge: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.sage,
    letterSpacing: 1,
  },
  contentArea: { flex: 1 },
  contentInner: { padding: 24, paddingBottom: 40 },
  arrivedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedText,
    letterSpacing: 2,
    marginBottom: 8,
  },
  milestoneName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  nepaliName: {
    fontSize: 18,
    fontStyle: 'italic',
    color: colors.mutedText,
    marginBottom: 28,
  },
  dialogueContainer: { marginBottom: 16 },
  dialogueLine: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.accentDeep,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  typingIndicator: {
    fontSize: 20,
    color: colors.sage,
    letterSpacing: 4,
  },
  pembaName: {
    fontSize: 13,
    color: colors.mutedText,
    marginBottom: 32,
  },

});
