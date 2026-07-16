# Task: Fix PageSpeed Insights performance issues on mhsaad.xyz

## Context

A Lighthouse/PageSpeed Insights audit (mobile, Slow 4G, Moto G Power emulation) scored this site **71/100 Performance** (Accessibility 95, Best Practices 100, SEO 100). Main problems: oversized images, render-blocking CSS/fonts, missing `fetchpriority` on the LCP image, unminified CSS/JS, unused JS from Google Tag Manager, and non-composited animations. LCP is currently **5.8s** — the goal is to get it under ~2.5s and push Performance into the 90s.

Work through the tasks below in priority order. After each change, re-run a Lighthouse/PageSpeed check to confirm the metric actually improved before moving to the next task.

---

## Priority 1 — Resize and re-compress oversized images (~540 KiB waste)

Images are being served far larger than their displayed size. Resize each source image to ~2x its rendered CSS size (for retina sharpness), then re-export at good compression. Do NOT rely on CSS/HTML width/height attributes alone to shrink an oversized source file.

| File | Currently served at | Displayed at | Target resize |
|---|---|---|---|
| `images/avatar.webp` | 1000×1000 | 574×574 | ~1150px wide |
| `images/personalOS.webp` | 3200×3200 | 46×46 | ~100px wide |
| `images/visualshare.webp` | 4000×3600 | 46×41 | ~100px wide |
| `images/msstudio.webp` | 1000×1000 | 49×49 | ~100px wide |
| `images/Fashionhub.webp` | 211×183 | 46×39 | ~100px wide |
| `images/Broady/thumbnail.avif` | 1963×1225 | 768×413 | ~1536px wide |
| `images/Papershare/Thumbnail.avif` | 1871×1171 | 678×413 | ~1400px wide |
| `images/PersonalOS/thumbnail.avif` | 1122×700 | 768×413 | ~1536px wide |

Use `squoosh-cli`, `sharp`, or equivalent. Example:

```bash
npx @squoosh/cli --resize '{"width":1150}' --webp '{"quality":78}' images/avatar.webp
npx @squoosh/cli --resize '{"width":100}'  --webp '{"quality":80}' images/personalOS.webp
npx @squoosh/cli --resize '{"width":100}'  --webp '{"quality":80}' images/visualshare.webp
npx @squoosh/cli --resize '{"width":100}'  --webp '{"quality":80}' images/msstudio.webp
npx @squoosh/cli --resize '{"width":100}'  --webp '{"quality":80}' images/Fashionhub.webp
npx @squoosh/cli --resize '{"width":1536}' --avif '{"quality":60}' images/Broady/thumbnail.avif
npx @squoosh/cli --resize '{"width":1400}' --avif '{"quality":60}' images/Papershare/Thumbnail.avif
npx @squoosh/cli --resize '{"width":1536}' --avif '{"quality":60}' images/PersonalOS/thumbnail.avif
```

Optional but recommended — ship both 1x/2x and use `srcset` so devices don't always download the retina version:

```html
<img src="images/avatar-574.webp"
     srcset="images/avatar-574.webp 1x, images/avatar-1148.webp 2x"
     alt="Muhammad Saad avatar" class="hero-avatar"
     loading="eager" fetchpriority="high">
```

Acceptance check: re-run the "Improve image delivery" audit — estimated savings should drop from 540 KiB to near 0.

---

## Priority 2 — Prioritize the LCP element (avatar image)

The LCP element (`.hero-avatar`) loads eagerly and is discoverable in the initial HTML (good), but is missing `fetchpriority="high"`.

1. Add `fetchpriority="high"` to the avatar `<img>` tag:
```html
<img alt="Muhammad Saad avatar" class="hero-avatar" decoding="async" loading="eager"
     fetchpriority="high" src="images/avatar.webp">
```
2. Add a preload hint in `<head>`:
```html
<link rel="preload" as="image" href="images/avatar.webp" fetchpriority="high">
```

Acceptance check: "LCP request discovery" insight should show all checks passing; LCP time should drop measurably.

---

## Priority 3 — Eliminate render-blocking CSS/fonts (~750ms)

Currently blocking: `/styles.css` (370ms) and the Google Fonts stylesheet request (750ms).

1. **Self-host the fonts** instead of loading from `fonts.googleapis.com`/`fonts.gstatic.com`. Download the woff2 files currently in use and serve them from `/fonts/`:
```css
@font-face {
  font-family: 'YourFontName';
  src: url('/fonts/yourfont.woff2') format('woff2');
  font-display: swap;
  font-weight: 400 700;
}
```
   Remove the `<link rel="preconnect" href="https://fonts.googleapis.com">` / `fonts.gstatic.com` tags once self-hosted, since they're no longer needed.

2. **Load CSS non-blocking** using the preload+swap pattern, keeping a `<noscript>` fallback:
```html
<link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/styles.css"></noscript>
```
   If there's a small amount of above-the-fold CSS (hero section, nav), consider inlining it directly in `<head>` in a `<style>` block so first paint doesn't wait on any external CSS request at all.

Acceptance check: "Render-blocking requests" audit should show 0 or near-0 entries.

---

## Priority 4 — Minify and trim JavaScript/CSS

1. **Minify `styles.css`** (currently 8.9 KiB → target ~6.5 KiB) and **`script.js`** (currently 10.4 KiB → target ~7 KiB). Add a build step using `esbuild`, `terser`, and `cssnano`/`postcss` rather than hand-editing — set this up so it runs automatically before every deploy, not as a one-off manual pass.

2. **Google Tag Manager wastes ~65 KiB of unused JS out of 155 KiB.** Defer its load so it doesn't compete with critical rendering:
```html
<script>
  window.addEventListener('load', () => {
    setTimeout(() => {
      const gtmScript = document.createElement('script');
      gtmScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-TZNPWMWETW';
      gtmScript.async = true;
      document.head.appendChild(gtmScript);
      // initialize dataLayer/gtag as usual after this loads
    }, 2000); // delay 2s after load, or trigger on first user interaction instead
  });
</script>
```
   Alternative: trigger the GTM load on the first `scroll`, `mousemove`, `keydown`, or `touchstart` event instead of a fixed timeout, so it loads sooner if the user actually engages with the page but never blocks initial render.

3. `email.min.js` from jsdelivr caches for only 7 days at 3 KiB — low priority, but consider self-hosting it under `/vendor/` to avoid the extra third-party DNS/connection.

Acceptance check: "Minify CSS", "Minify JavaScript", and "Reduce unused JavaScript" audits should show near-0 estimated savings.

---

## Priority 5 — Fix non-composited animations and long tasks

Lighthouse flagged 79 animated elements as non-composited and 2 long main-thread tasks.

1. Audit all CSS transitions/animations in `styles.css`. Any animation using `top`, `left`, `width`, `height`, `margin`, or similar layout-triggering properties should be rewritten to use only `transform` and `opacity`, which the browser can composite on the GPU without a repaint:
```css
/* Before (triggers layout/paint every frame): */
.hero-card { transition: top 0.3s, left 0.3s; }

/* After (GPU-composited): */
.hero-card { transition: transform 0.3s, opacity 0.3s; will-change: transform; }
```
2. If 79 simultaneously-animating elements is intentional (e.g. a background grid/particle effect), consider:
   - Reducing the number of concurrently animated elements, or
   - Wrapping the effect in `@media (prefers-reduced-motion: no-preference)` so it's skipped for users/devices that prefer or need reduced motion, which also reduces load on lower-power mobile devices.
3. Profile the 2 long tasks in Chrome DevTools Performance panel to identify what's running on the main thread during them, and break up any large synchronous JS work (e.g. with `requestIdleCallback` or splitting into smaller chunks).

Acceptance check: "Avoid non-composited animations" and "Avoid long main-thread tasks" audits should show 0 or a much smaller count; TBT should drop from 90ms.

---

## Priority 6 — Accessibility fixes (95 → 100)

1. **Add a `<main>` landmark** wrapping the primary page content (the site currently has no main region):
```html
<main>
  <section class="section about-section" id="about">...</section>
  <section class="section skills-section" id="skills">...</section>
  <section class="section portfolio-section" id="portfolio">...</section>
  <section class="section contact-section" id="contact">...</section>
</main>
```
2. **Fix low-contrast text** on the following elements — check actual contrast ratios in Chrome DevTools and adjust colors to meet WCAG AA (4.5:1 for normal text):
   - `.hero-stack-card` / `.stack-label` text ("CORE STACK MERN REACT POSTGRESQL PHP PYTHON NEXT.JS")
   - `.section-number` spans ("01", "02", "03", "04")
   - Footer text (`<footer class="footer">`)

Acceptance check: Accessibility score reaches 100; "Contrast" audit passes with 0 failing elements.

---

## Verification

After completing all tasks:
1. Run Lighthouse locally (`npx lighthouse https://mhsaad.xyz --form-factor=mobile --throttling-method=simulate --view`) or re-check via https://pagespeed.web.dev/ for both mobile and desktop.
2. Confirm: Performance score ≥ 90, LCP < 2.5s, TBT < 50ms, CLS stays ≤ 0.1, Accessibility = 100.
3. Do a final visual regression pass — confirm images still look sharp at their displayed sizes and no layout shifted from the `<main>` wrapper or CSS loading changes.