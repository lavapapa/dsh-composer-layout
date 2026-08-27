import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import { transform } from 'lightningcss'

const stylesheet = new URL('../src/client/ComposerSplitAction.module.css', import.meta.url)

test('narrow split fallback restores the host Composer card sizing', async () => {
  const source = await readFile(stylesheet)
  const css = transform({
    filename: stylesheet.pathname,
    code: source,
    cssModules: { pattern: '[hash]_[local]' },
    minify: true,
  }).code.toString()
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setContent(`
      <style>${css}</style>
      <div data-dsh-composer-split-active="true" style="width: 664px; height: 600px">
        <div data-dsh-composer-split-body>
          <div data-dsh-composer-split-chat></div>
          <div data-composer-seat data-dsh-composer-split-pane>
            <div data-composer-card>
              <div data-input-scroll></div>
            </div>
          </div>
        </div>
      </div>
    `)
    const card = await page.locator('[data-composer-card]').evaluate(element => {
      const style = getComputedStyle(element)
      return { flex: style.flex }
    })
    assert.equal(card.flex, '0 1 auto')
  } finally {
    await browser.close()
  }
})
