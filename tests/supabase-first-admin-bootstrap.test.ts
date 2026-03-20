// @ts-nocheck
import * as path from 'node:path';

const repoRoot = process.cwd();

type EnvRecord = Record<string, string | undefined>;

type FirstAdminBootstrapModule = {
  buildFirstAdminBootstrapSql: (
    targetType: string,
    targetValue: string,
  ) => string;
  getFirstAdminBootstrapPrerequisites: (
    rawArgs: string[],
    env: EnvRecord,
  ) => {
    missing: string[];
    projectId: string;
    targetType: string;
    targetValue: string;
  };
  parseFirstAdminBootstrapArgs: (rawArgs: string[]) => {
    userId: string;
    email: string;
    errors: string[];
  };
};

function requireFreshModule<T>(relativePath: string): T {
  let loaded = null as T | null;

  jest.isolateModules(() => {
    loaded = jest.requireActual(path.join(repoRoot, relativePath)) as T;
  });

  if (!loaded) {
    throw new Error(`Failed to load module: ${relativePath}`);
  }

  return loaded;
}

describe('Supabase first-admin bootstrap helpers', () => {
  it('parses a forwarded pnpm email target argument', () => {
    const { parseFirstAdminBootstrapArgs } =
      requireFreshModule<FirstAdminBootstrapModule>(
        'scripts/run-supabase-first-admin.cjs',
      );

    expect(
      parseFirstAdminBootstrapArgs(['--', '--email', 'admin@rosty.app']),
    ).toEqual({
      userId: '',
      email: 'admin@rosty.app',
      errors: [],
    });
  });

  it('rejects ambiguous target configuration', () => {
    const { getFirstAdminBootstrapPrerequisites } =
      requireFreshModule<FirstAdminBootstrapModule>(
        'scripts/run-supabase-first-admin.cjs',
      );

    const prereqs = getFirstAdminBootstrapPrerequisites([], {
      EXPO_PUBLIC_SUPABASE_URL: 'https://pxxuhfagabdymdnclbfr.supabase.co',
      SUPABASE_ACCESS_TOKEN: 'sbp_local_real_token',
      SUPABASE_DB_PASSWORD: 'real-db-password',
      SUPABASE_FIRST_ADMIN_USER_ID: '11111111-1111-4111-8111-111111111111',
      SUPABASE_FIRST_ADMIN_EMAIL: 'admin@rosty.app',
    });

    expect(prereqs.projectId).toBe('pxxuhfagabdymdnclbfr');
    expect(prereqs.missing).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Provide exactly one bootstrap target'),
      ]),
    );
  });

  it('builds bootstrap SQL that targets auth.users by email and guards the first-admin path', () => {
    const { buildFirstAdminBootstrapSql } =
      requireFreshModule<FirstAdminBootstrapModule>(
        'scripts/run-supabase-first-admin.cjs',
      );

    const sql = buildFirstAdminBootstrapSql('email', "admin.o'hara@rosty.app");

    expect(sql).toContain(
      "lower(users.email) = lower('admin.o''hara@rosty.app')",
    );
    expect(sql).toContain(
      "pg_advisory_xact_lock(hashtext('rosty:first-admin-bootstrap')::bigint)",
    );
    expect(sql).toContain(
      'This bootstrap path only supports the first persistent admin account.',
    );
    expect(sql).toContain("role = 'admin'");
    expect(sql).toContain("status = 'active'");
  });
});
