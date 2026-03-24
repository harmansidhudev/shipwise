# Trigger Accuracy Tests

## Purpose
Verify that the correct skill fires for each type of user prompt.

## Test Cases

### Skill 00: launch-assess
| Prompt | Expected | Notes |
|--------|----------|-------|
| "Help me launch my app" | 00-launch-assess | Primary trigger |
| "Am I ready to ship?" | 00-launch-assess | Readiness query |
| "What do I need to do before launch?" | 00-launch-assess | Gap assessment |
| "Where am I in the launch process?" | 00-launch-assess | Status query |

### Skill 04: tech-architecture
| Prompt | Expected | Notes |
|--------|----------|-------|
| "Should I use Next.js or SvelteKit?" | 04-tech-architecture | Framework selection |
| "What database should I use?" | 04-tech-architecture | DB selection |
| "REST or GraphQL for my API?" | 04-tech-architecture | API style |
| "Help me choose an auth provider" | 04-tech-architecture | Auth strategy |

### Skill 05: fullstack-development
| Prompt | Expected | Notes |
|--------|----------|-------|
| "How should I structure my React components?" | 05-fullstack-development | Component architecture |
| "Help me design my API routes" | 05-fullstack-development | API design |
| "What state management should I use?" | 05-fullstack-development | State management |
| "Help me set up database migrations" | 05-fullstack-development | DB migrations |

### Skill 08: security-compliance
| Prompt | Expected | Notes |
|--------|----------|-------|
| "Add security headers to my app" | 08-security-compliance | Security headers |
| "Is my auth secure?" | 08-security-compliance | Auth hardening |
| "OWASP checklist" | 08-security-compliance | OWASP |

### Cross-skill disambiguation
| Prompt | Should NOT trigger | Notes |
|--------|-------------------|-------|
| "Add a login page" | 08-security-compliance | This is UI work (05), not security |
| "Deploy my app" | 04-tech-architecture | This is ops (06), not architecture |
| "Fix the payment bug" | 11-billing-payments | Bug fixing, not billing setup |

## Success criteria
- 85%+ correct skill activation across all test prompts
- Zero false triggers on disambiguation cases
