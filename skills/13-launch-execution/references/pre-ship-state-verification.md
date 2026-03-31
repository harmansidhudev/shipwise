# Pre-Ship State Verification

> If you haven't seen a state, your users will see it first.

A binary pass/fail checklist for every state your app can be in. This is not analytical (that's the [design audit workflow](../../02-product-design/references/design-audit-workflow.md)) — this is "did you TEST this specific state before shipping?"

## When to use

Run this checklist in staging before every production deployment. Open your app in incognito. Throttle network to "Slow 3G" in DevTools for loading states. Work through each section. Mark pass/fail for each item.

---

## How to run

1. Open your staging URL in an incognito/private browser window
2. Open DevTools → Network → Throttle to "Slow 3G"
3. Work through each section below
4. Mark: ✓ (pass) / ⚠ (needs improvement) / ✗ (fail — fix before shipping)

---

## Copy-paste template

```markdown
# Pre-Ship State Verification — [Project Name]
**Date:** YYYY-MM-DD
**Tested by:** [Your name]
**Staging URL:** [URL]
**Browser:** [e.g., Chrome 130]
**Mobile device:** [e.g., iPhone 15 / emulator at 375px]

---

## Per-Page Verification

### Page: [CUSTOMIZE: page name] — [route]

| State | Test method | Status | Notes |
|-------|------------|--------|-------|
| Empty (no data) | Delete all data or use new account | | Explains feature? Provides next action? |
| Loading (3G throttle) | Throttle network, refresh | | Skeleton/spinner visible within 200ms? |
| Populated (realistic data) | Use seeded test account | | Layout holds? Truncation works? |
| Error (API failure) | Kill API / go offline | | Message shown? Recovery path clear? |
| Mobile (375px) | Resize or use device | | No horizontal scroll? Touch targets ≥44px? |
| Tablet (768px) | Resize or use device | | Layout adapts? No awkward whitespace? |

[CUSTOMIZE: Repeat this table for every route in your app]

---

## Global State Verification

### Navigation
| Check | Status | Notes |
|-------|--------|-------|
| Mobile nav opens and closes cleanly | | |
| Sidebar collapse/expand (if applicable) | | |
| Browser back button works from every page | | |
| Deep link: paste any URL directly, loads correctly | | |
| Breadcrumbs (if applicable) work at every depth | | |
| Logo links back to home/dashboard | | |

### Modals & Overlays
| Check | Status | Notes |
|-------|--------|-------|
| Focus trapped inside modal when open | | |
| Escape key closes modal/drawer | | |
| Focus returns to trigger element on close | | |
| Background scroll disabled when modal open | | |
| Command palette / search overlay opens, searches, navigates, closes | | |
| Nested modals (if any) stack correctly | | |

### Feedback & Notifications
| Check | Status | Notes |
|-------|--------|-------|
| Toast appears on action, auto-dismisses, doesn't block content | | |
| Form validation errors appear at right time, clear on fix | | |
| Copy-to-clipboard shows confirmation | | |
| Success state visible after save/create/delete actions | | |
| Undo available where appropriate (delete, archive) | | |

### Auth Boundaries
| Check | Status | Notes |
|-------|--------|-------|
| Protected page while logged out → redirects to login | | |
| After login → returns to originally requested page | | |
| 404 page is styled with navigation (not blank white) | | |
| Session expiry handled (no crash, no infinite redirect) | | |
| Role-based access: unauthorized user sees appropriate message | | |

### Themes (if multi-theme)
| Check | Status | Notes |
|-------|--------|-------|
| Each theme looks intentionally designed (not just inverted) | | |
| No elements invisible or unreadable in any theme | | |
| Theme preference persists across page loads | | |
| Theme works on first load (no flash of wrong theme) | | |
| System preference detection works (prefers-color-scheme) | | |

### Accessibility
| Check | Status | Notes |
|-------|--------|-------|
| `prefers-reduced-motion: reduce` → no animations | | |
| Tab through entire page → focus ring visible everywhere | | |
| Skip-to-content link → visible on focus, jumps to main | | |
| Form inputs all have labels (visible or aria-label) | | |
| Screen reader reads page in logical order | | |

### Performance
| Check | Status | Notes |
|-------|--------|-------|
| First paint < 1s on broadband | | |
| No layout shift after font/image load | | |
| Above-fold images load immediately | | |
| Below-fold images lazy-loaded | | |
| No blocking scripts in head | | |

---

## Completion Criteria

| Result | Action |
|--------|--------|
| All ✓ | Ship it |
| Any ⚠ | Fix or accept risk — document in known issues |
| Any ✗ | Fix before shipping — these are states your users WILL encounter |

**Critical failures (always fix before shipping):**
- Any empty state that shows a blank page
- Any error state that shows raw error text or stack trace
- Any protected page accessible without auth
- Any theme where text is unreadable
- No loading feedback on data-fetching pages
```
