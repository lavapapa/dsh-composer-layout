import assert from 'node:assert/strict'
import test from 'node:test'

import { Config, apply, name } from '../lib/index.js'

test('host plugin exposes live Composer settings through its Config', () => {
  assert.equal(name, 'composer-layout')
  assert.equal(typeof apply, 'function')
  assert.equal(Config.meta.volatile, true)
  assert.deepEqual(Object.keys(Config.dict), [
    'defaultPlacement', 'autoThreshold', 'rememberPlacement',
    'bottomHandleHoverOnly', 'defaultWidthPreset',
  ])
})
