const { platform } = require('node:os');
const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

function printUsage(exitCode = 0) {
  console.log('Usage:');
  console.log('  node scripts/run-e2e.cjs <android|ios> [--build] [additional Detox args]');
  process.exit(exitCode);
}

const [, , targetPlatform, ...rawArgs] = process.argv;

if (!targetPlatform || targetPlatform === '--help' || targetPlatform === '-h') {
  printUsage(targetPlatform ? 0 : 1);
}

if (targetPlatform === 'ios' && platform() !== 'darwin') {
  console.error('iOS E2E requires macOS with Xcode. This command is not available on Windows.');
  process.exit(1);
}

const configurationByPlatform = {
  android: 'android.emu.debug',
  ios: 'ios.sim.debug',
};

const configuration = configurationByPlatform[targetPlatform];
if (!configuration) {
  console.error(`Unsupported E2E platform: ${targetPlatform}`);
  printUsage(1);
}

let shouldBuild = false;
const forwardedArgs = [];
let hasCustomConfiguration = false;

for (let i = 0; i < rawArgs.length; i += 1) {
  const arg = rawArgs[i];
  if (arg === '--build') {
    shouldBuild = true;
    continue;
  }

  if (arg === '--configuration') {
    hasCustomConfiguration = true;
    forwardedArgs.push(arg, rawArgs[i + 1]);
    i += 1;
    continue;
  }

  if (arg.startsWith('--configuration=')) {
    hasCustomConfiguration = true;
  }

  forwardedArgs.push(arg);
}

if (targetPlatform === 'android') {
  const gradlew = process.platform === 'win32' ? path.join('android', 'gradlew.bat') : path.join('android', 'gradlew');
  const androidAppBinary = path.join('android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  const androidTestBinary = path.join(
    'android',
    'app',
    'build',
    'outputs',
    'apk',
    'androidTest',
    'debug',
    'app-debug-androidTest.apk'
  );

  if (shouldBuild) {
    if (!existsSync(gradlew)) {
      console.error('Android native project is missing. Run `pnpm prebuild:android` first.');
      process.exit(1);
    }

    if (!process.env.JAVA_HOME) {
      console.error('JAVA_HOME is not set. Android Detox builds require a local JDK.');
      process.exit(1);
    }
  } else if (!existsSync(androidAppBinary) || !existsSync(androidTestBinary)) {
    console.error('Android Detox artifacts are missing. Run `pnpm test:e2e:android:build` first.');
    process.exit(1);
  }
}

if (targetPlatform === 'ios') {
  const hasWorkspace = existsSync(path.join('ios', 'Rosty.xcworkspace'));
  const hasProject = existsSync(path.join('ios', 'Rosty.xcodeproj'));

  if (!hasWorkspace && !hasProject) {
    console.error('iOS native project is missing. Run `pnpm prebuild:ios` on macOS first.');
    process.exit(1);
  }
}

const detoxArgs = [
  'exec',
  'detox',
  'test',
  ...(hasCustomConfiguration ? [] : ['--configuration', configuration]),
  ...(shouldBuild ? ['--build'] : []),
  ...forwardedArgs,
];

const result = spawnSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', detoxArgs, {
  stdio: 'inherit',
  shell: false,
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
