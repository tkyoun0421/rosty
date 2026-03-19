# Secrets Policy

## Immediate Action

The existing token stored in `.env` should be treated as compromised and rotated before any GitHub or MCP integration continues.

## Repository Rules

- Commit `.env.example`, never `.env`.
- Keep client-safe values limited to `EXPO_PUBLIC_*`.
- Store non-public keys in GitHub Actions secrets, EAS secrets, or Supabase-managed secret storage.
- Do not paste service-role keys into mobile client code.
- Treat `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` as rollout-only secrets. They must stay out of tracked files and out of Expo public env names.

## Local Development

- Keep `.env` only on developer machines.
- Reissue credentials if they are copied into screenshots, logs, issues, or chats.
- Prefer deriving `SUPABASE_PROJECT_ID` from `EXPO_PUBLIC_SUPABASE_URL`; if you set it explicitly, it can stay local but it is not treated as a secret.
- Use `pnpm supabase:migrations:dry-run` before `pnpm supabase:migrations:apply` so privileged rollout secrets are not used blindly.

## GitHub Actions

- The manual rollout workflow is `.github/workflows/supabase-migrations.yml`.
- Configure `SUPABASE_PROJECT_ID`, `SUPABASE_ACCESS_TOKEN`, and `SUPABASE_DB_PASSWORD` as repository or environment secrets before running it.
- Keep the workflow manual; do not convert real migration apply into an automatic push-triggered path without an explicit review gate.

## CI / CD

- GitHub Actions should read tokens from repository or environment secrets.
- EAS credentials should be managed through Expo secure channels, not checked into the repo.
- Any CI migration job should inject `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` through the runner secret store instead of committing them or echoing them in logs.
