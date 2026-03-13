import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useCeremonyStore } from '../../stores/useCeremonyStore';

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

  const allLinesVisible = visibleLines >= activeCeremony.dialogueLines.length;

  const actionLabel = activeCeremony.nextAction === 'complete'
    ? 'You Made It'
    : activeCeremony.nextAction === 'paywall'
      ? "See What's Ahead"
      : 'Continue Journey';

  const handleAction = () => {
    dismissCeremony();
    // TODO: For paywall, navigate to PurchaseInvitationScreen
    // TODO: For complete, show completion celebration
  };

  return (
    <Modal visible animationType="fade" onRequestClose={handleAction}>
      <View style={styles.container}>
        {/* Hero Image Placeholder */}
        <View style={styles.heroArea}>
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

          <Text style={styles.pembaName}>— Pemba Dorje Sherpa</Text>

          {/* Action Button */}
          {allLinesVisible && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                activeCeremony.nextAction === 'complete' && styles.actionButtonComplete,
              ]}
              onPress={handleAction}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>{actionLabel}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F3ED' },
  heroArea: {
    height: '40%',
    backgroundColor: '#0F2A43',
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    padding: 20,
    paddingBottom: 24,
  },
  altitudeBadge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C4B89B',
    letterSpacing: 1,
  },
  contentArea: { flex: 1 },
  contentInner: { padding: 24, paddingBottom: 40 },
  arrivedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7355',
    letterSpacing: 2,
    marginBottom: 8,
  },
  milestoneName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F2A43',
    marginBottom: 4,
  },
  nepaliName: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#8B7355',
    marginBottom: 28,
  },
  dialogueContainer: { marginBottom: 16 },
  dialogueLine: {
    fontSize: 16,
    lineHeight: 26,
    color: '#4A6741',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  typingIndicator: {
    fontSize: 20,
    color: '#C4B89B',
    letterSpacing: 4,
  },
  pembaName: {
    fontSize: 13,
    color: '#8B7355',
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#0F2A43',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  actionButtonComplete: {
    backgroundColor: '#4A6741',
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F6F3ED',
  },
});
