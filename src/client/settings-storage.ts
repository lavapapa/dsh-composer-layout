import type {
  ComposerLayoutPlacement, ComposerLayoutSettings,
} from '../settings.ts'

const SETTINGS_KEY = 'dsh.composer-split.settings'
const SESSION_LAYOUTS_KEY = 'dsh.composer-split.session-layouts'

export interface ComposerSessionLayout {
  placement?: ComposerLayoutPlacement
  width?: number
}

export function readLocalSettings(): Partial<ComposerLayoutSettings> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}')
    return parsed !== null && typeof parsed === 'object' ? parsed as Partial<ComposerLayoutSettings> : {}
  } catch {
    return {}
  }
}

export function writeLocalSetting<K extends keyof ComposerLayoutSettings>(
  field: K,
  value: ComposerLayoutSettings[K],
): void {
  try {
    const next = { ...readLocalSettings(), [field]: value }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  } catch {}
}

function readSessionLayouts(): Record<string, ComposerSessionLayout> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SESSION_LAYOUTS_KEY) ?? '{}')
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as Record<string, ComposerSessionLayout>
  } catch {
    return {}
  }
}

/** Read the layout override belonging to one conversation session. */
export function readSessionLayout(sessionId: string): ComposerSessionLayout {
  const value = readSessionLayouts()[sessionId]
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return {}
  return {
    ...value.placement === 'bottom' || value.placement === 'right'
      ? { placement: value.placement }
      : {},
    ...typeof value.width === 'number' && Number.isFinite(value.width) && value.width > 0
      ? { width: value.width }
      : {},
  }
}

/** Persist the current placement and width for one conversation session. */
export function writeSessionLayout(sessionId: string, value: ComposerSessionLayout): void {
  try {
    const layouts = readSessionLayouts()
    layouts[sessionId] = value
    localStorage.setItem(SESSION_LAYOUTS_KEY, JSON.stringify(layouts))
  } catch {}
}
