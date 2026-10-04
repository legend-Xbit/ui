#!/usr/bin/env bash
# Browser RTL test for new-york-v4 components: original vs `migrate rtl` vs migrate + rtl-patch.
#
# Usage:   docs/design-kh/rtl-harness/run.sh <workdir>
# Needs:   `pnpm install && pnpm --filter shadcn build` already run at the repo root,
#          Node 20+, and a Chromium (set CHROMIUM_PATH if not under /opt/pw-browsers).
# Output:  <workdir>/results.txt (mirror-results.txt with MIRROR_ONLY=1) and <workdir>/shots/*.png.
#          Env: MIRROR_ONLY=1 runs only the gallery test; ONLY=a,b limits it to those components;
#          VARIANTS=patched limits variants; SHOTS=1 saves gallery screenshots. Nothing in the repo is modified.
set -euo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/../../.." && pwd)
REG="$ROOT/apps/v4/registry/new-york-v4"
CLI="$ROOT/packages/shadcn/dist/index.js"
WORK=${1:?usage: run.sh <workdir>}
[ -f "$CLI" ] || { echo "CLI not built: run 'pnpm --filter shadcn build' first" >&2; exit 1; }

mkdir -p "$WORK/src" "$WORK/shots"
cp "$HERE"/index.html "$HERE"/vite.config.ts "$HERE"/package.json "$HERE"/*.mjs "$WORK/"
cp "$HERE"/src/cn.ts "$HERE"/src/main.tsx "$WORK/src/"

# Theme tokens come straight from the app css so the harness uses the real palette.
awk '/^@theme inline/{p=1} /^@layer base/{p=0} p' "$ROOT/apps/v4/app/globals.css" > "$WORK/theme-tokens.css"
python3 - "$HERE/src/index.css" "$WORK/theme-tokens.css" "$WORK/src/index.css" <<'EOF'
import sys
css, tokens, out = (open(sys.argv[1]).read(), open(sys.argv[2]).read(), sys.argv[3])
open(out, "w").write(css.replace("/*__THEME_TOKENS__*/", tokens))
EOF

# Three source trees: orig, migrated (CLI only), patched (CLI + rtl-patch).
for v in orig migrated patched; do
  rm -rf "$WORK/variants/$v"; mkdir -p "$WORK/variants/$v/ui" "$WORK/variants/$v/hooks"
  cp "$REG"/ui/*.tsx "$WORK/variants/$v/ui/"; cp "$REG/hooks/use-mobile.ts" "$WORK/variants/$v/hooks/"
done
MIG="$WORK/migrate-project"
rm -rf "$MIG"; mkdir -p "$MIG/app" "$MIG/lib"
cp "$REG"/ui/*.tsx "$MIG/"; mkdir -p "$MIG/components/ui"; mv "$MIG"/*.tsx "$MIG/components/ui/"
echo '@import "tailwindcss";' > "$MIG/app/globals.css"
echo 'export const cn = (...a: unknown[]) => a.join(" ")' > "$MIG/lib/utils.ts"
echo '{"compilerOptions":{"baseUrl":".","paths":{"@/*":["./*"]}}}' > "$MIG/tsconfig.json"
echo '{"name":"m","dependencies":{"tailwindcss":"4.0.0"}}' > "$MIG/package.json"
cat > "$MIG/components.json" <<'EOF'
{"style":"new-york","rsc":true,"tsx":true,"tailwind":{"config":"","css":"app/globals.css","baseColor":"zinc","cssVariables":true},"aliases":{"components":"@/components","utils":"@/lib/utils","ui":"@/components/ui","lib":"@/lib","hooks":"@/hooks"},"iconLibrary":"lucide"}
EOF
(cd "$MIG" && node "$CLI" migrate rtl --yes >/dev/null)
cp "$MIG"/components/ui/*.tsx "$WORK/variants/migrated/ui/"
cp "$MIG"/components/ui/*.tsx "$WORK/variants/patched/ui/"
node "$HERE/../rtl-patch.mjs" "$WORK/variants/patched/ui"

cd "$WORK"
npm install --no-audit --no-fund --loglevel=error
PIDS=()
trap 'kill "${PIDS[@]}" 2>/dev/null || true' EXIT
for pair in orig:5171 migrated:5172 patched:5173; do
  VARIANT=${pair%%:*} PORT=${pair##*:} npx vite --strictPort >/dev/null 2>&1 & PIDS+=($!)
done
for port in 5171 5172 5173; do
  for _ in $(seq 1 40); do curl -sf "http://127.0.0.1:$port/" >/dev/null && break; sleep 0.5; done
done

{
  if [ -z "${MIRROR_ONLY:-}" ]; then
    echo "### icons (breadcrumb / pagination / calendar / dropdown-sub)"; node icons.mjs
    echo; echo "### context-menu / menubar sub-trigger chevrons"; node menus.mjs
    echo; echo "### sidebar toggle icon"; node toggle.mjs
    echo; echo "### sheet / sidebar / carousel / navigation-menu"; node suite.mjs
    echo
  fi
  echo "### mirror-symmetry test over the component gallery"; node mirror.mjs
} | tee "${MIRROR_ONLY:+mirror-}results.txt"
