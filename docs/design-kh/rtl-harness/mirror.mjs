// Geometric mirror test: every component part in RTL should sit on the mirror image
// of its LTR position around the viewport centre (same size, same height).
import { launch, open } from "./lib.mjs"
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
const probe = await open(b, "patched", "icons", "ltr")
const names = await probe.evaluate(() => window.__GALLERY__); await probe.close()
const list = only ?? names
const table = {}, detail = {}

for (const name of list) {
  for (const v of variants) {
    const data = {}
    for (const d of ["ltr", "rtl"]) {
      const p = await open(b, v, `g:${name}`, d)
      await p.waitForTimeout(900)
      data[d] = await p.evaluate(COLLECT)
      if (v === "patched" && process.env.SHOTS) await p.screenshot({ path: `shots/g-${name}-${d}.png` })
      await p.close()
    }
    const L = data.ltr.rows.filter(r => r.w > 1 && r.h > 1), R = data.rtl.rows.filter(r => r.w > 1 && r.h > 1)
    if (L.length !== R.length || L.some((r, i) => r.sig !== R[i].sig)) {
      table[name] ??= {}; table[name][v] = `structure differs (${L.length} vs ${R.length})`; continue
    }
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

console.log("scenario".padEnd(16), variants.map(v => v.padEnd(10)).join(""))
for (const [name, row] of Object.entries(table)) console.log(name.padEnd(16), variants.map(v => String(row[v]).padEnd(10)).join(""))
console.log("\nROOT VIOLATIONS IN PATCHED (dx = offset from the mirrored position, px)")
for (const [name, roots] of Object.entries(detail)) {
  if (!roots.length) continue
  console.log(`\n${name}`); for (const r of roots.slice(0, 6)) console.log(`   ${r.sig.padEnd(34)} dx:${r.dx}  dy:${r.dy}  dw:${r.dw}`)
}
