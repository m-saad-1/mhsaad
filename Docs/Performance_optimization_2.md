# Website Performance Optimization — Round 2 (Remaining Issues)

**Site:** https://mhsaad.xyz/
**Context:** Round 1 fixes are working — image `srcset`, AVIF thumbnails, and most contrast issues are resolved. Accessibility moved 95 → 96. This brief covers only what's **still outstanding**.

---

## Task 1 — Remaining Render-Blocking Request (280 ms)

**Issue:** `fonts.css` is now a separate self-hosted stylesheet but is still render-blocking.

| Resource | Transfer Size | Duration |
|---|---|---|
| `/fonts.css` (mhsaad.xyz) | 1.1 KiB | 180 ms |

### Fix

Apply the preload+swap pattern to `fonts.css` the same way as `styles.css`:

```html
<link rel="preload" href="/fonts.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/fonts.css"></noscript>
```

Alternatively, since this file only contains `@font-face` declarations, inline it directly into the `<head>` `<style>` block (it's just 1.1 KiB) so there's no extra request at all:

```html
<style>
  @font-face {
    font-family: '...';
    src: url('/fonts/....woff2') format('woff2');
    font-display: swap;
  }
  /* remaining @font-face rules */
</style>
```

Confirm `font-display: swap` is present on every `@font-face` rule so text isn't blocked waiting on font load.

---

## Task 2 — Remaining Image Optimization (110 KiB savings)

These images already have lazy-loading and correct `fetchpriority="low"` set — good. They just need proper responsive sizing. Some already have `srcset`/AVIF (PaperShare, ReceptionAI, Broady) but are still oversized relative to their displayed dimensions — the existing breakpoints are too large. Others (FashionHub, VisualShare, leaf disease, FashionHub logo) have no responsive variants yet.

| Image | Path | Resource Size | Served Dimensions | Displayed Dimensions | Est. Savings |
|---|---|---|---|---|---|
| FashionHub preview | `images/FashionHub/Thumbnail.webp` | 31.5 KiB | 800×499 | 408×266 | 23.0 KiB |
| VisualShare preview | `images/VisualShare/thumbnail.webp` | 28.9 KiB | 800×500 | 408×260 | 21.2 KiB |
| PaperShare preview | `images/Papershare/thumbnail-700.avif` | 25.4 KiB | 683×427 | 418×255 | 16.1 KiB |
| Leaf disease preview | `images/leaf_disease_detection/thumbnail.webp` | 23.4 KiB | 745×465 | 439×255 | 15.8 KiB |
| ReceptionAI preview | `images/AI_Chatbot/thumbnail-700.avif` | 24.5 KiB | 683×427 | 418×255 | 15.6 KiB |
| Broady preview | `images/Broady/Broady/thumbnail-700.avif` | 30.9 KiB | 603×377 | 473×255 | 14.5 KiB |
| FashionHub logo | `images/Fashionhub.webp` | 4.4 KiB | 150×130 | 30×26 | 4.2 KiB |

### Fix

1. **FashionHub preview, VisualShare preview, Leaf disease preview** — no `srcset` present yet. Add responsive variants matching the pattern already used elsewhere (e.g. Broady/PaperShare/ReceptionAI):
   ```html
   <img
     alt="FashionHub preview"
     class="project-thumb-img"
     decoding="async"
     fetchpriority="low"
     loading="lazy"
     src="images/FashionHub/thumbnail-450.webp"
     srcset="images/FashionHub/thumbnail-450.webp 450w, images/FashionHub/thumbnail-900.webp 900w"
     sizes="(max-width: 768px) 100vw, 50vw">
   ```
   Generate the `-450w` variant at ~450px wide (2x of the 408–439px display width range used across these cards) and a `-900w` fallback for larger viewports/HiDPI.

2. **PaperShare, ReceptionAI, Broady** — already use `srcset` with a `-700w`/`-1400w` pair, but the 700w file is still ~1.6–2x larger than needed for a ~418–473px display width. Regenerate the smaller breakpoint at **~450px wide** instead of 700px, and keep the larger breakpoint for bigger viewports:
   ```html
   <img
     alt="PaperShare preview"
     class="project-thumb-img"
     decoding="async"
     fetchpriority="low"
     loading="lazy"
     src="images/Papershare/thumbnail-450.avif"
     srcset="images/Papershare/thumbnail-450.avif 450w, images/Papershare/thumbnail-900.avif 900w"
     sizes="(max-width: 768px) 100vw, 50vw">
   ```
   Repeat for `AI_Chatbot/thumbnail-*.avif` and `Broady/Broady/thumbnail-*.avif`.

3. **FashionHub logo** (`Fashionhub.webp`) — served at 150×130 for a 30×26 display. Re-export at **~60×52** (2x). This is a small icon; no `srcset` needed, just resize the single source file.

4. Re-compress every regenerated file at WebP/AVIF quality 75–80.

---

## Task 3 — Unused JavaScript Still Not Fixed (67.2 KiB, GTM)

This is unchanged from the previous audit — still not addressed.

| Resource | Transfer Size | Est. Savings |
|---|---|---|
| `https://www.googletagmanager.com/gtag/js?id=G-TZNPWMWETW` | 159.0 KiB | 67.2 KiB |

### Fix

Defer GTM initialization until after first paint/load instead of loading it eagerly in `<head>`:

```javascript
window.addEventListener('load', () => {
  const script = document.createElement('script');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-TZNPWMWETW';
  script.async = true;
  document.head.appendChild(script);
});
```

If GTM is currently placed as a static `<script>` tag in `<head>` or early in `<body>`, remove it from there and inject it via the deferred pattern above. This also reduces main-thread blocking time (see Task 4).

---

## Task 4 — Long Main-Thread Task (1 found)

One long task remains on the main thread (down from 3 in the previous audit — improvement already made, but not fully resolved). This is very likely still tied to the un-deferred GTM script load.

### Fix

Resolving **Task 3** (deferring GTM) should eliminate or shrink this remaining long task. After deferring GTM, re-profile with Chrome DevTools Performance panel to confirm the task is gone or reduced to sub-50ms.

---

## Task 5 — Non-Composited Animations (36 elements, down from 91)

Progress has been made (91 → 36), but the `skeletonSweep`-style animation is still present on 36 elements using a non-compositable property.

### Fix

Same fix as before, now scoped to fewer remaining elements — confirm the CSS change was applied consistently across **all** skeleton-loading elements sitewide, not just the primary hero/portfolio cards:

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

Search the codebase for any remaining instances of `background-position` or `background-position-x` being animated and convert each to the `transform`-based pattern above.

---

## Task 6 — Accessibility: Footer Contrast (95/96 → 100)

**Issue:** Only one contrast failure remains (down from a long list previously) — the footer copyright text.

**Failing element:**
```html
<footer class="footer">
  ...
  <span>© 2026 Muhammad Saad. All rights reserved.</span>
</footer>
```

### Fix

Increase the contrast of the footer copyright `<span>` text against its background to meet **WCAG AA (4.5:1 for normal text)**. Likely currently using a low-opacity or light-gray color on a similarly light/dark background.

```css
.footer span {
  color: #6b6b6b; /* example — verify against actual footer background with a contrast checker */
}
```

Use WebAIM's Contrast Checker against the *actual* rendered footer background color to pick a compliant value — don't guess. If the footer background is dark, lighten the text; if light, darken it.

---

## Task 7 — SEO: "LEARN MORE" Link Still Not Fixed (91)

**Issue:** Unchanged from previous audit.

```html
<a class="hero-cv-btn" href="/about">LEARN MORE</a>
```

### Fix

```html
<a class="hero-cv-btn" href="/about" aria-label="Learn more about Muhammad Saad's background">LEARN MORE</a>
```

---

## Verification Checklist

- [ ] `fonts.css` is inlined or preloaded — no longer render-blocking
- [ ] FashionHub, VisualShare, and Leaf disease preview images have `srcset`/responsive variants added
- [ ] PaperShare, ReceptionAI, Broady thumbnails regenerated at a smaller (~450w) breakpoint
- [ ] FashionHub logo resized to ~60×52
- [ ] GTM script deferred to load after `window.load`
- [ ] Long main-thread task count drops to 0 after GTM deferral
- [ ] Remaining 36 `skeletonSweep` elements converted to `transform`-based animation
- [ ] Footer copyright text passes WCAG AA contrast (4.5:1)
- [ ] "LEARN MORE" link has `aria-label` or descriptive text
- [ ] Re-run Lighthouse: Performance, Accessibility (target 100), SEO (target 100 or near)
- [ ] Confirm no regressions in Best Practices (100) or Agentic Browsing (2/2)

---

## Priority Order

1. **Task 3** — Defer GTM (fixes unused JS + long main-thread task in one move)
2. **Task 1** — Fix remaining render-blocking `fonts.css`
3. **Task 2** — Finish responsive image variants (110 KiB)
4. **Task 5** — Finish non-composited animation conversion (36 elements)
5. **Task 6** — Footer contrast fix
6. **Task 7** — SEO link text fix