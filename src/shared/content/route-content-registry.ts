import type { RouteContent, ComingSoonRoute } from './types';
import { EVEREST_CONTENT } from './routes/everest';
import { ANNAPURNA_COMING_SOON } from './routes/annapurna';

// Register all route content here. Adding a new route = one import + one entry.
const ROUTE_CONTENT: Record<string, RouteContent> = {
  'everest-summit': EVEREST_CONTENT,
};

export function getRouteContent(routeId: string): RouteContent {
  const content = ROUTE_CONTENT[routeId];
  if (!content) {
    throw new Error(`No content registered for route: ${routeId}. Add it to route-content-registry.ts`);
  }
  return content;
}

export function getDefaultRouteContent(): RouteContent {
  return EVEREST_CONTENT;
}

const COMING_SOON_ROUTES: ComingSoonRoute[] = [
  ANNAPURNA_COMING_SOON,
];

export function getComingSoonRoutes(): ComingSoonRoute[] {
  return COMING_SOON_ROUTES;
}
