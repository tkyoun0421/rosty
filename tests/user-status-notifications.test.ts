declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('user status notifications migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260324100000_user_status_notifications.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('adds suspend and reactivate notification types and patches admin_manage_member', () => {
    expect(migration).toContain(
      "alter type public.notification_type add value if not exists 'user_suspended'",
    );
    expect(migration).toContain(
      "alter type public.notification_type add value if not exists 'user_reactivated'",
    );
    expect(migration).toContain(
      'create or replace function public.admin_manage_member',
    );
  });

  it('enqueues notifications for suspend and reactivate actions', () => {
    expect(migration).toContain("'user_suspended'::public.notification_type");
    expect(migration).toContain("'user_reactivated'::public.notification_type");
    expect(migration).toContain("'Access suspended'");
    expect(migration).toContain("'Access restored'");
    expect(migration).toContain("'/suspended'");
    expect(migration).toContain("then '/employee-home'");
    expect(migration).toContain("else '/manager-home'");
  });
});
