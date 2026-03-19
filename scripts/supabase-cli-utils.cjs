const { spawnSync } = require('node:child_process');
const { existsSync, mkdirSync, readFileSync } = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(process.cwd());
const envFiles = ['.env', '.env.local'];
const placeholderPatterns = [
  /^your[-_]/i,
  /^https:\/\/your-project\.supabase\.co$/i,
  /^your-project-ref$/i,
  /^your-anon-key$/i,
  /^your-personal-access-token$/i,
  /^your-db-password$/i,
  /^change[-_]?me$/i,
  /^replace[-_]?me$/i,
];

function normalizeEnvValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isPlaceholderEnvValue(value) {
  const normalized = normalizeEnvValue(value);

  if (!normalized) {
    return false;
  }

  return placeholderPatterns.some((pattern) => pattern.test(normalized));
}

function hasUsableEnvValue(value) {
  const normalized = normalizeEnvValue(value);

  return normalized !== '' && !isPlaceholderEnvValue(normalized);
}

function parseEnvFile(contents) {
  const parsed = {};
  const lines = contents.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      continue;
    }

    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

    if (!match) {
      continue;
    }

    const key = match[1];
    let value = match[2] ?? '';

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function loadProjectEnv(baseEnv = process.env) {
  const env = { ...baseEnv };

  if (env.ROSTY_SKIP_DOTENV === '1') {
    return env;
  }

  for (const fileName of envFiles) {
    const filePath = path.join(repoRoot, fileName);

    if (!existsSync(filePath)) {
      continue;
    }

    const fileEnv = parseEnvFile(readFileSync(filePath, 'utf8'));

    for (const [key, value] of Object.entries(fileEnv)) {
      if (hasUsableEnvValue(env[key])) {
        continue;
      }

      if (value === undefined || value === null || value === '') {
        continue;
      }

      env[key] = value;
    }
  }

  return env;
}

function getSupabasePackageJsonPath() {
  try {
    return require.resolve('supabase/package.json', { paths: [repoRoot] });
  } catch {
    return null;
  }
}

function getSupabasePackageDir() {
  const packageJsonPath = getSupabasePackageJsonPath();

  return packageJsonPath ? path.dirname(packageJsonPath) : null;
}

function getSupabaseBinaryPath() {
  const packageJsonPath = getSupabasePackageJsonPath();

  if (!packageJsonPath) {
    return null;
  }

  const packageDir = path.dirname(packageJsonPath);
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const relativeBinPath =
    process.platform === 'win32'
      ? `${packageJson.bin.supabase}.exe`
      : packageJson.bin.supabase;

  return path.join(packageDir, relativeBinPath);
}

function installSupabaseCli({ required = false } = {}) {
  const packageDir = getSupabasePackageDir();
  const binaryPath = getSupabaseBinaryPath();

  if (!packageDir || !binaryPath) {
    const message =
      'The `supabase` devDependency is missing. Run `pnpm install` before using migration commands.';

    if (required) {
      throw new Error(message);
    }

    console.warn(message);
    return null;
  }

  if (existsSync(binaryPath)) {
    return binaryPath;
  }

  const result = spawnSync(process.execPath, ['scripts/postinstall.js'], {
    cwd: packageDir,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    if (required) {
      throw result.error;
    }

    console.warn(
      `Supabase CLI bootstrap failed: ${result.error.message}. Run \`pnpm supabase:install\` after resolving the issue.`,
    );
    return null;
  }

  if (result.status !== 0 || !existsSync(binaryPath)) {
    const message =
      'Supabase CLI bootstrap did not produce a local binary. Run `pnpm supabase:install` after resolving network or permission issues.';

    if (required) {
      throw new Error(message);
    }

    console.warn(message);
    return null;
  }

  return binaryPath;
}

function ensureSupabaseCli({ required = false } = {}) {
  const binaryPath = getSupabaseBinaryPath();

  if (binaryPath && existsSync(binaryPath)) {
    return binaryPath;
  }

  return installSupabaseCli({ required });
}

function getCliHomeDir() {
  return path.join(repoRoot, '.tmp-home', 'supabase-cli');
}

function runSupabase(args, options = {}) {
  const binaryPath = ensureSupabaseCli({ required: options.required !== false });

  if (!binaryPath) {
    return 1;
  }

  const cliHomeDir = getCliHomeDir();
  mkdirSync(cliHomeDir, { recursive: true });

  const env = {
    ...loadProjectEnv(),
    ...options.extraEnv,
    EXPO_NO_TELEMETRY: '1',
    HOME: cliHomeDir,
    USERPROFILE: cliHomeDir,
  };

  const result = spawnSync(binaryPath, args, {
    cwd: options.cwd ?? repoRoot,
    stdio: 'inherit',
    env,
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === 'number') {
    return result.status;
  }

  return 1;
}

module.exports = {
  ensureSupabaseCli,
  getSupabaseBinaryPath,
  hasUsableEnvValue,
  installSupabaseCli,
  isPlaceholderEnvValue,
  loadProjectEnv,
  normalizeEnvValue,
  repoRoot,
  runSupabase,
};
