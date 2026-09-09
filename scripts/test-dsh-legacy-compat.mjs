import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, webkit } from 'playwright'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const matrix = JSON.parse(await readFile(join(root, 'scripts/dsh-compat-matrix.json'), 'utf8'))
const browserName = process.env.DSH_BROWSER ?? 'chromium'
const pair = matrix.include.find(row => row.channel === 'legacy' && row.browser === browserName)
assert.ok(pair, `No legacy pair configured for browser ${browserName}`)
assert.ok(process.env.DSH_VERSION === undefined || process.env.DSH_VERSION === pair.dsh, 'Legacy test must use its pinned DSH/plugin pair')
const port = Number(process.env.DSH_COMPAT_PORT ?? 3815)
const home = await mkdtemp(join(tmpdir(), 'dsh-composer-layout-legacy-'))
const environment = { ...process.env, DSH_HOME: home, DSH_TELEMETRY_DISABLED: '1' }
const artifactDirectory = process.env.DSH_COMPAT_ARTIFACT_DIR
const cli = ['--allow-build=fs-ext', 'dlx', `@deepseek-ai/dsh@${pair.dsh}`]
const evidence = { plugin: pair.plugin, dsh: pair.dsh, browser: browserName, source: 'npm', samples: [] }
function dsh(args) {
  return spawnSync('pnpm', [...cli, ...args], { cwd: root, encoding: 'utf8', env: environment })
}
function checked(result) {
  assert.equal(result.status, 0, `${result.stdout ?? ''}${result.stderr ?? ''}`)
  return result.stdout
}
let server
let browser
try {
  // 旧配对始终安装已发布 npm 包，当前工作树不会参与打包或安装。
  checked(dsh(['plugin', '--profile', 'web', 'add', `dsh-composer-layout@${pair.plugin}`]))
  const installed = JSON.parse(await readFile(join(home, 'profiles/web/node_modules/dsh-composer-layout/package.json'), 'utf8'))
  assert.equal(installed.version, pair.plugin)
  const config = checked(dsh(['--profile', 'web', '--dump-config']))
  assert.match(config, /id: ui-composer-layout/)
  assert.match(config, /name: dsh-composer-layout/)
  const output = []
  server = spawn('pnpm', [...cli, '--profile', 'web', '--port', String(port), '--no-open'], { cwd: root, env: environment, stdio: ['ignore', 'pipe', 'pipe'] })
  server.stdout.on('data', chunk => output.push(chunk.toString()))
  server.stderr.on('data', chunk => output.push(chunk.toString()))
  const url = `http://127.0.0.1:${port}`
  let ready = false
  for (const deadline = Date.now() + 45_000; Date.now() < deadline;) {
    try { if ((await fetch(url)).ok) { ready = true; break } } catch {}
    if (server.exitCode !== null) break
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  assert.ok(ready, `Legacy DSH failed to start: ${output.join('')}`)
  browser = await ({ chromium, webkit })[browserName].launch({ headless: true })
  if (artifactDirectory !== undefined) await mkdir(artifactDirectory, { recursive: true })
  for (const placement of ['bottom', 'right']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'en-US' })
    try {
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.addInitScript(defaultPlacement => {
        localStorage.setItem('dsh.composer-split.settings', JSON.stringify({ defaultPlacement, rememberPlacement: true, bottomHandleHoverOnly: false, defaultWidthPreset: 'medium' }))
      }, placement)
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 })
      for (const name of ['Continue', 'Configure later']) {
        const button = page.getByRole('button', { name, exact: true })
        await button.waitFor({ state: 'visible', timeout: 3_000 }).then(() => button.click()).catch(() => {})
      }
      await page.locator('style[data-plugin="dsh-composer-layout"]').first().waitFor({ state: 'attached', timeout: 20_000 })
      await page.locator('[data-phase="hero"]').waitFor({ state: 'attached', timeout: 20_000 })
      const input = page.locator('[data-phase="hero"] textarea')
      assert.ok(await input.isVisible(), 'Legacy Hero must render its native textarea')
      assert.equal(await input.inputValue(), '', 'Fresh legacy Hero must not acquire a draft')
      const metrics = await page.locator('[data-input-scroll]').evaluate(el => ({ height: el.getBoundingClientRect().height, split: el.closest('[data-dsh-composer-split-pane]') !== null, sideSizing: el.closest('[data-dsh-composer-side-max]') !== null }))
      assert.ok(metrics.height > 0, 'Legacy Hero input must have visible height')
      assert.equal(metrics.split, false, 'Legacy Hero must retain native layout')
      assert.equal(metrics.sideSizing, false, 'Legacy Hero must not receive split input sizing')
      assert.deepEqual(errors, [], 'Legacy browser must load without page errors')
      evidence.samples.push({ placement, ...metrics, nativeTextareaVisible: true })
      if (artifactDirectory !== undefined) await page.screenshot({ path: join(artifactDirectory, `legacy-hero-${placement}.png`) })
    } finally { await context.close() }
  }
  assert.ok(evidence.samples[1].height >= evidence.samples[0].height * 0.95, 'Remembered Right must not collapse legacy Hero')
  console.log(`verified published dsh-composer-layout@${pair.plugin} + DSH ${pair.dsh} (${browserName}): isolated npm installation, browser loading, native Hero textarea and remembered-Right geometry; active-session editing is outside this historical baseline`)
} finally {
  if (artifactDirectory !== undefined) {
    await mkdir(artifactDirectory, { recursive: true })
    await writeFile(join(artifactDirectory, 'legacy-evidence.json'), JSON.stringify(evidence, null, 2) + '\n')
  }
  if (browser !== undefined) await browser.close()
  if (server !== undefined && server.exitCode === null && !server.killed) { server.kill('SIGTERM'); await once(server, 'exit') }
  await rm(home, { force: true, recursive: true })
}
