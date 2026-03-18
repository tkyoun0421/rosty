const { spawnSync } = require('node:child_process');

const platforms = ['android', 'ios'];

for (const platform of platforms) {
  const result = spawnSync(
    process.execPath,
    ['scripts/run-expo.cjs', 'export', '--platform', platform, '--output-dir', `dist/${platform}`],
    {
      stdio: 'inherit',
      shell: false,
    }
  );

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status);
  }

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
}
