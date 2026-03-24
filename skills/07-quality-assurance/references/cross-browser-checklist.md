# Cross-Browser Checklist

## When to use

Reference this before every release, when building new UI features, or when a user reports a browser-specific bug. Use the checklist to systematically validate cross-browser compatibility.

## Decision framework

```
Is this a CSS feature?
├── Check caniuse.com for support
│   ├── Supported in all targets? → Use directly
│   ├── Supported with prefix? → Use autoprefixer (already in your build)
│   └── Not supported in a target browser?
│       ├── Is there a fallback? → Use @supports for progressive enhancement
│       └── No fallback? → Choose a different approach
│
Is this a JS API?
├── Check MDN compatibility table
│   ├── Supported? → Use directly
│   └── Not supported? → Polyfill or feature-detect
│
Is this a form element or input type?
└── Test manually in Safari and Firefox — they render forms differently
```

## Copy-paste template

### Browser compatibility matrix

```markdown
| Feature / Page     | Chrome | Firefox | Safari | Edge | iOS Safari | Chrome Android |
|--------------------|--------|---------|--------|------|------------|----------------|
| Homepage           | [ ]    | [ ]     | [ ]    | [ ]  | [ ]        | [ ]            |
| Login / Signup     | [ ]    | [ ]     | [ ]    | [ ]  | [ ]        | [ ]            |
| Dashboard          | [ ]    | [ ]     | [ ]    | [ ]  | [ ]        | [ ]            |
| Core action flow   | [ ]    | [ ]     | [ ]    | [ ]  | [ ]        | [ ]            |
| Payment / Checkout | [ ]    | [ ]     | [ ]    | [ ]  | [ ]        | [ ]            |
| Settings           | [ ]    | [ ]     | [ ]    | [ ]  | [ ]        | [ ]            |
| Mobile navigation  | N/A    | N/A     | N/A    | N/A  | [ ]        | [ ]            |
```

### CSS compatibility checklist

Check these specific items in each browser:

```markdown
## Layout
- [ ] Flexbox gap renders correctly (Safari < 14.1 does not support gap in flexbox)
- [ ] Grid layout renders correctly across all browsers
- [ ] Container queries work (Chrome 105+, Safari 16+, Firefox 110+)
- [ ] Subgrid works or gracefully degrades (Firefox 71+, Chrome 117+, Safari 16+)

## Spacing and sizing
- [ ] `dvh` / `svh` / `lvh` units work or fallback to `vh` (Safari 15.4+)
- [ ] `100vh` on iOS Safari does not overlap with address bar
  → Fix: use `100dvh` with fallback `height: 100vh; height: 100dvh;`
- [ ] `safe-area-inset-*` applied for notch/home indicator
  → `padding-bottom: env(safe-area-inset-bottom);`
- [ ] Scrollbar width does not shift layout
  → `scrollbar-gutter: stable;` (Chrome 94+, Firefox 97+, no Safari)

## Visual
- [ ] `backdrop-filter` works (Safari has had bugs with nested backdrop-filters)
- [ ] `accent-color` on form elements renders correctly
- [ ] `color-mix()` works or has fallback (Chrome 111+, Safari 16.2+, Firefox 113+)
- [ ] Dark mode `prefers-color-scheme` works in all browsers
- [ ] Smooth scrolling (`scroll-behavior: smooth`) works or is non-breaking

## Typography
- [ ] Font loading does not cause layout shift (use `font-display: swap`)
- [ ] `text-wrap: balance` works or degrades gracefully (Chrome 114+)
- [ ] `line-clamp` works (`-webkit-line-clamp` needed for older browsers)

## Forms
- [ ] Date inputs render usably in Safari and Firefox (consider a custom date picker)
- [ ] `<input type="number">` scroll behavior disabled (Firefox scrolls on number inputs)
- [ ] Input zoom disabled on iOS (set `font-size: 16px` minimum on inputs)
- [ ] Autofill styling overridden if needed (`:-webkit-autofill`)
- [ ] Form validation messages display correctly

## Images and media
- [ ] WebP/AVIF images have fallbacks via `<picture>` element
- [ ] `aspect-ratio` works (Chrome 88+, Safari 15+, Firefox 89+)
- [ ] `object-fit` works correctly on images in all browsers
- [ ] Lazy loading (`loading="lazy"`) works (Safari 15.4+)
```

### Mobile-specific checklist

```markdown
## Touch interactions
- [ ] All tap targets are at least 44x44px (Apple HIG) / 48x48dp (Material)
- [ ] No hover-only interactions (provide tap alternatives)
- [ ] Swipe gestures do not conflict with browser navigation
- [ ] Pull-to-refresh does not conflict with custom scroll behavior
  → `overscroll-behavior: none;` on scroll containers

## Viewport
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">` is set
- [ ] No horizontal scroll on any page (test in portrait and landscape)
- [ ] Keyboard does not obscure active input field
  → `scrollIntoView({ behavior: 'smooth', block: 'center' })` on focus
- [ ] Orientation change does not break layout

## Performance
- [ ] No janky scroll (test 60fps on mid-range Android device)
- [ ] Images are responsive (`srcset` or `next/image`)
- [ ] Fonts are subset for mobile (reduce payload)
- [ ] Touch interactions respond within 100ms (no delay from double-tap zoom)
  → `touch-action: manipulation;` on interactive elements
```

### Browserslist config

```json
// [CUSTOMIZE] Add to package.json
{
  "browserslist": [
    ">= 0.5%",
    "last 2 versions",
    "Firefox ESR",
    "not dead",
    "iOS >= 15",
    "Android >= 10"
  ]
}
```

### Progressive enhancement pattern

```css
/* Base styles that work everywhere */
.card {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem; /* fallback for gap */
}

/* Enhanced styles for browsers that support newer features */
@supports (gap: 1rem) {
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  .card {
    margin-bottom: 0; /* remove fallback margin */
  }
}

@supports (backdrop-filter: blur(10px)) {
  .modal-overlay {
    backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, 0.3);
  }
}

/* iOS Safari safe areas */
@supports (padding: env(safe-area-inset-bottom)) {
  .bottom-nav {
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  }
}
```

### Safari-specific debug tips

```css
/* Debug: highlight elements that use unsupported features in Safari */
/* Remove before shipping */
@supports not (gap: 1rem) {
  .debug-gap-fallback {
    outline: 2px dashed red;
  }
}
```

## Testing strategy

### Automated (CI)

Playwright covers the three major engines:

| Playwright project | Engine | Covers |
|--------------------|--------|--------|
| `chromium` | Blink | Chrome, Edge |
| `firefox` | Gecko | Firefox |
| `webkit` | WebKit | Safari (approximation) |

Run all three in CI on every PR. This catches ~90% of cross-browser bugs.

### Manual testing (per release)

The remaining ~10% requires real devices:

1. **iOS Safari on a real iPhone** -- WebKit on iOS has unique bugs not reproduced by Playwright's WebKit. Test:
   - Viewport height (100vh issue)
   - Input zoom behavior
   - Safe area rendering
   - Smooth scroll behavior
   - PWA behavior if applicable

2. **Chrome on a real Android device** -- Test:
   - Touch interactions on mid-range hardware
   - Scroll performance
   - Keyboard interaction with forms
   - Font rendering

3. **BrowserStack or LambdaTest** -- Use for older browser versions or devices you don't have physical access to. Only test the 4 critical paths, not the entire app.

## Customization notes

- **Browserslist**: Adjust the config based on your analytics data. If 0% of your users are on Firefox ESR, drop it.
- **Mobile priority**: If your analytics show > 50% mobile users, prioritize the mobile checklist items.
- **Progressive enhancement**: Always start with a working baseline and layer on enhancements. Never rely on a feature that is unsupported in your target browsers.
- **Autoprefixer**: Ensure it runs as part of your PostCSS or build pipeline. It handles vendor prefixes automatically based on your browserslist config.

## Companion tools

| Tool | Use for |
|------|---------|
| [caniuse.com](https://caniuse.com) | Checking CSS/JS feature support |
| [MDN Web Docs](https://developer.mozilla.org) | Detailed compatibility tables |
| BrowserStack / LambdaTest | Real device testing in CI or manually |
| Playwright | Automated cross-browser testing (Chromium, Firefox, WebKit) |
