const path = require('node:path');

const {
  ensureSupabaseCli,
  getSupabaseBinaryPath,
} = require('./supabase-cli-utils.cjs');

const required = process.argv.includes('--required');

try {
  const binaryPath = ensureSupabaseCli({ required });

  if (binaryPath) {
    console.log(`Supabase CLI ready: ${path.relative(process.cwd(), binaryPath)}`);
    process.exit(0);
  }

  console.warn(
    'Supabase CLI is not ready yet. Run `pnpm supabase:install` before using migration commands.',
  );
  process.exit(0);
} catch (error) {
  const fallbackPath = getSupabaseBinaryPath();

  if (fallbackPath) {
    console.error(
      `Supabase CLI install failed for ${path.relative(process.cwd(), fallbackPath)}.`,
    );
  }

  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
