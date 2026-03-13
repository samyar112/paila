import React, { createContext, useContext } from 'react';
import type { RouteContent } from './types';
import { EVEREST_CONTENT } from './routes/everest';

const RouteContentContext = createContext<RouteContent>(EVEREST_CONTENT);

interface RouteContentProviderProps {
  content: RouteContent;
  children: React.ReactNode;
}

export function RouteContentProvider({ content, children }: RouteContentProviderProps) {
  return (
    <RouteContentContext.Provider value={content}>
      {children}
    </RouteContentContext.Provider>
  );
}

export function useRouteContent(): RouteContent {
  return useContext(RouteContentContext);
}
