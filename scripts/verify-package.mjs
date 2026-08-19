import { readFile } from 'node:fs/promises'
import { access } from 'node:fs/promises'

const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')

const required = [
  'lib/index.js',
  'lib/client.js',
  'lib/invariant.js',
  'cordis.patch.yml',
  'assets/icon.svg',
  'assets/screenshots/hero-en.png',
  'assets/screenshots/hero-zh.png',
  'README.md',
]

for (const file of required) await access(new URL(`../${file}`, import.meta.url))
if (manifest.dsh?.bundle?.patch !== './cordis.patch.yml') throw new Error('dsh.bundle.patch must point to ./cordis.patch.yml')
if (manifest.dsh?.client?.platform !== 'web') throw new Error('dsh.client.platform must be web')
if (!patch.includes("name: 'dsh-composer-layout'")) throw new Error('cordis.patch.yml must mount the package')
const client = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
if (!client.includes('id: "dsh-composer-layout"')) throw new Error('browser artifact id does not match package name')
console.log(`verified ${manifest.name}@${manifest.version}`)
