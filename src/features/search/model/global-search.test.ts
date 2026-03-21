import { filterGlobalSearchResults } from '@/features/search/model/global-search';

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
});
