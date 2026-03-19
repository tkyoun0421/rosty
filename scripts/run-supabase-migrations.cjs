const {
  hasUsableEnvValue,
  isPlaceholderEnvValue,
  loadProjectEnv,
  normalizeEnvValue,
  runSupabase,
} = require('./supabase-cli-utils.cjs');

const allowedActions = new Set(['link', 'status', 'dry-run', 'apply']);

function deriveProjectId(env) {
  const explicitProjectId =
    normalizeEnvValue(env.SUPABASE_PROJECT_ID) ||
    normalizeEnvValue(env.SUPABASE_PROJECT_REF);

  if (hasUsableEnvValue(explicitProjectId)) {
    return explicitProjectId;
  }

  const publicUrl = normalizeEnvValue(env.EXPO_PUBLIC_SUPABASE_URL);

  if (!hasUsableEnvValue(publicUrl)) {
    return '';
  }

  try {
    const hostname = new URL(publicUrl).hostname;
    const suffix = '.supabase.co';

    if (hostname.endsWith(suffix)) {
      const derivedProjectId = hostname.slice(0, -suffix.length);
      return isPlaceholderEnvValue(derivedProjectId) ? '' : derivedProjectId;
    }
  } catch {
    return '';
  }

  return '';
}

function getMigrationPrerequisites(env = loadProjectEnv()) {
  const projectId = deriveProjectId(env);
  const accessToken = normalizeEnvValue(env.SUPABASE_ACCESS_TOKEN);
  const dbPassword = normalizeEnvValue(env.SUPABASE_DB_PASSWORD);
  const missing = [];

  if (!projectId) {
    missing.push(
      'Set `SUPABASE_PROJECT_ID` or provide a standard `EXPO_PUBLIC_SUPABASE_URL` so the project ref can be resolved. Example placeholders such as `your-project-ref` or `https://your-project.supabase.co` are not valid.',
    );
  }

  if (!hasUsableEnvValue(accessToken)) {
    missing.push(
      'Set `SUPABASE_ACCESS_TOKEN` with a real Supabase personal access token for non-interactive CLI auth. Example placeholders such as `your-personal-access-token` are not valid. Prefer `.env.local` or process-level secrets for rollout-only credentials.',
    );
  }

  if (!hasUsableEnvValue(dbPassword)) {
    missing.push(
      'Set `SUPABASE_DB_PASSWORD` with the remote Postgres database password so `supabase link` can complete. Example placeholders such as `your-db-password` are not valid. Prefer `.env.local` or process-level secrets for rollout-only credentials.',
    );
  }

  return {
    projectId,
    accessToken,
    dbPassword,
    missing,
  };
}

function main(argv = process.argv) {
  const action = argv[2];

  if (!allowedActions.has(action)) {
    console.error('Usage: pnpm supabase:migrations:<link|status|dry-run|apply>');
    return 1;
  }

  const env = loadProjectEnv();
  const { projectId, accessToken, dbPassword, missing } =
    getMigrationPrerequisites(env);

  if (missing.length > 0) {
    console.error(
      'Supabase migration prerequisites are missing or still using example placeholders:',
    );

    for (const item of missing) {
      console.error(`- ${item}`);
    }

    return 1;
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
    return status;
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
  return status;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = {
  allowedActions,
  deriveProjectId,
  getMigrationPrerequisites,
  main,
};
