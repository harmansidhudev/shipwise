# Deploy Gate Tests

## Purpose
Verify that the pre-deploy gate catches real gaps and doesn't false-trigger.

## Should trigger
| Command | P0 gaps | Expected |
|---------|---------|----------|
| `vercel --prod` | 3 P0 items | Warning with gap list |
| `fly deploy` | 1 P0 item | Warning with gap list |
| `git push origin main` (with deploy hook) | 5 P0 items | Warning with top 5 gaps |
| `railway up` | 2 P0 items | Warning with gap list |

## Should NOT trigger
| Command | Reason |
|---------|--------|
| `npm run dev` | Not a deploy command |
| `git push origin feature-branch` | Not pushing to prod |
| `vercel --prod` with 0 P0 items | No gaps to warn about |
| `npm run build` | Build, not deploy |
| `docker build .` | Building image, not deploying |

## Experience-adjusted output
| Level | P0 gaps | Expected output |
|-------|---------|-----------------|
| beginner | 3 | Gap list + time estimates + "Want me to fix these?" |
| intermediate | 3 | Gap list + time estimates |
| senior | 3 | Gap list only |

## Post-deploy suggestion (G9)
All levels should see: "After deploying, say 'verify deploy' and I'll check your production health endpoint."

## Success criteria
- 100% trigger rate on deploy commands with P0 gaps
- 0% false trigger rate on non-deploy commands
- 0% trigger rate when no P0 gaps exist
- Correct experience-adjusted output format
