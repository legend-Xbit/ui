import { launch, open, CUM_ROT } from "./lib.mjs"
const b = await launch()
const rotOf = (p, sel) => p.evaluate(`(() => { const rot = ${CUM_ROT}; const s = document.querySelector(${JSON.stringify(sel)} + " svg.lucide-chevron-right"); return s ? rot(s) : "missing" })()`)
for (const v of ["orig", "migrated", "patched"]) for (const d of ["ltr", "rtl"]) {
  const p = await open(b, v, "menus", d)
  await p.click("[data-testid=ctx-area]", { button: "right" }); await p.waitForTimeout(250)
  const ctx = await rotOf(p, "[data-slot=context-menu-sub-trigger]"); await p.keyboard.press("Escape")
  await p.click("[data-testid=mb-trigger]"); await p.waitForTimeout(250)
  const mb = await rotOf(p, "[data-slot=menubar-sub-trigger]")
  console.log(`${v}/${d}`.padEnd(14), `context-menu sub chevron:${ctx}°  menubar sub chevron:${mb}°`)
  await p.close()
}
await b.close()
