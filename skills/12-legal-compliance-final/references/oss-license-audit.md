# Open Source License Audit Guide

> **Disclaimer: Organizational checklists, not legal advice. Consult qualified professionals.**

## When to use

Reference this guide before launching a product, during due diligence for fundraising or acquisition, when adding a new dependency with an unfamiliar license, or during annual compliance reviews. Use the license compatibility matrix to assess risk and the CI templates to automate ongoing scanning.

## Decision framework

```
How do you distribute your software?
├── SaaS (server-side only, users access via browser)?
│   ├── Most licenses are safe (including LGPL, MPL)
│   ├── AGPL is the risk — requires sharing source if users interact over network
│   └── GPL is generally safe for SaaS (no distribution trigger)
│
├── Desktop/mobile app (binary distributed to users)?
│   ├── Permissive licenses (MIT, Apache, BSD, ISC) — safe
│   ├── Weak copyleft (LGPL, MPL) — safe if dynamically linked / separate files
│   ├── GPL — your app must also be GPL (copyleft triggers on distribution)
│   └── AGPL — same as GPL + network interaction trigger
│
├── Library/SDK (distributed as a package)?
│   ├── Choose your own license carefully
│   ├── Permissive deps — compatible with any license
│   ├── Copyleft deps — your library inherits copyleft obligations
│   └── Check downstream compatibility
│
└── Open source project?
    ├── License compatibility between your license and dependencies matters
    ├── GPL deps → your project must be GPL-compatible
    └── Use SPDX identifiers for clarity
```

---

## License Compatibility Matrix

| License | Type | Risk level | SaaS safe? | Binary distribution safe? | Must attribute? | Must share source? | Patent grant? |
|---------|------|-----------|-----------|--------------------------|-----------------|-------------------|---------------|
| **MIT** | Permissive | Low | Yes | Yes | Yes (include license) | No | No |
| **Apache 2.0** | Permissive | Low | Yes | Yes | Yes (include NOTICE) | No | Yes |
| **BSD 2-Clause** | Permissive | Low | Yes | Yes | Yes (include license) | No | No |
| **BSD 3-Clause** | Permissive | Low | Yes | Yes | Yes (include license, no endorsement) | No | No |
| **ISC** | Permissive | Low | Yes | Yes | Yes (include license) | No | No |
| **MPL 2.0** | Weak copyleft | Medium | Yes | Yes (if MPL files stay separate) | Yes | Yes (only MPL-licensed files) | Yes |
| **LGPL 2.1/3.0** | Weak copyleft | Medium | Yes | Yes (if dynamically linked) | Yes | Yes (only LGPL library) | No / Yes (3.0) |
| **GPL 2.0** | Strong copyleft | High | Yes (SaaS) | No (must GPL your code) | Yes | Yes (entire work) | No |
| **GPL 3.0** | Strong copyleft | High | Yes (SaaS) | No (must GPL your code) | Yes | Yes (entire work) | Yes |
| **AGPL 3.0** | Network copyleft | High | No (network use triggers) | No (must AGPL your code) | Yes | Yes (entire work + network) | Yes |
| **SSPL** | Source-available | High | No | No | Yes | Yes (entire stack) | No |
| **Commons Clause** | Source-available | High | Varies (restricts commercial use) | Varies | Yes | Varies | No |
| **Unlicense** | Public domain | Low | Yes | Yes | No | No | No |
| **CC0** | Public domain | Low | Yes | Yes | No (but appreciated) | No | No |

### Risk summary

| Risk level | Action | Licenses |
|-----------|--------|----------|
| **Low** (Permissive) | Include attribution in NOTICE file. No other obligations. | MIT, Apache 2.0, BSD, ISC, Unlicense, CC0 |
| **Medium** (Weak copyleft) | Keep copyleft-licensed files separate. Share modifications to those files only. Review linking method. | MPL 2.0, LGPL |
| **High** (Strong copyleft) | If distributing binaries: must open-source your code under same license. SaaS usually exempt (except AGPL). | GPL 2.0/3.0, AGPL 3.0, SSPL |
| **Review required** | Non-standard or uncommon license. Have legal counsel review. | Custom, dual-license, Commons Clause, EUPL, Artistic |

---

## Automated Scanning Setup

### Option 1: license-checker (npm — quick local scan)

```bash
# Install globally or as dev dependency
npm install -g license-checker

# Basic scan — production dependencies only
npx license-checker --production --summary

# Detailed JSON output for processing
npx license-checker --production --json --out licenses.json

# Fail on specific licenses (use in CI)
npx license-checker --production \
  --failOn "GPL-2.0-only;GPL-3.0-only;AGPL-3.0-only;SSPL-1.0" \
  --excludePrivatePackages
```

### Option 2: license-report (npm — cleaner output)

```bash
npx license-report --only=prod --output=table
```

### Option 3: FOSSA (comprehensive, supports multiple ecosystems)

```bash
# Install FOSSA CLI
curl -H 'Cache-Control: no-cache' \
  https://raw.githubusercontent.com/fossas/fossa-cli/master/install-latest.sh | bash

# Analyze project
FOSSA_API_KEY=[CUSTOMIZE] fossa analyze

# Check for issues (use in CI)
FOSSA_API_KEY=[CUSTOMIZE] fossa test
```

### Option 4: Snyk (security + license scanning)

```bash
# Install Snyk CLI
npm install -g snyk

# Test for license issues
snyk test --all-projects

# Monitor continuously
snyk monitor
```

---

## Copy-paste templates

### npm/pnpm license audit script

```bash
#!/usr/bin/env bash
# scripts/license-audit.sh
# [CUSTOMIZE] Run locally or in CI to check dependency licenses

set -euo pipefail

echo "=== Open Source License Audit ==="
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# [CUSTOMIZE] Define your license policy
ALLOWED_LICENSES="MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;CC0-1.0;Unlicense;0BSD;BlueOak-1.0.0"
FLAGGED_LICENSES="MPL-2.0;LGPL-2.1-only;LGPL-3.0-only"
BLOCKED_LICENSES="GPL-2.0-only;GPL-3.0-only;AGPL-3.0-only;SSPL-1.0"

echo "--- Checking for blocked licenses ---"
# [CUSTOMIZE] Use npx or pnpm dlx depending on your package manager
if npx license-checker --production --failOn "$BLOCKED_LICENSES" --excludePrivatePackages 2>/dev/null; then
  echo "PASS: No blocked licenses found."
else
  echo "FAIL: Blocked license detected! Review output above."
  exit 1
fi

echo ""
echo "--- Checking for flagged licenses (review required) ---"
# List any packages with flagged licenses
npx license-checker --production --onlyAllow "$ALLOWED_LICENSES" --excludePrivatePackages 2>&1 || {
  echo ""
  echo "WARNING: Some packages have licenses outside the allowed list."
  echo "Review these packages and add exceptions if approved by legal."
  # [CUSTOMIZE] Change 'exit 0' to 'exit 1' to enforce strict policy
  exit 0
}

echo ""
echo "--- Full license summary ---"
npx license-checker --production --summary --excludePrivatePackages

echo ""
echo "=== License audit complete ==="
```

### NOTICE file template

```
NOTICE

[CUSTOMIZE: PROJECT_NAME]
Copyright (c) [CUSTOMIZE: YEAR] [CUSTOMIZE: COMPANY_NAME]

This product includes software developed by third parties.
Licenses and attributions for bundled dependencies are listed below.

---

The following third-party dependencies are included:

[CUSTOMIZE: This section is auto-generated. Use the script below to populate.]

Package: react
Version: 18.x
License: MIT
Copyright: Meta Platforms, Inc. and affiliates

Package: next
Version: 14.x
License: MIT
Copyright: Vercel, Inc.

Package: [CUSTOMIZE: PACKAGE_NAME]
Version: [CUSTOMIZE: VERSION]
License: [CUSTOMIZE: LICENSE]
Copyright: [CUSTOMIZE: COPYRIGHT_HOLDER]

---

Full license texts are available in the licenses/ directory or at:
https://opensource.org/licenses
```

### Generate NOTICE file from dependencies

```bash
#!/usr/bin/env bash
# scripts/generate-notice.sh
# [CUSTOMIZE] Generates a NOTICE file from production dependencies

set -euo pipefail

OUTPUT="NOTICE"

cat > "$OUTPUT" << 'HEADER'
NOTICE

[CUSTOMIZE: PROJECT_NAME]
Copyright (c) [CUSTOMIZE: YEAR] [CUSTOMIZE: COMPANY_NAME]

This product includes software developed by third parties.

---

HEADER

# [CUSTOMIZE] Adjust for your package manager
npx license-checker --production --csv --excludePrivatePackages \
  | tail -n +2 \
  | while IFS=',' read -r name version license; do
    # Clean up CSV quoting
    name=$(echo "$name" | tr -d '"')
    version=$(echo "$version" | tr -d '"')
    license=$(echo "$license" | tr -d '"')

    echo "Package: $name" >> "$OUTPUT"
    echo "Version: $version" >> "$OUTPUT"
    echo "License: $license" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  done

echo "NOTICE file generated at $OUTPUT"
```

### License compliance CI check (GitHub Actions)

```yaml
# .github/workflows/license-check.yml
# [CUSTOMIZE] Add to your CI pipeline

name: License Compliance Check

on:
  pull_request:
    paths:
      - 'package.json'
      - 'package-lock.json'
      - 'pnpm-lock.yaml'
      - 'yarn.lock'
  # [CUSTOMIZE] Also run weekly to catch policy changes
  schedule:
    - cron: '0 9 * * 1' # Every Monday at 9am UTC

jobs:
  license-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20' # [CUSTOMIZE] Your Node version

      - name: Install dependencies
        run: npm ci # [CUSTOMIZE] or pnpm install --frozen-lockfile

      - name: Check for blocked licenses
        run: |
          npx license-checker --production \
            --failOn "GPL-2.0-only;GPL-3.0-only;AGPL-3.0-only;SSPL-1.0" \
            --excludePrivatePackages

      - name: Check for unknown licenses
        run: |
          # [CUSTOMIZE] Add all licenses you have approved
          npx license-checker --production \
            --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;CC0-1.0;Unlicense;0BSD;BlueOak-1.0.0;Python-2.0;MPL-2.0" \
            --excludePrivatePackages

      - name: Generate license report
        if: always()
        run: |
          npx license-checker --production --csv --excludePrivatePackages \
            > license-report.csv

      - name: Upload license report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: license-report
          path: license-report.csv

      # [CUSTOMIZE] Optional: FOSSA integration for deeper analysis
      # - name: FOSSA analysis
      #   uses: fossas/fossa-action@main
      #   with:
      #     api-key: ${{ secrets.FOSSA_API_KEY }}
```

### SBOM generation (CycloneDX)

```bash
# Generate Software Bill of Materials in CycloneDX format
# [CUSTOMIZE] Required by some enterprise customers and government contracts

# Install CycloneDX generator
npm install -g @cyclonedx/cyclonedx-npm

# Generate SBOM for production dependencies
cyclonedx-npm --output-file sbom.json --output-format json --omit dev

# Or in XML format
cyclonedx-npm --output-file sbom.xml --output-format xml --omit dev
```

---

## Handling Specific License Situations

### Found a GPL dependency in your proprietary project?

1. **Check if it is actually GPL** — Some packages have dual licenses (e.g., "MIT OR GPL-2.0"). If one option is permissive, use that.
2. **Check if it is only a dev dependency** — Dev dependencies (test frameworks, linters) are not distributed and do not trigger copyleft obligations.
3. **SaaS exception** — If you are running SaaS (server-side only, not distributing binaries), GPL 2.0/3.0 generally does not trigger. AGPL does.
4. **Find an alternative** — Search for a permissive-licensed package that does the same thing.
5. **Isolate the dependency** — If you must use it, consider running it as a separate process (microservice) to argue against derivative work claims. This is legally gray and should be reviewed by counsel.

### Found an AGPL dependency?

1. **This is the highest-risk license for SaaS.** AGPL triggers copyleft obligations when users interact with the software over a network.
2. **Replace it.** Almost always the safest path.
3. **If you cannot replace it**, you must make your source code available under AGPL terms, or obtain a commercial license from the copyright holder (many AGPL projects offer dual licensing).

### Found an unknown or custom license?

1. **Do not use it without review.** Unknown licenses carry unquantified risk.
2. **Check the package repository** — sometimes the license file exists but is not declared in package.json.
3. **If truly custom**, have legal counsel review before using in production.
4. **Add an exception** to your policy if approved, with a documented rationale.

---

## Customization notes

1. **Package manager support** — The templates use npm/npx. For pnpm, replace `npx` with `pnpm dlx` or `pnpm exec`. For yarn, use `yarn dlx` or the yarn plugin `yarn licenses list`.
2. **Monorepo considerations** — Run license checks at the root and per workspace. Some workspaces may have different distribution models (e.g., a CLI tool vs a SaaS backend).
3. **Transitive dependencies** — License-checker scans the full dependency tree by default. A direct dependency may be MIT, but one of its transitive dependencies could be GPL. Always scan the full tree.
4. **License exceptions file** — For packages with acceptable non-standard licenses, maintain an exceptions file (e.g., `license-exceptions.json`) and pass it to your scanning tool.
5. **SBOM requirements** — US Executive Order 14028 and EU Cyber Resilience Act may require SBOM generation. Include it in your release process if selling to government or EU enterprise.
6. **Review cadence** — Run automated checks on every PR that modifies lock files. Run a full manual review quarterly.

## Companion tools
- `rohitg00/awesome-claude-code-toolkit` -> `legal-advisor`
- `mcpmarket.com` -> `legal-advisor` skill
- FOSSA — comprehensive license compliance platform
- Snyk — security + license scanning
- CycloneDX, SPDX — SBOM standards and tooling
- WhiteSource (Mend) — enterprise license compliance
