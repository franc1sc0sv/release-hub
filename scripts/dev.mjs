import { spawn } from 'node:child_process'
import { createConnection } from 'node:net'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envFile = resolve(rootDir, '.env')

if (existsSync(envFile)) {
  process.loadEnvFile(envFile)
}

const DEFAULT_API_PORT = 3001
const DEFAULT_WEB_PORT = 5173
const PORT_SCAN_LIMIT = 20
const PORT_PROBE_MS = 500
const READY_TIMEOUT_MS = 90_000
const READY_POLL_MS = 500

function isPortFree(port) {
  return new Promise((done) => {
    const probe = createConnection({ port, host: 'localhost' })
    const finish = (free) => {
      probe.destroy()
      done(free)
    }
    probe.setTimeout(PORT_PROBE_MS)
    probe.once('connect', () => finish(false))
    probe.once('timeout', () => finish(true))
    probe.once('error', () => finish(true))
  })
}

async function findFreePort(preferred) {
  for (let port = preferred; port < preferred + PORT_SCAN_LIMIT; port += 1) {
    if (await isPortFree(port)) return port
  }
  throw new Error(`No free port between ${preferred} and ${preferred + PORT_SCAN_LIMIT - 1}`)
}

const children = []
let shuttingDown = false

function stopAll(code) {
  if (shuttingDown) return
  shuttingDown = true
  process.exitCode = code
  for (const child of children) child.kill('SIGTERM')
}

function start(args, env) {
  const child = spawn('pnpm', args, {
    cwd: rootDir,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  })
  child.on('exit', (code) => stopAll(code ?? 0))
  children.push(child)
  return child
}

function buildPackages() {
  return new Promise((done, fail) => {
    const build = spawn(
      'pnpm',
      ['turbo', 'build', '--filter=@release-hub/shared', '--filter=@release-hub/db'],
      { cwd: rootDir, stdio: 'inherit' },
    )
    build.on('exit', (code) => (code === 0 ? done() : fail(new Error(`Package build failed (${code})`))))
  })
}

async function waitForDatabase(apiUrl) {
  const deadline = Date.now() + READY_TIMEOUT_MS
  while (Date.now() < deadline && !shuttingDown) {
    const ready = await fetch(`${apiUrl}/readyz`)
      .then((response) => response.ok)
      .catch(() => false)
    if (ready) {
      console.log(`\n  database  reachable — API ready on ${apiUrl}\n`)
      return
    }
    await new Promise((done) => setTimeout(done, READY_POLL_MS))
  }
  if (!shuttingDown) {
    console.log(`\n  database  NOT reachable — check DATABASE_URL (${apiUrl}/readyz)\n`)
  }
}

const preferredApiPort = Number(process.env.PORT ?? DEFAULT_API_PORT)
const preferredWebPort = Number(process.env.WEB_PORT ?? DEFAULT_WEB_PORT)
const apiPort = await findFreePort(preferredApiPort)
const webPort = await findFreePort(preferredWebPort)
const apiUrl = `http://localhost:${apiPort}`
const webUrl = `http://localhost:${webPort}`

await buildPackages()

console.log('\nRelease Hub dev')
console.log(`  web  ${webUrl}${webPort === preferredWebPort ? '' : ` (${preferredWebPort} was taken)`}`)
console.log(`  api  ${apiUrl}/graphql${apiPort === preferredApiPort ? '' : ` (${preferredApiPort} was taken)`}\n`)

start(['--filter', '@release-hub/api', 'dev'], {
  PORT: String(apiPort),
  CORS_ORIGIN: webUrl,
  WEB_APP_URL: webUrl,
})

start(['--filter', '@release-hub/web', 'dev'], {
  WEB_PORT: String(webPort),
  VITE_API_URL: `${apiUrl}/graphql`,
  VITE_WS_URL: `ws://localhost:${apiPort}/graphql`,
})

process.on('SIGINT', () => stopAll(0))
process.on('SIGTERM', () => stopAll(0))

await waitForDatabase(apiUrl)
