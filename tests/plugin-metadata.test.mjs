import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

test('publishes the icon and localized metadata consumed by DSH Plugin Manager', async () => {
  const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
  assert.equal(manifest.icon, 'assets/icon.svg')
  assert.ok(manifest.files.includes(manifest.icon))
  assert.equal(manifest.exports['./locale/*.json'], './locale/*.json')
  assert.ok(manifest.files.includes('locale/*.json'))
  for (const language of ['en', 'zh']) {
    const resource = new URL(import.meta.resolve(`dsh-composer-layout/locale/${language}.json`))
    const { meta } = JSON.parse(await readFile(resource, 'utf8'))
    assert.ok(meta.title.trim())
    assert.ok(meta.description.trim())
    assert.ok(!meta.description.includes('Unpublished'))
  }
  const icon = await readFile(new URL(manifest.icon, root), 'utf8')
  assert.match(icon, /<svg\b/)
})
