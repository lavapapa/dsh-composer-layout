import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { include: pairs } = JSON.parse(readFileSync(join(root, 'scripts/dsh-compat-matrix.json'), 'utf8'))
const failed = []
// 顺序执行，避免隔离实例争用同一个端口；任一组合失败仍运行其余组合。
for (const pair of pairs) {
  const label = `${pair.channel}: plugin=${pair.plugin} DSH=${pair.dsh} browser=${pair.browser}`
  console.log(`Checking ${label}`)
  const env = { ...process.env, DSH_VERSION: pair.dsh, DSH_BROWSER: pair.browser }
  if (env.DSH_COMPAT_ARTIFACT_DIR !== undefined) {
    env.DSH_COMPAT_ARTIFACT_DIR = join(env.DSH_COMPAT_ARTIFACT_DIR, `${pair.channel}-${pair.plugin}-${pair.dsh}-${pair.browser}`)
  }
  const result = spawnSync(process.execPath, [join(root, 'scripts', pair.script)], { cwd: root, env, stdio: 'inherit' })
  if (result.status !== 0) failed.push(label)
}
if (failed.length > 0) {
  console.error(`Failed compatibility pairs:\n${failed.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`Verified all ${pairs.length} plugin/DSH/browser pairs`)
}
