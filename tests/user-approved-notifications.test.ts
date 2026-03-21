declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('user approved notifications migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260321123000_user_approved_notifications.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('patches admin_manage_member approvals to enqueue user-approved notifications', () => {
    expect(migration).toContain(
      'create or replace function public.admin_manage_member',
    );
    expect(migration).toContain("'user_approved'::public.notification_type");
    expect(migration).toContain('insert into public.notifications');
  });

  it('routes approved employees and managers to the correct home screens', () => {
    expect(migration).toContain("then '/employee-home'");
    expect(migration).toContain("else '/manager-home'");
  });
});
