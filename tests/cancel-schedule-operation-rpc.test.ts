declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('cancel schedule operation rpc migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260321133000_cancel_schedule_operation_rpc.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('creates the limited schedule cancellation rpc', () => {
    expect(migration).toContain(
      'create or replace function public.cancel_schedule_operation',
    );
    expect(migration).toContain("'cancelled'::public.schedule_status");
    expect(migration).toContain("set status = 'cancelled'");
  });

  it('requires pending cancellation requests to be resolved first', () => {
    expect(migration).toContain(
      'Resolve pending cancellation requests before cancelling the schedule.',
    );
    expect(migration).toContain(
      "and cancellation_requests.status = 'requested'",
    );
  });
});
