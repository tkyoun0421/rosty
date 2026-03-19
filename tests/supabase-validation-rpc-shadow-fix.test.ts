declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('validation rpc shadow fix migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260320103000_validation_rpc_shadow_fix.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('qualifies profile setup and employee join reads that would shadow RETURNS TABLE columns', () => {
    expect(migration).toContain('select profiles.role, profiles.status');
    expect(migration).toContain('select invitation_links.id,');
    expect(migration).toContain('invitation_links.consumed_at,');
  });

  it('uses explicit primary-key constraints for pay policy upserts', () => {
    expect(migration).toContain(
      'on conflict on constraint pay_policies_pkey do update',
    );
    expect(migration).toContain(
      'on conflict on constraint pay_rates_pkey do update',
    );
  });
});
