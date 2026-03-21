declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('complete schedule operation rpc migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260321130000_complete_schedule_operation_rpc.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('creates the limited schedule completion rpc', () => {
    expect(migration).toContain(
      'create or replace function public.complete_schedule_operation',
    );
    expect(migration).toContain("'completed'::public.schedule_status");
    expect(migration).toContain("set status = 'completed'");
  });

  it('requires actual time and no pending cancellation requests before completion', () => {
    expect(migration).toContain(
      'Record actual start and end times before completing the schedule.',
    );
    expect(migration).toContain(
      'Resolve pending cancellation requests before completing the schedule.',
    );
  });
});
