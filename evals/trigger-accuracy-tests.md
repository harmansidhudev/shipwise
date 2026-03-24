# Trigger Accuracy Tests

## Purpose
Verify that shipwise skills activate on the correct file edits and user prompts.

## Test cases

### Skill 04: tech-architecture
| # | Input | Expected trigger | Pass criteria |
|---|-------|-----------------|---------------|
| 1 | User asks "What framework should I use?" | tech-architecture | Skill loads, presents framework matrix |
| 2 | User asks "Should I use REST or GraphQL?" | tech-architecture | Skill loads, presents API decision tree |
| 3 | User asks "Which database for my SaaS?" | tech-architecture | Skill loads, presents DB selection guide |

### Skill 05: fullstack-development
| # | Input | Expected trigger | Pass criteria |
|---|-------|-----------------|---------------|
| 1 | User edits a React component | fullstack-development | Skill available for component patterns |
| 2 | User creates an API route file | fullstack-development | Skill available for API patterns |
| 3 | User edits database schema | fullstack-development | Skill available for migration guidance |

### Skill 06: platform-infrastructure
| # | Input | Expected trigger | Pass criteria |
|---|-------|-----------------|---------------|
| 1 | User edits .github/workflows/*.yml | platform-infrastructure | Skill loads with CI/CD guidance |
| 2 | User creates Dockerfile | platform-infrastructure | Skill loads with container best practices |
| 3 | User edits terraform files | platform-infrastructure | Skill loads with IaC guidance |

### Skill 07: quality-assurance
| # | Input | Expected trigger | Pass criteria |
|---|-------|-----------------|---------------|
| 1 | User asks "How should I test this?" | quality-assurance | Skill loads with testing pyramid |
| 2 | User creates *.test.ts file | quality-assurance | Skill available |
| 3 | User asks about E2E testing | quality-assurance | Skill loads with Playwright guidance |

### Skill 08: security-compliance
| # | Input | Expected trigger | Pass criteria |
|---|-------|-----------------|---------------|
| 1 | User edits auth/login code | security-compliance | Skill loads with auth hardening |
| 2 | User asks about OWASP | security-compliance | Skill loads with OWASP checklist |
| 3 | User edits security headers | security-compliance | Skill loads with header templates |

### Skill 09: observability-reliability
| # | Input | Expected trigger | Pass criteria |
|---|-------|-----------------|---------------|
| 1 | User sets up Sentry | observability-reliability | Skill loads with Sentry config |
| 2 | User creates health endpoint | observability-reliability | Skill loads with health patterns |
| 3 | User asks about monitoring | observability-reliability | Skill loads with monitoring stack |

### Skill 10: seo-performance
| # | Input | Expected trigger | Pass criteria |
|---|-------|-----------------|---------------|
| 1 | User asks "How do I improve my SEO?" | seo-performance | Skill loads with SEO checklist |
| 2 | User edits robots.txt or sitemap.xml | seo-performance | Skill loads with SEO file templates |
| 3 | User asks about Core Web Vitals | seo-performance | Skill loads with performance guidance |

### Skill 11: billing-payments
| # | Input | Expected trigger | Pass criteria |
|---|-------|-----------------|---------------|
| 1 | User asks "How do I add Stripe?" | billing-payments | Skill loads with Stripe integration guide |
| 2 | User creates a webhook handler for payments | billing-payments | Skill loads with webhook patterns |
| 3 | User asks about subscription billing | billing-payments | Skill loads with subscription model guidance |

### Skill 12: legal-compliance-final
| # | Input | Expected trigger | Pass criteria |
|---|-------|-----------------|---------------|
| 1 | User asks "Do I need a privacy policy?" | legal-compliance-final | Skill loads with privacy policy template |
| 2 | User asks about GDPR | legal-compliance-final | Skill loads with GDPR checklist |
| 3 | User creates terms-of-service page | legal-compliance-final | Skill loads with legal document guidance |

### Skill 13: launch-execution
| # | Input | Expected trigger | Pass criteria |
|---|-------|-----------------|---------------|
| 1 | User asks "How do I launch my app?" | launch-execution | Skill loads with launch checklist |
| 2 | User asks about go-live planning | launch-execution | Skill loads with launch timeline |
| 3 | User says "I'm ready to deploy to production" | launch-execution | Skill loads with pre-launch verification |

### Skill 14: growth-ops
| # | Input | Expected trigger | Pass criteria |
|---|-------|-----------------|---------------|
| 1 | User asks "How do I get more users?" | growth-ops | Skill loads with growth strategy |
| 2 | User asks about analytics setup | growth-ops | Skill loads with analytics guidance |
| 3 | User asks about user retention | growth-ops | Skill loads with retention patterns |

### Cross-skill disambiguation
| # | Input | Could trigger | Should trigger | Rationale |
|---|-------|--------------|----------------|-----------|
| 1 | "Add Stripe checkout" | billing-payments, fullstack-development | billing-payments | Payment-specific |
| 2 | "Write unit tests for auth" | quality-assurance, security-compliance | quality-assurance | Testing focus |
| 3 | "Deploy to production" | platform-infrastructure, launch-execution | launch-execution | Launch context |
| 4 | "Add a login page" | security-compliance, fullstack-development | fullstack-development | UI work, not security |
| 5 | "Fix the payment bug" | billing-payments, fullstack-development | fullstack-development | Bug fixing, not billing setup |
| 6 | "Set up error tracking" | observability-reliability, quality-assurance | observability-reliability | Observability focus |
| 7 | "Add meta tags for sharing" | seo-performance, fullstack-development | seo-performance | SEO-specific |
| 8 | "Create a pricing page" | billing-payments, fullstack-development | billing-payments | Pricing is billing domain |
| 9 | "Add cookie consent banner" | legal-compliance-final, fullstack-development | legal-compliance-final | Legal compliance focus |
| 10 | "Set up GitHub Actions for tests" | platform-infrastructure, quality-assurance | platform-infrastructure | CI/CD pipeline focus |

### Negative cases (should NOT trigger any skill)
| # | Input | Rationale |
|---|-------|-----------|
| 1 | "Fix the typo in the button label" | Simple edit, no domain relevance |
| 2 | "Rename this variable" | Refactoring, no domain relevance |
| 3 | "What time is it?" | Off-topic question |
| 4 | "Help me write a README" | Documentation, not launch lifecycle |

## Running these tests
These are manual evaluation tests. For each test case:
1. Start a fresh Claude session with shipwise installed
2. Provide the input
3. Check if the expected skill triggered
4. Record pass/fail

Target: 85%+ trigger accuracy across all test cases.
