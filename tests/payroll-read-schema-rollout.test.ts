declare const __dirname: string;
declare function require(moduleName: string): any;

const { readFileSync } = require('fs');
const path = require('path');

describe('payroll read schema rollout migration', () => {
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260320130000_payroll_read_schema_rollout.sql',
  );
  const migration = readFileSync(migrationPath, 'utf8');

  it('creates the tracked scheduling tables required by Team Payroll', () => {
    expect(migration).toContain('create table if not exists public.slot_presets');
    expect(migration).toContain('create table if not exists public.schedules');
    expect(migration).toContain('create table if not exists public.schedule_slots');
    expect(migration).toContain('create table if not exists public.assignments');
    expect(migration).toContain(
      'create table if not exists public.schedule_time_records',
    );
  });

  it('adds the active-user and manager-admin read-side policies', () => {
    expect(migration).toContain('create or replace function public.is_active_user()');
    expect(migration).toContain('create policy schedules_active_read');
    expect(migration).toContain('create policy assignments_manager_admin_read');
    expect(migration).toContain(
      'create policy schedule_time_records_active_read',
    );
  });
});
