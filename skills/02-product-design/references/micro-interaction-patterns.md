# Micro-Interaction Patterns

Micro-interactions are small animations and state changes that give users feedback about what just happened or what will happen next. They turn static interfaces into responsive ones that feel alive and trustworthy.

## When to use

Reference this when building interactive UI components — buttons, notifications, loading states, progress indicators, or any element that changes state in response to user action. Cross-references skill 05 (fullstack-development) for implementation.

---

## 1. Button state machine

**State diagram:** `idle → hover → active → loading → success/error → idle`

| State | Visual | Cursor | ARIA | Duration |
|-------|--------|--------|------|----------|
| Idle | Default bg/text | `pointer` | — | — |
| Hover | bg darken 5% | `pointer` | — | instant |
| Active | bg darken 10%, scale 0.98 | `pointer` | — | instant |
| Loading | Spinner, text hidden | `not-allowed` | `aria-busy="true"` `aria-disabled="true"` | varies |
| Success | Green tint, checkmark | `default` | `aria-live="polite"` | 1.5s then idle |
| Error | Red tint, shake | `default` | `aria-live="assertive"` | 2s then idle |

**Rules:**
- If loading → preserve button width with `min-width` so layout does not shift
- If success → auto-return to idle after 1.5s
- If error → shake animation (translateX oscillation), auto-return after 2s

### Copy-paste: SubmitButton

```tsx
// [CUSTOMIZE] Adjust colors, durations, and icon imports for your design system
import { useState, useEffect, type ButtonHTMLAttributes } from 'react';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onSubmit: () => Promise<void>;
  label: string;
}

export function SubmitButton({ onSubmit, label, className = '', ...props }: SubmitButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');

  useEffect(() => {
    if (state === 'success') { const t = setTimeout(() => setState('idle'), 1500); return () => clearTimeout(t); }
    if (state === 'error') { const t = setTimeout(() => setState('idle'), 2000); return () => clearTimeout(t); }
  }, [state]);

  async function handleClick() {
    if (state === 'loading') return;
    setState('loading');
    try { await onSubmit(); setState('success'); } catch { setState('error'); }
  }

  // [CUSTOMIZE] Replace Tailwind classes to match your color tokens
  const styles: Record<ButtonState, string> = {
    idle: 'bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98] cursor-pointer',
    loading: 'bg-primary-400 text-white cursor-not-allowed',
    success: 'bg-green-500 text-white cursor-default',
    error: 'bg-red-500 text-white cursor-default animate-shake',
  };

  return (
    <button
      type="button" onClick={handleClick} disabled={state === 'loading'}
      aria-busy={state === 'loading'} aria-disabled={state === 'loading'}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-w-[120px] ${styles[state]} ${className}`}
      {...props}
    >
      {state === 'loading' && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {state === 'success' && <span className="mr-2">&#10003;</span>}
      {state === 'loading' ? 'Saving...' : state === 'success' ? 'Done!' : state === 'error' ? 'Failed' : label}
    </button>
  );
}

// [CUSTOMIZE] tailwind.config.ts — shake keyframe:
// keyframes: { shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-4px)' }, '75%': { transform: 'translateX(4px)' } } }
// animation: { shake: 'shake 0.3s ease-in-out' }
```

---

## 2. Toast / notification patterns

| Type | Color | Icon | Auto-dismiss? | Duration |
|------|-------|------|---------------|----------|
| Success | green-50 / green-500 | Checkmark circle | Yes | 3s |
| Error | red-50 / red-500 | X circle | No (manual) | Persistent |
| Warning | amber-50 / amber-500 | Triangle | Yes | 5s |
| Info | blue-50 / blue-500 | Info circle | Yes | 4s |

**Positioning:** if desktop → top-right (16px from edge). If mobile → bottom-center (safe area aware).
**Stacking:** max 3 visible, queue the rest. Include `aria-live="polite"` on the container.

### Copy-paste: Toast system

```tsx
// [CUSTOMIZE] Adjust icons, colors, and positioning for your design system
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: string; type: ToastType; message: string; }
interface ToastCtx { addToast: (type: ToastType, message: string) => void; removeToast: (id: string) => void; }

const ToastContext = createContext<ToastCtx | null>(null);

// [CUSTOMIZE] Change durations per toast type
const DISMISS_MS: Record<ToastType, number | null> = { success: 3000, error: null, warning: 5000, info: 4000 };
const STYLES: Record<ToastType, string> = {
  success: 'border-green-500 bg-green-50 text-green-800',
  error: 'border-red-500 bg-red-50 text-red-800',
  warning: 'border-amber-500 bg-amber-50 text-amber-800',
  info: 'border-blue-500 bg-blue-50 text-blue-800',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const removeToast = useCallback((id: string) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  const addToast = useCallback((type: ToastType, message: string) => {
    setToasts((p) => [...p, { id: crypto.randomUUID(), type, message }].slice(-3));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-sm:bottom-4 max-sm:left-1/2 max-sm:top-auto max-sm:right-auto max-sm:-translate-x-1/2" aria-live="polite">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const ms = DISMISS_MS[toast.type]; if (!ms) return;
    const t = setTimeout(onDismiss, ms); return () => clearTimeout(t);
  }, [toast.type, onDismiss]);

  return (
    <div role="status" className={`flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 shadow-md ${STYLES[toast.type]}`}>
      <span className="flex-1 text-sm">{toast.message}</span>
      <button onClick={onDismiss} className="opacity-50 hover:opacity-100" aria-label="Dismiss">&#10005;</button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
```

---

## 3. Skeleton screens vs spinners

```
What am I loading?
├── Content with known structure (dashboard, list, card grid)
│   → Skeleton screen (matches layout shape)
├── Content with unknown structure (search results, dynamic)
│   → Inline spinner or indeterminate progress bar
├── Full page load
│   → Skeleton of page layout (header + content area)
├── Small component within a page
│   → Inline spinner (not full-page overlay)
└── Action feedback (button click, form submit)
    → Button spinner (see section 1)
```

**Quick rule:** if you can draw the shape before it loads → skeleton. If you cannot → spinner.

### Copy-paste: Skeleton component

```tsx
// [CUSTOMIZE] Adjust colors and animation speed
interface SkeletonProps {
  variant: 'line' | 'circle' | 'rectangle';
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ variant, width, height, className = '' }: SkeletonProps) {
  const base = 'animate-pulse bg-neutral-200 dark:bg-neutral-700';
  const shape = { line: 'h-4 rounded', circle: 'rounded-full', rectangle: 'rounded-lg' }[variant];

  return (
    <div
      className={`${base} ${shape} ${className}`}
      style={{ width: width ?? '100%', height: height ?? (variant === 'circle' ? width : undefined) }}
      role="status" aria-label="Loading..."
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Usage: card skeleton
export function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 p-4">
      <Skeleton variant="rectangle" height="160px" />
      <Skeleton variant="line" width="60%" />
      <Skeleton variant="line" width="90%" />
      <Skeleton variant="line" width="40%" />
    </div>
  );
}
```

---

## 4. Optimistic UI

Optimistic UI shows the expected result immediately, then reconciles with the server in the background.

**Decision:** if action is reversible AND low-risk → optimistic. If payment or destructive → wait for server.

| Action | Optimistic? | Rollback strategy |
|--------|-------------|-------------------|
| Toggle / like | Yes | Revert state + error toast |
| List reorder | Yes | Revert position + error toast |
| Message send | Yes | Show "sending..." then confirm |
| Payment | **No** | Wait for server confirmation |
| Delete | **No** | Wait for confirmation dialog |

### Copy-paste: useOptimisticMutation hook

```tsx
// [CUSTOMIZE] Replace with your data-fetching library (React Query, SWR, etc.)
import { useState, useCallback } from 'react';

interface UseOptimisticMutationOptions<T> {
  currentValue: T;
  optimisticValue: T;
  mutationFn: () => Promise<T>;
  onError?: (error: unknown) => void;
}

export function useOptimisticMutation<T>({ currentValue, optimisticValue, mutationFn, onError }: UseOptimisticMutationOptions<T>) {
  const [data, setData] = useState<T>(currentValue);
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async () => {
    const prev = data;
    setData(optimisticValue);
    setIsPending(true);
    try { const server = await mutationFn(); setData(server); }
    catch (e) { setData(prev); onError?.(e); }
    finally { setIsPending(false); }
  }, [data, optimisticValue, mutationFn, onError]);

  return { data, mutate, isPending };
}

// Usage: const { data: isLiked, mutate: toggleLike } = useOptimisticMutation({
//   currentValue: false, optimisticValue: true,
//   mutationFn: () => api.toggleLike(postId),
//   onError: () => toast.addToast('error', 'Could not update.'),
// });
```

---

## 5. Progress indicators

**Rule:** if you know the total → determinate (shows %). If you do not → indeterminate (animated loop).

| Scenario | Type | Visual |
|----------|------|--------|
| File upload | Determinate | Progress bar with % |
| Multi-step wizard | Determinate | Step counter (2 of 5) |
| Server processing | Indeterminate | Pulsing bar |
| Search query | Indeterminate | Inline spinner |

### Copy-paste: ProgressBar

```tsx
// [CUSTOMIZE] Adjust height, colors, and border-radius
interface ProgressBarProps {
  value?: number; // 0-100 for determinate, undefined for indeterminate
  label?: string;
  className?: string;
}

export function ProgressBar({ value, label, className = '' }: ProgressBarProps) {
  const det = value !== undefined;
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="mb-1 flex justify-between text-sm text-neutral-600">
          <span>{label}</span>{det && <span>{Math.round(value)}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200" role="progressbar"
        aria-valuenow={det ? value : undefined} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Progress'}>
        {det
          ? <div className="h-full rounded-full bg-primary-500 transition-all duration-300 ease-out" style={{ width: `${value}%` }} />
          : <div className="h-full w-1/3 animate-indeterminate rounded-full bg-primary-500" />}
      </div>
    </div>
  );
}
// [CUSTOMIZE] tailwind.config.ts — indeterminate keyframe:
// keyframes: { indeterminate: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(400%)' } } }
// animation: { indeterminate: 'indeterminate 1.5s ease-in-out infinite' }
```

### Copy-paste: ProgressRing (circular, for small spaces)

```tsx
// [CUSTOMIZE] Adjust size and strokeWidth
interface ProgressRingProps { value: number; size?: number; strokeWidth?: number; className?: string; }

export function ProgressRing({ value, size = 40, strokeWidth = 4, className = '' }: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className={className} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-neutral-200" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
        strokeDasharray={c} strokeDashoffset={c - (value/100)*c} strokeLinecap="round"
        className="text-primary-500 transition-all duration-300 -rotate-90 origin-center" />
    </svg>
  );
}
```

---

## 6. Hover and focus states

Every interactive element needs: default, hover, focus-visible, active, disabled. Use `focus-visible` (not `focus`) so the ring only shows on keyboard navigation.

| Element | Hover | focus-visible | Active | Disabled |
|---------|-------|---------------|--------|----------|
| Button | bg darken 5% | 2px ring primary-500 | bg darken 10%, scale 0.98 | opacity 50%, no pointer |
| Link | underline | 2px ring primary-500 | color darken 10% | opacity 50% |
| Card | shadow-md | 2px ring primary-500 | shadow-lg | opacity 50% |
| Input | border darken | 2px ring primary-500 | border primary-500 | bg gray-50, no cursor |

### Copy-paste: Tailwind utility classes

```tsx
// [CUSTOMIZE] Replace primary-500 with your brand color token
export const interactiveStyles = {
  button: `bg-primary-500 text-white hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:bg-primary-700 active:scale-[0.98]
    disabled:opacity-50 disabled:pointer-events-none transition-all duration-150`,
  link: `text-primary-500 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-primary-500 focus-visible:rounded-sm active:text-primary-700`,
  card: `rounded-lg border border-neutral-200 shadow-sm hover:shadow-md focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-primary-500 active:shadow-lg transition-shadow duration-200`,
  input: `rounded-md border border-neutral-300 px-3 py-2 hover:border-neutral-400 focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed
    disabled:opacity-50 transition-colors duration-150`,
} as const;
```

---

## 7. Transition and animation timing

| Category | Duration | Easing | Examples |
|----------|----------|--------|----------|
| Micro-interaction | 100-150ms | ease-out | Hover, toggle, tooltip show |
| State change | 200-300ms | ease-in-out | Expand/collapse, tab switch, modal open |
| Page transition | 300-500ms | ease-in-out | Route change, page slide |
| Emphasis | 400-600ms | spring/bounce | Celebration, success state |

**Rule:** if you cannot articulate WHY it is animated, remove the animation.

**Reduced motion:** always wrap animations in a `prefers-reduced-motion` check. Users who set this may experience motion sickness.

### Copy-paste: Timing tokens + reduced-motion

```css
/* [CUSTOMIZE] Add to your global CSS or Tailwind @layer */
:root {
  --duration-micro: 150ms;
  --duration-state: 250ms;
  --duration-page: 400ms;
  --duration-emphasis: 500ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root { --duration-micro: 0ms; --duration-state: 0ms; --duration-page: 0ms; --duration-emphasis: 0ms; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```ts
// [CUSTOMIZE] Add to tailwind.config.ts
// theme: { extend: { transitionDuration: { micro: '150ms', state: '250ms', page: '400ms', emphasis: '500ms' } } }
```

---

## 8. Feedback for destructive actions

- If truly irreversible → **confirmation dialog** (custom modal, NOT `window.confirm()`)
- If recoverable (soft-delete) → **undo toast** with countdown

### Copy-paste: ConfirmDeleteDialog

```tsx
// [CUSTOMIZE] Integrate with your modal/dialog library
interface ConfirmDeleteDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  consequenceMessage: string; // e.g. "This will permanently delete 24 files"
  itemName: string;
}

export function ConfirmDeleteDialog({ open, onConfirm, onCancel, consequenceMessage, itemName }: ConfirmDeleteDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 id="confirm-title" className="text-lg font-semibold text-neutral-900">Delete {itemName}?</h2>
        <p className="mt-2 text-sm text-neutral-600">{consequenceMessage}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">Cancel</button>
          <button onClick={onConfirm} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" autoFocus>Delete</button>
        </div>
      </div>
    </div>
  );
}
```

### Copy-paste: UndoToast

```tsx
// [CUSTOMIZE] Adjust countdown duration and styling
import { useState, useEffect } from 'react';

interface UndoToastProps { message: string; countdownSeconds?: number; onUndo: () => void; onExpire: () => void; }

export function UndoToast({ message, countdownSeconds = 5, onUndo, onExpire }: UndoToastProps) {
  const [remaining, setRemaining] = useState(countdownSeconds);
  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);

  return (
    <div role="status" aria-live="assertive" className="flex items-center gap-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 shadow-md">
      <span className="flex-1 text-sm text-amber-800">{message}</span>
      <button onClick={onUndo} className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700">Undo ({remaining}s)</button>
    </div>
  );
}
```

---

## 9. Anti-patterns

| Anti-pattern | Why it hurts | Fix |
|-------------|-------------|-----|
| Animating everything | Cognitive overload; users stop noticing | Only animate state changes needing attention |
| Spinners for known-layout content | Page jumps when content loads | Use skeleton screens matching content shape |
| Toast for validation errors | User scans away from the form | Use inline errors below the field |
| Optimistic UI for payments | Payment could fail; user thinks it worked | Wait for server confirmation |
| No loading state on buttons | User double-clicks, submitting twice | Add loading state + disable during submit |
| Ignoring prefers-reduced-motion | Motion-sensitive users feel discomfort | Wrap all animations in reduced-motion query |
| Focus ring on mouse click | Annoying visual flash for mouse users | Use `focus-visible` instead of `focus` |
| No feedback on page transitions | User unsure if navigation worked | Add brief transition or loading indicator |
| Success states that never dismiss | Stale notifications clutter the screen | Auto-dismiss success/info toasts after 3-4s |
| Generic "Loading..." text | No context about what is loading | Use "Loading your dashboard..." instead |

---

## Companion tools

- `anthropics/claude-code` -> `frontend-design` skill -- Implement micro-interactions
- `bencium/bencium-marketplace` -> `controlled-ux-designer` -- Motion specification and easing curves (MOTION-SPEC.md)
- `bencium/bencium-marketplace` -> `typography` -- Text animation and transition patterns
