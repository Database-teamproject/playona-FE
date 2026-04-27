#!/usr/bin/env bash
# Assemble a fully self-contained Playona wireframe HTML.
# Pretendard font, hero image, React/ReactDOM/Babel, and all JSX are inlined.
# Output: <repo>/playona-wireframe.html

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WF="/Users/jaeuu/Desktop/playona-WF"
OUT="$ROOT/playona-wireframe.html"
DEPS="$ROOT/scripts"

FONT_TTF="$WF/fonts/PretendardVariable.ttf"
HERO_JPG="$WF/assets/hero-music.jpg"
LOGO_PNG="$WF/assets/logo.png"
FAVICON_SVG="$ROOT/favicon.svg"
PLATFORM_JSX="$WF/ui_kits/playona-web/PlatformIcon.jsx"
PRIMITIVES_JSX="$WF/ui_kits/playona-web/Primitives.jsx"
SCREENS_JSX="$WF/ui_kits/playona-web/Screens.jsx"

for f in "$FONT_TTF" "$HERO_JPG" "$LOGO_PNG" "$FAVICON_SVG" "$PLATFORM_JSX" "$PRIMITIVES_JSX" "$SCREENS_JSX" \
         "$DEPS/react.umd.js" "$DEPS/react-dom.umd.js" "$DEPS/babel.min.js"; do
  [[ -f "$f" ]] || { echo "missing: $f" >&2; exit 1; }
done

echo "→ encoding font + hero + logo + favicon..."
FONT_B64="$(base64 < "$FONT_TTF" | tr -d '\n')"
HERO_B64="$(base64 < "$HERO_JPG" | tr -d '\n')"
LOGO_B64="$(base64 < "$LOGO_PNG" | tr -d '\n')"
FAVICON_B64="$(base64 < "$FAVICON_SVG" | tr -d '\n')"

# Patch JSX so file-relative asset paths point at the inlined data URLs.
SCREENS_PATCHED="$(sed 's#src="../../assets/hero-music.jpg"#src={HERO_IMG}#' "$SCREENS_JSX")"
PRIMITIVES_PATCHED="$(sed 's#src="../../assets/logo.png"#src={LOGO_IMG}#' "$PRIMITIVES_JSX")"

echo "→ writing $OUT..."
{
cat <<HEAD
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${FAVICON_B64}"/>
<title>Playona — Wireframe</title>
<style>
@font-face {
  font-family: 'Pretendard Variable';
  font-weight: 45 920;
  font-style: normal;
  font-display: swap;
  src: url('data:font/ttf;base64,${FONT_B64}') format('truetype-variations'),
       url('data:font/ttf;base64,${FONT_B64}') format('truetype');
}

:root {
  --font-display: 'Space Grotesk', 'Pretendard Variable', Pretendard, system-ui, sans-serif;
  --font-heading: 'Pretendard Variable', Pretendard, 'Space Grotesk', system-ui, sans-serif;
  --font-body:    'Pretendard Variable', Pretendard, 'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'SF Mono', Menlo, monospace;

  --background: 240 20% 4%;
  --foreground: 0 0% 95%;
  --card: 240 15% 8%;
  --card-foreground: 0 0% 95%;
  --popover: 240 15% 8%;
  --popover-foreground: 0 0% 95%;
  --secondary: 240 15% 14%;
  --secondary-foreground: 0 0% 85%;
  --muted: 240 12% 12%;
  --muted-foreground: 240 5% 55%;
  --border: 240 12% 16%;
  --input: 240 12% 16%;
  --surface-elevated: 240 15% 10%;
  --surface-glass: 240 15% 8%;

  --primary: 172 66% 50%;
  --primary-foreground: 240 20% 4%;
  --ring: 172 66% 50%;
  --accent: 265 60% 60%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 98%;
  --glow-primary: 172 66% 50%;
  --glow-accent: 265 60% 60%;

  --spotify: 141 73% 42%;
  --youtube: 0 100% 50%;
  --melon: 134 100% 45%;
  --apple-music: 340 82% 52%;
  --youtube-music: 0 100% 50%;
  --kakao: 49 100% 50%;

  --radius: 0.75rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.625rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.25rem;
  --radius-pill: 9999px;

  --gradient-primary: linear-gradient(135deg, hsl(172 66% 50%), hsl(265 60% 60%));
  --gradient-hero:    linear-gradient(180deg, hsl(240 20% 6%) 0%, hsl(240 20% 4%) 100%);
  --gradient-card:    linear-gradient(135deg, hsl(240 15% 10%), hsl(240 15% 8%));

  --shadow-glow:  0 0 40px -10px hsl(172 66% 50% / 0.30);
  --shadow-card:  0 4px 24px -4px hsl(0 0% 0% / 0.40);
  --shadow-pop:   0 8px 32px -8px hsl(0 0% 0% / 0.55);
}

html, body, #root { margin: 0; height: 100%; }
body {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

.text-gradient {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
.bg-gradient-primary { background: var(--gradient-primary); }
.bg-surface-elevated { background-color: hsl(var(--surface-elevated)); }
.bg-surface-glass {
  background: hsl(var(--surface-glass) / 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.shadow-glow { box-shadow: var(--shadow-glow); }
.shadow-card { box-shadow: var(--shadow-card); }

.t-eyebrow {
  font-family: var(--font-body);
  font-size: 0.75rem;
  line-height: 1.4;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

@keyframes pulse-glow { 0%, 100% { opacity: 0.4 } 50% { opacity: 0.8 } }
@keyframes float      { 0%, 100% { transform: translateY(0px) } 50% { transform: translateY(-8px) } }
@keyframes slide-up   { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
@keyframes spin       { to { transform: rotate(360deg) } }
@keyframes popover-in {
  from { opacity: 0; transform: translate(-50%, 8px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}
@keyframes toast-in {
  from { opacity: 0; transform: translate(-50%, 12px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}

</style>
</head>
<body>
<div id="root"></div>

<script>/* assets (inlined as data URLs) */
window.HERO_IMG = 'data:image/jpeg;base64,${HERO_B64}';
window.LOGO_IMG = 'data:image/png;base64,${LOGO_B64}';
</script>

<script>/* React 18 (UMD, production) */
HEAD

cat "$DEPS/react.umd.js"
echo
echo '</script>'
echo
echo '<script>/* ReactDOM 18 (UMD, production) */'
cat "$DEPS/react-dom.umd.js"
echo
echo '</script>'
echo
echo '<script>/* @babel/standalone 7.29.0 */'
cat "$DEPS/babel.min.js"
echo
echo '</script>'
echo
echo '<script type="text/babel" data-presets="env,react">'
echo '/* PlatformIcon.jsx — inlined */'
cat "$PLATFORM_JSX"
echo
echo '</script>'
echo
echo '<script type="text/babel" data-presets="env,react">'
echo '/* Primitives.jsx — inlined (logo src patched to LOGO_IMG) */'
echo "const LOGO_IMG = window.LOGO_IMG;"
echo "$PRIMITIVES_PATCHED"
echo '</script>'
echo
echo '<script type="text/babel" data-presets="env,react">'
echo '/* Screens.jsx — inlined (hero src patched to HERO_IMG) */'
echo "const HERO_IMG = window.HERO_IMG;"
echo "$SCREENS_PATCHED"
echo '</script>'
echo
cat <<'APP'
<script type="text/babel" data-presets="env,react">
/* App + mount — inlined from playona-WF/ui_kits/playona-web/index.html */
const { useState } = React;

const App = () => {
  const [route, setRoute] = useState("/");
  const [shortCode, setShortCode] = useState("demo123");
  const [toast, setToast] = useState("");

  const navigate = (r) => setRoute(r);
  const onConvert = () => {
    setShortCode("ab" + Math.random().toString(36).slice(2, 6));
    navigate("/result/x");
  };
  const fakeRoute =
    route.startsWith("/result/") ? "/result"
    : route.startsWith("/t/")    ? "/t"
    : route;

  return (
    <div data-screen-label={`Playona ${fakeRoute}`}>
      <Header route={route} onNavigate={navigate}/>
      {fakeRoute === "/"         && <IndexScreen onConvert={onConvert}/>}
      {fakeRoute === "/result"   && <ResultScreen shortCode={shortCode} onBack={() => navigate("/")} onCopy={setToast}/>}
      {fakeRoute === "/t"        && <PlatformSelectScreen onCopy={setToast}/>}
      {fakeRoute === "/settings" && <SettingsScreen onBack={() => navigate("/")} onCopy={setToast}/>}
      {fakeRoute === "/history"  && <HistoryScreen onBack={() => navigate("/")} onCopy={setToast}/>}
      {fakeRoute === "/profile"  && <ProfileScreen onBack={() => navigate("/")} onCopy={setToast}/>}
      <Toast message={toast} onDismiss={() => setToast("")}/>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
</script>
</body>
</html>
APP
} > "$OUT"

echo
echo "✓ wrote $OUT"
ls -lh "$OUT"
