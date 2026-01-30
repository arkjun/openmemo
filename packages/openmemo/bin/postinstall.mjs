import { platform, arch } from "os"
import { existsSync, createWriteStream, chmodSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { createRequire } from "module"
import https from "https"

// Skip during CI builds
if (process.env.CI) {
  console.log("[openmemo] Skipping binary download in CI environment")
  process.exit(0)
}

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = require("../package.json")

const REPO = "arkjun/openmemo"
const VERSION = pkg.version

const platformMap = { darwin: "darwin", linux: "linux", win32: "windows" }
const archMap = { x64: "x64", arm64: "arm64" }

const os = platformMap[platform()]
const cpu = archMap[arch()]

if (!os || !cpu) {
  console.warn(`[openmemo] Unsupported platform: ${platform()}-${arch()}`)
  process.exit(0)
}

const binaryName = `openmemo-${os}-${cpu}${os === "windows" ? ".exe" : ""}`
const binaryPath = join(__dirname, binaryName)

// Skip if already exists
if (existsSync(binaryPath)) {
  console.log(`[openmemo] Binary already exists`)
  process.exit(0)
}

const url = `https://github.com/${REPO}/releases/download/v${VERSION}/${binaryName}`

console.log(`[openmemo] Downloading binary for ${os}-${cpu}...`)

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const request = (url) => {
      https.get(url, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          request(res.headers.location)
          return
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed: ${res.statusCode}`))
          return
        }
        const file = createWriteStream(dest)
        res.pipe(file)
        file.on("finish", () => {
          file.close()
          chmodSync(dest, 0o755)
          resolve()
        })
      }).on("error", reject)
    }
    request(url)
  })
}

download(url, binaryPath)
  .then(() => console.log(`[openmemo] Binary installed successfully`))
  .catch((err) => {
    console.error(`[openmemo] Failed to download binary: ${err.message}`)
    console.error(`[openmemo] URL: ${url}`)
    process.exit(1)
  })
