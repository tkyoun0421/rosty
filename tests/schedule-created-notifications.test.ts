declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('schedule created notifications migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260321120000_schedule_created_notifications.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('creates the schedule-created trigger function and trigger', () => {
    expect(migration).toContain(
      'create or replace function public.notify_schedule_created()',
    );
    expect(migration).toContain(
      'create trigger schedules_created_notifications_after_insert',
    );
  });

  it('enqueues schedule_created notifications for active employees', () => {
    expect(migration).toContain("'schedule_created'::public.notification_type");
    expect(migration).toContain("where profiles.role = 'employee'");
    expect(migration).toContain("and profiles.status = 'active'");
  });
});
