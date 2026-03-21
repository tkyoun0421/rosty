declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('assignment confirmed notifications migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260321113000_assignment_confirmed_notifications.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('patches confirm_schedule_assignments to enqueue assignment-confirmed notifications', () => {
    expect(migration).toContain(
      'create or replace function public.confirm_schedule_assignments',
    );
    expect(migration).toContain("'assignment_confirmed'::public.notification_type");
    expect(migration).toContain('insert into public.notifications');
  });

  it('dedupes recipients per assignee when multiple seats are confirmed on the same schedule', () => {
    expect(migration).toContain('select distinct');
    expect(migration).toContain(
      "'/assignment-detail?scheduleId=' || p_schedule_id::text",
    );
  });
});
