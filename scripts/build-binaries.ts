import { $ } from "bun";
import { mkdir } from "fs/promises";
import { join } from "path";

const allTargets = [
  { target: "bun-darwin-arm64", pkg: "openmemo-darwin-arm64", ext: "" },
  { target: "bun-linux-x64", pkg: "openmemo-linux-x64", ext: "" },
  { target: "bun-linux-arm64", pkg: "openmemo-linux-arm64", ext: "" },
  { target: "bun-windows-x64", pkg: "openmemo-windows-x64", ext: ".exe" },
];

// Parse command line arguments
const args = process.argv.slice(2);
const currentOnly = args.includes("--current") || args.includes("-c");
const continueOnError = args.includes("--continue") || args.includes("-k");

// Check for --target flag
const targetIndex = args.findIndex((arg) => arg === "--target" || arg === "-t");
const specifiedTarget = targetIndex !== -1 ? args[targetIndex + 1] : null;

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

// Determine which targets to build
let buildTargets = allTargets;

if (specifiedTarget) {
  // Build specific target(s) - can be comma-separated
  const requestedTargets = specifiedTarget.split(",").map((t) => t.trim());
  buildTargets = allTargets.filter((t) =>
    requestedTargets.some((rt) => t.target.includes(rt) || t.pkg.includes(rt))
  );
} else if (currentOnly) {
  buildTargets = allTargets.filter((t) => t.target === currentTarget);
}

if (buildTargets.length === 0) {
  console.error(`No matching target found.`);
  console.error(`Available targets: ${allTargets.map((t) => t.pkg).join(", ")}`);
  process.exit(1);
}

console.log("Building openmemo binaries...\n");
if (specifiedTarget) {
  console.log(`(Building specified target(s): ${buildTargets.map((t) => t.pkg).join(", ")})\n`);
} else if (currentOnly) {
  console.log(`(Building for current platform only: ${currentTarget})\n`);
}

let successCount = 0;
let failCount = 0;

for (const { target, pkg, ext } of buildTargets) {
  const outDir = join("packages", pkg);
  const shortTarget = pkg.replace("openmemo-", "");
  const outFile = join(outDir, `openmemo-${shortTarget}${ext}`);

  console.log(`Building ${target}...`);

  await mkdir(outDir, { recursive: true });

  try {
    await $`bun build --compile --target=${target} ./src/cli.ts --outfile ${outFile}`.quiet();
    console.log(`  ✓ Built: ${outFile}\n`);
    successCount++;
  } catch (error) {
    console.error(`  ✗ Failed to build ${target}`);
    if (error instanceof Error) {
      const stderr = (error as any).stderr;
      if (stderr) {
        const stderrStr = typeof stderr === "string" ? stderr : stderr.toString();
        const errorLine = stderrStr.split("\n").find((line: string) => line.includes("error:"));
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
