declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('deactivate my account rpc migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260321110000_deactivate_my_account_rpc.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('creates the limited self-deactivation rpc', () => {
    expect(migration).toContain(
      'create or replace function public.deactivate_my_account()',
    );
    expect(migration).toContain("set status = 'deactivated'");
  });

  it('blocks users with upcoming confirmed assignments', () => {
    expect(migration).toContain("assignments.status = 'confirmed'");
    expect(migration).toContain('schedules.event_date >= current_date');
    expect(migration).toContain(
      'Resolve your upcoming confirmed assignments before deactivating this account.',
    );
  });
});
