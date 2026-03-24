# Whisper Quality Tests

## Purpose
Verify that post-edit whispers are useful, not noisy.

## Test Scenarios

### Should whisper
| File edited | Expected category | Expected behavior |
|-------------|------------------|-------------------|
| `src/auth/login.ts` | auth | Whisper auth checklist items |
| `src/api/payments/webhook.ts` | billing | Whisper payment security items |
| `.github/workflows/ci.yml` | cicd | Whisper pipeline best practices |
| `src/api/users/route.ts` | api | Whisper API checklist items |
| `.env.production` | secrets | Whisper .gitignore warning (always) |

### Should NOT whisper
| File edited | Reason |
|-------------|--------|
| `src/components/Button.tsx` | No matching category |
| `README.md` | No matching category |
| `package.json` | No matching category (too generic) |
| `src/utils/format.ts` | Utility file, no category match |

### Deduplication (G4)
| Sequence | Expected |
|----------|----------|
| Edit `auth/login.ts` → Edit `auth/signup.ts` | Whisper once (login), suppress second (signup) |
| Edit `auth/login.ts` → Edit `stripe/webhook.ts` | Whisper both (different categories) |

### Intent suppression (G5)
| User prompt | File created | Expected |
|-------------|--------------|----------|
| "Create a login page" | `auth/login.tsx` (Write) | Suppress (user knows what they're doing) |
| "Fix the bug" | `auth/login.tsx` (Edit) | Whisper (user may not be thinking about auth checklist) |
| "Add a .env file" | `.env` (Write) | Whisper (always warn about secrets) |

## Success criteria
- Zero whispers on non-matching files
- Dedup works within sessions
- Intent suppression works for Write (new file creation)
- Secrets category is never suppressed
