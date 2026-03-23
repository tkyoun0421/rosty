declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('schedule cancelled notifications migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260323110000_schedule_cancelled_notifications.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('adds the notification type and patches cancel_schedule_operation', () => {
    expect(migration).toContain(
      "alter type public.notification_type add value if not exists 'schedule_cancelled'",
    );
    expect(migration).toContain(
      'create or replace function public.cancel_schedule_operation',
    );
  });

  it('enqueues schedule_cancelled notifications only for confirmed assignees', () => {
    expect(migration).toContain("'schedule_cancelled'::public.notification_type");
    expect(migration).toContain(
      "where cancelled_assignments.previous_status = 'confirmed'",
    );
    expect(migration).toContain(
      "'The schedule for ' || v_event_date::text || ' was cancelled. Your assignment was removed.'",
    );
  });
});
