# Deploy Gate Tests

## Purpose
Verify that the pre-deploy gate hook catches real deployment attempts with outstanding P0 gaps and does not false-trigger on non-deploy commands.

## Test Scenarios

### Should trigger (deploy commands with P0 gaps)
| # | Command | P0 gaps present | Expected behavior |
|---|---------|----------------|-------------------|
| 1 | `vercel --prod` | 3 P0 items | Warning with full gap list |
| 2 | `fly deploy` | 1 P0 item | Warning with gap list |
| 3 | `git push origin main` (with deploy hook) | 5 P0 items | Warning with top 5 gaps |
| 4 | `railway up` | 2 P0 items | Warning with gap list |
| 5 | `netlify deploy --prod` | 4 P0 items | Warning with gap list |
| 6 | `aws ecs update-service` | 1 P0 item | Warning with gap list |
| 7 | `kubectl apply -f deploy/` | 3 P0 items | Warning with gap list |
| 8 | `heroku container:release web` | 2 P0 items | Warning with gap list |

### Should NOT trigger (non-deploy commands)
| # | Command | Reason |
|---|---------|--------|
| 1 | `npm run dev` | Development server, not deploy |
| 2 | `git push origin feature-branch` | Not pushing to production branch |
| 3 | `npm run build` | Build step, not deploy |
| 4 | `docker build .` | Building image, not deploying |
| 5 | `npm install` | Installing dependencies |
| 6 | `git commit -m "fix bug"` | Committing, not deploying |
| 7 | `vercel` (no --prod flag) | Preview deployment, not production |
| 8 | `fly logs` | Viewing logs, not deploying |
| 9 | `railway logs` | Viewing logs, not deploying |
| 10 | `terraform plan` | Planning, not applying |

### Should NOT trigger (deploy commands, no P0 gaps)
| # | Command | P0 gaps present | Expected behavior |
|---|---------|----------------|-------------------|
| 1 | `vercel --prod` | 0 P0 items | No warning, deploy proceeds |
| 2 | `fly deploy` | 0 P0 items | No warning, deploy proceeds |
| 3 | `git push origin main` | 0 P0 items | No warning, deploy proceeds |
| 4 | `railway up` | 0 P0 items (has P1/P2 only) | No warning, deploy proceeds |

### Experience-adjusted output
| # | Level | P0 gap count | Expected output format |
|---|-------|-------------|----------------------|
| 1 | beginner | 3 | Gap list with explanations + time estimates + "Want me to fix these before you deploy?" |
| 2 | beginner | 1 | Single gap explanation + time estimate + "Want me to fix this first?" |
| 3 | intermediate | 3 | Gap list with time estimates, no offer to fix |
| 4 | intermediate | 1 | Single gap with time estimate |
| 5 | senior | 3 | Compact gap list only (no time estimates, no offers) |
| 6 | senior | 1 | Single line gap mention |

### Post-deploy verification suggestion
| # | Level | After deploy | Expected suggestion |
|---|-------|-------------|-------------------|
| 1 | beginner | Deploy completes | "Your app is deployed! Say 'verify deploy' and I'll check your production health endpoint, error tracking, and basic smoke tests." |
| 2 | intermediate | Deploy completes | "After deploying, say 'verify deploy' to check production health." |
| 3 | senior | Deploy completes | "Run 'verify deploy' to check prod health." |

### Edge cases
| # | Scenario | Expected behavior |
|---|----------|-------------------|
| 1 | No shipwise-state.json exists | No gate, no warning (shipwise not initialized) |
| 2 | State file exists but is malformed JSON | No gate, log parse error silently |
| 3 | State file has items but none have priority field | No gate (can't determine P0) |
| 4 | Deploy command in a script (e.g., `bash deploy.sh`) | Gate triggers if script contains deploy commands |
| 5 | Multiple deploy commands chained (`vercel --prod && fly deploy`) | Gate triggers once for the first deploy command |
| 6 | User ignores warning and deploys anyway | Warning shown but deploy is not blocked |

## Success criteria
- 100% trigger rate on deploy commands when P0 gaps exist
- 0% false trigger rate on non-deploy commands
- 0% trigger rate on deploy commands when no P0 gaps exist
- Correct experience-adjusted output format for all levels
- Post-deploy verification suggestion always present
- Gate is advisory only (never blocks the deploy)
- No errors when state file is missing or malformed
