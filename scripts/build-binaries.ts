import { $ } from "bun";
import { mkdir } from "fs/promises";
import { join } from "path";

const targets = [
  { target: "bun-darwin-arm64", pkg: "openmemo-darwin-arm64", ext: "" },
  { target: "bun-darwin-x64", pkg: "openmemo-darwin-x64", ext: "" },
  { target: "bun-linux-x64", pkg: "openmemo-linux-x64", ext: "" },
  { target: "bun-linux-arm64", pkg: "openmemo-linux-arm64", ext: "" },
  { target: "bun-windows-x64", pkg: "openmemo-windows-x64", ext: ".exe" },
];

// Parse command line arguments
const args = process.argv.slice(2);
const currentOnly = args.includes("--current") || args.includes("-c");
const continueOnError = args.includes("--continue") || args.includes("-k");

// Get current platform target
const platformMap: Record<string, string> = {
  darwin: "darwin",
  linux: "linux",
  win32: "windows",
};
const archMap: Record<string, string> = {
  arm64: "arm64",
  x64: "x64",
};
const currentPlatform = platformMap[process.platform] || process.platform;
const currentArch = archMap[process.arch] || process.arch;
const currentTarget = `bun-${currentPlatform}-${currentArch}`;

// Filter targets if --current flag is set
const buildTargets = currentOnly
  ? targets.filter((t) => t.target === currentTarget)
  : targets;

if (buildTargets.length === 0) {
  console.error(`No matching target found for current platform: ${currentTarget}`);
  process.exit(1);
}

console.log("Building openmemo binaries...\n");
if (currentOnly) {
  console.log(`(Building for current platform only: ${currentTarget})\n`);
}

let successCount = 0;
let failCount = 0;

for (const { target, pkg, ext } of buildTargets) {
  const outDir = join("packages", pkg);
  const outFile = join(outDir, `openmemo${ext}`);

  console.log(`Building ${target}...`);

  await mkdir(outDir, { recursive: true });

  try {
    await $`bun build --compile --target=${target} ./src/cli.ts --outfile ${outFile}`.quiet();
    console.log(`  ✓ Built: ${outFile}\n`);
    successCount++;
  } catch (error) {
    console.error(`  ✗ Failed to build ${target}`);
    if (error instanceof Error) {
      // Extract just the error message, not the full stack trace
      const stderr = (error as any).stderr;
      if (stderr) {
        const errorLine = stderr.split("\n").find((line: string) => line.includes("error:"));
        if (errorLine) {
          console.error(`    ${errorLine.trim()}\n`);
        }
      }
    }
    failCount++;
    if (!continueOnError) {
      process.exit(1);
    }
  }
}

console.log(`\nBuild complete: ${successCount} succeeded, ${failCount} failed`);

if (failCount > 0 && !continueOnError) {
  process.exit(1);
}
