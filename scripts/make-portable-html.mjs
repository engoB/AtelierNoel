import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sourcePath = resolve('standalone/index.html')
const outputPath = resolve('atelier-du-pere-noel.html')
let html = readFileSync(sourcePath, 'utf8')

const moduleMarker = '<script type="module" crossorigin>'
const plainMarker = '<script>window.addEventListener("DOMContentLoaded",()=>{'
html = html.replace(moduleMarker, plainMarker)
html = html.replaceAll('import.meta.resolve', 'globalThis.__atelierImportResolve')
html = html.replaceAll('import.meta.url', 'document.baseURI')

const scriptStart = html.indexOf(plainMarker)
const scriptEnd = html.indexOf('</script>', scriptStart)
if (scriptStart < 0 || scriptEnd < 0) throw new Error('Impossible de localiser le script autonome.')
html = `${html.slice(0, scriptEnd)}});${html.slice(scriptEnd)}`

writeFileSync(outputPath, html)
console.log(`HTML autonome créé : ${outputPath}`)
