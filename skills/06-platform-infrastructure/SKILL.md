---
name: platform-infrastructure
description: "CI/CD, containerization, IaC, environment management, secrets, DNS/SSL, and CDN configuration."
triggers:
  - "CI/CD"
  - "GitHub Actions"
  - "Docker"
  - "Terraform"
  - "deploy pipeline"
  - "secrets management"
  - "environment variables"
  - "DNS"
  - "SSL"
  - "CDN"
---

# Platform & Infrastructure

> Phase 2: BUILD | Sprint 2 (planned)

## Coverage

- CI/CD architecture (GitHub Actions recommended, branch strategy, deploy gates)
- Container strategy (Dockerfile best practices, Docker Compose for local dev)
- IaC (Terraform recommended, module structure, remote state)
- Environment management (dev/staging/prod parity, env vars, feature branches)
- Secrets management (vault-based, rotation, audit logging, pre-commit scanning)
- Domain/DNS/SSL (Cloudflare recommended, automated certs, HSTS)
- CDN configuration (cache rules, busting, purge on deploy)

## Checklist Items

### CI/CD Pipeline
<!-- beginner -->
**Set up a CI/CD pipeline** — This automatically tests and deploys your code when you push to GitHub. Without it, you're deploying manually (error-prone) and might ship broken code.
→ Time: ~30 min with GitHub Actions
→ Template: See `references/cicd-pipeline-templates/`

<!-- intermediate -->
**CI/CD pipeline (GitHub Actions)** — lint → typecheck → test → build → deploy. Branch protection on main.
→ ~30 min

<!-- senior -->
**CI/CD** → GHA: lint/type/test/build/deploy gates.

## Companion tools
- `antonbabenko/terraform-skill`
- `alirezarezvani/claude-skills` → `ci-cd-builder`, `senior-devops-engineer`
- `zxkane/aws-skills`
