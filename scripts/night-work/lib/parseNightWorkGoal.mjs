export function parseNightWorkGoal(argv) {
  const normalizedArguments = argv[0] === "--" ? argv.slice(1) : argv;

  return normalizedArguments.join(" ").trim();
}
