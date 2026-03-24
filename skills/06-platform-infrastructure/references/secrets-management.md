# Secrets Management

## When to use
Reference this when setting up secret storage, configuring pre-commit scanning to prevent secret leaks, establishing rotation schedules, or auditing secret access across environments.

## Decision framework

```
Where should this secret be stored?
├── Local development
│   → .env file (git-ignored)
│   → Never committed, developer creates from .env.example
│
├── CI/CD pipeline
│   ├── GitHub Actions
│   │   → GitHub Secrets (Settings → Secrets and variables → Actions)
│   │   → Use OIDC for cloud auth instead of static keys
│   │
│   └── Other CI (GitLab, CircleCI)
│       → Platform-native secret storage
│
├── Application runtime (deployed)
│   ├── Vercel / Netlify / Railway
│   │   → Platform environment variables (encrypted at rest)
│   │
│   ├── AWS
│   │   → SSM Parameter Store (simple key-value)
│   │   → Secrets Manager (rotation support, cross-account)
│   │
│   ├── GCP
│   │   → Secret Manager
│   │
│   └── Self-hosted
│       → HashiCorp Vault
│
└── Infrastructure (Terraform)
    → Cloud secret manager via data sources
    → NEVER in .tfvars or terraform.tfstate
    → Use lifecycle { ignore_changes = [value] }
```

### Secret rotation schedule

| Secret type | Rotation frequency | Automation |
|------------|-------------------|------------|
| Database passwords | 30 days | AWS Secrets Manager auto-rotation |
| API keys (internal) | 90 days | Manual with calendar reminder |
| API keys (third-party) | Per provider policy | Manual |
| JWT signing keys | 90 days | Deploy new key, keep old for grace period |
| OAuth client secrets | 180 days | Manual |
| SSL certificates | Auto (Let's Encrypt / Cloudflare) | Automated |
| SSH keys | 180 days | Manual |
| CI/CD tokens | 90 days | Manual |

## Copy-paste template

### Gitleaks configuration

```toml
# .gitleaks.toml — place in repository root
# [CUSTOMIZE] Add project-specific allowlist entries as needed
title = "gitleaks config"

# Extend the default rules (covers AWS keys, GitHub tokens, Stripe keys, etc.)
[extend]
useDefault = true

# Allowlist paths and patterns that trigger false positives
[allowlist]
  description = "Global allowlist"
  paths = [
    '''\.env\.example''',
    '''\.env\.test''',
    '''\.gitleaks\.toml''',
    '''package-lock\.json''',
    '''pnpm-lock\.yaml''',
    '''yarn\.lock''',
    '''\.test\.(ts|tsx|js|jsx)$''',
    '''__tests__/''',
    '''__mocks__/''',
    '''fixtures/''',
  ]
  regexTarget = "line"
  regexes = [
    # Placeholder values used in examples and docs
    '''(?i)(sk_test_|pk_test_|re_test_|whsec_test_)''',
    '''change-me''',
    '''placeholder''',
    '''CHANGE_ME''',
    '''your-.*-here''',
  ]
```

### Pre-commit hook setup

```yaml
# .pre-commit-config.yaml
# [CUSTOMIZE] Update rev versions to latest
repos:
  # Gitleaks — scan for secrets before commit
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.21.2  # [CUSTOMIZE] Check for latest version
    hooks:
      - id: gitleaks

  # Optional: additional secret scanning with detect-secrets
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.5.0  # [CUSTOMIZE] Check for latest version
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

```bash
# Install pre-commit (run once per developer machine)
# [CUSTOMIZE] Choose your package manager

# macOS
brew install pre-commit

# pip
pip install pre-commit

# Then install the hooks
pre-commit install

# Run against all files (first time or to verify)
pre-commit run --all-files

# Generate detect-secrets baseline (if using detect-secrets)
detect-secrets scan > .secrets.baseline
```

### Gitleaks in CI (GitHub Actions)

```yaml
# .github/workflows/security.yml
# Add this as a required status check on your main branch
name: Security Scan

on:
  pull_request:
  push:
    branches: [main, staging]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for scanning all commits

      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### GitHub Actions OIDC for AWS (no static credentials)

```yaml
# In your GitHub Actions workflow
# [CUSTOMIZE] AWS account ID, role name, and region

permissions:
  id-token: write   # Required for OIDC
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/github-actions  # [CUSTOMIZE]
      aws-region: us-east-1  # [CUSTOMIZE]
      # No access keys needed — uses OIDC token exchange
```

```hcl
# Terraform: Create the IAM role for GitHub Actions OIDC
# [CUSTOMIZE] GitHub org, repo name, and allowed branches

# First, create the OIDC provider (once per AWS account)
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

# Then, create the role that GitHub Actions will assume
resource "aws_iam_role" "github_actions" {
  name = "github-actions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          # [CUSTOMIZE] Restrict to your org/repo and branches
          "token.actions.githubusercontent.com:sub" = "repo:myorg/myrepo:ref:refs/heads/main"
        }
      }
    }]
  })
}

# Attach policies for what GitHub Actions can do
# [CUSTOMIZE] Scope permissions to only what CI/CD needs
resource "aws_iam_role_policy" "github_actions" {
  name = "ci-cd-permissions"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:RegisterTaskDefinition",
        ]
        Resource = "*"
      },
    ]
  })
}
```

### Reading secrets at runtime (Node.js with AWS SSM)

```ts
// lib/secrets.ts
// [CUSTOMIZE] Parameter path prefix and region
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssm = new SSMClient({ region: process.env.AWS_REGION || "us-east-1" });

const cache = new Map<string, { value: string; expiresAt: number }>();
const CACHE_TTL = 300_000; // 5 minutes in ms

/**
 * Get a secret from AWS SSM Parameter Store with local caching.
 */
export async function getSecret(name: string): Promise<string> {
  const cached = cache.get(name);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });

  const result = await ssm.send(command);
  const value = result.Parameter?.Value;

  if (!value) {
    throw new Error(`Secret not found: ${name}`);
  }

  cache.set(name, { value, expiresAt: Date.now() + CACHE_TTL });
  return value;
}

// Usage:
// const dbUrl = await getSecret("/myapp/prod/DATABASE_URL");
```

### Audit logging for secret access

```ts
// lib/audit.ts
// [CUSTOMIZE] Adjust log destination (console, CloudWatch, Datadog, etc.)

interface SecretAccessLog {
  timestamp: string;
  secretName: string;
  action: "read" | "write" | "rotate";
  actor: string;        // Service name or user ID
  environment: string;
  success: boolean;
  error?: string;
}

export function logSecretAccess(entry: Omit<SecretAccessLog, "timestamp">) {
  const log: SecretAccessLog = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // Structured JSON log — picked up by CloudWatch, Datadog, etc.
  console.log(JSON.stringify({
    level: "info",
    type: "secret_access",
    ...log,
  }));
}

// Usage:
// logSecretAccess({
//   secretName: "/myapp/prod/DATABASE_URL",
//   action: "read",
//   actor: "api-server",
//   environment: "production",
//   success: true,
// });
```

### Emergency secret rotation checklist

```bash
# If a secret is leaked, follow this checklist IMMEDIATELY:

# 1. Revoke the compromised secret
#    - Rotate the password/key at the source (AWS console, Stripe dashboard, etc.)
#    - This invalidates the old value immediately

# 2. Update the secret in all environments
#    - Production: Update in cloud secret manager (SSM, Secrets Manager)
#    - Staging: Update in platform env vars
#    - CI/CD: Update in GitHub Secrets

# 3. Redeploy all services that use the secret
#    - Force a new deployment to pick up the rotated value
#    - Verify services are healthy after redeployment

# 4. Audit for unauthorized access
#    - Check access logs for the time window the secret was exposed
#    - Look for unusual API calls, database queries, or data access

# 5. Scan git history
gitleaks detect --source . --log-level info
#    - If found in git history, consider BFG Repo-Cleaner or git-filter-repo
#    - Note: Even after scrubbing, assume the secret was compromised

# 6. Post-incident
#    - Document what happened and how it was found
#    - Update pre-commit hooks if the leak type was not caught
#    - Add the pattern to .gitleaks.toml custom rules if needed
```

## Customization notes

- **GitHub Secrets vs cloud secret manager:** For simple apps deployed to Vercel/Netlify/Railway, platform environment variables are sufficient. Use AWS SSM or Secrets Manager when you need rotation automation, cross-service access, or audit trails.
- **Gitleaks vs detect-secrets:** Gitleaks has better default rules and is faster. detect-secrets is better at reducing false positives via its baseline file. Use both if your team has high sensitivity requirements.
- **OIDC eliminates static credentials:** The biggest security win for CI/CD is switching from long-lived AWS access keys to OIDC token exchange. GitHub Actions assumes an IAM role directly, and the token expires after the workflow run. No secrets to rotate.
- **Secret caching:** When reading secrets from SSM/Secrets Manager at runtime, cache them in memory with a short TTL (5 minutes). This avoids hitting rate limits and reduces latency. Invalidate the cache on deploy or when rotation is triggered.
- **Pre-commit vs CI scanning:** Run gitleaks in both pre-commit hooks (catches leaks before push) and CI (catches leaks from developers who skip hooks). The CI check should be a required status check on protected branches.

## Companion tools

| Tool | Use for |
|------|---------|
| gitleaks | Pre-commit and CI secret scanning |
| detect-secrets (Yelp) | Baseline-based secret detection with low false positives |
| AWS SSM Parameter Store | Simple encrypted key-value secret storage |
| AWS Secrets Manager | Secret storage with automatic rotation support |
| HashiCorp Vault | Self-hosted secret management for complex setups |
| `alirezarezvani/claude-skills` -> `senior-devops-engineer` | Secret management architecture decisions |
