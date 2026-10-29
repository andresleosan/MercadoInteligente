import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const firebaseCli = join(projectRoot, 'node_modules/firebase-tools/lib/bin/firebase.js')

// emulators:exec owns startup and cleanup, and refuses occupied emulator ports.
// The demo project ensures no test can fall back to a deployed Firebase project.
const result = spawnSync(process.execPath, [
  firebaseCli,
  'emulators:exec',
  '--project', 'demo-mercado-inteligente',
  '--only', 'auth,firestore',
  'pnpm exec playwright test',
], {
  cwd: projectRoot,
  env: process.env,
  stdio: 'inherit',
  windowsHide: true,
})

if (result.error) throw result.error
process.exitCode = result.status ?? 1
