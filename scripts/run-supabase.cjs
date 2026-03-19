const { runSupabase } = require('./supabase-cli-utils.cjs');

try {
  const args = process.argv.slice(2);

  if (args[0] === '--') {
    args.shift();
  }

  const status = runSupabase(args);
  process.exit(status);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
