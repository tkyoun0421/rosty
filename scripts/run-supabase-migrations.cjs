const { loadProjectEnv, runSupabase } = require('./supabase-cli-utils.cjs');

const action = process.argv[2];
const allowedActions = new Set(['link', 'status', 'dry-run', 'apply']);

function deriveProjectId(env) {
  const explicitProjectId =
    env.SUPABASE_PROJECT_ID?.trim() || env.SUPABASE_PROJECT_REF?.trim();

  if (explicitProjectId) {
    return explicitProjectId;
  }

  const publicUrl = env.EXPO_PUBLIC_SUPABASE_URL?.trim();

  if (!publicUrl) {
    return '';
  }

  try {
    const hostname = new URL(publicUrl).hostname;
    const suffix = '.supabase.co';

    if (hostname.endsWith(suffix)) {
      return hostname.slice(0, -suffix.length);
    }
  } catch {
    return '';
  }

  return '';
}

if (!allowedActions.has(action)) {
  console.error('Usage: pnpm supabase:migrations:<link|status|dry-run|apply>');
  process.exit(1);
}

const env = loadProjectEnv();
const projectId = deriveProjectId(env);
const accessToken = env.SUPABASE_ACCESS_TOKEN?.trim() ?? '';
const dbPassword = env.SUPABASE_DB_PASSWORD?.trim() ?? '';
const missing = [];

if (!projectId) {
  missing.push(
    'Set `SUPABASE_PROJECT_ID` or provide a standard `EXPO_PUBLIC_SUPABASE_URL` so the project ref can be resolved.',
  );
}

if (!accessToken) {
  missing.push(
    'Set `SUPABASE_ACCESS_TOKEN` with a Supabase personal access token for non-interactive CLI auth.',
  );
}

if (!dbPassword) {
  missing.push(
    'Set `SUPABASE_DB_PASSWORD` with the remote Postgres database password so `supabase link` can complete.',
  );
}

if (missing.length > 0) {
  console.error('Supabase migration prerequisites are missing:');

  for (const item of missing) {
    console.error(`- ${item}`);
  }

  process.exit(1);
}

const cliEnv = {
  SUPABASE_ACCESS_TOKEN: accessToken,
  SUPABASE_DB_PASSWORD: dbPassword,
};

console.log(`Linking Supabase project ${projectId}...`);

let status = runSupabase(
  ['link', '--project-ref', projectId, '--password', dbPassword],
  { extraEnv: cliEnv },
);

if (status !== 0 || action === 'link') {
  process.exit(status);
}

const nextCommand =
  action === 'status'
    ? ['migration', 'list']
    : action === 'dry-run'
      ? ['db', 'push', '--dry-run']
      : ['db', 'push'];

console.log(
  action === 'status'
    ? 'Checking linked migration status...'
    : action === 'dry-run'
      ? 'Previewing pending migration apply...'
      : 'Applying pending migrations to the linked project...',
);

status = runSupabase(nextCommand, { extraEnv: cliEnv });
process.exit(status);
