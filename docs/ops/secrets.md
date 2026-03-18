# Secrets Policy

## Immediate Action

The existing token stored in `.env` should be treated as compromised and rotated before any GitHub or MCP integration continues.

## Repository Rules

- Commit `.env.example`, never `.env`.
- Keep client-safe values limited to `EXPO_PUBLIC_*`.
- Store non-public keys in GitHub Actions secrets, EAS secrets, or Supabase-managed secret storage.
- Do not paste service-role keys into mobile client code.

## Local Development

- Keep `.env` only on developer machines.
- Reissue credentials if they are copied into screenshots, logs, issues, or chats.

## CI / CD

- GitHub Actions should read tokens from repository or environment secrets.
- EAS credentials should be managed through Expo secure channels, not checked into the repo.
