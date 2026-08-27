import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dshVersion = process.env.DSH_VERSION ?? '0.1.1-rc.2'
const dshPackage = `@deepseek-ai/dsh@${dshVersion}`
const port = Number(process.env.DSH_COMPAT_PORT ?? 3813)
const home = await mkdtemp(join(tmpdir(), 'dsh-composer-layout-compat-'))
const environment = {
  ...process.env,
  DSH_HOME: home,
  DSH_TELEMETRY_DISABLED: '1',
}

function dsh(args, options = {}) {
  return spawnSync('pnpm', ['dlx', dshPackage, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: environment,
    ...options,
  })
}

function commandOutput(result) {
  return `${result.stdout ?? ''}${result.stderr ?? ''}`
}

async function waitForServer(url, output) {
  const deadline = Date.now() + 45_000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`DSH Web did not start within 45 seconds.\n${output.join('')}`)
}

let server
try {
  const packed = spawnSync('pnpm', ['pack', '--pack-destination', home], {
    cwd: root,
    encoding: 'utf8',
    env: environment,
  })
  assert.equal(packed.status, 0, `Could not pack the plugin.\n${commandOutput(packed)}`)
  const tarball = (await readdir(home)).find(file => file.endsWith('.tgz'))
  assert.ok(tarball, 'pnpm pack did not create a plugin tarball')

  const installed = dsh(['plugin', '--profile', 'web', 'add', join(home, tarball)])
  assert.equal(installed.status, 0, `Could not install ${dshPackage}.\n${commandOutput(installed)}`)

  const config = dsh(['--profile', 'web', '--dump-config'])
  assert.equal(config.status, 0, `Could not read the DSH profile.\n${commandOutput(config)}`)
  assert.match(config.stdout, /id: ui-composer-layout/)
  assert.match(config.stdout, /name: dsh-composer-layout/)

  const output = []
  server = spawn('pnpm', ['dlx', dshPackage, '--profile', 'web', '--port', String(port), '--no-open'], {
    cwd: root,
    env: environment,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.stdout.on('data', chunk => output.push(chunk.toString()))
  server.stderr.on('data', chunk => output.push(chunk.toString()))
  const url = `http://127.0.0.1:${String(port)}`
  await waitForServer(url, output)

  const browser = await chromium.launch({ headless: true })
  try {
    async function inspectHero(defaultPlacement) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await context.newPage()
      const pageErrors = []
      page.on('pageerror', error => pageErrors.push(error.message))
      await page.addInitScript((placement) => {
        localStorage.setItem('dsh.composer-split.settings', JSON.stringify({
          defaultPlacement: placement,
          rememberPlacement: true,
          bottomHandleHoverOnly: false,
          defaultWidthPreset: 'medium',
        }))
      }, defaultPlacement)
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 })
      await page.locator('style[data-plugin="dsh-composer-layout"]').first().waitFor({ state: 'attached', timeout: 20_000 })
      await page.locator('[data-phase="hero"]').waitFor({ state: 'attached', timeout: 20_000 })
      assert.equal(await page.title(), 'DeepSeek Harness')
      assert.equal(pageErrors.length, 0, `Browser errors while loading the plugin:\n${pageErrors.join('\n')}`)
      const metrics = await page.locator('[data-input-scroll]').evaluate((element) => ({
        height: element.getBoundingClientRect().height,
        hasSideInputSizing: element.closest('[data-dsh-composer-side-max]') !== null,
        hasSplitPane: element.closest('[data-dsh-composer-split-pane]') !== null,
      }))
      await context.close()
      return metrics
    }

    const bottomHero = await inspectHero('bottom')
    const rightPreferredHero = await inspectHero('right')
    assert.equal(rightPreferredHero.hasSideInputSizing, false, 'Hero must not receive side-pane input sizing')
    assert.equal(rightPreferredHero.hasSplitPane, false, 'Hero must not install a split Composer pane')
    assert.ok(
      rightPreferredHero.height >= bottomHero.height * 0.95,
      `Hero Composer collapsed with a right preference (${rightPreferredHero.height}px vs ${bottomHero.height}px at bottom)`,
    )
  } finally {
    await browser.close()
  }

  console.log(`verified DSH ${dshVersion}: profile install, Web startup, and browser plugin load`)
} finally {
  if (server !== undefined && server.exitCode === null && !server.killed) {
    server.kill('SIGTERM')
    await once(server, 'exit')
  }
  await rm(home, { force: true, recursive: true })
}
