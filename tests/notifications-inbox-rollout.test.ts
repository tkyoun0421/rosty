declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('notifications inbox rollout migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260320143000_notifications_inbox_rollout.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('creates the notifications table and active-user policies', () => {
    expect(migration).toContain('create table if not exists public.notifications');
    expect(migration).toContain('create policy notifications_self_read');
    expect(migration).toContain('create policy notifications_self_update');
  });

  it('patches cancellation RPCs to enqueue notification rows', () => {
    expect(migration).toContain('cancellation_requested');
    expect(migration).toContain('cancellation_approved');
    expect(migration).toContain('cancellation_rejected');
    expect(migration).toContain("'/cancellation-queue'");
    expect(migration).toContain("format('/assignment-detail?scheduleId=%s'");
  });
});
