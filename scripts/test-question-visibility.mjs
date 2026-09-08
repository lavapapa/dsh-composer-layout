import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { zstdCompressSync } from 'node:zlib'
import { chromium } from 'playwright'

// 使用真实 DSH 和问题组件，只在客户端入口注入可控请求；不调用模型，不伪造网络断线。
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const home = await mkdtemp(join(tmpdir(), 'dsh-question-visibility-'))
const dshPackage = '@deepseek-ai/dsh@0.1.2-rc.1'
const env = { ...process.env, DSH_HOME: home, DSH_TELEMETRY_DISABLED: '1' }
const id = 'question-visibility-session'
const artifacts = process.env.QUESTION_ARTIFACT_DIR ?? '/tmp/dsh-question-visibility-results'
const run = args => spawnSync('pnpm', args, { cwd: root, env, encoding: 'utf8' })
let server, browser
try {
  await mkdir(artifacts, { recursive: true })
  const pack = run(['pack', '--pack-destination', home])
  assert.equal(pack.status, 0, pack.stderr)
  const tarball = (await readdir(home)).find(name => name.endsWith('.tgz'))
  const install = run(['dlx', dshPackage, 'plugin', '--profile', 'web', 'add', join(home, tarball)])
  assert.equal(install.status, 0, install.stderr)
  const cwd = join(home, 'workspace')
  await mkdir(cwd)
  const project = `--${cwd.replace(/^\/+|\/+$/g, '').replaceAll('/', '-')}--`
  const directory = join(home, 'sessions', project, id)
  await mkdir(directory, { recursive: true })
  const events = [
    ['turn/start', { turn: 1 }], ['step/start', { turn: 1, step: 1 }],
    ['user/message', { id: 'test-user', role: 'user', content: [{ type: 'text', text: 'Question visibility experiment' }], source: { kind: 'user' } }],
    ['assistant/message', { turn: 1, step: 1, message: { id: 'test-assistant', role: 'assistant', content: [{ type: 'text', text: 'An existing answer.\n\n'.repeat(50) }], source: { kind: 'model', provider: 'test', model: 'test' } } }],
    ['step/end', { turn: 1, step: 1 }], ['turn/end', { turn: 1, reason: { kind: 'completed' } }],
  ]
  await writeFile(join(directory, 'session.jsonl.zstd'), Buffer.concat([
    { type: 'session', version: 0, id, createdAt: Date.now(), delegationDepth: 0, cwd },
    ...events.map(([type, data], seq) => ({ type, seq, time: Date.now(), data, ...(type.endsWith('/message') ? { surfaceOp: 'append' } : {}) })),
  ].map(row => zstdCompressSync(Buffer.from(JSON.stringify(row) + '\n')))))
  const output = []
  server = spawn('pnpm', ['dlx', dshPackage, '--profile', 'web', '--port', '3814', '--no-open'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] })
  server.stdout.on('data', b => output.push(b.toString()))
  server.stderr.on('data', b => output.push(b.toString()))
  let url
  const deadline = Date.now() + 45000
  while (!url && Date.now() < deadline) {
    url = output.join('').match(/dsh web:\s+(https?:\/\/\S+)/)?.[1]
    if (!url) await new Promise(r => setTimeout(r, 250))
  }
  assert.ok(url, 'Isolated host did not start')
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1920, height: 900 } })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.addInitScript(() => localStorage.setItem('dsh.composer-split.settings', JSON.stringify({ defaultPlacement: 'right', rememberPlacement: true, bottomHandleHoverOnly: false, defaultWidthPreset: 'medium' })))
  await page.route('**/plugins/**', async route => {
    const target = route.request().url()
    if (!target.includes('dsh-composer-layout/client.js') && !target.includes('dsh-client-ui-user-questions/client.js')) return route.continue()
    const response = await route.fetch()
    let body = await response.text()
    if (target.includes('dsh-composer-layout/client.js')) body = body.replace('function apply(ctx) {\n  const settingsService', 'function apply(ctx) {\n  document.documentElement.__composerTestContext = ctx;\n  const settingsService')
    if (target.includes('dsh-client-ui-user-questions/client.js')) body = body.replace('ctx.remote.$on("user-questions/request", function(request, next) {', `document.documentElement.__questionTest = {
      ctx,
      dispatch(id, request) { return answerQuestion(ctx, ctx.sessions.scope(id), request, () => Promise.resolve('delegated'), registerPendingInteraction) }
    };
    ctx.remote.$on("user-questions/request", function(request, next) {`)
    await route.fulfill({ response, body })
  })
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  for (const name of ['Continue', 'Configure later']) await page.getByRole('button', { name, exact: true }).waitFor({ timeout: 3000 }).then(() => page.getByRole('button', { name, exact: true }).click()).catch(() => {})
  await page.waitForFunction(() => document.documentElement.__questionTest && document.documentElement.__composerTestContext)
  await page.evaluate(async id => document.documentElement.__composerTestContext.sessions.open(id), id)
  await page.locator('[data-dsh-composer-split-active]').waitFor({ state: 'attached' })
  await page.locator('[data-composer-input]').fill('Long unsent draft line.\n'.repeat(100))
  await page.evaluate(() => { const p = document.querySelector('[data-dsh-composer-split-pane]'); p.scrollTop = p.scrollHeight; const i = p.querySelector('[data-input-scroll]'); i.scrollTop = i.scrollHeight })
  await page.evaluate(id => {
    const d = document.documentElement
    d.__questionAbort = new AbortController()
    d.__questionOutcome = 'pending'
    d.__questionTest.dispatch(id, { signal: d.__questionAbort.signal, questions: [{ id: 'question-one', question: 'VISIBLE QUESTION TEST', detail: 'A long explanatory detail paragraph.\n\n'.repeat(20), options: [{ label: 'Option A' }, { label: 'Option B' }, { label: 'Option C' }, { label: 'Option D' }] }] }).then(value => { d.__questionOutcome = value }, error => { d.__questionOutcome = String(error) })
  }, id)
  await page.locator('[data-question-key]').waitFor({ state: 'attached' })
  const samples = []
  async function sample(label) {
    const value = await page.evaluate(({ label, id }) => {
      const root = document.documentElement
      const question = document.querySelector('[data-question-key]')
      const overlay = document.querySelector('[data-conversation-composer-overlay]')
      const card = document.querySelector('[data-composer-card]')
      const rect = element => element?.getBoundingClientRect().toJSON()
      const q = question?.getBoundingClientRect()
      const x = q ? Math.max(0, Math.min(innerWidth - 1, q.x + q.width / 2)) : 0
      const y = q ? Math.max(0, Math.min(innerHeight - 1, q.y + Math.min(q.height / 2, 60))) : 0
      const hit = document.elementFromPoint(x, y)
      const ancestors = []
      for (let e = question; e && ancestors.length < 7; e = e.parentElement) {
        const s = getComputedStyle(e)
        ancestors.push({ tag: e.tagName, attrs: Array.from(e.attributes).map(a => [a.name, a.value]), rect: rect(e), display: s.display, position: s.position, overflow: s.overflow, flex: s.flex, zIndex: s.zIndex })
      }
      return { label, pending: root.__questionTest.ctx.uiSession.pendingInteractions.getSnapshot().get(id)?.key ?? null, question: rect(question), overlay: rect(overlay), card: rect(card), questionOwnsHit: !!question && !!hit && question.contains(hit), hit: hit?.outerHTML.slice(0, 500), ancestors }
    }, { label, id })
    samples.push(value)
    console.log(JSON.stringify({ ...value, ancestors: undefined }))
    await page.screenshot({ path: join(artifacts, label + '.png') })
  }
  await sample('initial-right')
  await page.waitForTimeout(1000)
  await sample('settled-right')
  for (const [width, height] of [[1400, 900], [1920, 400], [600, 700], [1000, 1100], [1920, 900]]) {
    await page.setViewportSize({ width, height })
    await page.waitForTimeout(300)
    await sample(`resize-${width}-${height}`)
  }
  await page.evaluate(() => { document.querySelector('[data-composer-input]')?.focus(); window.dispatchEvent(new Event('resize')) })
  await page.waitForTimeout(300)
  await sample('focus-native-input')
  await page.evaluate(() => { const p = document.querySelector('[data-dsh-composer-split-pane]'); p.scrollTop = p.scrollHeight })
  await sample('pane-scroll-end')
  for (const placement of ['bottom', 'right']) {
    await page.getByRole('button', { name: 'Settings', exact: true }).click()
    await page.getByRole('button', { name: 'Plugins', exact: true }).click()
    await page.getByText('Composer Layout', { exact: true }).click()
    await page.locator('section[aria-label="Composer Layout"]').getByRole('combobox').first().selectOption(placement)
    await page.getByRole('button', { name: 'Close', exact: true }).click()
    await page.waitForTimeout(200)
    await sample(`settings-${placement}`)
  }
  await page.getByRole('button', { name: /Collapse the question card|收起问题卡片/ }).click()
  await sample('deliberately-minimized')
  for (let i = 0; i < 5; i++) {
    await page.evaluate(({ id, i }) => {
      const d = document.documentElement
      d.__questionAbort.abort()
      d.__questionAbort = new AbortController()
      d.__questionTest.dispatch(id, { signal: d.__questionAbort.signal, questions: [{ id: 'question-one', question: `REPEATED QUESTION ${i}`, options: [{ label: 'First choice' }, { label: 'Second choice' }] }] }).catch(() => {})
    }, { id, i })
    await page.waitForTimeout(100)
    await sample(`repeated-${i}`)
  }
  await writeFile(join(artifacts, 'samples.json'), JSON.stringify({ errors, samples }, null, 2))
  for (const sample of samples) {
    assert.ok(sample.pending, `${sample.label}: pending question unexpectedly cleared`)
    assert.ok(sample.question?.width > 0 && sample.question?.height > 0, `${sample.label}: question geometry collapsed`)
    assert.equal(sample.questionOwnsHit, true, `${sample.label}: question covered or outside viewport`)
    assert.equal(sample.card.width, 0, `${sample.label}: fallback Composer unexpectedly visible`)
  }
  assert.equal(errors.length, 0, errors.join('\n'))
  console.log('Artifacts: ' + artifacts)
  await page.evaluate(() => document.documentElement.__questionAbort.abort())
} finally {
  await browser?.close()
  if (server && server.exitCode === null && !server.killed) { server.kill('SIGTERM'); await once(server, 'exit') }
  await rm(home, { recursive: true, force: true })
}
