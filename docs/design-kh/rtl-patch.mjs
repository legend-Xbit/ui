#!/usr/bin/env node
// RTL patch for new-york-v4 components AFTER `shadcn migrate rtl` has run.
// Usage: node rtl-patch.mjs <ui-dir>
//
// Every edit must match exactly once, otherwise the script aborts without
// writing: if upstream changes a file, we want a loud failure, not a silent skip.
//
// Contract followed (taken from upstream's own RTL examples in apps/v4/examples):
//   - `side` on Sheet / Sidebar is PHYSICAL; the consumer mirrors it
//     (`side={dir === "rtl" ? "left" : "right"}`), so positioning driven by
//     `side` must stay physical. `migrate rtl` turns it logical, which makes the
//     consumer's mirroring cancel out (double flip).
//   - Carousel direction is passed by the consumer via `opts.direction`.
import fs from "node:fs"
import path from "node:path"

const dir = process.argv[2]
if (!dir) {
  console.error("usage: node rtl-patch.mjs <ui-dir>")
  process.exit(1)
}

// [file, from, to, why]
const EDITS = [
  // --- directional icons that must mirror in RTL --------------------------
  ["breadcrumb.tsx", "{children ?? <ChevronRight />}", '{children ?? <ChevronRight className="rtl:rotate-180" />}', "icon"],
  ["pagination.tsx", "<ChevronLeftIcon />", '<ChevronLeftIcon className="rtl:rotate-180" />', "icon"],
  ["pagination.tsx", "<ChevronRightIcon />", '<ChevronRightIcon className="rtl:rotate-180" />', "icon"],
  ["context-menu.tsx", '<ChevronRightIcon className="ms-auto" />', '<ChevronRightIcon className="ms-auto rtl:rotate-180" />', "icon"],
  ["dropdown-menu.tsx", '<ChevronRightIcon className="ms-auto size-4" />', '<ChevronRightIcon className="ms-auto size-4 rtl:rotate-180" />', "icon"],
  ["menubar.tsx", '<ChevronRightIcon className="ms-auto h-4 w-4" />', '<ChevronRightIcon className="ms-auto h-4 w-4 rtl:rotate-180" />', "icon"],
  ["sidebar.tsx", "<PanelLeftIcon />", '<PanelLeftIcon className="rtl:rotate-180" />', "icon"],
  // Carousel arrows: only mirror when horizontal. The vertical buttons are already
  // rotated 90deg, a second rotation would point them the wrong way.
  ["carousel.tsx", "<ArrowLeft />", '<ArrowLeft className={orientation === "horizontal" ? "rtl:rotate-180" : undefined} />', "icon"],
  ["carousel.tsx", "<ArrowRight />", '<ArrowRight className={orientation === "horizontal" ? "rtl:rotate-180" : undefined} />', "icon"],

  // --- carousel keyboard: ArrowLeft advances in RTL ------------------------
  [
    "carousel.tsx",
    `      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]`,
    `      const isRtl = opts?.direction === "rtl"
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        isRtl ? scrollNext() : scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        isRtl ? scrollPrev() : scrollNext()
      }
    },
    [scrollPrev, scrollNext, opts?.direction]`,
    "logic",
  ],

  // --- sheet: `side` is physical, keep position/border physical ------------
  ["sheet.tsx", '"inset-y-0 end-0 h-full w-3/4 border-s ', '"inset-y-0 right-0 h-full w-3/4 border-l ', "side"],
  ["sheet.tsx", '"inset-y-0 start-0 h-full w-3/4 border-e ', '"inset-y-0 left-0 h-full w-3/4 border-r ', "side"],

  // --- sidebar: container + rail follow the physical `side` ----------------
  [
    "sidebar.tsx",
    `? "start-0 group-data-[collapsible=offcanvas]:start-[calc(var(--sidebar-width)*-1)]"
            : "end-0 group-data-[collapsible=offcanvas]:end-[calc(var(--sidebar-width)*-1)]",`,
    `? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",`,
    "side",
  ],
  ["sidebar.tsx", "group-data-[side=left]:border-e group-data-[side=right]:border-s", "group-data-[side=left]:border-r group-data-[side=right]:border-l", "side"],
  ["sidebar.tsx", "w-4 -translate-x-1/2 rtl:translate-x-1/2 transition-all", "w-4 -translate-x-1/2 transition-all", "side"],
  ["sidebar.tsx", "after:start-1/2 after:w-[2px]", "after:left-1/2 after:w-[2px]", "side"],
  [
    "sidebar.tsx",
    '"in-data-[side=left]:cursor-w-resize rtl:in-data-[side=left]:cursor-e-resize in-data-[side=right]:cursor-e-resize rtl:in-data-[side=right]:cursor-w-resize"',
    '"in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize"',
    "side",
  ],
  [
    "sidebar.tsx",
    '"[[data-side=left][data-state=collapsed]_&]:cursor-e-resize rtl:[[data-side=left][data-state=collapsed]_&]:cursor-w-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize rtl:[[data-side=right][data-state=collapsed]_&]:cursor-e-resize"',
    '"[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize"',
    "side",
  ],
  [
    "sidebar.tsx",
    "group-data-[collapsible=offcanvas]:translate-x-0 rtl:group-data-[collapsible=offcanvas]:-translate-x-0 group-data-[collapsible=offcanvas]:after:start-full",
    "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
    "side",
  ],
  ["sidebar.tsx", '"[[data-side=left][data-collapsible=offcanvas]_&]:-end-2"', '"[[data-side=left][data-collapsible=offcanvas]_&]:-right-2"', "side"],
  ["sidebar.tsx", '"[[data-side=right][data-collapsible=offcanvas]_&]:-start-2"', '"[[data-side=right][data-collapsible=offcanvas]_&]:-left-2"', "side"],

  // navigation-menu is deliberately NOT patched: Radix reverses its item order in
  // RTL, so data-motion=from-start/-end already point at the physical side the new
  // item sits on. Adding rtl: swaps made the content enter from the wrong side
  // (measured in a browser), so the migrated output is left as is.
]

const count = (s, sub) => s.split(sub).length - 1
const files = new Map()
for (const [file, from, to] of EDITS) {
  if (!files.has(file)) files.set(file, fs.readFileSync(path.join(dir, file), "utf8"))
  const src = files.get(file)
  const n = count(src, from)
  if (n !== 1) {
    console.error(`ABORT ${file}: expected exactly 1 match, found ${n}:\n  ${from.split("\n")[0]}`)
    process.exit(1)
  }
  files.set(file, src.replace(from, () => to))
}
for (const [file, src] of files) fs.writeFileSync(path.join(dir, file), src)
const byKind = EDITS.reduce((a, e) => ((a[e[3]] = (a[e[3]] ?? 0) + 1), a), {})
console.log(`patched ${files.size} files, ${EDITS.length} edits`, byKind)
