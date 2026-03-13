import { create } from 'zustand';
import type { ContentPackState } from '../services/content/ContentPackService';

interface ContentStoreState {
  downloadState: ContentPackState;
  downloadProgress: number;
  downloadError: string | null;
}

interface ContentStoreActions {
  setDownloadState: (state: ContentPackState) => void;
  setDownloadProgress: (progress: number) => void;
  setDownloadError: (error: string | null) => void;
  reset: () => void;
}

type ContentStore = ContentStoreState & ContentStoreActions;

const INITIAL_STATE: ContentStoreState = {
  downloadState: 'idle',
  downloadProgress: 0,
  downloadError: null,
};

export const useContentStore = create<ContentStore>((set) => ({
  ...INITIAL_STATE,
  setDownloadState: (state) => set({ downloadState: state }),
  setDownloadProgress: (progress) => set({ downloadProgress: progress }),
  setDownloadError: (error) => set({ downloadError: error }),
  reset: () => set(INITIAL_STATE),
}));
