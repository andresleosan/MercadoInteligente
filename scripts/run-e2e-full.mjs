import { spawn } from 'node:child_process'
import net from 'node:net'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'

function start(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    ...options,
  })

  child.stdout.on('data', (chunk) => process.stdout.write(chunk))
  child.stderr.on('data', (chunk) => process.stderr.write(chunk))

  return child
}

function isPortOpen(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect(port, host)

    socket.once('connect', () => {
      socket.end()
      resolve(true)
    })

    socket.once('error', () => {
      socket.destroy()
      resolve(false)
    })
  })
}

function waitForPort(host, port, timeoutMs = 120000) {
  const deadline = Date.now() + timeoutMs

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect(port, host)

      socket.once('connect', () => {
        socket.end()
        resolve()
      })

      socket.once('error', () => {
        socket.destroy()
        if (Date.now() > deadline) {
          reject(new Error(`Timeout waiting for ${host}:${port}`))
          return
        }
        setTimeout(attempt, 1000)
      })
    }

    attempt()
  })
}

async function main() {
  const startedProcesses = []

    const emulatorReady = await isPortOpen('localhost', 9099)
  if (!emulatorReady) {
    const emulatorProcess = start(npmCommand, ['run', 'emulators', '--', '--only', 'auth,firestore'])
    startedProcesses.push(emulatorProcess)
  }

    const devReady = await isPortOpen('localhost', 5173)
  if (!devReady) {
    const devProcess = start(npmCommand, ['run', 'dev', '--', '--port', '5173', '--strictPort'], {
      env: { ...process.env, VITE_USE_FIREBASE_EMULATOR: 'true' },
    })
    startedProcesses.push(devProcess)
  }

  const cleanup = () => {
    startedProcesses.forEach((child) => child.kill())
  }

  process.on('SIGINT', () => {
    cleanup()
    process.exit(130)
  })

  process.on('SIGTERM', () => {
    cleanup()
    process.exit(143)
  })

  try {
    await Promise.all([
        waitForPort('localhost', 9099),
        waitForPort('localhost', 5173),
    ])

    const playwright = start(npxCommand, ['playwright', 'test'], {
      env: process.env,
    })

    const exitCode = await new Promise((resolve) => {
      playwright.on('exit', (code) => resolve(code ?? 1))
    })

    cleanup()
    process.exit(exitCode)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    cleanup()
    process.exit(1)
  }
}

main()