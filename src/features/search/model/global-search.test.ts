import {
  filterGlobalSearchResults,
  rankGlobalSearchResults,
  shouldShowGlobalSearchSection,
} from '@/features/search/model/global-search';

describe('global search helpers', () => {
  it('filters case-insensitively', () => {
    const results = filterGlobalSearchResults(
      [
        { title: 'Grand Hall wedding' },
        { title: 'Garden Hall reception' },
      ],
      (item) => item.title,
      'grand',
    );

    expect(results).toEqual([{ title: 'Grand Hall wedding' }]);
  });

  it('shows only the selected result section when a chip is active', () => {
    expect(shouldShowGlobalSearchSection('all', 'schedules')).toBe(true);
    expect(shouldShowGlobalSearchSection('assignments', 'assignments')).toBe(
      true,
    );
    expect(shouldShowGlobalSearchSection('members', 'schedules')).toBe(false);
  });

  it('ranks stronger matches ahead of weaker matches', () => {
    const results = rankGlobalSearchResults(
      [
        { title: 'Grand Hall wedding', meta: '2026-03-29' },
        { title: 'Wedding support', meta: 'Grand Hall' },
        { title: 'Garden Hall reception', meta: '2026-03-30' },
      ],
      (item) => item.title,
      (item) => item.meta,
      'grand',
    );

    expect(results).toEqual([
      { title: 'Grand Hall wedding', meta: '2026-03-29' },
      { title: 'Wedding support', meta: 'Grand Hall' },
      { title: 'Garden Hall reception', meta: '2026-03-30' },
    ]);
  });
});
