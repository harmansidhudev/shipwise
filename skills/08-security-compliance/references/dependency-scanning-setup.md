# Dependency Scanning & Secret Scanning Setup

## When to use
Reference this when setting up a new project's CI/CD pipeline, onboarding an existing project to automated security scanning, or adding pre-commit hooks for secret detection.

## Decision framework

```
What do you need?
├── Automated dependency update PRs → Dependabot (GitHub native) or Renovate (any platform)
├── Vulnerability scanning in CI → Snyk (comprehensive) or Socket (supply chain focus)
├── Quick audit in CI → npm audit / pnpm audit (built-in, free)
├── Pre-commit secret blocking → gitleaks (fast, local)
├── Historical secret scanning → trufflehog (scans git history)
└── All of the above → Recommended for production apps
```

---

## Copy-paste template

### 1. Dependabot Configuration (GitHub)

```yaml
# .github/dependabot.yml
# [CUSTOMIZE] Adjust package-ecosystem, directory, and schedule

version: 2
updates:
  # JavaScript / Node.js dependencies
  - package-ecosystem: "npm"
    directory: "/"                    # [CUSTOMIZE] Path to package.json
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "America/New_York"   # [CUSTOMIZE] Your timezone
    open-pull-requests-limit: 10
    reviewers:
      - "your-team"                  # [CUSTOMIZE] GitHub team or username
    labels:
      - "dependencies"
      - "security"
    # Group minor/patch updates into a single PR to reduce noise
    groups:
      production-deps:
        patterns:
          - "*"
        exclude-patterns:
          - "@types/*"
          - "eslint*"
          - "prettier*"
          - "vitest*"
          - "playwright*"
        update-types:
          - "minor"
          - "patch"
      dev-deps:
        patterns:
          - "@types/*"
          - "eslint*"
          - "prettier*"
          - "vitest*"
          - "playwright*"
        update-types:
          - "minor"
          - "patch"
    # Auto-merge patch updates that pass CI
    # [CUSTOMIZE] Requires branch protection rules with required status checks

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "ci"
      - "dependencies"

  # Docker (if applicable)
  # - package-ecosystem: "docker"
  #   directory: "/"
  #   schedule:
  #     interval: "weekly"
```

---

### 2. Renovate Configuration (Any Platform)

```json5
// renovate.json
// [CUSTOMIZE] Adjust to your repository structure and preferences
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended",
    ":semanticCommits",
    ":automergeMinor",
    "group:recommended",
    "schedule:weekdays"
  ],
  // [CUSTOMIZE] Set your timezone
  "timezone": "America/New_York",
  // [CUSTOMIZE] Set auto-merge for patch updates (requires CI checks)
  "packageRules": [
    {
      "description": "Auto-merge non-major dev dependencies",
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true,
      "automergeType": "pr",
      "platformAutomerge": true
    },
    {
      "description": "Auto-merge patch production dependencies",
      "matchDepTypes": ["dependencies"],
      "matchUpdateTypes": ["patch"],
      "automerge": true,
      "automergeType": "pr",
      "platformAutomerge": true
    },
    {
      "description": "Group ESLint-related packages",
      "matchPackagePatterns": ["eslint"],
      "groupName": "eslint"
    },
    {
      "description": "Group testing packages",
      "matchPackagePatterns": ["vitest", "playwright", "@testing-library"],
      "groupName": "testing"
    },
    {
      "description": "Pin GitHub Actions to SHA",
      "matchManagers": ["github-actions"],
      "pinDigests": true
    }
  ],
  // Limit concurrent PRs to avoid overwhelming the team
  "prConcurrentLimit": 10,
  // Security updates bypass the schedule
  "vulnerabilityAlerts": {
    "enabled": true,
    "labels": ["security"],
    "schedule": ["at any time"]
  }
}
```

---

### 3. Snyk CI Integration

```yaml
# .github/workflows/security.yml
# [CUSTOMIZE] Set SNYK_TOKEN as a repository secret

name: Security Scan
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 8 * * 1'    # Weekly Monday scan

jobs:
  snyk-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'       # [CUSTOMIZE] Your Node version
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: >
            --severity-threshold=high
            --fail-on=all
        continue-on-error: false    # Fail the build on high/critical vulns

      - name: Run Snyk Code (SAST)
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          command: code test
        continue-on-error: true     # SAST findings are advisory
```

**Socket.dev alternative (supply chain focus)**:

```yaml
# .github/workflows/socket.yml
# Socket detects supply chain attacks (typosquatting, install scripts, etc.)
# [CUSTOMIZE] Set SOCKET_SECURITY_API_KEY as a repository secret

name: Socket Security
on:
  pull_request:
    paths:
      - 'package.json'
      - 'package-lock.json'
      - 'pnpm-lock.yaml'

jobs:
  socket-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: SocketDev/socket-security-action@v1
        with:
          api_key: ${{ secrets.SOCKET_SECURITY_API_KEY }}
```

---

### 4. npm audit in CI

```yaml
# Add to your existing CI workflow
# No secrets or third-party services required

- name: Security audit
  run: |
    # Fail on high and critical vulnerabilities
    npm audit --audit-level=high

    # Verify lock file integrity (detect supply chain tampering)
    npm ci --ignore-scripts

    # Check for known vulnerable packages
    npx is-website-vulnerable https://your-staging-url.com || true
```

**pnpm equivalent**:

```yaml
- name: Security audit (pnpm)
  run: |
    pnpm audit --audit-level high
    pnpm install --frozen-lockfile
```

---

### 5. gitleaks Pre-Commit Hook

```toml
# .gitleaks.toml
# [CUSTOMIZE] Add project-specific rules and allowlists

title = "gitleaks config"

# Extend the default rules (detects AWS keys, GitHub tokens, etc.)
[extend]
useDefault = true

# [CUSTOMIZE] Allowlist false positives
[allowlist]
description = "Global allowlist"
paths = [
    '''\.gitleaks\.toml$''',
    '''\.github/.*\.yml$''',
    '''go\.sum$''',
    '''package-lock\.json$''',
    '''pnpm-lock\.yaml$''',
    '''\.test\.(ts|js)$''',          # Test files often have fake secrets
    '''\.spec\.(ts|js)$''',
]

# [CUSTOMIZE] Add custom rules for your specific secret patterns
# [[rules]]
# id = "custom-internal-token"
# description = "Internal API token pattern"
# regex = '''INTERNAL_[A-Z]+_TOKEN\s*=\s*['"][a-zA-Z0-9]{32,}['"]'''
# tags = ["internal", "token"]
```

```yaml
# .pre-commit-config.yaml
# Install: pip install pre-commit && pre-commit install
# [CUSTOMIZE] Pin to the latest gitleaks version

repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.21.2              # [CUSTOMIZE] Pin to latest version
    hooks:
      - id: gitleaks

  # Optional: additional pre-commit hooks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: detect-private-key
      - id: check-added-large-files
        args: ['--maxkb=1000']
      - id: no-commit-to-branch
        args: ['--branch', 'main', '--branch', 'master']
```

**Quick install commands**:

```bash
# Install gitleaks
brew install gitleaks                 # macOS
# or: go install github.com/gitleaks/gitleaks/v8@latest

# Install pre-commit and activate hooks
pip install pre-commit
pre-commit install

# Test the hook manually
pre-commit run gitleaks --all-files

# Run gitleaks standalone scan
gitleaks detect --source . --verbose
```

---

### 6. trufflehog Historical Scanning

```yaml
# .github/workflows/trufflehog.yml
# Scans entire git history for leaked secrets
# [CUSTOMIZE] Set up alerts for findings

name: TruffleHog Secret Scan
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  trufflehog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0     # Full history needed for scanning

      - name: TruffleHog scan
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified --results=verified
```

**Local scanning**:

```bash
# Install trufflehog
brew install trufflehog               # macOS
# or: curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sh

# Scan current repository (full history)
trufflehog git file://. --only-verified

# Scan a specific branch
trufflehog git file://. --branch main --only-verified

# Scan a remote repo before cloning
trufflehog git https://github.com/your-org/your-repo.git --only-verified
```

---

### 7. Combined CI Security Workflow

```yaml
# .github/workflows/security.yml
# [CUSTOMIZE] Enable/disable jobs based on your tooling choices

name: Security
on:
  push:
    branches: [main]
  pull_request:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'         # [CUSTOMIZE]
          cache: 'npm'
      - run: npm ci
      - name: npm audit
        run: npm audit --audit-level=high
      - name: Lock file check
        run: npm ci --ignore-scripts  # Ensures lock file is in sync

  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  trufflehog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified
```

---

## Customization notes

- **Dependabot vs Renovate**: Dependabot is built into GitHub and requires zero setup beyond the YAML file. Renovate is more configurable and works on GitLab, Bitbucket, and self-hosted. Choose Renovate if you need auto-merge logic or complex grouping.
- **Snyk vs Socket**: Snyk is comprehensive (SCA + SAST + container scanning). Socket focuses on supply chain attacks (malicious packages, install scripts). Use both for maximum coverage, or Snyk alone for simplicity.
- **gitleaks vs trufflehog**: gitleaks is best as a pre-commit hook (fast, local). trufflehog is best for CI/historical scanning (thorough, verifies secrets are real). Use both.
- **Lock file strategy**: Always commit lock files. Run `npm ci` (not `npm install`) in CI to ensure reproducible builds and detect supply chain attacks.
- **False positives**: Configure `.gitleaks.toml` allowlists for test fixtures and mock data that trigger false positives. Never allowlist patterns broadly.

## Companion tools

- `agamm/claude-code-owasp` — Integrates OWASP scanning with dependency checks
- `trailofbits/skills` — Advanced supply chain analysis
