#!/usr/bin/env node
// Static RTL audit for a directory of shadcn-style component files.
// Usage: node rtl-audit.mjs <dir>
// Reports physical-direction Tailwind tokens that a logical/RTL migration should
// have removed, plus directional icons that are not flipped. It does NOT render
// anything, so treat results as CANDIDATES. The browser harness (rtl-harness/) is
// the authority. Known false positives measured there: calendar chevrons (flipped
// by CSS in classNames) and slide-* tokens in navigation-menu / sheet (those are
// correct as they are).
import fs from "node:fs"
import path from "node:path"

const dir = process.argv[2]
if (!dir) {
  console.error("usage: node rtl-audit.mjs <dir>")
  process.exit(1)
}

const PHYSICAL = [
  [/^-?(ml|mr|pl|pr|scroll-ml|scroll-mr|scroll-pl|scroll-pr)-/, "margin/padding"],
  [/^-?(left|right)-/, "left/right inset"],
  [/^text-(left|right)$/, "text-align"],
  [/^border-[lr](-\d+|-\[.*\]|-px|-0)?$/, "border-l/r"],
  [/^rounded-(l|r|tl|tr|bl|br)(-.*)?$/, "rounded corner"],
  [/^(float|clear)-(left|right)$/, "float/clear"],
  [/^origin-(left|right|top-left|top-right|bottom-left|bottom-right)$/, "origin"],
  [/^slide-(in-from|out-to)-(left|right)(-.*)?$/, "slide animation"],
  [/^-?translate-x-/, "translate-x"],
  [/^(space|divide)-x(-.*)?$/, "space/divide-x"],
]
// Matches the opening of the tag only: JSX props often span several lines.
const DIRECTIONAL_ICON =
  /<(Chevrons?(Left|Right)|Arrow(Big)?(Left|Right)|Panel(Left|Right)(Close|Open)?|Caret(Left|Right)|Move(Left|Right))(Icon)?\b/

const residual = {}
const legit = { physicalSideVariant: 0, rtlPaired: 0 }
const examples = {}
const icons = []

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
  const lines = fs.readFileSync(path.join(dir, file), "utf8").split("\n")
  lines.forEach((line, i) => {
    const icon = line.match(DIRECTIONAL_ICON)
    // Look a few lines ahead so multi-line JSX props are covered.
    const tag = lines.slice(i, i + 4).join(" ")
    if (icon && !/rtl:rotate-180/.test(tag)) {
      icons.push(`${file}:${i + 1}  ${icon[0].trim()}`)
    }
    for (const m of line.matchAll(/[^\s"'`{}(),]+/g)) {
      const token = m[0]
      // split variants on ':' that is not inside [...]
      const parts = token.split(/:(?![^[]*\])/)
      const utility = parts.at(-1)
      const variants = parts.slice(0, -1)
      if (variants.some((v) => v.startsWith("rtl:") || v.startsWith("ltr:"))) continue
      for (const [re, label] of PHYSICAL) {
        if (!re.test(utility)) continue
        if (variants.some((v) => /data-\[side=(left|right)\]/.test(v))) {
          legit.physicalSideVariant++
        } else if (/translate-x|space-x|divide-x/.test(label) && /rtl:/.test(line)) {
          legit.rtlPaired++
        } else {
          residual[label] ??= {}
          residual[label][file] = (residual[label][file] ?? 0) + 1
          ;(examples[label] ??= []).push(`${file}:${i + 1}  ${token}`)
        }
        break
      }
    }
  })
}

console.log(JSON.stringify({ legit, residual }, null, 2))
for (const [label, list] of Object.entries(examples)) {
  console.log(`\n[${label}]\n  ${list.join("\n  ")}`)
}
console.log(`\n[unflipped directional icons: ${icons.length}]\n  ${icons.join("\n  ")}`)
