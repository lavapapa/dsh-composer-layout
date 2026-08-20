import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MIN_CHAT_WIDTH,
  MIN_COMPOSER_WIDTH,
  SIDE_LAYOUT_BREAKPOINT,
  canUseSideLayout,
  clampComposerWidth,
} from '../src/client/layout-policy.js'

test('side layout becomes available exactly when both usable columns fit', () => {
  assert.equal(SIDE_LAYOUT_BREAKPOINT, MIN_COMPOSER_WIDTH + MIN_CHAT_WIDTH)
  assert.equal(canUseSideLayout(SIDE_LAYOUT_BREAKPOINT - 1), false)
  assert.equal(canUseSideLayout(SIDE_LAYOUT_BREAKPOINT), true)
})

test('Composer resizing stays within the same responsive limits', () => {
  assert.equal(clampComposerWidth(120, 1_000), MIN_COMPOSER_WIDTH)
  assert.equal(clampComposerWidth(900, 1_000), 680)
  assert.equal(clampComposerWidth(500, 680), MIN_COMPOSER_WIDTH)
})
