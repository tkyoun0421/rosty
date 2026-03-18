const { spawnSync } = require('node:child_process');
const { mkdirSync } = require('node:fs');
const { join } = require('node:path');

const localExpoHome = join(process.cwd(), '.tmp-home');
const expoCliEntrypoint = require.resolve('expo/bin/cli');

mkdirSync(localExpoHome, { recursive: true });

const result = spawnSync(process.execPath, [expoCliEntrypoint, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    EXPO_NO_TELEMETRY: '1',
    HOME: localExpoHome,
    USERPROFILE: localExpoHome,
  },
});

if (result.error) {
  console.error(result.error.message);
}

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
