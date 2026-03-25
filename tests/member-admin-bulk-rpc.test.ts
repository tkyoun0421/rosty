declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('member admin bulk rpc migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260325100000_member_admin_bulk_rpc.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('creates the limited bulk member-admin rpc', () => {
    expect(migration).toContain(
      'create or replace function public.admin_manage_members_bulk',
    );
    expect(migration).toContain(
      'public.admin_manage_member(',
    );
    expect(migration).toContain(
      'returns table (\n  total_requested integer,\n  total_updated integer',
    );
  });

  it('rejects empty member lists and deduplicates ids before processing', () => {
    expect(migration).toContain(
      "raise exception 'Choose at least one valid member.'",
    );
    expect(migration).toContain('array_agg(distinct member_id)');
  });
});
