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
const dshVersion = process.env.DSH_VERSION ?? '0.1.2-rc.1'
const dshPackage = `@deepseek-ai/dsh@${dshVersion}`
const browserName = process.env.DSH_BROWSER ?? 'chromium'
assert.ok(['chromium', 'webkit'].includes(browserName), 'DSH_BROWSER must be chromium or webkit')
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

  const testSessionId = 'composer-layout-compat-session'
  const testWorkspace = join(home, 'workspace')
  await mkdir(testWorkspace)
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
    async function inspectHero(defaultPlacement, viewport) {
      const context = await browser.newContext({ viewport, locale: 'en-US' })
      const page = await context.newPage()
      const pageErrors = []
      page.on('pageerror', error => pageErrors.push(error.message))
      page.on('console', message => { if (message.type() === 'error') pageErrors.push(message.text()) })
      await page.addInitScript((placement) => {
        localStorage.setItem('dsh.composer-split.settings', JSON.stringify({
          defaultPlacement: placement,
          rememberPlacement: true,
          bottomHandleHoverOnly: false,
          defaultWidthPreset: 'medium',
        }))
      }, defaultPlacement)
      // 仅在隔离浏览器暴露已加载插件的真实 Context，用公开 sessions.open
      // 精确打开测试会话；不替换 RPC、会话投影或业务组件。
      await page.route('**/plugins/**', async route => {
        if (!route.request().url().includes('dsh-composer-layout/client.js')) return route.continue()
        const response = await route.fetch()
        const body = (await response.text()).replace('function apply(ctx) {\n  const settingsService', 'function apply(ctx) {\n  document.documentElement.__composerTestContext = ctx;\n  const settingsService')
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
        await page.getByRole('button', { name: 'Plugins', exact: true }).click()
        await page.getByText('Composer Layout', { exact: true }).click()
        const settingsPanel = page.locator('section[aria-label="Composer Layout"]')
        await settingsPanel.waitFor({ state: 'visible' })
        await settingsPanel.getByRole('combobox').first().selectOption('auto')
        await settingsPanel.getByRole('slider').fill('0.75')
        assert.equal(await settingsPanel.getByRole('slider').inputValue(), '0.75')
        console.log('verified Composer Layout settings registration and automatic threshold interaction')
        await page.getByRole('button', { name: 'Close', exact: true }).click()
        await page.getByRole('button', { name: 'Settings', exact: true }).click()
        await page.getByRole('button', { name: 'Plugins', exact: true }).click()
        await page.getByText('Composer Layout', { exact: true }).click()
        assert.equal(await settingsPanel.getByRole('combobox').first().inputValue(), 'auto')
        assert.equal(await settingsPanel.getByRole('slider').inputValue(), '0.75')
        await page.getByRole('button', { name: 'Close', exact: true }).click()
        await page.setViewportSize({ width: 1920, height: 900 })
        await page.evaluate(async id => { await document.documentElement.__composerTestContext.sessions.open(id) }, testSessionId)
        await page.locator('[data-dsh-composer-split-adapter="plugin"]').waitFor({ state: 'attached', timeout: 20_000 })
        await page.getByText('Paragraph 100: a long answer for independent scrolling verification.', { exact: true }).waitFor({ state: 'attached', timeout: 20_000 })
        await page.locator('[data-dsh-composer-split-active="true"]').waitFor({ state: 'attached', timeout: 20_000 })
        const geometry = await page.locator('[data-dsh-composer-split-body]').evaluate(body => {
          const chat = body.querySelector('[data-dsh-composer-split-chat]').getBoundingClientRect()
          const composer = body.querySelector('[data-dsh-composer-split-pane]').getBoundingClientRect()
          return { chat: chat.toJSON(), composer: composer.toJSON(), display: getComputedStyle(body).display }
        })
        assert.equal(geometry.display, 'grid')
        assert.ok(geometry.chat.width >= 320 && geometry.composer.width >= 360)
        assert.ok(geometry.chat.right <= geometry.composer.left + 1, 'Chat and Composer must not overlap')
        const editor = page.locator('[data-composer-input][contenteditable="true"]')
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
        const chatPosition = await page.locator('[data-dsh-composer-split-chat]').evaluate(el => { el.scrollTop = 200; return el.scrollTop })
        await editor.fill('Long native editor draft line.\n'.repeat(100))
        const inputScroll = page.locator('[data-dsh-composer-split-pane] [data-input-scroll]')
        assert.ok(await inputScroll.evaluate(el => el.scrollHeight > el.clientHeight + 500), 'Long draft must overflow the input scrollport')
        await inputScroll.evaluate(el => { el.scrollTop = 0 })
        assert.equal(await inputScroll.evaluate(el => el.scrollTop), 0, 'Wheel test must start at the top rather than at the fill caret')
        const inputBox = await inputScroll.boundingBox()
        await page.mouse.move(inputBox.x + inputBox.width / 2, inputBox.y + inputBox.height / 2)
        await page.mouse.wheel(0, 500)
        await page.waitForFunction(() => document.querySelector('[data-dsh-composer-split-pane] [data-input-scroll]').scrollTop > 0)
        assert.equal(await page.locator('[data-dsh-composer-split-chat]').evaluate(el => el.scrollTop), chatPosition, 'Draft scrolling must not move Chat')
        assert.ok(await page.locator('[data-dsh-composer-split-pane]').evaluate(el => el.scrollHeight <= el.clientHeight + 2), 'Long draft must not create an outer Composer scrollport')
        await editor.fill('Native editor selection surface')
        await page.setViewportSize({ width: 1920, height: 600 })
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
        const resized = await page.locator('[data-dsh-composer-split-pane]').boundingBox()
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
        const scroll = page.locator('[data-dsh-composer-split-chat]')
        await scroll.evaluate(el => { el.scrollTop = 200; el.dispatchEvent(new Event('scroll')) })
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        assert.ok((await scroll.evaluate(el => el.scrollTop)) < 300, 'Reading near the answer start must not jump to the bottom')
        assert.equal(pageErrors.length, 0, pageErrors.join('\n'))
        if (artifactDirectory !== undefined) await page.screenshot({ path: join(artifactDirectory, 'active-split.png') })
        console.log('verified real session: two-column geometry, dragging, bottom/auto switching, narrow-width disabling, and settled answer scrolling')
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

  console.log(`verified DSH ${dshVersion}: isolated install, settings, Hero geometry, and real-session layout interactions`)
} finally {
  if (server !== undefined && server.exitCode === null && !server.killed) {
    server.kill('SIGTERM')
    await once(server, 'exit')
  }
  await rm(home, { force: true, recursive: true })
}
