declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('availability submission rpc migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260320150000_availability_submission_rpc.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('creates the availability_submissions table and the limited employee rpc', () => {
    expect(migration).toContain(
      'create table if not exists public.availability_submissions',
    );
    expect(migration).toContain(
      'create or replace function public.submit_my_availability_response',
    );
  });

  it('blocks writes when collection is closed or the schedule is cancelled', () => {
    expect(migration).toContain(
      'Cancelled schedules cannot receive availability responses.',
    );
    expect(migration).toContain(
      'Availability responses are only open while the schedule collection is open.',
    );
  });
});
