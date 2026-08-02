# Website Performance Optimization — Agent Task Brief

**Site:** https://mhsaad.xyz/
**Goal:** Raise Lighthouse scores on both Mobile and Desktop, with primary focus on Mobile Performance (currently 66/100 vs Desktop 96/100).

---

## Current Scores (Baseline)

| Category | Mobile | Desktop |
|---|---|---|
| Performance | 66 | 96 |
| Accessibility | 95 | 95 |
| Best Practices | 100 | 100 |
| SEO | 91 | 91 |
| Agentic Browsing | 2/2 | 2/2 |

### Core Web Vitals

| Metric | Mobile | Desktop |
|---|---|---|
| First Contentful Paint (FCP) | 3.4 s | 0.8 s |
| Largest Contentful Paint (LCP) | 6.1 s | 1.3 s |
| Total Blocking Time (TBT) | 70 ms | 60 ms |
| Cumulative Layout Shift (CLS) | 0 | 0.027 |
| Speed Index (SI) | 5.9 s | 1.0 s |

---

## Task 1 — Image Optimization (Highest Priority, ~668 KiB savings on mobile / ~718 KiB on desktop)

All images below are served far larger than their rendered display size. Re-export, resize, and re-compress each one. Use WebP or AVIF at quality 75–80, and generate responsive variants with `srcset`.

### Images to fix

| File | Path | Current Size | Served Dimensions | Displayed Dimensions | Estimated Savings |
|---|---|---|---|---|---|
| Muhammad Saad avatar | `images/avatar.webp` | 261.8 KiB | 1000×1000 | 574×574 | 208.1 KiB (compression) + 175.5 KiB (resize) |
| Progress OS logo | `images/personalOS.webp` | 127.1 KiB | 3200×3200 | 46×46 | 127.1 KiB |
| ReceptionAI preview | `images/AI_Chatbot/Multi-vertical-Ai-receptionist-chatbot.avif` | 130.7 KiB | 2556×1600 | 678×413 | 121.7 KiB |
| VisualShare logo | `images/visualshare.webp` | 66.6 KiB | 4000×3600 | 46×41 | 66.6 KiB |
| Broady preview | `images/Broady/Broady/thumbnail.avif` | 73.9 KiB | 1963×1225 | 768×413 | 64.1 KiB |
| PaperShare preview | `images/Papershare/Thumbnail.avif` | 40.4 KiB | 1871×1171 | 678×413 | 35.2 KiB |
| MsStudio logo | `images/msstudio.webp` | 20.9 KiB | 1000×1000 | 49×49 | 20.9 KiB |
| Progress OS preview | `images/PersonalOS/thumbnail.avif` | 19.1 KiB | 1122×700 | 768×413 | 11.4 KiB |
| DevBug preview | `images/DevBug/Thumbnail.webp` | 23.6 KiB | 800×500 | 662×431 | 6.8 KiB |
| FashionHub logo | `images/Fashionhub.webp` | 6.5 KiB | 211×183 | 46×39 | 6.2 KiB |

### Actions

1. **Logo icons** (`personalOS.webp`, `visualshare.webp`, `msstudio.webp`, `Fashionhub.webp`) — these are displayed at ~46px but served at 1000–4000px. Re-export at **~100–150px max** (2x for retina), producing near-zero perceptible quality loss and recovering the majority of the 668 KiB waste.
2. **Hero avatar** (`avatar.webp`) — resize source to **~1150×1150** (2x of 574px display) and re-compress at quality 75–80.
3. **Project thumbnails** (ReceptionAI, Broady, PaperShare, Progress OS, DevBug) — resize source to **~1350×750** (2x of ~678×413 display) and re-compress.
4. Implement responsive `srcset` for all thumbnail/hero images:
   ```html
   <img
     src="images/avatar-600.webp"
     srcset="images/avatar-600.webp 600w, images/avatar-1200.webp 1200w"
     sizes="(max-width: 768px) 574px, 574px"
     alt="Muhammad Saad avatar"
     loading="eager"
     fetchpriority="high"
     decoding="async">
   ```
5. Use `squoosh.app`, `sharp`, or `imagemin` (WebP/AVIF encoder) for batch re-compression. Target quality 75–80.
6. Keep `loading="lazy"` and `fetchpriority="low"` on all below-the-fold project thumbnails (already correctly set) — do not change this.

---

## Task 2 — Fix LCP Image Discovery & Priority (Applies to both Mobile & Desktop)

**Issue:** The LCP element (`images/avatar.webp`, class `hero-avatar`) is missing `fetchpriority="high"`.

**Current HTML:**
```html
<img alt="Muhammad Saad avatar" class="hero-avatar" decoding="async" loading="eager" src="images/avatar.webp">
```

**Fix — add fetchpriority:**
```html
<img alt="Muhammad Saad avatar" class="hero-avatar" decoding="async" loading="eager" fetchpriority="high" src="images/avatar.webp">
```

- Confirm the image remains discoverable directly in the initial HTML (already true — do not lazy-load it).
- This is contributing to the **1,440 ms Element Render Delay** portion of the mobile LCP breakdown (Time to first byte: 60ms, Resource load delay: 340ms, Resource load duration: 700ms, Element render delay: 1,440ms).

---

## Task 3 — Eliminate Render-Blocking Requests

**Impact:** ~900 ms savings on mobile, ~400 ms on desktop.

**Blocking resources:**

| Resource | Transfer Size | Duration (Mobile) | Duration (Desktop) |
|---|---|---|---|
| `/styles.css` (mhsaad.xyz) | 11.6 KiB | 330 ms | 200 ms |
| `/css2?family=…` (fonts.googleapis.com) | 1.6 KiB | 750 ms | 200 ms |

### Actions

1. **Inline critical CSS** for above-the-fold content (hero section, nav) directly in `<head>`.
2. **Defer non-critical CSS** using the preload+swap pattern:
   ```html
   <link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
   <noscript><link rel="stylesheet" href="/styles.css"></noscript>
   ```
3. **Self-host Google Fonts** instead of calling `fonts.googleapis.com`/`fonts.gstatic.com` at runtime — this removes the render-blocking round trip entirely (preconnect hints currently mitigate but don't eliminate this).
   - Download `.woff2` files (`JTUSjIg69….woff2` ~9.19 KiB, `UcC73FwrK….woff2` ~48.09 KiB) and serve from your own origin.
   - Add `font-display: swap;` in the `@font-face` declaration so text isn't blocked on font load.
4. Keep existing `preconnect` hints — they are correctly configured:
   ```html
   <link href="https://fonts.googleapis.com" rel="preconnect">
   <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
   ```
   (No additional preconnect origins are needed — audit confirms no other good candidates.)

---

## Task 4 — Reduce Unused JavaScript (67 KiB savings, both Mobile & Desktop)

**Issue:** Google Tag Manager script loads 159.0 KiB, of which ~66.7–67.1 KiB is unused on initial load.

**Resource:** `https://www.googletagmanager.com/gtag/js?id=G-TZNPWMWETW`

### Actions

1. Ensure the GTM/gtag script tag uses `async` (should already be default for gtag.js, verify implementation).
2. **Delay GTM initialization** until after first paint/interaction — trigger via `requestIdleCallback` or on `window.load` rather than blocking early execution:
   ```javascript
   window.addEventListener('load', () => {
     const script = document.createElement('script');
     script.src = 'https://www.googletagmanager.com/gtag/js?id=G-TZNPWMWETW';
     script.async = true;
     document.head.appendChild(script);
   });
   ```
3. Evaluate whether full GTM is necessary vs. a lighter direct GA4 gtag snippet if only pageview/event tracking is needed.
4. This script is also among the **top 3 long main-thread tasks**:
   - `gtag/js?id=G-TZNPWMWETW` — start 161 ms, duration 87 ms
   - `gtag/js?id=G-TZNPWMWETW` — start 876 ms, duration 74 ms (desktop) / included in mobile's 3 long tasks
   - Deferring load will also reduce Total Blocking Time (TBT).

---

## Task 5 — Fix Forced Reflow in `script.js`

**Issue:** JavaScript queries geometric properties (e.g., `offsetWidth`) immediately after DOM/style invalidation, forcing synchronous layout recalculation.

**Affected locations:**

| Source | Mobile Reflow Time | Desktop Reflow Time |
|---|---|---|
| `/script.js:6:47` | 92 ms (top function call) | 7 ms |
| `/script.js:181:37` | 87 ms | 1 ms |
| `/script.js:1382:19` | 5 ms | 7 ms |
| Unattributed (incl. GTM iframe) | 36 ms | 84 ms |

### Actions

1. Locate the code at `script.js` lines **6, 181, and 1382**.
2. Refactor using the **read-then-write batching pattern**: gather all geometry reads (`offsetWidth`, `offsetHeight`, `getBoundingClientRect()`, etc.) first, store in variables, *then* perform all DOM/style writes.
3. Wrap layout-dependent reads in `requestAnimationFrame()` to defer them until after the browser has painted, avoiding synchronous forced reflow.
4. Re-test with Chrome DevTools Performance panel to confirm reflow time reduction after changes.

---

## Task 6 — Fix Non-Composited Animations (CLS Impact)

**Issue:** 91 animated elements (mobile: 72) use the `skeletonSweep` animation, which animates `background-position-x` — an unsupported/non-compositable CSS property that forces repaint on every frame instead of running on the GPU compositor.

**Affected elements include (non-exhaustive — applies broadly across the skeleton loading state):**
- `div.portfolio-grid > div.project-card > div.project-thumbnail::before`
- `div.hero-right > div.hero-card > div.hero-image::before`
- Nav links: SERVICES, ABOUT, CASE STUDIES, DEV PROCESS
- `hero-cv-btn`, `hero-talk-btn`, `footer-link`, `hero-social-link`
- `stack-tag` spans (REACT, MERN, PYTHON, NEXT.JS, POSTGRESQL, PHP)
- Skill list items (all `<li>` under Technology Stack section)
- `section-number` spans (01–08)
- `stat-number`, `stat-label`, `rotating-title`, `project-title`, `brand-logo-text`, `footer-name`, `nav-time`, `nav-ampm`, `about-text`, `project-tagline`, `form-label`, `form-submit`, `section-title`

### Actions

1. Replace `background-position-x` animation with a **compositor-friendly** shimmer effect using `transform: translateX()`:
   ```css
   .skeleton::before {
     content: '';
     position: absolute;
     inset: 0;
     background: linear-gradient(
       90deg,
       transparent 0%,
       rgba(255,255,255,0.4) 50%,
       transparent 100%
     );
     transform: translateX(-100%);
     animation: skeletonSweep 1.5s infinite;
     will-change: transform;
   }

   @keyframes skeletonSweep {
     to {
       transform: translateX(100%);
     }
   }
   ```
2. Ensure the animated element has its own compositor layer (`will-change: transform` or `transform: translateZ(0)`), but use `will-change` sparingly and only on actively-animating elements to avoid excess memory usage.
3. Re-run the "Avoid non-composited animations" audit after the fix to confirm all flagged elements pass.

---

## Task 7 — Minify CSS and JavaScript

**Savings:** ~3 KiB (CSS) + ~4 KiB (JS), both Mobile & Desktop.

| File | Transfer Size | Estimated Savings |
|---|---|---|
| `/styles.css` | 11.6 KiB | 3.0 KiB |
| `/script.js` | 12.1–12.2 KiB | 3.8–3.9 KiB |

### Actions

1. Add a build step using **cssnano** (or equivalent) to minify `styles.css` before deployment.
2. Add a build step using **Terser** (or equivalent) to minify `script.js` before deployment.
3. Confirm minified files are the ones served in production (check for source maps not being served accidentally, and verify gzip/Brotli compression is enabled at the server/CDN level).

---

## Task 8 — Cache Lifetime (Informational, 0 KiB current savings)

**Observation:** `https://cdn.jsdelivr.net/.../dist/email.min.js` (~2.6–3 KiB) currently has a 7-day cache TTL. No action required — flagged only as an informational insight, not a scoring issue. Optionally increase to a longer TTL (e.g., 30 days) if the jsDelivr-hosted version is versioned/immutable.

---

## Task 9 — Accessibility Fixes (95 → 100)

### 9a. Fix insufficient color contrast

**Issue:** Background/foreground colors do not meet minimum contrast ratio across numerous elements.

**Failing elements include:**
- `.stack-label` ("CORE STACK")
- `.hero-stack-card` (stack tags: MERN, REACT, POSTGRESQL, PHP, PYTHON, NEXT.JS)
- Scroll indicator `<span>`
- All `.section-number` spans (01–08)
- Section headings/content: About, Portfolio, Skills, Contact sections
- Footer text and copyright line

**Action:** Audit the CSS custom properties/variables controlling text color on these elements (`.stack-label`, `.section-number`, `.about-text`, `.section-title`, footer text, etc.) and darken/lighten to meet **WCAG AA minimum contrast ratio of 4.5:1** for normal text (3:1 for large text ≥18px/14px bold). Use a contrast checker (e.g., WebAIM Contrast Checker) against the actual rendered background color for each.

### 9b. Add a `<main>` landmark

**Issue:** Document does not have a `<main>` landmark, flagged on `<html lang="en">`.

**Action:** Wrap the primary page content (everything between header/nav and footer — sections 01–08: About, Portfolio, Services, Dev Process, Skills, etc.) in a semantic `<main>` element:
```html
<body>
  <header>...</header>
  <main>
    <section class="section about-section" id="about">...</section>
    <section class="section portfolio-section" id="portfolio">...</section>
    <!-- sections 03–08 -->
  </main>
  <footer class="footer">...</footer>
</body>
```

### 9c. Review manual accessibility checklist

10 additional items require manual review (not automatable) — Claude/agent should still walk through Lighthouse's manual accessibility checklist for items such as: logical tab order, focus visibility, ARIA usage correctness, and heading hierarchy.

---

## Task 10 — SEO Fix (91 → higher)

**Issue:** Link does not have descriptive text.

**Failing element:**
```html
<a class="hero-cv-btn" href="/about">LEARN MORE</a>
```

**Action:** Replace generic "LEARN MORE" with descriptive text, or add an `aria-label` for context without changing visible copy:
```html
<a class="hero-cv-btn" href="/about" aria-label="Learn more about Muhammad Saad's background">LEARN MORE</a>
```

Also review the 1 additional manually-flagged SEO item in the Lighthouse report for further improvement.

---

## Verification Checklist (Run After Each Task)

- [ ] Re-run Lighthouse (Mobile: Moto G Power emulation, Slow 4G throttling) — confirm Performance score improves toward 90+
- [ ] Re-run Lighthouse (Desktop: standard emulation, custom throttling) — confirm Performance score remains ≥95
- [ ] Confirm LCP element (avatar) has `fetchpriority="high"` and loads without lazy-loading
- [ ] Confirm FCP, LCP, SI all decrease from baseline (Mobile baseline: FCP 3.4s, LCP 6.1s, SI 5.9s)
- [ ] Confirm TBT stays low (baseline: 70ms mobile / 60ms desktop) — should not regress
- [ ] Confirm CLS remains at or near 0 (mobile) / improves from 0.027 (desktop) after animation fix
- [ ] Confirm all 10 flagged images are resized/re-compressed and total payload drops by ~650+ KiB
- [ ] Confirm render-blocking CSS/font requests are inlined/deferred/self-hosted
- [ ] Confirm GTM no longer blocks initial render and unused JS drops by ~67 KiB
- [ ] Confirm forced reflow eliminated or reduced at `script.js:6`, `:181`, `:1382`
- [ ] Confirm `skeletonSweep` animation uses `transform` instead of `background-position-x`
- [ ] Confirm CSS/JS are minified in production build
- [ ] Confirm color contrast passes WCAG AA on all previously-failing elements
- [ ] Confirm `<main>` landmark is present and wraps primary content
- [ ] Confirm "LEARN MORE" link has descriptive text or `aria-label`
- [ ] Re-check Accessibility score reaches 100
- [ ] Re-check Best Practices score remains 100
- [ ] Re-check Agentic Browsing remains 2/2

---

## Priority Execution Order

1. **Task 1** — Image resize/compression (biggest single win, ~450–668 KiB)
2. **Task 2** — `fetchpriority="high"` on avatar
3. **Task 3** — Inline/defer CSS, self-host fonts
4. **Task 6** — Fix `skeletonSweep` animation (CLS/composite fix)
5. **Task 4** — Defer GTM initialization
6. **Task 5** — Fix forced reflow in `script.js`
7. **Task 7** — Minify CSS/JS in build pipeline
8. **Task 9** — Accessibility: contrast + `<main>` landmark
9. **Task 10** — SEO: descriptive link text

Completing steps 1–3 should move Mobile Performance from **66 → high 80s/low 90s**, since they directly address LCP, FCP, and Speed Index — the three metrics currently suppressing the score most.