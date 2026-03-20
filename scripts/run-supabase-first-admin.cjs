const { mkdtempSync, rmSync, writeFileSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  loadProjectEnv,
  normalizeEnvValue,
  runSupabase,
} = require('./supabase-cli-utils.cjs');
const { getMigrationPrerequisites } = require('./run-supabase-migrations.cjs');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseFirstAdminBootstrapArgs(rawArgs) {
  const args = [...rawArgs];
  const errors = [];
  let userId = '';
  let email = '';

  if (args[0] === '--') {
    args.shift();
  }

  while (args.length > 0) {
    const arg = args.shift();

    if (arg === '--user-id') {
      const value = normalizeEnvValue(args.shift());

      if (!value) {
        errors.push('Missing value for `--user-id`.');
      } else {
        userId = value;
      }

      continue;
    }

    if (arg === '--email') {
      const value = normalizeEnvValue(args.shift());

      if (!value) {
        errors.push('Missing value for `--email`.');
      } else {
        email = value;
      }

      continue;
    }

    errors.push(
      `Unknown argument: ${arg}. Use \`--user-id <uuid>\` or \`--email <address>\`.`,
    );
  }

  return {
    userId,
    email,
    errors,
  };
}

function resolveFirstAdminBootstrapTarget(rawArgs, env = loadProjectEnv()) {
  const parsed = parseFirstAdminBootstrapArgs(rawArgs);
  const userId = normalizeEnvValue(
    parsed.userId || env.SUPABASE_FIRST_ADMIN_USER_ID,
  );
  const email = normalizeEnvValue(parsed.email || env.SUPABASE_FIRST_ADMIN_EMAIL);
  const missing = [...parsed.errors];

  if (userId && email) {
    missing.push(
      'Provide exactly one bootstrap target: `--user-id` or `--email` (or the matching `SUPABASE_FIRST_ADMIN_*` env fallback).',
    );
  }

  if (!userId && !email) {
    missing.push(
      'Provide a first-admin bootstrap target with `--user-id <uuid>` or `--email <address>`. You can also set `SUPABASE_FIRST_ADMIN_USER_ID` or `SUPABASE_FIRST_ADMIN_EMAIL` in `.env.local` or the shell.',
    );
  }

  if (userId && !uuidPattern.test(userId)) {
    missing.push('`--user-id` must be a valid UUID.');
  }

  if (email && !emailPattern.test(email)) {
    missing.push('`--email` must be a valid email address.');
  }

  if (missing.length > 0) {
    return {
      targetType: '',
      targetValue: '',
      missing,
    };
  }

  return {
    targetType: userId ? 'user-id' : 'email',
    targetValue: userId || email,
    missing,
  };
}

function getFirstAdminBootstrapPrerequisites(
  rawArgs,
  env = loadProjectEnv(),
) {
  const rollout = getMigrationPrerequisites(env);
  const target = resolveFirstAdminBootstrapTarget(rawArgs, env);

  return {
    ...rollout,
    ...target,
    missing: [...rollout.missing, ...target.missing],
  };
}

function quoteSqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildTargetWhereClause(targetType, targetValue) {
  return targetType === 'user-id'
    ? `users.id = ${quoteSqlLiteral(targetValue)}::uuid`
    : `lower(users.email) = lower(${quoteSqlLiteral(targetValue)})`;
}

function buildFirstAdminBootstrapSql(targetType, targetValue) {
  const targetWhereClause = buildTargetWhereClause(targetType, targetValue);

  return `-- Bootstrap the first persistent Rosty admin from an existing auth.users row.
begin;

do $$
declare
  v_now timestamptz := statement_timestamp();
  v_target_user_id uuid;
  v_active_admin_count integer;
begin
  perform pg_advisory_xact_lock(hashtext('rosty:first-admin-bootstrap')::bigint);

  select users.id
    into v_target_user_id
  from auth.users as users
  where ${targetWhereClause}
  limit 1;

  if v_target_user_id is null then
    raise exception 'First admin bootstrap target was not found in auth.users.'
      using errcode = 'P0001';
  end if;

  select count(*)
    into v_active_admin_count
  from public.profiles
  where role = 'admin'
    and status = 'active';

  if v_active_admin_count > 0
     and not exists (
       select 1
       from public.profiles
       where id = v_target_user_id
         and role = 'admin'
         and status = 'active'
     ) then
    raise exception 'An active admin already exists. This bootstrap path only supports the first persistent admin account.'
      using errcode = 'P0001';
  end if;

  insert into public.profiles as profiles (
    id,
    full_name,
    phone_number,
    gender,
    role,
    status,
    approved_at,
    approved_by,
    last_active_at,
    created_at,
    updated_at
  )
  select
    users.id,
    coalesce(
      nullif(btrim(existing_profiles.full_name), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'name'), ''),
      split_part(
        coalesce(users.email, concat('rosty-admin-', users.id::text)),
        '@',
        1
      )
    ),
    coalesce(existing_profiles.phone_number, ''),
    coalesce(existing_profiles.gender, 'unspecified'::public.profile_gender),
    'admin'::public.user_role,
    'active'::public.user_status,
    coalesce(existing_profiles.approved_at, v_now),
    coalesce(existing_profiles.approved_by, users.id),
    coalesce(existing_profiles.last_active_at, v_now),
    coalesce(existing_profiles.created_at, v_now),
    v_now
  from auth.users as users
  left join public.profiles as existing_profiles
    on existing_profiles.id = users.id
  where users.id = v_target_user_id
  on conflict (id) do update
    set full_name = case
          when nullif(btrim(profiles.full_name), '') is not null
            then profiles.full_name
          else excluded.full_name
        end,
        role = 'admin'::public.user_role,
        status = 'active'::public.user_status,
        approved_at = coalesce(profiles.approved_at, excluded.approved_at),
        approved_by = coalesce(profiles.approved_by, excluded.approved_by),
        last_active_at = coalesce(profiles.last_active_at, excluded.last_active_at),
        updated_at = excluded.updated_at;

  raise notice 'First admin bootstrap complete for user %', v_target_user_id;
end;
$$;

select
  profiles.id,
  users.email,
  profiles.full_name,
  profiles.role::text as role,
  profiles.status::text as status,
  profiles.approved_at
from public.profiles as profiles
join auth.users as users
  on users.id = profiles.id
where ${targetWhereClause};

commit;
`;
}

function main(argv = process.argv) {
  const args = argv.slice(2);
  const env = loadProjectEnv();
  const { projectId, accessToken, dbPassword, targetType, targetValue, missing } =
    getFirstAdminBootstrapPrerequisites(args, env);

  if (missing.length > 0) {
    console.error(
      'Supabase first-admin bootstrap prerequisites are missing or invalid:',
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

  const tempDir = mkdtempSync(
    path.join(os.tmpdir(), 'rosty-first-admin-bootstrap-'),
  );
  const sqlPath = path.join(tempDir, 'first-admin-bootstrap.sql');

  try {
    writeFileSync(
      sqlPath,
      buildFirstAdminBootstrapSql(targetType, targetValue),
      'utf8',
    );

    console.log(`Linking Supabase project ${projectId}...`);

    let status = runSupabase(
      ['link', '--project-ref', projectId, '--password', dbPassword],
      { extraEnv: cliEnv },
    );

    if (status !== 0) {
      return status;
    }

    console.log(
      `Bootstrapping the first persistent admin by ${targetType} ${targetValue}...`,
    );

    status = runSupabase(['db', 'query', '--linked', '-f', sqlPath], {
      extraEnv: cliEnv,
    });

    return status;
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

if (require.main === module) {
  process.exit(main());
}

module.exports = {
  buildFirstAdminBootstrapSql,
  buildTargetWhereClause,
  getFirstAdminBootstrapPrerequisites,
  parseFirstAdminBootstrapArgs,
  resolveFirstAdminBootstrapTarget,
};
