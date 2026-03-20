declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('confirm schedule assignments rpc migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260320153000_confirm_schedule_assignments_rpc.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('creates the confirm rpc and locks the schedule into assigned/locked state', () => {
    expect(migration).toContain(
      'create or replace function public.confirm_schedule_assignments',
    );
    expect(migration).toContain("set status = 'assigned'");
    expect(migration).toContain("collection_state = 'locked'");
  });
});
