import { readFile, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { transform } from 'lightningcss'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const lib = resolve(root, 'lib')
const clientId = 'dsh-composer-layout'

/** Inline CSS modules into the lazy browser factory DSH loads for a plugin. */
const cssModules = {
  name: 'dsh-css-modules',
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: /\.module\.css$/ }, args => ({
      path: resolve(args.resolveDir, args.path),
      namespace: 'dsh-css-module',
    }))
    pluginBuild.onLoad({ filter: /.*/, namespace: 'dsh-css-module' }, async args => {
      const source = await readFile(args.path)
      const output = transform({
        filename: args.path,
        code: source,
        cssModules: { pattern: '[hash]_[local]' },
        minify: true,
      })
      // lightningcss 不保证导出对象的枚举顺序；固定排序使发布包可重复构建。
      const classes = Object.fromEntries(
        Object.entries(output.exports ?? {})
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([name, entry]) => [name, entry.name]),
      )
      const tagId = `${clientId}/${args.path.split('/').pop()}`
      return {
        contents: [
          `const css = ${JSON.stringify(output.code.toString())};`,
          `const tagId = ${JSON.stringify(tagId)};`,
          "if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']') === null) {",
          '  const tag = document.createElement(\'style\');',
          `  tag.dataset.plugin = ${JSON.stringify(clientId)};`,
          '  tag.dataset.pluginCss = tagId;',
          '  tag.textContent = css;',
          '  document.head.appendChild(tag);',
          '}',
          `export default ${JSON.stringify(classes)};`,
        ].join('\n'),
        loader: 'js',
      }
    })
  },
}

await Promise.all([
  'index.js', 'invariant.js', 'client.js', 'client.js.map',
].map(file => rm(resolve(lib, file), { force: true })))

await Promise.all([
  build({
    entryPoints: [resolve(root, 'src/index.ts')],
    outfile: resolve(lib, 'index.js'),
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    external: ['@deepseek-ai/dsh-settings', '@deepseek-ai/schemastery', '@deepseek-ai/cordis'],
  }),
  build({
    entryPoints: [resolve(root, 'src/invariant.ts')],
    outfile: resolve(lib, 'invariant.js'),
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    external: ['@deepseek-ai/cordis', '@deepseek-ai/dsh-invariants'],
  }),
  build({
    entryPoints: [resolve(root, 'src/client/index.ts')],
    outfile: resolve(lib, 'client.js'),
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    target: 'es2024',
    sourcemap: false,
    loader: { '.webp': 'dataurl' },
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [cssModules],
    banner: { js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(clientId)}, factory: (require) => { var module = { exports: {} }; var exports = module.exports;` },
    footer: { js: 'return module.exports; }});' },
  }),
])
