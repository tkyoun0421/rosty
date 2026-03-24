declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('schedule updated notifications migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260324110000_schedule_updated_notifications.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('adds the notification type and the schedule-updated trigger function', () => {
    expect(migration).toContain(
      "alter type public.notification_type add value if not exists 'schedule_updated'",
    );
    expect(migration).toContain(
      'create or replace function public.notify_schedule_updated()',
    );
    expect(migration).toContain(
      'create trigger schedules_updated_notifications_after_update',
    );
  });

  it('limits notifications to editable collecting schedule field changes', () => {
    expect(migration).toContain("'schedule_updated'::public.notification_type");
    expect(migration).toContain("old.status = 'collecting'");
    expect(migration).toContain("and new.status = 'collecting'");
    expect(migration).toContain("where profiles.role = 'employee'");
    expect(migration).toContain("and profiles.status = 'active'");
  });
});
