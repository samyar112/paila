// Generic app strings — not route-specific.
// These stay the same regardless of which route the user is on.

export const APP_STRINGS = {
  onboarding: {
    next: 'Next',
    beginJourney: 'Begin Journey',
  },

  journeyHome: {
    stateLabels: {
      WALKING: 'Walking',
      PAUSED_AT_CHECKPOINT: 'At Checkpoint',
      RESTING: 'Resting',
      PAYWALL_FROZEN: 'Journey Paused',
      COMPLETED: 'Journey Complete',
    } as Record<string, string>,
    stepsToday: 'Steps Today',
    distance: 'Distance',
    complete: 'Complete',
    loading: 'Loading your journey...',
    starting: 'Starting',
  },

  checkpoint: {
    arrivedLabel: 'You have arrived at',
    fallbackName: 'Checkpoint',
    rest: 'Rest here',
    restSub: 'End today. Tomorrow starts from here.',
    keepWalking: 'Keep walking today',
    keepWalkingSub: 'Continue until midnight. Open the app again to claim more steps.',
  },

  ceremony: {
    arrivedLabel: 'YOU HAVE ARRIVED AT',
    actionLabels: {
      continue: 'Continue Journey',
      paywall: "See What's Ahead",
      complete: 'You Made It',
    } as Record<string, string>,
  },

  purchase: {
    unlock: 'Unlock Full Trek',
    returnHome: 'Return Home Instead',
    returnHomeSub: 'Walk the free return path back to Kathmandu',
    restore: 'Restore Purchase',
    notNow: 'Not now',
    purchaseFailed: 'Purchase failed. Please try again.',
    noRestore: 'No previous purchase found.',
  },

  journeyReturn: {
    stateLabel: 'Returning Home',
  },

  deleteAccount: {
    title: 'Delete Account',
    warning: 'This will permanently delete your account, journey progress, and all data. This cannot be undone.',
    instruction: 'Type DELETE to confirm',
    placeholder: 'Type DELETE',
    delete: 'Delete My Account',
    cancel: 'Cancel',
    deleteFailed: 'Failed to delete account',
  },

  intro: {
    skip: 'Skip',
  },

  ads: {
    title: 'Ad Supports the App',
    subtitle: 'We show a small ad to keep Paila free. It never affects your journey progress, steps, or data. Unlock the full trek to remove ads.',
  },

  comingSoon: {
    badge: 'COMING SOON',
    notifyMe: 'Notify Me',
    distance: 'Distance',
    region: 'Region',
    guide: 'Your Guide',
  },
} as const;
