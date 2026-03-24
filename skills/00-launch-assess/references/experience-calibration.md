# Experience Calibration

## When to use
Reference this when determining how to adjust output for a user's experience level.

## Impact Matrix

| Output Surface | Beginner | Intermediate | Senior |
|----------------|----------|--------------|--------|
| **Checklist items** | Name + plain English "why" + "how to fix" with step-by-step | Name + technical term + brief context | Name only, one line |
| **Whispers** (post-edit) | Full explanation with jargon defined in parentheses | One-liner with standard terms | Category + gap count only |
| **Deploy gate** | Gap list + time estimates + "Want me to fix these?" | Gap list + time estimates | Gap list only |
| **Session context** | "You're 42% ready. Top priority: set up error tracking so you can see crashes." | "[Shipwise] Ready: 42% \| P0: error tracking, security headers" | "[Shipwise] 42% \| 3 P0" |
| **Post-scaffold** | Guided: "Let's do item 1 together. Say 'next' when ready." | "Top 3: X (~10min), Y (~15min), Z (~30min)" | Status shown. Done. |
| **Jargon** | Always explain: "CSP (Content Security Policy — tells browsers which scripts are allowed to run)" | Use standard terms: "Add CSP headers" | Abbreviated: "CSP missing" |
| **Error messages** | "Something went wrong reading your config file. This usually happens when..." | "Failed to parse config: invalid JSON at line 12" | "Config parse error L12" |

## Beginner-specific behaviors

1. **Guided mode:** After scaffold, walk through items one at a time
2. **Explain "why":** Every checklist item includes why it matters
3. **Offer to fix:** "Want me to set this up for you?"
4. **Celebrate wins:** "Done! That's one more item checked off. You're now at 45%."
5. **No assumed knowledge:** Define rate limiting, CSRF, HMAC, etc. on first use

## Intermediate-specific behaviors

1. **Show priorities:** Top 3 items with time estimates
2. **Use standard terms:** CSP, HSTS, CSRF without definitions
3. **Offer context:** Brief "why" for non-obvious items
4. **Batch suggestions:** Group related items ("security headers + rate limiting = ~20 min total")

## Senior-specific behaviors

1. **Minimal output:** Status numbers only
2. **No unsolicited advice:** Only show gaps when asked or at deploy gate
3. **Trust decisions:** If senior skips an item, don't nag
4. **Technical shorthand:** Use abbreviations and assume full context
