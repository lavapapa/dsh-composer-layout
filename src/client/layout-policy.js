/** Shared responsive limits for the plugin-owned Composer layout. */
export const MIN_COMPOSER_WIDTH = 360
export const MIN_CHAT_WIDTH = 320
export const SIDE_LAYOUT_BREAKPOINT = MIN_COMPOSER_WIDTH + MIN_CHAT_WIDTH

/** Keep a usable Chat column while resizing the right-hand Composer. */
export function clampComposerWidth(width, bodyWidth) {
  const largestComposerWidth = Math.max(MIN_COMPOSER_WIDTH, bodyWidth - MIN_CHAT_WIDTH)
  return Math.max(MIN_COMPOSER_WIDTH, Math.min(width, largestComposerWidth))
}

/** Whether both columns can remain usable at the current available width. */
export function canUseSideLayout(bodyWidth) {
  return bodyWidth >= SIDE_LAYOUT_BREAKPOINT
}
