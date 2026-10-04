import { launch, open, CUM_ROT } from "./lib.mjs"
const b = await launch()
for (const v of ["orig", "migrated", "patched"]) for (const d of ["ltr", "rtl"]) {
  const p = await open(b, v, "sidebar", d, "&side=left", { width: 1280, height: 700 })
  const r = await p.evaluate(`(() => { const rot = ${CUM_ROT}; return rot(document.querySelector("[data-sidebar=trigger] svg")) })()`)
  console.log(`${v}/${d}`.padEnd(14), `sidebar toggle icon:${r}°`)
  await p.close()
}
await b.close()
