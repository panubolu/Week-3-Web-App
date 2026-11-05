---
name: performance
description: Use whenever building or reviewing web pages, components, images, fonts, scripts, data fetching, or APIs, and whenever an app feels slow or will be deployed (for example to Vercel). Targets Google's Core Web Vitals (LCP, INP, CLS). Also use when asked about "speed", "page load", "Lighthouse score", "optimize", or "slow".
---

# Performance

Goal: pages load fast, respond instantly, and stay visually stable on an average phone on a mobile network, not only on a fast laptop.

Measure, don't guess. Prefer changes with a measurable effect on the targets below, and state the expected impact of each change.

## Targets (Core Web Vitals, "good" thresholds)

| Metric | Measures | Target |
|---|---|---|
| LCP (Largest Contentful Paint) | How fast the main content appears | ≤ 2.5 s |
| INP (Interaction to Next Paint) | How fast the page responds to clicks and typing | ≤ 200 ms |
| CLS (Cumulative Layout Shift) | How much the layout jumps while loading | ≤ 0.1 |

Also aim for a Lighthouse Performance score of 90 or higher on mobile.

## 1. Images (usually the biggest win)

- Use modern formats (WebP or AVIF) and serve the size actually displayed; never ship a 4000px image into a 400px box.
- Always set `width` and `height` (or an aspect ratio) so space is reserved and the layout does not shift.
- Lazy-load images below the fold (`loading="lazy"`), but **never** lazy-load the main hero image; give it `fetchpriority="high"`.
- Use the framework's image component when one exists (for example `next/image`).

## 2. JavaScript

- Ship less JavaScript: split code by page/route and load heavy features only when needed (dynamic import).
- Check a package's size before adding it; prefer small libraries or built-in browser features.
- Load third-party scripts (analytics, chat widgets) with `defer`/`async` or after the page is interactive.
- Keep work on the main thread short; break up tasks longer than 50 ms so clicks stay responsive.
- In React, avoid unnecessary re-renders; do not create expensive values on every render.

## 3. CSS and fonts

- Keep CSS small; remove unused styles.
- Limit custom fonts to the weights you use; use `font-display: swap` and preload the main font. Prefer the framework's font optimizer (for example `next/font`).

## 4. Layout stability

- Reserve space for images, videos, ads, and embeds before they load.
- Never insert content above existing content unless the user asked for it (for example, a banner pushing the page down).
- Animate with `transform` and `opacity`, not `top`, `left`, `width`, or `height`.

## 5. Data and network

- Fetch data in parallel, not one request after another.
- Avoid the "N+1" problem: do not run one database query per item in a list.
- Paginate or virtualize long lists instead of loading everything.
- Cache: static assets with long cache lifetimes and hashed file names; API responses where data allows.
- Render static content at build time or on the server when possible, so the browser has less work.
- Compress responses (Brotli or gzip; usually automatic on Vercel).

## Checklist before finishing

Report the result for each item in your answer:

- [ ] Images are correctly sized, modern format, with dimensions set; hero image not lazy-loaded
- [ ] No unnecessary large dependencies; heavy code is split or loaded on demand
- [ ] Third-party scripts are deferred
- [ ] Space is reserved for anything that loads late (no layout shift)
- [ ] Data requests run in parallel; no N+1 queries; long lists paginated
- [ ] Caching is configured for static assets
- [ ] Recommend running Lighthouse (Chrome DevTools, mobile mode) and checking LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1

## Reference

Google web.dev: Core Web Vitals and Lighthouse documentation.
