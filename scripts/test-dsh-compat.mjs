import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { mkdir, mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dshVersion = process.env.DSH_VERSION ?? '0.1.1-rc.2'
const dshPackage = `@deepseek-ai/dsh@${dshVersion}`
const port = Number(process.env.DSH_COMPAT_PORT ?? 3813)
const home = await mkdtemp(join(tmpdir(), 'dsh-composer-layout-compat-'))
const artifactDirectory = process.env.DSH_COMPAT_ARTIFACT_DIR === undefined
  ? undefined
  : resolve(root, process.env.DSH_COMPAT_ARTIFACT_DIR)
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
    async function inspectHero(defaultPlacement, viewport) {
      const context = await browser.newContext({ viewport })
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
      const testingNotice = page.getByRole('button', { name: 'Continue', exact: true })
      await testingNotice.waitFor({ state: 'visible', timeout: 3_000 })
        .then(() => testingNotice.click())
        .catch(() => {})
      const configureLater = page.getByRole('button', { name: 'Configure later', exact: true })
      await configureLater.waitFor({ state: 'visible', timeout: 3_000 })
        .then(() => configureLater.click())
        .catch(() => {})
      await page.locator('style[data-plugin="dsh-composer-layout"]').first().waitFor({ state: 'attached', timeout: 20_000 })
      await page.locator('[data-phase="hero"]').waitFor({ state: 'attached', timeout: 20_000 })
      assert.equal(await page.title(), 'DeepSeek Harness')
      assert.equal(pageErrors.length, 0, `Browser errors while loading the plugin:\n${pageErrors.join('\n')}`)
      const metrics = await page.locator('[data-input-scroll]').evaluate((element) => {
        const rect = element.getBoundingClientRect()
        const card = element.closest('[data-composer-card]')?.getBoundingClientRect()
        return {
          height: rect.height,
          width: rect.width,
          right: rect.right,
          bottom: rect.bottom,
          cardHeight: card?.height ?? 0,
          cardWidth: card?.width ?? 0,
          hasSideInputSizing: element.closest('[data-dsh-composer-side-max]') !== null,
          hasSplitPane: element.closest('[data-dsh-composer-split-pane]') !== null,
          hasSplitAdapter: document.querySelector('[data-dsh-composer-split-active]') !== null,
          overflowsViewport: document.documentElement.scrollWidth > window.innerWidth + 1,
        }
      })
      if (artifactDirectory !== undefined) {
        await mkdir(artifactDirectory, { recursive: true })
        await page.screenshot({ path: join(artifactDirectory, `hero-${defaultPlacement}-${viewport.width}x${viewport.height}.png`) })
      }
      await context.close()
      return metrics
    }

    const desktop = { width: 1280, height: 800 }
    const narrow = { width: 720, height: 800 }
    const bottomHero = await inspectHero('bottom', desktop)
    const rightPreferredHero = await inspectHero('right', desktop)
    const narrowRightPreferredHero = await inspectHero('right', narrow)
    for (const [label, metrics, viewport] of [
      ['desktop bottom', bottomHero, desktop],
      ['desktop right preference', rightPreferredHero, desktop],
      ['narrow right preference', narrowRightPreferredHero, narrow],
    ]) {
      assert.equal(metrics.hasSideInputSizing, false, `${label}: Hero must not receive side-pane input sizing`)
      assert.equal(metrics.hasSplitPane, false, `${label}: Hero must not install a split Composer pane`)
      assert.equal(metrics.hasSplitAdapter, false, `${label}: Hero must not install the split adapter`)
      assert.equal(metrics.overflowsViewport, false, `${label}: Hero must not create horizontal page overflow`)
      // DSH's untouched Hero input is compact (about 52px today). Anything
      // below 48px is a real collapse while allowing harmless host styling
      // changes around the native control.
      assert.ok(metrics.height >= 48, `${label}: Composer scroll area is unexpectedly short (${metrics.height}px)`)
      assert.ok(metrics.width > 0 && metrics.width <= viewport.width, `${label}: Composer width is outside the viewport (${metrics.width}px)`)
      assert.ok(metrics.right <= viewport.width + 1, `${label}: Composer extends past the viewport (${metrics.right}px)`)
      assert.ok(metrics.bottom <= viewport.height + 1, `${label}: Composer extends below the viewport (${metrics.bottom}px)`)
      assert.ok(metrics.cardHeight >= metrics.height, `${label}: input scroll area escaped its Composer card`)
      assert.ok(metrics.cardWidth >= metrics.width, `${label}: input scroll area is wider than its Composer card`)
    }
    assert.ok(
      rightPreferredHero.height >= bottomHero.height * 0.95,
      `Hero Composer collapsed with a right preference (${rightPreferredHero.height}px vs ${bottomHero.height}px at bottom)`,
    )
  } finally {
    await browser.close()
  }

  console.log(`verified DSH ${dshVersion}: profile install, Web startup, and desktop/narrow Hero plugin geometry`)
} finally {
  if (server !== undefined && server.exitCode === null && !server.killed) {
    server.kill('SIGTERM')
    await once(server, 'exit')
  }
  await rm(home, { force: true, recursive: true })
}
