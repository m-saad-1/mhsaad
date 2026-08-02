# Implementation Plan: Website Performance Optimization

This implementation plan outlines the step-by-step process for executing the optimizations detailed in the `Performance-optimization.md` task brief for the `mhsaad.xyz` portfolio website.

## Phase 1: Critical LCP & Asset Optimization
*Goal: Address the most significant performance bottlenecks (LCP, FCP, Speed Index) by optimizing images and critical rendering path. Expected to raise mobile score from 66 to high 80s/low 90s.*

1. **Image Optimization (Highest Priority)**
   - Batch process the 10 identified images.
   - **Resize:** Logos to ~100-150px, hero avatar to ~1150x1150px, and project thumbnails to ~1350x750px.
   - **Compress:** Encode as WebP/AVIF at quality 75-80.
   - **Markup:** Update `<img>` tags in HTML to use responsive `srcset` and `sizes` attributes for all thumbnail and hero images.
   
2. **LCP Image Priority**
   - Locate the `images/avatar.webp` image tag (`.hero-avatar`).
   - Add the attribute `fetchpriority="high"`.
   - Ensure `loading="eager"` remains intact and the image is unconditionally loaded.

3. **Critical Rendering Path (CSS & Fonts)**
   - **Inline Critical CSS:** Extract above-the-fold CSS (hero section, navigation) and inline it directly into the `<head>`.
   - **Defer Non-Critical CSS:** Load the remaining CSS using the `<link rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'">` pattern.
   - **Self-host Google Fonts:** Download the required `.woff2` files, update `@font-face` declarations to include `font-display: swap;`, and remove external `fonts.googleapis.com` render-blocking requests.

## Phase 2: JavaScript & Rendering Efficiency
*Goal: Reduce Main Thread blocking time and eliminate layout shifts.*

4. **Animation Compositing (CLS Fix)**
   - Refactor the `.skeletonSweep` keyframes in the CSS.
   - Replace the non-composited `background-position-x` property with a GPU-friendly `transform: translateX(-100%)` to `translateX(100%)` effect.
   - Apply `will-change: transform` to the animated pseudo-elements to ensure they run on the compositor thread.

5. **Script Deferral (GTM)**
   - Modify the Google Tag Manager (GTM) script injection.
   - Delay GTM initialization by wrapping it in `window.addEventListener('load', ...)` or by using `requestIdleCallback` to prevent it from blocking the initial render.

6. **Layout Thrashing Fixes**
   - Analyze `script.js` at lines 6, 181, and 1382.
   - Implement read-then-write batching. Group DOM geometry reads (e.g., `offsetWidth`) and wrap subsequent DOM writes inside `requestAnimationFrame()` to prevent forced synchronous reflows.

## Phase 3: Polish, Accessibility, and SEO
*Goal: Finalize build steps and achieve 100/100 in Accessibility and SEO.*

7. **Minification Pipeline**
   - Implement a build step (using `cssnano` and `terser` or similar tools) to minify `styles.css` and `script.js`.
   - Ensure the production deployment correctly serves these minified assets.

8. **Accessibility Enhancements (95 -> 100)**
   - **Contrast:** Adjust CSS color variables for specific text elements (stack labels, section numbers, footer text) to meet the WCAG AA 4.5:1 contrast ratio against their backgrounds.
   - **Semantics:** Wrap all primary page content sections (from About to Contact) inside a semantic `<main>` landmark element.
   - **Review:** Manually check tab order, focus visibility, and heading hierarchy.

9. **SEO Improvements (91 -> 100+)**
   - Add `aria-label="Learn more about Muhammad Saad's background"` to the `.hero-cv-btn` "LEARN MORE" button, or update its visible text to be more descriptive.

## Verification Protocol
After each phase, execute the following validation steps:
- Run Lighthouse audits on Mobile (Moto G Power emulation, Slow 4G) and Desktop.
- Verify FCP, LCP, and Speed Index reductions.
- Confirm TBT stays low and CLS remains near 0.
- Verify all images are correctly sized and utilizing `srcset`.
- Ensure color contrast tests pass and semantic elements (`<main>`) are correctly placed.
