import { afterEach, describe, expect, it } from 'vitest'
import {
  readSessionLayout,
  writeSessionLayout,
} from '../src/client/settings-storage.ts'

const SESSION_LAYOUTS_KEY = 'dsh.composer-split.session-layouts'

afterEach(() => { localStorage.clear() })

describe('session layout storage', () => {
  it('keeps placement and width independent for each conversation', () => {
    writeSessionLayout('session-a', { placement: 'right', width: 520 })
    writeSessionLayout('session-b', { placement: 'bottom' })

    expect(readSessionLayout('session-a')).toEqual({ placement: 'right', width: 520 })
    expect(readSessionLayout('session-b')).toEqual({ placement: 'bottom' })
  })

  it('does not let malformed stored values override a session layout', () => {
    localStorage.setItem(SESSION_LAYOUTS_KEY, JSON.stringify({
      valid: { placement: 'right', width: 480 },
      malformed: { placement: 'left', width: -3 },
    }))

    expect(readSessionLayout('valid')).toEqual({ placement: 'right', width: 480 })
    expect(readSessionLayout('malformed')).toEqual({})
  })
})
