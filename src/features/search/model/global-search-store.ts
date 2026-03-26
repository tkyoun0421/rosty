import { create } from 'zustand';

import type { GlobalSearchSectionChip } from '@/features/search/model/global-search';

type GlobalSearchUiState = {
  query: string;
  sectionChip: GlobalSearchSectionChip;
};

type GlobalSearchUiActions = {
  clear: () => void;
  setQuery: (query: string) => void;
  setSectionChip: (sectionChip: GlobalSearchSectionChip) => void;
};

const defaultGlobalSearchUiState: GlobalSearchUiState = {
  query: '',
  sectionChip: 'all',
};

export const useGlobalSearchStore = create<
  GlobalSearchUiState & GlobalSearchUiActions
>((set) => ({
  ...defaultGlobalSearchUiState,
  clear: () => set(defaultGlobalSearchUiState),
  setQuery: (query) => set({ query }),
  setSectionChip: (sectionChip) => set({ sectionChip }),
}));
