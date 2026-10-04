import { launch, open, CUM_ROT } from "./lib.mjs"
const b = await launch()
const V = ["orig", "migrated", "patched"], D = ["ltr", "rtl"]
const R = {}
const put = (k, key, val) => ((R[k] ??= {})[key] = val)

// ---------- SHEET: anchored side + slide-in origin ----------
for (const v of V) for (const d of D) {
  const p = await open(b, v, "sheet", d)
  for (const s of ["right", "left"]) {
    await p.evaluate(() => { window.__s = []; window.__run = false
      new MutationObserver(() => { const el = document.querySelector("[data-slot=sheet-content]")
        if (el && !window.__run) { window.__run = true; const t0 = performance.now()
          const tick = () => { const r = el.getBoundingClientRect(); window.__s.push(r.x); if (performance.now() - t0 < 700) requestAnimationFrame(tick) }; tick() } })
        .observe(document.body, { childList: true, subtree: true }) })
    await p.click(`[data-testid=open-${s}]`); await p.waitForTimeout(900)
    const xs = await p.evaluate(() => window.__s)
    const w = 1100, fin = xs.at(-1), first = xs[0]
    const anchored = fin < w / 2 ? "left" : "right"
    const from = Math.abs(first - fin) < 2 ? "?" : first > fin ? "right" : "left"
    put(`sheet side=${s}`, `${v}/${d}`, `anchored:${anchored} enters-from:${from}`)
    if (v === "patched" && d === "rtl") await p.screenshot({ path: `shots/sheet-${s}-patched-rtl.png` })
    await p.keyboard.press("Escape"); await p.waitForTimeout(800)
  }
  await p.close()
}

// ---------- SIDEBAR: container edge + rail centring ----------
for (const v of V) for (const d of D) for (const s of ["left", "right"]) {
  const p = await open(b, v, "sidebar", d, `&side=${s}`, { width: 1280, height: 700 })
  const m = await p.evaluate(() => {
    const c = document.querySelector("[data-slot=sidebar-container]").getBoundingClientRect()
    const r = document.querySelector("[data-slot=sidebar-rail]").getBoundingClientRect()
    return { cx: Math.round(c.x), cw: Math.round(c.width), rc: Math.round(r.x + r.width / 2) }
  })
  const anchored = m.cx + m.cw / 2 < 640 ? "left" : "right"
  const edge = anchored === "left" ? m.cx + m.cw : m.cx
  put(`sidebar side=${s}`, `${v}/${d}`, `anchored:${anchored} rail-off-edge:${m.rc - edge}px`)
  if (v === "patched" && d === "rtl" && s === "right") await p.screenshot({ path: `shots/sidebar-right-patched-rtl.png` })
  await p.close()
}

// ---------- CAROUSEL: shift on Next click / ArrowLeft / ArrowRight, arrow glyph rotation ----------
for (const v of V) for (const d of D) {
  const p = await open(b, v, "carousel", d, "", { width: 1100, height: 700 })
  const slideX = () => p.evaluate(() => document.querySelector("[data-testid=carousel-h-wrap] [data-slide='1']").getBoundingClientRect().x)
  const shiftAfter = async (act) => { const x0 = await slideX(); await act(); await p.waitForTimeout(800); const x1 = await slideX(); return Math.abs(x1 - x0) < 2 ? "none" : x1 > x0 ? "→(+)" : "←(-)" }
  const h = "[data-testid=carousel-h-wrap]"
  const next = await shiftAfter(() => p.click(`${h} [data-slot=carousel-next]`))
  await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(300)
  const keyL = await shiftAfter(async () => { await p.focus(`${h} [data-slot=carousel-next]`); await p.keyboard.press("ArrowLeft") })
  await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(300)
  const keyR = await shiftAfter(async () => { await p.focus(`${h} [data-slot=carousel-next]`); await p.keyboard.press("ArrowRight") })
  const geo = await p.evaluate(`(() => { const rot = ${CUM_ROT}
    const g = (sel) => { const s = document.querySelector(sel + " svg"); return { glyph: [...s.classList].find(c => c.startsWith("lucide-arrow")), rot: rot(s) } }
    const btnX = (sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return r.x + r.width / 2 }
    const mid = (() => { const r = document.querySelector("[data-testid=carousel-h-wrap]").getBoundingClientRect(); return r.x + r.width / 2 })()
    return { hPrev: g("[data-testid=carousel-h-wrap] [data-slot=carousel-previous]"), hNext: g("[data-testid=carousel-h-wrap] [data-slot=carousel-next]"),
             vPrev: g("[data-testid=carousel-v-wrap] [data-slot=carousel-previous]"), vNext: g("[data-testid=carousel-v-wrap] [data-slot=carousel-next]"),
             prevSide: btnX("[data-testid=carousel-h-wrap] [data-slot=carousel-previous]") < mid ? "left" : "right" } })()`)
  put("carousel H shift", `${v}/${d}`, `Next-click:${next}  ArrowLeft:${keyL}  ArrowRight:${keyR}`)
  put("carousel H arrows", `${v}/${d}`, `prev@${geo.prevSide} ${geo.hPrev.glyph}:${geo.hPrev.rot}°  next ${geo.hNext.glyph}:${geo.hNext.rot}°`)
  put("carousel V arrows", `${v}/${d}`, `prev ${geo.vPrev.glyph}:${geo.vPrev.rot}°  next ${geo.vNext.glyph}:${geo.vNext.rot}°`)
  if (v === "patched" && d === "rtl") await p.screenshot({ path: "shots/carousel-patched-rtl.png" })
  await p.close()
}

// ---------- NAVIGATION MENU: where does the entering content really come from? ----------
for (const v of V) for (const d of D) {
  const p = await open(b, v, "nav", d)
  await p.evaluate(() => { window.__nav = null
    new MutationObserver(() => { const el = [...document.querySelectorAll("[data-slot=navigation-menu-content][data-motion^=from-]")][0]
      if (el && !window.__nav) { window.__nav = { motion: el.dataset.motion, xs: [] }; const t0 = performance.now()
        const tick = () => { window.__nav.xs.push(el.getBoundingClientRect().x); if (performance.now() - t0 < 450) requestAnimationFrame(tick) }; tick() } })
      .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-motion"] }) })
  await p.hover("[data-testid=nav-0]"); await p.waitForTimeout(500)
  const x0 = await p.evaluate(() => document.querySelector("[data-testid=nav-0]").getBoundingClientRect().x)
  await p.hover("[data-testid=nav-1]"); await p.waitForTimeout(700)
  const x1 = await p.evaluate(() => document.querySelector("[data-testid=nav-1]").getBoundingClientRect().x)
  const nav = await p.evaluate(() => window.__nav)
  const target = x1 > x0 ? "right of previous item" : "left of previous item"
  let from = "?"
  if (nav) { const first = nav.xs[0], last = nav.xs.at(-1); from = Math.abs(first - last) < 2 ? "no-movement" : first < last ? "left" : "right" }
  put("navigation-menu", `${v}/${d}`, `motion=${nav?.motion ?? "-"}  new item is ${target}  content enters from ${from}`)
  if (v === "patched" && d === "rtl") await p.screenshot({ path: "shots/nav-patched-rtl.png" })
  await p.close()
}
await b.close()
for (const [k, row] of Object.entries(R)) { console.log(`\n## ${k}`); for (const [c, val] of Object.entries(row)) console.log(`  ${c.padEnd(13)} ${val}`) }
