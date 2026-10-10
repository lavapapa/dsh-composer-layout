import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, webkit } from 'playwright'
import { zstdCompressSync } from 'node:zlib'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dshVersion = process.env.DSH_VERSION ?? '0.2.0-rc.2'
const dshPackage = `@deepseek-ai/dsh@${dshVersion}`
const browserName = process.env.DSH_BROWSER ?? 'chromium'
assert.ok(['chromium', 'webkit'].includes(browserName), 'DSH_BROWSER must be chromium or webkit')
const port = Number(process.env.DSH_COMPAT_PORT ?? 3813)
const sessionSwitchOnly = process.env.DSH_COMPAT_SESSION_SWITCH_ONLY === '1'
const withoutComposer = process.env.DSH_COMPAT_WITHOUT_COMPOSER === '1'
assert.ok(!withoutComposer || sessionSwitchOnly, 'The no-Composer control runs only the focused session-switch regression')
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
  return spawnSync('pnpm', ['--allow-build=fs-ext', 'dlx', dshPackage, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: environment,
    ...options,
  })
}

function commandOutput(result) {
  return `${result.stdout ?? ''}${result.stderr ?? ''}`
}

async function waitForServer(output) {
  const deadline = Date.now() + 45_000
  while (Date.now() < deadline) {
    const match = output.join('').match(/dsh web:\s+(https?:\/\/\S+)/)
    if (match !== null) return match[1]
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`DSH Web did not announce an access URL within 45 seconds.\n${output.join('')}`)
}

let server
try {
  if (!withoutComposer) {
    let tarball = process.env.DSH_COMPAT_PLUGIN_VERSION === undefined ? process.env.DSH_COMPAT_PLUGIN_TARBALL : `dsh-composer-layout@${process.env.DSH_COMPAT_PLUGIN_VERSION}`
    if (tarball === undefined) {
      const packed = spawnSync('pnpm', ['pack', '--pack-destination', home], {
        cwd: root,
        encoding: 'utf8',
        env: environment,
      })
      assert.equal(packed.status, 0, `Could not pack the plugin.\n${commandOutput(packed)}`)
      const archive = (await readdir(home)).find(file => file.endsWith('.tgz'))
      assert.ok(archive, 'pnpm pack did not create a plugin tarball')
      tarball = join(home, archive)
    } else if (process.env.DSH_COMPAT_PLUGIN_VERSION === undefined) tarball = resolve(root, tarball)
    console.log(`installing ${tarball} for DSH ${dshVersion}/${browserName}`)
    const installed = dsh(['plugin', '--profile', 'web', 'add', tarball])
    assert.equal(installed.status, 0, `Could not install the Composer plugin.\n${commandOutput(installed)}`)
  }

  const config = dsh(['--profile', 'web', '--dump-config'])
  assert.equal(config.status, 0, `Could not read the DSH profile.\n${commandOutput(config)}`)
  if (withoutComposer) assert.doesNotMatch(config.stdout, /id: ui-composer-layout/)
  else {
    assert.match(config.stdout, /id: ui-composer-layout/)
    assert.match(config.stdout, /name: dsh-composer-layout/)
  }

  const testSessionId = 'composer-layout-compat-session'
  const testWorkspace = join(home, 'workspace')
  await mkdir(testWorkspace)
  await writeFile(join(testWorkspace, 'README.md'), '# Composer Layout test\n')
  const projectKey = `--${testWorkspace.replace(/^\/+|\/+$/g, '').replaceAll('/', '-')}--`
  const sessionDirectory = join(home, 'sessions', projectKey, testSessionId)
  await mkdir(sessionDirectory, { recursive: true })
  const now = Date.now()
  const events = [
    ['turn/start', { turn: 1 }],
    ['step/start', { turn: 1, step: 1 }],
    ['user/message', { id: 'compat-user', role: 'user', content: [{ type: 'text', text: 'Composer layout compatibility test' }], source: { kind: 'user' } }],
    ['assistant/message', { turn: 1, step: 1, message: { id: 'compat-answer', role: 'assistant', content: [{ type: 'text', text: Array.from({ length: 100 }, (_, index) => `Paragraph ${index + 1}: a long answer for independent scrolling verification.`).join('\n\n') }], source: { kind: 'model', provider: 'test', model: 'test' } } }],
    ['step/end', { turn: 1, step: 1 }],
    ['turn/end', { turn: 1, reason: { kind: 'completed' } }],
    ['session/title', { title: 'Composer compatibility test', messageSeqs: [], source: { kind: 'user' } }],
  ]
  await writeFile(join(sessionDirectory, 'session.jsonl.zstd'), Buffer.concat([
    { type: 'session', version: 0, id: testSessionId, createdAt: now, delegationDepth: 0, cwd: testWorkspace },
    ...events.map(([type, data], seq) => ({ type, seq, time: now + seq, data, ...type.endsWith('/message') ? { surfaceOp: 'append' } : {} })),
  ].map(row => zstdCompressSync(Buffer.from(JSON.stringify(row) + '\n')))))

  const secondSessionId = 'composer-layout-compat-session-b'
  {
    const directory = join(home, 'sessions', projectKey, secondSessionId)
    await mkdir(directory, { recursive: true })
    const secondEvents = []
    for (let turn = 1; turn <= 40; turn++) secondEvents.push(
      ['turn/start', { turn }],
      ['step/start', { turn, step: 1 }],
      ['user/message', { id: `compat-b-user-${turn}`, role: 'user', content: [{ type: 'text', text: `Session B request ${turn}` }], source: { kind: 'user' } }],
      ['assistant/message', { turn, step: 1, message: { id: `compat-b-answer-${turn}`, role: 'assistant', content: [{ type: 'text', text: Array.from({ length: 6 }, (_, index) => `Session B turn ${turn} paragraph ${index + 1}: completed history for semantic reader-position verification.`).join('\n\n') }], source: { kind: 'model', provider: 'test', model: 'test' } } }],
      ['step/end', { turn, step: 1 }],
      ['turn/end', { turn, reason: { kind: 'completed' } }],
    )
    await writeFile(join(directory, 'session.jsonl.zstd'), Buffer.concat([
      { type: 'session', version: 0, id: secondSessionId, createdAt: now + 1, delegationDepth: 0, cwd: testWorkspace },
      ...secondEvents.map(([type, data], seq) => ({ type, seq, time: now + seq, data, ...type.endsWith('/message') ? { surfaceOp: 'append' } : {} })),
    ].map(row => zstdCompressSync(Buffer.from(JSON.stringify(row) + '\n')))))
  }

  const output = []
  server = spawn('pnpm', ['--allow-build=fs-ext', 'dlx', dshPackage, '--profile', 'web', '--port', String(port), '--no-open'], {
    cwd: root,
    env: environment,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.stdout.on('data', chunk => output.push(chunk.toString()))
  server.stderr.on('data', chunk => output.push(chunk.toString()))
  const url = await waitForServer(output)

  const browser = await ({ chromium, webkit })[browserName].launch({ headless: true })
  try {
    async function inspectSessionSwitch(placement) {
      const context = await browser.newContext({ viewport: { width: 1920, height: 900 }, locale: 'en-US' })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
      await page.addInitScript(({ placement, ids }) => {
        localStorage.setItem('dsh.composer-split.settings', JSON.stringify({ defaultPlacement: placement, defaultWidth: 'medium', rememberPlacement: true, bottomHandleHoverOnly: false }))
        localStorage.setItem('dsh.composer-split.session-layouts', JSON.stringify(Object.fromEntries(ids.map(id => [id, { placement }]))))
      }, { placement, ids: [testSessionId, secondSessionId] })
      // 读取官方锚点与 Context；保存与恢复由原生 Chat 处理。
      await page.route('**/plugins/**', async route => {
        if (!route.request().url().includes('dsh-client-ui-chat/client.js')) return route.continue()
        const response = await route.fetch()
        const body = (await response.text())
          .replace('const chatStore = createChatStore();', 'const chatStore = createChatStore(); document.documentElement.__composerTestContext = ctx;')
          .replace('const chatScrollPositions = /* @__PURE__ */ new Map();', 'const chatScrollPositions = /* @__PURE__ */ new Map(); document.documentElement.__composerNativePositions = chatScrollPositions;')
        await route.fulfill({ response, body })
      })
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 })
      for (const name of ['Continue', 'Configure later']) await page.getByRole('button', { name, exact: true }).waitFor({ state: 'visible', timeout: 3_000 }).then(() => page.getByRole('button', { name, exact: true }).click()).catch(() => {})
      await page.waitForFunction(() => document.documentElement.__composerNativePositions instanceof Map)
      const snapshot = () => page.evaluate(() => {
        const root = document.querySelector('[data-conversation-session]')
        const id = root.dataset.conversationSession
        const body = root.querySelector('[data-conversation-scroll]')
        const flow = root.querySelector('[data-chat-flow]')
        let scroller = flow.parentElement
        while (scroller && !(/auto|scroll/.test(getComputedStyle(scroller).overflowY) && scroller.scrollHeight > scroller.clientHeight + 2)) scroller = scroller.parentElement
        if (!scroller) throw new Error('The displayed Chat has no scrollport')
        const viewport = scroller.getBoundingClientRect()
        const bottom = Math.min(viewport.bottom, scroller.querySelector('[data-composer-seat]')?.getBoundingClientRect().top ?? viewport.bottom)
        const paragraph = [...flow.querySelectorAll('p')].find(p => /^(Paragraph \d+:|Session B turn \d+ paragraph \d+:)/.test(p.textContent) && p.getBoundingClientRect().bottom > viewport.top + 8 && p.getBoundingClientRect().top < bottom - 8)
        const anchor = paragraph?.closest('[data-chat-anchor-key]')
        const session = document.documentElement.__composerTestContext.sessions.binding(id).session
        const entries = session.eventSource.getSnapshot().entries
        const state = session.getSnapshot()
        const identities = document.documentElement.__composerNativeIdentity ??= { nodes: new WeakMap(), next: 1 }
        const identity = node => {
          if (!node) return null
          if (!identities.nodes.has(node)) identities.nodes.set(node, identities.next++)
          return identities.nodes.get(node)
        }
        const views = body.querySelector(':scope > [data-slot="conversation.session"]')?.firstElementChild
        const action = root.querySelector('[data-dsh-composer-split-adapter]')
        const layout = { dock: action?.dataset.dshComposerSplitMode ?? 'native', bodyId: identity(body), viewId: identity(views), actionId: identity(action), marker: views?.hasAttribute('data-dsh-composer-split-chat') ?? false, body: body.getBoundingClientRect().toJSON(), view: views?.getBoundingClientRect().toJSON(), frame: root.querySelector('[data-dsh-composer-split-frame]')?.getBoundingClientRect().toJSON() }
        return { id, layout, side: !!root.closest('[data-dsh-composer-split-active]'), viewport: viewport.toJSON(), nativeOwner: { actual: body === scroller, top: body.scrollTop, height: body.clientHeight, content: body.scrollHeight }, top: scroller.scrollTop, tail: scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop, height: scroller.clientHeight, content: scroller.scrollHeight, visible: paragraph?.textContent, visibleTop: paragraph ? paragraph.getBoundingClientRect().top - viewport.top : null, anchorKey: anchor?.dataset.chatAnchorKey, anchorTop: anchor ? anchor.getBoundingClientRect().top - viewport.top : null, saved: document.documentElement.__composerNativePositions.get(id) ?? null, following: !!root.querySelector('[data-chat-following-tail]'), window: { firstSeq: entries[0]?.event.seq, lastSeq: entries.at(-1)?.event.seq, count: entries.length, hasMore: state.hasMore, loadingOlder: state.loadingOlder, openState: state.openState } }
      })
      const open = async id => {
        await page.locator(`[data-row-key="session:${id}"]`).click()
        await page.waitForFunction(id => {
          const root = document.querySelector(`[data-conversation-session="${id}"]`)
          return !!root?.querySelector('[data-chat-flow] p') && document.documentElement.__composerTestContext.sessions.binding(id)?.session.getSnapshot().openState === 'open'
        }, id)
        if (!withoutComposer) await page.locator('[data-dsh-composer-split-active]').waitFor({ state: placement === 'right' ? 'attached' : 'detached' })
        await page.waitForTimeout(750)
        const current = await snapshot()
        assert.equal(current.id, id)
        assert.equal(current.side, !withoutComposer && placement === 'right', 'Both sessions must use the requested layout')
        return current
      }
      const read = async (id, delta) => {
        await open(id)
        const box = await page.locator('[data-chat-flow]').boundingBox()
        const viewport = (await snapshot()).viewport
        await page.mouse.move(box.x + Math.min(box.width / 2, 300), viewport.y + viewport.height / 2)
        await page.mouse.wheel(0, 100_000)
        await page.waitForTimeout(750)
        await page.mouse.wheel(0, -delta)
        await page.waitForTimeout(750)
        const current = await snapshot()
        assert.ok(current.visible && current.top > 200 && current.tail > 500, `Reader must settle at a semantic history position: ${JSON.stringify(current)}`)
        return current
      }
      const expected = new Map()
      expected.set(testSessionId, await read(testSessionId, 1100))
      expected.set(secondSessionId, await read(secondSessionId, 1900))
      if (sessionSwitchOnly) console.log(`session-switch ${withoutComposer ? 'native' : 'Composer'}/${placement} initial: ${JSON.stringify([...expected.values()])}`)
      const failures = []
      for (let cycle = 1; cycle <= 3; cycle++) for (const id of [testSessionId, secondSessionId]) {
        const actual = await open(id)
        const before = expected.get(id)
        const preserved = actual.visible === before.visible && actual.anchorKey === before.anchorKey && Math.abs(actual.visibleTop - before.visibleTop) <= 3 && actual.saved !== null && before.saved !== null && actual.saved.anchorKey === before.saved.anchorKey && Math.abs(actual.saved.anchorTop - before.saved.anchorTop) <= 3
        if (sessionSwitchOnly || !preserved) console.log(`session-switch ${placement} cycle ${cycle} ${id}: ${JSON.stringify({ preserved, before, actual })}`)
        if (!preserved) failures.push({ placement, cycle, id, before, actual })
      }
      for (const id of [testSessionId, secondSessionId]) {
        const current = await open(id)
        const box = await page.locator('[data-chat-flow]').boundingBox()
        await page.mouse.move(box.x + Math.min(box.width / 2, 300), current.viewport.y + current.viewport.height / 2)
        await page.mouse.wheel(0, 100_000)
        await page.waitForTimeout(750)
        const following = await snapshot()
        assert.ok(following.tail <= 2 && following.following && following.saved === null, `Real reader arrival must enter native tail-follow mode: ${JSON.stringify(following)}`)
      }
      for (let cycle = 1; cycle <= 2; cycle++) for (const id of [testSessionId, secondSessionId]) {
        const actual = await open(id)
        const preserved = actual.tail <= 2 && actual.following && actual.saved === null
        if (sessionSwitchOnly || !preserved) console.log(`session-switch ${placement} tail cycle ${cycle} ${id}: ${JSON.stringify({ preserved, actual })}`)
        if (!preserved) failures.push({ placement, cycle, id, mode: 'following', actual })
      }
      assert.equal(errors.length, 0, errors.join('\n'))
      console.log(`verified ${placement} session switches: three semantic reader round trips and two native tail-follow round trips`)
      await context.close()
      return failures
    }

    async function inspectHero(defaultPlacement, viewport) {
      const context = await browser.newContext({ viewport, locale: 'en-US' })
      const page = await context.newPage()
      const pageErrors = []
      page.on('pageerror', error => pageErrors.push(error.message))
      page.on('console', message => { if (message.type() === 'error') pageErrors.push(message.text()) })
      await page.addInitScript((placement) => {
        if (sessionStorage.getItem('composer-compat-seeded')) return
        sessionStorage.setItem('composer-compat-seeded', '1')
        localStorage.setItem('dsh.composer-split.settings', JSON.stringify({
          defaultPlacement: placement,
          rememberPlacement: true,
          bottomHandleHoverOnly: false,
          defaultWidthPreset: 'medium',
        }))
      }, defaultPlacement)
      // Observe the real Config form revision, so the reload cannot race an
      // unfinished Host write or mistake the local preference for persistence.
      await page.route('**/plugins/**', async route => {
        if (!route.request().url().includes('dsh-composer-layout/client.js')) return route.continue()
        const response = await route.fetch()
        const body = (await response.text()).replace('function apply(ctx) {\n  const settings =', 'function apply(ctx) {\n  document.documentElement.__composerTestContext = ctx;\n  const settings =')
        await route.fulfill({ response, body })
      })
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
      if (defaultPlacement === 'bottom') {
        await page.getByRole('button', { name: 'Settings', exact: true }).click()
        await page.getByRole('button', { name: 'Built-in plugins', exact: true }).click()
        await page.getByText('Composer Layout', { exact: true }).click()
        const settingsPanel = page.locator('section[aria-label="Composer Layout"]')
        await settingsPanel.waitFor({ state: 'visible' })
        const initialRevision = await page.evaluate(() => document.documentElement.__composerTestContext.configForms.get('ui-composer-layout').getSnapshot().revision)
        await settingsPanel.getByRole('combobox').first().selectOption('auto')
        await settingsPanel.getByRole('slider').fill('0.75')
        assert.equal(await settingsPanel.getByRole('slider').inputValue(), '0.75')
        await page.waitForFunction(revision => {
          const snapshot = document.documentElement.__composerTestContext.configForms.get('ui-composer-layout').getSnapshot()
          return snapshot.revision !== revision && snapshot.value?.autoThreshold === 0.75
        }, initialRevision)
        await page.getByRole('button', { name: 'Close', exact: true }).click()
        await page.evaluate(() => { localStorage.removeItem('dsh.composer-split.settings') })
        await page.reload({ waitUntil: 'domcontentloaded' })
        await testingNotice.waitFor({ state: 'visible', timeout: 3_000 })
          .then(() => testingNotice.click())
          .catch(() => {})
        await configureLater.waitFor({ state: 'visible', timeout: 3_000 })
          .then(() => configureLater.click())
          .catch(() => {})
        await page.locator('style[data-plugin="dsh-composer-layout"]').first().waitFor({ state: 'attached', timeout: 20_000 })
        await page.getByRole('button', { name: 'Settings', exact: true }).click()
        await page.getByRole('button', { name: 'Built-in plugins', exact: true }).click()
        await page.getByText('Composer Layout', { exact: true }).click()
        assert.equal(await settingsPanel.getByRole('combobox').first().inputValue(), 'auto')
        assert.equal(await settingsPanel.getByRole('slider').inputValue(), '0.75')
        console.log('verified Host-persisted settings after clearing local overrides and reloading')
        await page.getByRole('button', { name: 'Close', exact: true }).click()
        await page.setViewportSize({ width: 1920, height: 900 })
        await page.locator(`[data-row-key="session:${testSessionId}"]`).click()
        await page.locator('[data-dsh-composer-split-adapter="plugin"]').waitFor({ state: 'attached', timeout: 20_000 })
        await page.getByText('Paragraph 100: a long answer for independent scrolling verification.', { exact: true }).waitFor({ state: 'attached', timeout: 20_000 })
        await page.locator('[data-dsh-composer-split-active="true"]').waitFor({ state: 'attached', timeout: 20_000 })
        const geometry = await page.locator('[data-dsh-composer-split-body]').evaluate(body => {
          const chat = body.querySelector('[data-dsh-composer-split-chat]').getBoundingClientRect()
          const composer = body.querySelector('[data-dsh-composer-split-frame]').getBoundingClientRect()
          const seat = body.querySelector('[data-dsh-composer-split-pane]').getBoundingClientRect()
          const scroll = body.getBoundingClientRect()
          const input = body.querySelector('[data-input-scroll]').getBoundingClientRect()
          return { chat: chat.toJSON(), composer: composer.toJSON(), seat: seat.toJSON(), scroll: scroll.toJSON(), input: input.toJSON(), clipLeft: scroll.left + body.clientLeft, clipRight: scroll.left + body.clientLeft + body.clientWidth, display: getComputedStyle(body).display }
        })
        assert.equal(geometry.display, 'flex', 'Side layout must preserve the native flex body')
        assert.ok(geometry.input.left >= geometry.clipLeft - 1 && geometry.input.right <= geometry.clipRight + 1, `Native input scrollport must stay inside its native owner's viewport clip: ${JSON.stringify(geometry)}`)
        assert.ok(geometry.chat.width >= 320 && geometry.composer.width >= 360)
        assert.ok(geometry.chat.right <= geometry.composer.left + 1, 'Chat and Composer must not overlap')
        assert.ok(geometry.seat.height <= 1 && Math.abs(geometry.seat.top - geometry.scroll.bottom) <= 2, `Native zero-height seat must stay at the scrollport bottom: ${JSON.stringify(geometry)}`)
        const editor = page.locator('[data-composer-input][contenteditable="true"]')
        // 复用真实 Session 与官方输入提交；替换传输端，避免凭据和模型调用。
        await page.evaluate(sessionId => {
          const session = document.documentElement.__composerTestContext.sessions.binding(sessionId).session
          let seq = Math.max(...session.eventSource.getSnapshot().entries.map(entry => entry.event.seq)) + 1
          let turn = 1
          const fixture = {
            calls: [], index: 0, revision: 0, text: '', stream: [],
            append(type, data) {
              // 官方提交先持久化权限和模型选择，序号须接续提交时的宿主事件尾部。
              seq = Math.max(seq, Math.floor(Math.max(...session.eventSource.getSnapshot().entries.map(entry => entry.event.seq))) + 1)
              const eventSeq = seq++
              session.acceptEventChange({ type: 'append', entry: { type: 'event', event: { type, seq: eventSeq, time: Date.now(), data, ...type.endsWith('/message') ? { surfaceOp: 'append' } : {} } } })
              return eventSeq
            },
            chunk(chunk) {
              const time = Date.now()
              fixture.stream.push(chunk.type === 'text-delta'
                ? { type: 'text-chunks', time0: time, index: chunk.index, dt: [], texts: [chunk.text] }
                : { type: 'chunk', time, chunk })
              session.acceptEventChange({ type: 'assistant-stream', frame: { type: 'chunk', attemptId: fixture.attemptId, revision: ++fixture.revision, index: fixture.index++, time, chunk } })
            },
            grow(text) {
              fixture.text += text
              fixture.chunk({ type: 'text-delta', index: 0, text })
            },
            finish() {
              fixture.chunk({ type: 'block-end', index: 0, block: { type: 'text', text: fixture.text } })
              fixture.chunk({ type: 'finish', reason: { kind: 'stop' } })
              const settlementSeq = fixture.append('assistant/message', { turn, step: 1, stream: fixture.stream, message: { id: `compat-response-${turn}`, role: 'assistant', content: [{ type: 'text', text: fixture.text }], source: { kind: 'model', provider: 'test', model: 'test' } } })
              session.acceptEventChange({ type: 'assistant-stream', frame: { type: 'end', attemptId: fixture.attemptId, revision: ++fixture.revision, index: fixture.index, outcome: { kind: 'committed', seq: settlementSeq, eventType: 'assistant/message' } } })
              fixture.append('step/end', { turn, step: 1 })
              fixture.append('turn/end', { turn, reason: { kind: 'completed' } })
              session.handleRunning(false)
            },
          }
          const prompt = async request => {
            assertRequest(request)
            fixture.calls.push(request)
            turn += 1
            fixture.append('turn/start', { turn })
            fixture.append('step/start', { turn, step: 1 })
            fixture.append('user/message', { id: `compat-submit-${turn}`, role: 'user', content: request.content, source: { kind: 'user', rpcId: request.requestId } })
            session.handleRunning(true)
            fixture.attemptId = `compat-attempt-${turn}`
            fixture.index = 0
            fixture.text = ''
            fixture.stream = []
            session.acceptEventChange({ type: 'assistant-stream', frame: { type: 'start', attemptId: fixture.attemptId, revision: ++fixture.revision, startedAfterSeq: seq - 1, turn, step: 1 } })
            fixture.chunk({ type: 'block-start', index: 0, blockType: 'text' })
            return { ok: true, value: { accepted: true } }
          }
          // Remote 命名空间是动态代理，替换本 Session 的传输引用，避免代理重新解析 prompt。
          session.remote = { ...session.remote, session: { ...session.remote.session, prompt } }
          if (session.remote.session.prompt !== prompt) throw new Error('Mock prompt transport was not installed')
          function assertRequest(request) {
            if (request.sessionId !== sessionId || !request.requestId) throw new Error('Expected an identified official session prompt')
          }
          document.documentElement.__composerSubmitFixture = fixture
        }, testSessionId)
        const chatState = () => page.locator('[data-chat-flow]').evaluate(flow => {
          let owner = flow.parentElement
          while (owner && !(['auto', 'scroll'].includes(getComputedStyle(owner).overflowY) && owner.scrollHeight > owner.clientHeight + 2)) owner = owner.parentElement
          if (!owner) {
            const ancestors = []
            for (let element = flow; element; element = element.parentElement) ancestors.push({ tag: element.tagName, attributes: [...element.attributes].map(a => [a.name, a.value]), overflow: getComputedStyle(element).overflowY, clientHeight: element.clientHeight, scrollHeight: element.scrollHeight })
            throw new Error(`No real transcript scroll owner: ${JSON.stringify(ancestors)}`)
          }
          const box = owner.getBoundingClientRect()
          const users = [...flow.querySelectorAll('[data-chat-flow-kind="user"]')]
          const last = users.at(-1)?.getBoundingClientRect()
          return { nativeOwner: owner.hasAttribute('data-conversation-scroll'), top: owner.scrollTop, tail: owner.scrollHeight - owner.clientHeight - owner.scrollTop, height: owner.scrollHeight, box: box.toJSON(), userVisible: !!last && last.bottom > box.top && last.top < box.bottom }
        })
        const browseHistory = async label => {
          const before = await chatState()
          assert.equal(before.nativeOwner, true, `${label}: transcript must retain its official native scroll owner`)
          await page.mouse.move(before.box.x + before.box.width / 2, before.box.y + before.box.height / 2)
          await page.mouse.wheel(0, -100_000)
          await page.waitForFunction(() => !document.querySelector('[data-chat-following-tail]'))
          // 原生阅读策略在滚动结束后取样；再次观察静止历史位置。
          await page.waitForTimeout(250)
          const reading = await chatState()
          assert.ok(reading.tail > 500, `${label}: reader must start away from the tail: ${JSON.stringify(reading)}`)
          await editor.fill('History browsing draft')
          await page.waitForTimeout(250)
          const after = await chatState()
          assert.ok(Math.abs(after.top - reading.top) <= 2, `${label}: ordinary draft editing must not force history down: ${JSON.stringify({ reading, after })}`)
          return reading
        }
        for (const placement of ['right', 'bottom']) {
          if (placement === 'bottom') {
            await page.getByRole('separator', { name: /调整输入区域宽度/ }).click()
            await page.getByRole('button', { name: '停靠到底部', exact: true }).click()
            await page.locator('[data-dsh-composer-split-active]').waitFor({ state: 'detached' })
          }
          for (const submission of ['click', 'Enter']) {
            const label = `${placement}/${submission}`
            await browseHistory(label)
            const text = `Compatibility submit ${label}`
            await editor.fill(text)
            const callsBefore = await page.evaluate(() => document.documentElement.__composerSubmitFixture.calls.length)
            if (submission === 'Enter') await editor.press('Enter')
            else await page.getByRole('button', { name: 'Send message', exact: true }).click()
            await page.waitForFunction(count => document.documentElement.__composerSubmitFixture.calls.length === count + 1, callsBefore).catch(async error => {
              const state = await page.evaluate(sessionId => ({ text: document.body.innerText.slice(-2500), snapshot: document.documentElement.__composerTestContext.sessions.binding(sessionId).session.getSnapshot(), calls: document.documentElement.__composerSubmitFixture.calls }), testSessionId)
              throw new Error(`${label}: official prompt did not reach the fixture: ${JSON.stringify(state)}`, { cause: error })
            })
            await page.getByText(text, { exact: true }).waitFor({ state: 'visible' }).catch(async error => {
              const state = await page.evaluate(sessionId => ({ text: document.body.innerText.slice(-4000), events: document.documentElement.__composerTestContext.sessions.binding(sessionId).session.eventSource.getSnapshot().entries.slice(-6), snapshot: document.documentElement.__composerTestContext.sessions.binding(sessionId).session.getSnapshot(), calls: document.documentElement.__composerSubmitFixture.calls }), testSessionId)
              throw new Error(`${label}: user was not rendered: ${JSON.stringify({ state, pageErrors })}`, { cause: error })
            })
            await page.waitForFunction(() => !!document.querySelector('[data-chat-following-tail]'))
            const submitted = await chatState()
            assert.ok(submitted.userVisible && submitted.tail <= 160, `${label}: submitted user must be visible near the real scroll tail: ${JSON.stringify(submitted)}`)
            for (let chunk = 0; chunk < 3; chunk++) {
              const marker = `Stream ${label} chunk ${chunk}`
              await page.evaluate(({ marker }) => document.documentElement.__composerSubmitFixture.grow(`${marker}\n\n${'Native response growth verification.\n\n'.repeat(24)}`), { marker })
              await page.getByText(marker, { exact: true }).waitFor({ state: 'attached' })
              await page.waitForTimeout(250)
              const growing = await chatState()
              assert.ok(growing.height > submitted.height + 300 && growing.tail <= 160, `${label}: native follow must track response growth without test scrolling: ${JSON.stringify(growing)}`)
            }
            const reading = await browseHistory(`${label}/response-history`)
            await page.evaluate(() => document.documentElement.__composerSubmitFixture.grow('\n\nHistory must stay put during more response text.\n\n'.repeat(12)))
            await page.waitForTimeout(250)
            const held = await chatState()
            assert.ok(Math.abs(held.top - reading.top) <= 2 && held.tail > 500, `${label}: response growth must preserve ordinary history browsing: ${JSON.stringify({ reading, held })}`)
            await page.evaluate(() => document.documentElement.__composerSubmitFixture.finish())
            await editor.fill('')
            assert.equal(pageErrors.length, 0, `${label}: browser errors after official response settlement:\n${pageErrors.join('\n')}`)
            console.log(`verified ${label}: official submit from history, visible user, native response follow and preserved history browsing`)
          }
        }
        await page.getByRole('button', { name: '打开输入区域布局菜单', exact: true }).click()
        await page.getByRole('button', { name: /停靠到右侧/ }).click()
        await page.locator('[data-dsh-composer-split-active]').waitFor({ state: 'attached' })
        const emptySurface = await editor.evaluate(el => {
          el.blur()
          const scroll = el.closest('[data-input-scroll]').getBoundingClientRect()
          const box = el.getBoundingClientRect()
          const hit = document.elementFromPoint(scroll.x + scroll.width / 2, scroll.y + scroll.height * 0.9)
          return { height: box.height, scrollHeight: scroll.height, nativeHit: el.contains(hit), cursor: getComputedStyle(hit).cursor, focused: document.activeElement === el }
        })
        assert.equal(emptySurface.focused, false)
        assert.ok(emptySurface.height >= emptySurface.scrollHeight - 2, `Empty unfocused editor must fill the input surface: ${JSON.stringify(emptySurface)}`)
        assert.equal(emptySurface.nativeHit, true, 'Empty unfocused blank area must belong to the native editor')
        assert.equal(emptySurface.cursor, 'text', 'Empty unfocused blank area must have the text cursor')
        await editor.fill('Native editor selection surface')
        const editorSurface = await editor.evaluate(el => {
          const scroll = el.closest('[data-input-scroll]')
          const box = el.getBoundingClientRect()
          const area = scroll.getBoundingClientRect()
          return { editor: box.toJSON(), scroll: area.toJSON(), mirrorCount: scroll.querySelectorAll('[data-input-mirror]').length, ancestors: [el, el.parentElement, scroll].map(e => ({ tag: e.tagName, height: e.getBoundingClientRect().height, display: getComputedStyle(e).display, minHeight: getComputedStyle(e).minHeight })) }
        })
        assert.ok(editorSurface.editor.height >= editorSurface.scroll.height - 2, `Short draft must fill the native editing surface: ${JSON.stringify(editorSurface)}`)
        for (const fraction of [0.5, 0.9]) {
          const x = editorSurface.scroll.x + editorSurface.scroll.width / 2
          const y = editorSurface.scroll.y + editorSurface.scroll.height * fraction
          assert.equal(await editor.evaluate((el, point) => el.contains(document.elementFromPoint(point.x, point.y)), { x, y }), true, 'Blank input area must hit the native editor, not a focus proxy')
          assert.equal(await page.evaluate(point => getComputedStyle(document.elementFromPoint(point.x, point.y)).cursor, { x, y }), 'text', 'Blank native input area must show the text cursor')
        }
        // 真实鼠标操作验证浏览器原生光标与选择，不能用脚本设置 Selection 代替。
        const textPoint = await editor.evaluate(el => {
          const text = document.createTreeWalker(el, NodeFilter.SHOW_TEXT).nextNode()
          const range = document.createRange()
          range.setStart(text, 0)
          range.setEnd(text, 1)
          const rect = range.getBoundingClientRect()
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
        })
        const blankPoint = { x: editorSurface.scroll.x + editorSurface.scroll.width / 2, y: editorSurface.scroll.y + editorSurface.scroll.height * 0.9 }
        await page.mouse.click(blankPoint.x, blankPoint.y)
        assert.equal(await editor.evaluate(el => document.activeElement === el), true, 'Blank-area click must focus the native editor without a proxy')
        await page.mouse.move(textPoint.x, textPoint.y)
        await page.mouse.down()
        const forwardStart = await page.evaluate(() => ({ anchor: getSelection().anchorOffset, focus: getSelection().focusOffset, text: getSelection().toString() }))
        await page.mouse.move(blankPoint.x, blankPoint.y, { steps: 12 })
        const forwardMoved = await page.evaluate(() => ({ anchor: getSelection().anchorOffset, focus: getSelection().focusOffset, text: getSelection().toString() }))
        await page.mouse.up()
        // Chromium also collapses this forward drag over distant empty space in
        // a bare contenteditable. Compare native behavior rather than inventing
        // textarea selection semantics; the reverse drag below must select text.
        const forwardSelection = await page.evaluate(() => getSelection().toString())
        const nativePage = await context.newPage()
        try {
          await nativePage.setViewportSize({ width: 1920, height: 900 })
          await nativePage.setContent('<div contenteditable="true">Native editor selection surface</div>')
          const nativeEditor = nativePage.locator('[contenteditable]')
          const font = await editor.evaluate(el => getComputedStyle(el).font)
          const points = await nativeEditor.evaluate((el, { width, height, font }) => {
            Object.assign(el.style, { width: `${width}px`, height: `${height}px`, font, whiteSpace: 'pre-wrap' })
            const range = document.createRange()
            range.setStart(el.firstChild, 0)
            range.setEnd(el.firstChild, 1)
            const text = range.getBoundingClientRect(), box = el.getBoundingClientRect()
            return { x: text.x + text.width / 2, y: text.y + text.height / 2, bx: box.x + box.width / 2, by: box.y + box.height * 0.9 }
          }, { width: editorSurface.editor.width, height: editorSurface.editor.height, font })
          await nativePage.mouse.click(points.bx, points.by)
          await nativePage.mouse.move(points.x, points.y)
          await nativePage.mouse.down()
          await nativePage.mouse.move(points.bx, points.by, { steps: 12 })
          await nativePage.mouse.up()
          const nativeSelection = await nativePage.evaluate(() => getSelection().toString())
          assert.equal(forwardSelection.length > 0, nativeSelection.length > 0, `Forward drag must match native selection behavior: ${JSON.stringify({ forwardStart, forwardMoved, nativeSelection })}`)
          if (nativeSelection.length > 0) assert.ok(forwardSelection.includes('editor selection surface'), 'Forward drag must select the draft when the native browser does so')
        } finally {
          await nativePage.close()
          await page.bringToFront()
        }
        await page.mouse.click(blankPoint.x, blankPoint.y)
        await page.mouse.dblclick(textPoint.x, textPoint.y)
        assert.equal(await page.evaluate(() => getSelection().toString()), 'Native', 'Native double-click must select a word')
        await page.mouse.click(textPoint.x, textPoint.y, { clickCount: 3 })
        assert.ok((await page.evaluate(() => getSelection().toString())).includes('Native editor selection surface'), 'Native triple-click must select the paragraph')
        await page.mouse.click(blankPoint.x, blankPoint.y)
        await page.mouse.move(blankPoint.x, blankPoint.y)
        await page.mouse.down()
        await page.mouse.move(textPoint.x, textPoint.y, { steps: 12 })
        await page.mouse.up()
        const draggedSelection = await page.evaluate(() => { const s = getSelection(); return { text: s.toString(), anchor: s.anchorOffset, focus: s.focusOffset, anchorText: s.anchorNode?.textContent, focusText: s.focusNode?.textContent } })
        assert.ok(draggedSelection.text.includes('editor selection surface'), `Dragging from blank space into text must extend native selection: ${JSON.stringify({ draggedSelection, textPoint, blankPoint })}`)
        const chatPosition = (await browseHistory('independent draft scroll')).top
        await editor.fill('Long native editor draft line.\n'.repeat(100))
        await editor.press('ControlOrMeta+A')
        await editor.press('ArrowLeft')
        const inputScroll = page.locator('[data-dsh-composer-split-pane] [data-input-scroll]')
        assert.ok(await inputScroll.evaluate(el => el.scrollHeight > el.clientHeight + 500), 'Long draft must overflow the input scrollport')
        const inputBox = await inputScroll.boundingBox()
        await page.mouse.move(inputBox.x + inputBox.width / 2, inputBox.y + inputBox.height / 2)
        await page.mouse.wheel(0, -100_000)
        await page.waitForFunction(() => Math.abs(document.querySelector('[data-dsh-composer-split-pane] [data-input-scroll]').scrollTop) <= 1).catch(async error => {
          const state = await inputScroll.evaluate(el => ({ top: el.scrollTop, height: el.clientHeight, content: el.scrollHeight, box: el.getBoundingClientRect().toJSON(), selection: getSelection()?.focusOffset }))
          throw new Error(`Native draft navigation and wheel must reach the input start: ${JSON.stringify(state)}`, { cause: error })
        })
        await page.mouse.wheel(0, 500)
        await page.waitForFunction(() => document.querySelector('[data-dsh-composer-split-pane] [data-input-scroll]').scrollTop > 0).catch(async error => {
          const state = await inputScroll.evaluate(el => {
            const box = el.getBoundingClientRect()
            const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
            return { top: el.scrollTop, height: el.clientHeight, content: el.scrollHeight, overflow: getComputedStyle(el).overflowY, input: box.toJSON(), owner: el.closest('[data-conversation-scroll]')?.getBoundingClientRect().toJSON(), hit: hit?.outerHTML.slice(0, 300), selection: getSelection()?.focusOffset, chatTop: el.closest('[data-conversation-scroll]')?.scrollTop }
          })
          throw new Error(`Native draft wheel must scroll its own input: ${JSON.stringify(state)}`, { cause: error })
        })
        assert.equal((await chatState()).top, chatPosition, 'Draft scrolling must not move Chat')
        assert.ok(await page.locator('[data-dsh-composer-split-frame]').evaluate(el => el.scrollHeight <= el.clientHeight + 2), 'Long draft must not create an outer Composer scrollport')
        await editor.fill('Native editor selection surface')
        const splitPane = page.locator('[data-dsh-composer-split-frame]')
        const inputCard = splitPane.locator('[data-composer-card]')
        const cardHeightBeforePopups = (await inputCard.boundingBox()).height
        const assertPopupInsidePane = async (label, popup) => {
          const pane = await splitPane.boundingBox()
          const box = await popup.boundingBox()
          assert.ok(pane && box, `${label} popup must be measurable`)
          assert.ok(box.x >= pane.x - 1 && box.x + box.width <= pane.x + pane.width + 1, `${label} popup must stay inside the Composer pane: ${JSON.stringify({ pane, box })}`)
          assert.ok(box.y >= 0 && box.y + box.height <= (await page.evaluate(() => window.innerHeight)) + 1, `${label} popup must stay inside the viewport: ${JSON.stringify(box)}`)
        }
        const triggerMenu = page.locator('[role=listbox][aria-label="Trigger suggestions"]:visible')
        await editor.fill('/')
        await triggerMenu.waitFor({ state: 'visible', timeout: 5_000 })
        await assertPopupInsidePane('Slash', triggerMenu)
        if (artifactDirectory !== undefined) {
          await mkdir(artifactDirectory, { recursive: true })
          await page.screenshot({ path: join(artifactDirectory, `popup-slash-${browserName}.png`) })
        }
        await page.getByRole('button', { name: /Select model, current/ }).click()
        await page.getByRole('menu', { name: 'Model and reasoning effort' }).waitFor({ state: 'visible', timeout: 5_000 })
        assert.equal(await triggerMenu.count(), 0, 'Slash candidates must close before the model popup opens')
        await assertPopupInsidePane('Model', page.getByRole('menu', { name: 'Model and reasoning effort' }))
        await page.keyboard.press('Escape')
        await editor.fill('@')
        await triggerMenu.waitFor({ state: 'visible', timeout: 5_000 })
        await assertPopupInsidePane('Reference', triggerMenu)
        await page.getByRole('button', { name: /Access mode, current/ }).click()
        const accessMenu = page.getByRole('menu').filter({ has: page.getByRole('menuitem', { name: /Workspace Write/ }) })
        await accessMenu.waitFor({ state: 'visible', timeout: 5_000 })
        assert.equal(await triggerMenu.count(), 0, 'Reference candidates must close before the access popup opens')
        await assertPopupInsidePane('Access', accessMenu)
        await page.keyboard.press('Escape')
        const groupedMenuTrigger = splitPane.locator('button[aria-haspopup="listbox"]').first()
        await groupedMenuTrigger.click()
        await triggerMenu.waitFor({ state: 'visible', timeout: 5_000 })
        await assertPopupInsidePane('Plus/command', triggerMenu)
        await page.keyboard.press('Escape')
        await editor.fill('')
        await editor.fill(`${'context line\n'.repeat(24)}@`)
        await triggerMenu.waitFor({ state: 'visible', timeout: 5_000 })
        await triggerMenu.getByRole('option', { name: 'README.md', exact: true }).waitFor({ state: 'visible', timeout: 5_000 })
        await assertPopupInsidePane('Long-draft reference', triggerMenu)
        await triggerMenu.getByRole('option', { name: 'README.md', exact: true }).click()
        assert.equal(await triggerMenu.count(), 0, 'Reference selection must close its candidate menu')
        assert.match(await editor.innerText(), /README\.md/, 'Reference selection must insert the chosen file token')
        await page.keyboard.press('Escape')
        await editor.fill('')
        const cardHeightAfterPopups = (await inputCard.boundingBox()).height
        assert.ok(Math.abs(cardHeightAfterPopups - cardHeightBeforePopups) <= 2, `Native Composer popups must not change the side card height: ${cardHeightBeforePopups} -> ${cardHeightAfterPopups}`)
        console.log('verified slash/reference popup placement and native popup dismissal in side layout')
        await page.setViewportSize({ width: 1920, height: 600 })
        await editor.fill('/')
        await triggerMenu.waitFor({ state: 'visible', timeout: 5_000 })
        await assertPopupInsidePane('Short-window slash', triggerMenu)
        await page.keyboard.press('Escape')
        await editor.fill('Native editor selection surface')
        await page.waitForFunction(() => {
          const el = document.querySelector('[data-composer-input]')
          return el.getBoundingClientRect().height >= el.closest('[data-input-scroll]').getBoundingClientRect().height - 2
        })
        await page.setViewportSize({ width: 1920, height: 900 })
        await editor.fill('')
        const nativeHandles = page.locator('[data-width-handle]')
        assert.equal(await nativeHandles.count(), 2)
        assert.deepEqual(await nativeHandles.evaluateAll(elements => elements.map(el => getComputedStyle(el).display)), ['none', 'none'], 'Native transcript handles must be hidden in split layout')
        const flow = await page.locator('[data-chat-flow]').boundingBox()
        assert.ok(flow.x >= geometry.chat.left && flow.x + flow.width <= geometry.chat.right + 1, 'Transcript must stay inside Chat')
        const separator = page.getByRole('separator', { name: /调整输入区域宽度/ })
        const handle = await separator.boundingBox()
        await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
        await page.mouse.down()
        await page.mouse.move(handle.x - 80, handle.y + handle.height / 2, { steps: 8 })
        await page.mouse.up()
        const resized = await page.locator('[data-dsh-composer-split-frame]').boundingBox()
        assert.ok(resized.width > geometry.composer.width + 40, 'Dragging must widen the right pane')
        await separator.click()
        await page.getByRole('button', { name: '停靠到底部', exact: true }).click()
        await page.locator('[data-dsh-composer-split-active]').waitFor({ state: 'detached' })
        assert.ok((await editor.boundingBox()).height < 96, 'Empty bottom Composer must retain its compact native editor')
        assert.ok((await nativeHandles.evaluateAll(elements => elements.map(el => getComputedStyle(el).display))).every(display => display !== 'none'), 'Bottom layout must restore native transcript handles')
        const transcriptHandle = page.locator('[data-width-handle="right"]')
        const transcriptBox = await transcriptHandle.boundingBox()
        const flowBefore = await page.locator('[data-chat-flow]').boundingBox()
        await page.mouse.move(transcriptBox.x + transcriptBox.width / 2, transcriptBox.y + 100)
        await page.mouse.down()
        await page.mouse.move(transcriptBox.x + transcriptBox.width / 2 - 60, transcriptBox.y + 100, { steps: 8 })
        await page.mouse.up()
        const flowAfter = await page.locator('[data-chat-flow]').boundingBox()
        assert.ok(flowAfter.width < flowBefore.width - 60, 'Native transcript resizing must still work at bottom')
        await page.getByRole('button', { name: '打开输入区域布局菜单', exact: true }).click()
        await page.getByRole('button', { name: /自动选择布局/ }).click()
        await page.locator('[data-dsh-composer-split-active]').waitFor({ state: 'attached' })
        await page.setViewportSize({ width: 600, height: 1300 })
        await page.locator('[data-dsh-composer-split-active]').waitFor({ state: 'detached' })
        // 缩窄会触发 ResizeObserver 关闭菜单；等布局完成后再模拟用户打开。
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        await page.getByRole('button', { name: '打开输入区域布局菜单', exact: true }).click()
        assert.equal(await page.getByRole('button', { name: /停靠到右侧/ }).isDisabled(), true)
        // 自动模式已在宽屏时选定；缩窄不应要求重新选择，变宽后应自行恢复。
        await page.keyboard.press('Escape')
        await page.setViewportSize({ width: 1920, height: 900 })
        await page.locator('[data-dsh-composer-split-active]').waitFor({ state: 'attached' })
        await browseHistory('settled answer history')
        // 对照真实权限 Menu；测试不注入产品背景、定位或层级 CSS。
        await page.getByRole('button', { name: /Access mode, current/ }).click()
        await accessMenu.waitFor({ state: 'visible' })
        const nativeMenuStyle = await accessMenu.evaluate(menu => {
          const style = getComputedStyle(menu)
          const material = menu.querySelector(':scope > [aria-hidden="true"]')
          return { shadow: style.boxShadow, radius: style.borderRadius, material: getComputedStyle(material).backgroundColor, filter: getComputedStyle(material).backdropFilter }
        })
        await page.keyboard.press('Escape')
        const addOverflowControls = async entries => page.locator('[data-slot="conversation.input.right"]').evaluate((slot, entries) => {
          const fixture = document.documentElement.__overflowRegressionFixture ??= new Map()
          for (const [label, width] of entries) {
            const button = document.createElement('button')
            button.textContent = width === 30 ? 'Fast' : width === 70 ? '7d: 42%' : label
            button.setAttribute('aria-label', label)
            button.dataset.overflowRegression = ''
            button.style.cssText = `flex:none;width:${width}px;height:28px;position:relative`
            const record = { node: button, parent: slot, width, height: 28, clicks: 0, enters: 0 }
            record.click = () => { record.clicks++ }
            button.onclick = record.click
            button.addEventListener('mouseenter', () => { record.enters++ })
            fixture.set(label, record)
            slot.append(button)
            record.fontSize = getComputedStyle(button).fontSize
            record.lineHeight = getComputedStyle(button).lineHeight
          }
        }, entries)
        const assertOverflowSurface = async (label, requireFit = false) => {
          const state = await page.locator('[data-slot="conversation.input.right"]').evaluate(slot => {
            const surface = slot.querySelector('[data-menu-material="translucent"]')
            const material = surface?.querySelector(':scope > [aria-hidden="true"]')
            const style = getComputedStyle(slot)
            const records = [...document.documentElement.__overflowRegressionFixture.values()].filter(record => record.node.isConnected)
            return { surface: !!surface, box: slot.getBoundingClientRect().toJSON(), direction: style.flexDirection, gap: Number.parseFloat(style.columnGap), padding: Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight), overflowX: style.overflowX, overflowY: style.overflowY, shadow: style.boxShadow, radius: surface && getComputedStyle(surface).borderRadius, material: material && getComputedStyle(material).backgroundColor, filter: material && getComputedStyle(material).backdropFilter, rows: records.map(record => ({ box: record.node.getBoundingClientRect().toJSON(), sameNode: slot.contains(record.node) && record.node.parentElement === record.parent, sameClick: record.node.onclick === record.click, originalWidth: record.width, originalHeight: record.height, originalFontSize: record.fontSize, originalLineHeight: record.lineHeight, fontSize: getComputedStyle(record.node).fontSize, lineHeight: getComputedStyle(record.node).lineHeight })), measuring: !!document.querySelector('[data-dsh-composer-measuring]') }
          })
          assert.equal(state.surface, true, `${label}: overflow must reuse the native MenuSurface`)
          for (const property of ['shadow', 'radius', 'material', 'filter']) assert.equal(state[property], nativeMenuStyle[property], `${label}: ${property} must match native permissions Menu`)
          assert.equal(state.measuring, false, `${label}: measuring overrides must be cleared`)
          assert.equal(state.direction, 'row', `${label}: original controls must stay horizontal`)
          assert.equal(state.overflowX, 'visible', `${label}: inline quota tooltip must escape the surface without a horizontal scrollport`)
          assert.equal(state.overflowY, 'visible', `${label}: inline quota tooltip must remain unclipped`)
          const fits = state.rows.reduce((width, row) => width + row.originalWidth, state.padding + state.gap * Math.max(0, state.rows.length - 1)) <= state.box.width + 1
          if (requireFit) assert.equal(fits, true, `${label}: fast 30px, quota 70px and task controls must fit without wrapping`)
          for (const [index, row] of state.rows.entries()) {
            assert.ok(row.sameNode && row.sameClick, `${label}: original widget node, parent and click callback must survive`)
            assert.equal(row.fontSize, row.originalFontSize, `${label}: preserve the widget's own typography`)
            assert.equal(row.lineHeight, row.originalLineHeight, `${label}: preserve the widget's own line height`)
            assert.ok(Math.abs(row.box.width - row.originalWidth) <= 1 && Math.abs(row.box.height - row.originalHeight) <= 1, `${label}: preserve the widget's own size without menu normalization: ${JSON.stringify(row)}`)
            if (fits && index) assert.ok(Math.abs(row.box.top - state.rows[0].box.top) <= 1 && row.box.left >= state.rows[index - 1].box.right + state.gap - 1, `${label}: controls that fit must share one real horizontal row: ${JSON.stringify(state.rows)}`)
          }
        }
        const assertOriginalCallback = async label => {
          const state = await page.evaluate(label => {
            const record = document.documentElement.__overflowRegressionFixture.get(label)
            return { clicks: record.clicks, enters: record.enters, sameClick: record.node.onclick === record.click, sameParent: record.node.parentElement === record.parent }
          }, label)
          assert.ok(state.clicks > 0 && state.enters > 0 && state.sameClick && state.sameParent, `${label}: real pointer must reach the original widget callback: ${JSON.stringify(state)}`)
        }
        // 使用真实宿主 CSS 和 display:contents 插槽，覆盖折叠前后的自然测宽。
        await addOverflowControls([['Extra mode control', 30], ['Extra quota control', 70], ['Extra task control', 130]])
        const divider = page.getByRole('separator')
        for (let step = 0; step < 55; step++) await divider.press('ArrowRight')
        const overflow = page.getByRole('button', { name: '显示额外输入控件', exact: true })
        await overflow.waitFor({ state: 'visible', timeout: 5_000 }).catch(async error => {
          const state = await page.locator('[data-slot="conversation.input.right"]').evaluate(slot => ({ slot: slot.getBoundingClientRect().toJSON(), children: [...slot.children].map(el => ({ text: el.textContent, box: el.getBoundingClientRect().toJSON(), display: getComputedStyle(el).display })), pane: document.querySelector('[data-dsh-composer-split-frame]')?.getBoundingClientRect().toJSON(), row: slot.parentElement.getBoundingClientRect().toJSON() }))
          throw new Error(`Side overflow did not collapse: ${JSON.stringify(state)}`, { cause: error })
        })
        await overflow.click()
        await assertOverflowSurface('Side fast/quota/task fit', true)
        const tooltipBefore = await page.locator('[data-slot="conversation.input.right"]').boundingBox()
        await page.evaluate(() => {
          const record = document.documentElement.__overflowRegressionFixture.get('Extra quota control')
          const tip = document.createElement('span')
          tip.dataset.overflowTooltipRegression = ''
          tip.textContent = '7-day quota details from the original inline tooltip'
          tip.style.cssText = 'display:none;position:absolute;right:0;bottom:calc(100% + 8px);width:340px;height:60px;background:Canvas;color:CanvasText;pointer-events:auto'
          record.node.append(tip)
          record.node.addEventListener('mouseenter', () => { tip.style.display = 'block' }, { once: true })
        })
        try {
          await page.getByRole('button', { name: 'Extra quota control', exact: true }).hover()
          const tooltipState = await page.evaluate(() => {
            const slot = document.querySelector('[data-slot="conversation.input.right"]')
            const tip = document.querySelector('[data-overflow-tooltip-regression]')
            const popup = slot.getBoundingClientRect(), box = tip.getBoundingClientRect()
            const point = { x: (Math.max(12, box.left) + Math.min(popup.left - 1, box.right)) / 2, y: box.top + box.height / 2 }
            return { visible: box.width > 0 && box.height > 0, outside: point.x < popup.left && point.x >= box.left && point.x <= box.right, hit: tip.contains(document.elementFromPoint(point.x, point.y)), popup: popup.toJSON(), overflowX: getComputedStyle(slot).overflowX, scrollbarHeight: slot.offsetHeight - slot.clientHeight }
          })
          assert.ok(tooltipState.visible && tooltipState.outside && tooltipState.hit, `Original absolute quota tooltip must be hit-testable outside the more surface: ${JSON.stringify(tooltipState)}`)
          assert.equal(tooltipState.overflowX, 'visible', 'Quota hover must not turn more into a horizontal scrollport')
          assert.ok(tooltipState.scrollbarHeight <= 1 && Math.abs(tooltipState.popup.width - tooltipBefore.width) <= 1 && Math.abs(tooltipState.popup.height - tooltipBefore.height) <= 1, 'Quota hover must preserve the panel box and create no horizontal scrollbar')
        } finally {
          await page.locator('[data-overflow-tooltip-regression]').evaluateAll(elements => elements.forEach(element => element.remove()))
        }
        await overflow.click()
        // 长状态控件扩大真实 popup，使它实际穿过 divider 命中带。
        await addOverflowControls([['Extra long status control', 320]])
        await page.locator('[data-overflow-regression]').filter({ hasText: 'Extra long status control' }).evaluate(button => { button.style.minWidth = '320px' })
        await overflow.click()
        await page.getByRole('button', { name: 'Extra mode control', exact: true }).waitFor({ state: 'visible' })
        await page.getByRole('button', { name: 'Extra quota control', exact: true }).waitFor({ state: 'visible' })
        await assertOverflowSurface('Side')
        for (const label of ['Extra mode control', 'Extra quota control', 'Extra task control']) {
          const control = page.getByRole('button', { name: label, exact: true })
          await control.hover()
          await control.click()
          await assertOriginalCallback(label)
        }
        const crossPoint = await page.evaluate(() => {
          const slot = document.querySelector('[data-slot="conversation.input.right"]')
          const rail = document.querySelector('[role="separator"]').getBoundingClientRect()
          const button = document.documentElement.__overflowRegressionFixture.get('Extra long status control').node
          const row = button.getBoundingClientRect()
          const popup = slot.getBoundingClientRect()
          const left = Math.max(rail.left, row.left, popup.left), right = Math.min(rail.right, row.right, popup.right)
          const top = Math.max(rail.top, row.top, popup.top), bottom = Math.min(rail.bottom, row.bottom, popup.bottom)
          const point = { x: (left + right) / 2, y: (top + bottom) / 2 }
          return { ...point, intersects: right > left + 1 && bottom > top + 1, hitOriginal: button.contains(document.elementFromPoint(point.x, point.y)), rail: rail.toJSON(), popup: popup.toJSON(), row: row.toJSON() }
        })
        assert.equal(crossPoint.intersects, true, `Fixture must cross the real divider hit area: ${JSON.stringify(crossPoint)}`)
        assert.equal(crossPoint.hitOriginal, true, `Popup must beat the divider at their actual intersection: ${JSON.stringify(crossPoint)}`)
        await page.mouse.move(crossPoint.x, crossPoint.y)
        assert.equal(await page.evaluate(() => document.documentElement.__overflowRegressionFixture.get('Extra long status control').node.matches(':hover')), true, 'Cross-divider pointer must really hover the original status widget without normalizing its hover style')
        await page.mouse.click(crossPoint.x, crossPoint.y)
        await assertOriginalCallback('Extra long status control')
        // 原生 HoverCard(100) 与 body Menu(1100) 都必须盖过 overflow pane。
        for (const layer of [100, 1100]) {
          assert.equal(await page.evaluate(({ point, layer }) => {
            const probe = document.createElement('div')
            probe.dataset.overflowLayerProbe = ''
            Object.assign(probe.style, { position: 'fixed', left: `${point.x - 2}px`, top: `${point.y - 2}px`, width: '4px', height: '4px', zIndex: String(layer) })
            document.body.append(probe)
            try { return document.elementFromPoint(point.x, point.y) === probe }
            finally { probe.remove() }
          }, { point: crossPoint, layer }), true, `Body overlay z${layer} must remain above the lifted overflow pane`)
        }
        const initialOverflowGap = await page.locator('[data-slot="conversation.input.right"]').evaluate(slot => document.querySelector('[data-dsh-composer-slot-overflow-trigger]').getBoundingClientRect().top - slot.getBoundingClientRect().bottom)
        const assertOverflowAnchored = async label => {
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
          const state = await page.locator('[data-slot="conversation.input.right"]').evaluate(slot => {
            const popup = slot.getBoundingClientRect()
            const trigger = document.querySelector('[data-dsh-composer-slot-overflow-trigger]').getBoundingClientRect()
            const records = [...document.documentElement.__overflowRegressionFixture.values()].filter(record => record.node.isConnected)
            const expectedLeft = Math.min(Math.max(trigger.right - popup.width, 12), innerWidth - popup.width - 12)
            return { popup: popup.toJSON(), trigger: trigger.toJSON(), viewport: { width: innerWidth, height: innerHeight }, expectedLeft, gap: trigger.top - popup.bottom, open: slot.hasAttribute('data-dsh-composer-slot-overflow-open'), collapsed: slot.hasAttribute('data-dsh-composer-slot-overflow'), split: !!document.querySelector('[data-dsh-composer-split-active]'), sameWidgets: records.every(record => record.node.parentElement === record.parent && record.node.onclick === record.click && slot.contains(record.node)) }
          })
          assert.ok(state.open && state.collapsed && state.split && state.sameWidgets, `${label}: resize must preserve the open popup and original widgets: ${JSON.stringify(state)}`)
          assert.ok(state.popup.left >= 12 - 1 && state.popup.right <= state.viewport.width - 12 + 1 && state.popup.top >= 12 - 1 && state.popup.bottom <= state.viewport.height - 12 + 1, `${label}: open popup must track the resized viewport: ${JSON.stringify(state)}`)
          assert.ok(Math.abs(state.popup.left - state.expectedLeft) <= 1 && Math.abs(state.gap - initialOverflowGap) <= 1, `${label}: open popup must retain top/end placement and its initial ${initialOverflowGap}px gap: ${JSON.stringify(state)}`)
          return state
        }
        await page.setViewportSize({ width: 1280, height: 900 })
        const resizedOverflow = await assertOverflowAnchored('Open side popup after viewport resize')
        await page.evaluate(() => {
          const record = document.documentElement.__overflowRegressionFixture.get('Extra long status control')
          record.originalStyle = record.node.getAttribute('style')
          record.node.style.height = 'auto'
          record.node.style.whiteSpace = 'pre-line'
          // 五行内容让 WebKit 的原生小字号也产生明确高度增长。
          record.node.textContent = 'Extra long status control\nQuota refresh is pending\nExisting task control remains active\nAdditional status detail\nFinal status detail'
        })
        const grownOverflow = await assertOverflowAnchored('Open side popup after original status growth')
        assert.ok(grownOverflow.popup.height >= resizedOverflow.popup.height + 20, `Fixture must really increase the open panel height before checking re-anchoring: ${JSON.stringify({ before: resizedOverflow.popup, after: grownOverflow.popup })}`)
        await page.evaluate(() => {
          const record = document.documentElement.__overflowRegressionFixture.get('Extra long status control')
          record.node.setAttribute('style', record.originalStyle)
          record.node.textContent = 'Extra long status control'
          delete record.originalStyle
        })
        await page.setViewportSize({ width: 1920, height: 900 })
        await assertOverflowAnchored('Open side popup after viewport restoration')
        await overflow.click()
        await page.locator('[data-overflow-regression]').filter({ hasText: 'Extra long status control' }).evaluate(button => { button.remove() })
        for (let step = 0; step < 35; step++) await divider.press('ArrowLeft')
        await overflow.waitFor({ state: 'detached', timeout: 5_000 })
        await page.getByRole('button', { name: 'Extra quota control', exact: true }).waitFor({ state: 'visible' })
        for (let step = 0; step < 35; step++) await divider.press('ArrowRight')
        await overflow.waitFor({ state: 'visible', timeout: 5_000 })
        assert.equal(await page.locator('[data-dsh-composer-measuring]').count(), 0, 'Measurement styles must be removed before paint')
        await page.locator('[data-overflow-regression]').evaluateAll(elements => elements.forEach(el => el.remove()))
        console.log('verified extra controls: narrow collapse, popup visibility, wide restoration and repeat collapse with native CSS')
        await divider.click()
        await page.getByRole('button', { name: '停靠到底部', exact: true }).click()
        await page.locator('[data-dsh-composer-split-active]').waitFor({ state: 'detached' })
        // 前面的原生宽度测试缩窄了工具栏；用同一原生手柄给四个额外控件留足空间。
        const wideHandle = await transcriptHandle.boundingBox()
        await page.mouse.move(wideHandle.x + wideHandle.width / 2, wideHandle.y + 100)
        await page.mouse.down()
        await page.mouse.move(wideHandle.x + wideHandle.width / 2 + 400, wideHandle.y + 100, { steps: 12 })
        await page.mouse.up()
        await page.waitForFunction(() => document.querySelector('[data-composer-card]').getBoundingClientRect().width >= 1100)
        await addOverflowControls([['Extra mode control', 160], ['Extra quota control', 160], ['Extra review control', 160], ['Extra status control', 160]])
        for (const width of [600, 1920, 600]) {
          await page.setViewportSize({ width, height: 900 })
          if (width === 600) {
            await overflow.waitFor({ state: 'visible', timeout: 5_000 })
            await overflow.click({ timeout: 5_000 }).catch(async error => {
              const state = await page.evaluate(() => ({ slot: document.querySelector('[data-slot="conversation.input.right"]').outerHTML, card: document.querySelector('[data-composer-card]').getBoundingClientRect().toJSON() }))
              throw new Error(`Bottom ${width}px overflow trigger must remain clickable: ${JSON.stringify(state)}`, { cause: error })
            })
            await assertOverflowSurface(`Bottom ${width}px`)
            for (const label of ['Extra mode control', 'Extra quota control', 'Extra review control', 'Extra status control']) {
              const control = page.getByRole('button', { name: label, exact: true })
              await control.waitFor({ state: 'visible' })
              const box = await control.boundingBox()
              assert.ok(box.x >= 8 && box.x + box.width <= width - 8 && box.y >= 0 && box.y + box.height <= 901, `Bottom overflow popup must stay within the viewport: ${JSON.stringify(box)}`)
              await control.hover()
              await control.click()
              await assertOriginalCallback(label)
              await control.waitFor({ state: 'visible' })
            }
            await overflow.click()
          } else {
            await overflow.waitFor({ state: 'detached', timeout: 5_000 }).catch(async error => {
              const state = await page.locator('[data-composer-card]').evaluate(card => ({ card: card.getBoundingClientRect().toJSON(), row: card.querySelector('[data-input-scroll]').nextElementSibling.getBoundingClientRect().toJSON(), transcript: document.querySelector('[data-chat-flow]').getBoundingClientRect().toJSON() }))
              throw new Error(`Wide bottom toolbar must restore extra controls: ${JSON.stringify(state)}`, { cause: error })
            })
            await page.getByRole('button', { name: 'Extra quota control', exact: true }).waitFor({ state: 'visible' })
          }
          assert.equal(await page.locator('[data-dsh-composer-measuring]').count(), 0, 'Bottom measurement styles must be removed before paint')
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'Bottom right-slot overflow must not overflow the viewport')
        }
        await page.locator('[data-overflow-regression]').evaluateAll(elements => elements.forEach(el => el.remove()))
        await page.setViewportSize({ width: 1920, height: 900 })
        console.log('verified bottom extra controls: narrow collapse, bounded popup, wide restoration and repeat collapse')
        assert.equal(pageErrors.length, 0, pageErrors.join('\n'))
        if (artifactDirectory !== undefined) await page.screenshot({ path: join(artifactDirectory, 'active-split.png') })
        console.log('verified real session: two-column geometry, dragging, bottom/auto switching, narrow-width disabling, and settled answer scrolling')
      }
      await context.close()
      return metrics
    }

    const failures = []
    for (const placement of withoutComposer ? ['bottom'] : ['bottom', 'right']) failures.push(...await inspectSessionSwitch(placement))
    assert.equal(failures.length, 0, `Session switching must preserve semantic reader positions: ${JSON.stringify(failures)}`)
    if (!sessionSwitchOnly) {
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
    }
  } catch (error) {
    if (artifactDirectory !== undefined) {
      await mkdir(artifactDirectory, { recursive: true })
      const page = browser.contexts().flatMap(context => context.pages()).at(-1)
      if (page !== undefined) await page.screenshot({ path: join(artifactDirectory, `failure-${browserName}.png`) })
    }
    throw error
  } finally {
    await browser.close()
  }

  console.log(`verified DSH ${dshVersion}/${browserName}: ${sessionSwitchOnly ? 'semantic session-switch reader positions' : 'isolated install, settings, Hero geometry, semantic session switches, official click/Enter follow, history browsing, and side/bottom overflow'}`)
} finally {
  if (server !== undefined && server.exitCode === null && !server.killed) {
    server.kill('SIGTERM')
    await once(server, 'exit')
  }
  await rm(home, { force: true, recursive: true })
}
