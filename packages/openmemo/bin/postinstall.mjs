import { platform, arch } from "os";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const platformMap = {
  darwin: "darwin",
  linux: "linux",
  win32: "windows",
};

const archMap = {
  x64: "x64",
  arm64: "arm64",
};

const os = platformMap[platform()];
const cpu = archMap[arch()];

if (!os || !cpu) {
  console.warn(`[openmemo] Unsupported platform: ${platform()}-${arch()}`);
  process.exit(0);
}

const pkgName = `openmemo-${os}-${cpu}`;
const ext = os === "windows" ? ".exe" : "";

// Check global install path (sibling package)
const globalPath = join(__dirname, "..", "..", pkgName, `openmemo-${os}-${cpu}${ext}`);
// Check local install path
const localPath = join(__dirname, "..", "node_modules", pkgName, `openmemo-${os}-${cpu}${ext}`);

if (existsSync(globalPath) || existsSync(localPath)) {
  console.log(`[openmemo] Binary found for ${os}-${cpu}`);
} else {
  console.warn(`[openmemo] Binary not found for ${os}-${cpu}`);
  console.warn(`[openmemo] Searched paths:`);
  console.warn(`[openmemo]   - ${globalPath}`);
  console.warn(`[openmemo]   - ${localPath}`);
  console.warn(`[openmemo] This platform may not be supported yet.`);
}
