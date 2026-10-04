import { launch, open, CUM_ROT } from "./lib.mjs"
const b = await launch()
const out = {}
for (const variant of ["orig", "migrated", "patched"]) {
  for (const dir of ["ltr", "rtl"]) {
    const p = await open(b, variant, "icons", dir)
    out[`${variant}/${dir}`] = await p.evaluate(`(() => {
      const rot = ${CUM_ROT}
      const where = (el) => el.closest("[data-testid=breadcrumb]") ? "breadcrumb" : el.closest("[data-testid=pagination]") ? "pagination" : el.closest("[data-testid=dd]") ? "dropdown-sub" : el.closest("[data-testid=calendar], .rdp-root") ? "calendar" : "other"
      return [...document.querySelectorAll("svg[class*=lucide-chevron-]")]
        .map(s => ({ in: where(s), glyph: [...s.classList].find(c => /^lucide-chevron-(left|right)$/.test(c))?.replace("lucide-chevron-",""), rot: rot(s) }))
        .filter(x => x.glyph && x.in !== "other")
    })()`)
    await p.close()
  }
}
await b.close()
const fmt = (a) => a.map(x => `${x.in}:${x.glyph}@${x.rot}`).join("  ")
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(14), fmt(v))
