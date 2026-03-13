// Route content types. Every route (Everest, Camino, Inca Trail) implements this.
// Screens read from this shape -- they never reference a specific route by name.

export interface GuideContent {
  name: string;
  attribution: string;
  role: string;
  characterId: string;
}

export interface OnboardingSlide {
  title: string;
  subtitle: string;
  imageKey?: string;
}

export interface PaywallContent {
  location: string;
  altitude: string;
  guideQuote: string;
  unlockTitle: string;
  unlockItems: string[];
}

export interface IntroContent {
  routeLabel: string;
  guideWelcome: string;
}

export interface RouteContent {
  routeId: string;
  routeName: string;
  shortName: string;

  guide: GuideContent;

  onboarding: {
    slides: OnboardingSlide[];
    countryPicker: {
      title: string;
      subtitle: string;
      placeholder: string;
    };
  };

  intro: IntroContent;

  paywall: PaywallContent;

  checkpoint: {
    guideRestQuote: string;
  };

  returnPath: {
    guideQuote: string;
    description: string;
  };
}

export interface ComingSoonRoute {
  routeId: string;
  routeName: string;
  shortName: string;
  region: string;
  country: string;
  distance: string;
  guideName: string;
  teaser: string;
  isComingSoon: true;
}
