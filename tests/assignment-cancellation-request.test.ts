declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('assignment cancellation request migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260320133000_assignment_cancellation_request.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('creates the cancellation_requests table and employee RPC', () => {
    expect(migration).toContain(
      'create table if not exists public.cancellation_requests',
    );
    expect(migration).toContain(
      'create or replace function public.request_assignment_cancellation',
    );
  });

  it('enforces one active request per assignment and assignment status updates', () => {
    expect(migration).toContain(
      'create unique index if not exists cancellation_requests_active_request_unique',
    );
    expect(migration).toContain("set status = 'cancel_requested'");
  });
});
