import { chromium } from "playwright-core"
export const PORTS = { orig: 5171, migrated: 5172, patched: 5173 }
export async function launch() {
  return chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] })
}
export async function open(b, variant, scenario, dir, extra = "", vp = { width: 1100, height: 800 }) {
  const p = await b.newPage({ viewport: vp })
  await p.goto(`http://127.0.0.1:${PORTS[variant]}/?scenario=${scenario}&dir=${dir}${extra}`, { waitUntil: "networkidle" })
  await p.waitForTimeout(300)
  return p
}
// Cumulative rotation (deg, 0..359) of an element through its ancestor chain.
export const CUM_ROT = `(el) => {
  let deg = 0
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    const cs = getComputedStyle(n)
    if (cs.rotate && cs.rotate !== "none") { const m = cs.rotate.match(/(-?[\\d.]+)deg/); if (m) deg += parseFloat(m[1]) }
    if (cs.scale && cs.scale !== "none" && parseFloat(cs.scale.split(" ")[0]) < 0) deg += 180
    if (cs.transform && cs.transform !== "none") { const m = cs.transform.match(/matrix\\(([^)]+)\\)/); if (m) { const [a,b] = m[1].split(",").map(Number); deg += Math.atan2(b,a)*180/Math.PI } }
  }
  return ((Math.round(deg) % 360) + 360) % 360
}`
