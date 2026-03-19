// @ts-nocheck
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const repoRoot = process.cwd();

type EnvRecord = Record<string, string | undefined>;

type SupabaseCliUtilsModule = {
  loadProjectEnv: (baseEnv?: EnvRecord) => EnvRecord;
};

type RunSupabaseMigrationsModule = {
  deriveProjectId: (env: EnvRecord) => string;
  getMigrationPrerequisites: (env: EnvRecord) => {
    projectId: string;
    accessToken: string;
    dbPassword: string;
    missing: string[];
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

function restoreEnv(snapshot: EnvRecord) {
  for (const key of Object.keys(process.env)) {
    if (!(key in snapshot)) {
      delete process.env[key];
    }
  }

  for (const [key, value] of Object.entries(snapshot)) {
    if (value === undefined) {
      delete process.env[key];
      continue;
    }

    process.env[key] = value;
  }
}

describe('Supabase migration rollout helpers', () => {
  const originalCwd = process.cwd();
  const originalEnv: EnvRecord = { ...process.env };

  afterEach(() => {
    restoreEnv(originalEnv);
    process.chdir(originalCwd);
    jest.resetModules();
  });

  it('lets .env.local override placeholder rollout values from .env', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rosty-rollout-env-'));

    fs.writeFileSync(
      path.join(tempDir, '.env'),
      [
        'SUPABASE_PROJECT_ID=your-project-ref',
        'SUPABASE_ACCESS_TOKEN=your-personal-access-token',
        'SUPABASE_DB_PASSWORD=your-db-password',
        '',
      ].join('\n'),
      'utf8',
    );
    fs.writeFileSync(
      path.join(tempDir, '.env.local'),
      [
        'SUPABASE_PROJECT_ID=real-project-ref',
        'SUPABASE_ACCESS_TOKEN=sbp_local_real_token',
        'SUPABASE_DB_PASSWORD=real-db-password',
        '',
      ].join('\n'),
      'utf8',
    );

    process.chdir(tempDir);

    const { loadProjectEnv } =
      requireFreshModule<SupabaseCliUtilsModule>('scripts/supabase-cli-utils.cjs');
    const env = loadProjectEnv({});

    expect(env.SUPABASE_PROJECT_ID).toBe('real-project-ref');
    expect(env.SUPABASE_ACCESS_TOKEN).toBe('sbp_local_real_token');
    expect(env.SUPABASE_DB_PASSWORD).toBe('real-db-password');
  });

  it('treats example rollout placeholders as missing prerequisites', () => {
    const { getMigrationPrerequisites } =
      requireFreshModule<RunSupabaseMigrationsModule>(
        'scripts/run-supabase-migrations.cjs',
      );

    const prereqs = getMigrationPrerequisites({
      SUPABASE_PROJECT_ID: 'your-project-ref',
      SUPABASE_ACCESS_TOKEN: 'your-personal-access-token',
      SUPABASE_DB_PASSWORD: 'your-db-password',
      EXPO_PUBLIC_SUPABASE_URL: 'https://your-project.supabase.co',
    });

    expect(prereqs.projectId).toBe('');
    expect(prereqs.missing).toEqual(
      expect.arrayContaining([
        expect.stringContaining('your-project-ref'),
        expect.stringContaining('your-personal-access-token'),
        expect.stringContaining('.env.local'),
        expect.stringContaining('your-db-password'),
      ]),
    );
  });

  it('derives the project ref from a valid public Supabase URL', () => {
    const { deriveProjectId } =
      requireFreshModule<RunSupabaseMigrationsModule>(
        'scripts/run-supabase-migrations.cjs',
      );

    expect(
      deriveProjectId({
        EXPO_PUBLIC_SUPABASE_URL: 'https://pxxuhfagabdymdnclbfr.supabase.co',
      }),
    ).toBe('pxxuhfagabdymdnclbfr');
  });
});
