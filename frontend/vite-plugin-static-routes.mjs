import fs from 'node:fs'
import path from 'node:path'

const DATA_FILE = /^(.+)_cheatsheet(_hi)?\.json$/

/** Read public/cheatsheets/*.json -> { topic: { en: [ids], hi: [ids] } } */
function readTopics(dataDir) {
  const topics = {}
  for (const file of fs.readdirSync(dataDir)) {
    const match = file.match(DATA_FILE)
    if (!match) continue
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
    const lang = match[2] ? 'hi' : 'en'
    topics[match[1]] ??= {}
    topics[match[1]][lang] = (data.sections ?? []).map((s) => s.id).filter(Boolean)
  }
  return topics
}

/**
 * Small build-time helpers for hosting on GitHub Pages.
 *
 * 1. Static routes. Pages cannot rewrite unknown URLs to index.html the way Vercel did, so a hard refresh
 *    on /java/collections would 404. After the build the built index.html is copied to every route the SPA
 *    serves (/<topic>/index.html and /<topic>/<sectionId>/index.html) so deep links return a real 200 page,
 *    and to 404.html so any other unknown URL still boots the app (which then renders its own 404 view).
 *
 * 2. cheatsheets/manifest.json — `{ java: { en: 26, hi: 20 }, ... }` chapter counts derived from the data,
 *    so the Home page never advertises a hard-coded number that drifts from the content.
 *    Served by the dev server too.
 */
export default function staticRoutes() {
  let outDir
  let publicDir

  const manifestOf = (topics) =>
    Object.fromEntries(
      Object.entries(topics).map(([topic, langs]) => [
        topic,
        { en: langs.en?.length ?? 0, hi: langs.hi?.length ?? langs.en?.length ?? 0 },
      ]),
    )

  return {
    name: 'static-routes',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
      publicDir = path.resolve(config.root, config.publicDir)
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.split('?')[0].endsWith('/cheatsheets/manifest.json')) return next()
        const source = JSON.stringify(manifestOf(readTopics(path.join(publicDir, 'cheatsheets'))))
        res.setHeader('Content-Type', 'application/json')
        res.end(source)
      })
    },
    generateBundle() {
      const topics = readTopics(path.join(publicDir, 'cheatsheets'))
      this.emitFile({
        type: 'asset',
        fileName: 'cheatsheets/manifest.json',
        source: JSON.stringify(manifestOf(topics)),
      })
    },
    writeBundle() {
      const indexHtml = path.join(outDir, 'index.html')
      const copyTo = (...segments) => {
        const target = path.join(outDir, ...segments)
        fs.mkdirSync(path.dirname(target), { recursive: true })
        fs.copyFileSync(indexHtml, target)
      }

      copyTo('404.html')

      for (const [topic, langs] of Object.entries(readTopics(path.join(publicDir, 'cheatsheets')))) {
        copyTo(topic, 'index.html')
        for (const id of new Set([...(langs.en ?? []), ...(langs.hi ?? [])])) copyTo(topic, id, 'index.html')
      }
    },
  }
}
