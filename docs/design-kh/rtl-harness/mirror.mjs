// Geometric mirror test: every component part in RTL should sit on the mirror image
// of its LTR position around the viewport centre (same size, same height).
import { launch, open, PORTS } from "./lib.mjs"
const TOL = 2
const only = process.env.ONLY?.split(",")
const variants = (process.env.VARIANTS ?? "orig,migrated,patched").split(",")

const COLLECT = `(() => {
  const SEL = "[data-slot], svg, input, textarea, button, label, th, td, li, select, option, [role]"
  const all = [...document.querySelectorAll(SEL)].filter(e => !(e.parentElement && e.parentElement.closest("svg")))
  const idx = new Map(all.map((e, i) => [e, i]))
  const rows = all.map((e, i) => {
    let p = e.parentElement, parent = -1
    while (p) { if (idx.has(p)) { parent = idx.get(p); break } p = p.parentElement }
    const r = e.getBoundingClientRect()
    const slot = e.getAttribute("data-slot") || e.getAttribute("role") || ""
    return { i, parent, sig: e.tagName.toLowerCase() + (slot ? "[" + slot + "]" : ""), x: r.x, y: r.y, w: r.width, h: r.height }
  })
  return { W: innerWidth, rows }
})()`

const b = await launch()
// First load of a fresh Vite server may trigger a dependency re-optimisation and a page
// reload, so warm every server up and wait for the gallery list instead of reading it once.
for (const v of variants) {
  const warm = await b.newPage()
  await warm.goto(`http://127.0.0.1:${PORTS[v]}/?scenario=g:accordion&dir=ltr`, { waitUntil: "networkidle" })
  await warm.waitForFunction(() => window.__GALLERY__?.length, null, { timeout: 60000 })
  await warm.waitForTimeout(1500)
  await warm.close()
}
const probe = await b.newPage()
await probe.goto(`http://127.0.0.1:${PORTS[variants.at(-1)]}/?scenario=icons&dir=ltr`, { waitUntil: "networkidle" })
await probe.waitForFunction(() => window.__GALLERY__?.length, null, { timeout: 60000 })
const names = await probe.evaluate(() => window.__GALLERY__); await probe.close()
const list = only ?? names
const table = {}, detail = {}, ltrRows = {}, ltrReg = {}
let failed = false

for (const name of list) {
  for (const v of variants) {
    const data = {}
    for (const d of ["ltr", "rtl"]) {
      const errs = []
      const p = await b.newPage({ viewport: { width: 1100, height: 800 } })
      p.on("pageerror", (e) => errs.push(e.message.slice(0, 160)))
      p.on("response", (r) => { if (r.status() >= 500) errs.push(`HTTP ${r.status()} ${new URL(r.url()).pathname}`) })
      await p.goto(`http://127.0.0.1:${PORTS[v]}/?scenario=g:${name}&dir=${d}`, { waitUntil: "networkidle" })
      await p.waitForTimeout(1000)
      data[d] = await p.evaluate(COLLECT)
      data[d].errs = errs
      if (v === "patched" && process.env.SHOTS) await p.screenshot({ path: `shots/g-${name}-${d}.png` })
      await p.close()
    }
    const L = data.ltr.rows.filter(r => r.w > 1 && r.h > 1), R = data.rtl.rows.filter(r => r.w > 1 && r.h > 1)
    // An empty or crashed page is a test failure, never a pass.
    const errs = [...data.ltr.errs, ...data.rtl.errs]
    if (errs.length || L.length < 1 || R.length < 1) {
      table[name] ??= {}; table[name][v] = `NO RENDER (${L.length}/${R.length} parts) ${errs[0] ?? ""}`.trim(); failed = true; continue
    }
    if (L.length !== R.length || L.some((r, i) => r.sig !== R[i].sig)) {
      table[name] ??= {}; table[name][v] = `structure differs (${L.length} vs ${R.length})`; continue
    }
    ;(ltrRows[name] ??= {})[v] = L
    const W = data.ltr.W
    const bad = new Set(), info = {}
    L.forEach((l, k) => {
      const r = R[k]
      const dx = Math.round(r.x - (W - (l.x + l.w))), dy = Math.round(r.y - l.y), dw = Math.round(r.w - l.w)
      if (Math.abs(dx) > TOL || Math.abs(dy) > TOL || Math.abs(dw) > TOL) { bad.add(l.i); info[l.i] = { sig: l.sig, dx, dy, dw } }
    })
    // root causes only: a violating part whose nearest collected ancestor is fine
    const roots = L.filter(l => bad.has(l.i) && !bad.has(l.parent)).map(l => info[l.i])
    table[name] ??= {}; table[name][v] = roots.length
    if (v === "patched") detail[name] = roots
  }
}
await b.close()

// LTR regression: the patched component must lay out exactly like the original in LTR.
for (const name of Object.keys(ltrRows)) {
  const o = ltrRows[name].orig, p = ltrRows[name].patched
  if (!o || !p) continue
  if (o.length !== p.length || o.some((r, i) => r.sig !== p[i].sig)) { ltrReg[name] = "structure differs"; continue }
  const bad = new Set()
  o.forEach((r, i) => { const q = p[i]; if (Math.abs(q.x - r.x) > TOL || Math.abs(q.y - r.y) > TOL || Math.abs(q.w - r.w) > TOL || Math.abs(q.h - r.h) > TOL) bad.add(r.i) })
  ltrReg[name] = o.filter(r => bad.has(r.i) && !bad.has(r.parent)).length
}
console.log("\nLTR regression (patched vs orig, root violations):")
const regs = Object.entries(ltrReg)
console.log(regs.every(([, n]) => n === 0) ? `  none across ${regs.length} components` : regs.filter(([, n]) => n !== 0).map(([k, n]) => `  ${k}: ${n}`).join("\n"))

console.log("scenario".padEnd(16), variants.map(v => v.padEnd(10)).join(""))
for (const [name, row] of Object.entries(table)) console.log(name.padEnd(16), variants.map(v => String(row[v]).padEnd(10)).join(""))
console.log("\nROOT VIOLATIONS IN PATCHED (dx = offset from the mirrored position, px)")
for (const [name, roots] of Object.entries(detail)) {
  if (!roots.length) continue
  console.log(`\n${name}`); for (const r of roots.slice(0, 6)) console.log(`   ${r.sig.padEnd(34)} dx:${r.dx}  dy:${r.dy}  dw:${r.dw}`)
}
if (failed) { console.error("\nFAIL: some scenarios did not render; their results above are not valid."); process.exit(2) }
