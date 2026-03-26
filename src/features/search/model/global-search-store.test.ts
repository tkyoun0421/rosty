import { useGlobalSearchStore } from '@/features/search/model/global-search-store';

describe('global search store', () => {
  afterEach(() => {
    useGlobalSearchStore.getState().clear();
  });

  it('stores query and section chip across reads', () => {
    useGlobalSearchStore.getState().setQuery('grand');
    useGlobalSearchStore.getState().setSectionChip('assignments');

    expect(useGlobalSearchStore.getState().query).toBe('grand');
    expect(useGlobalSearchStore.getState().sectionChip).toBe('assignments');
  });

  it('clears back to the default state', () => {
    useGlobalSearchStore.getState().setQuery('reception');
    useGlobalSearchStore.getState().setSectionChip('members');
    useGlobalSearchStore.getState().clear();

    expect(useGlobalSearchStore.getState().query).toBe('');
    expect(useGlobalSearchStore.getState().sectionChip).toBe('all');
  });
});
