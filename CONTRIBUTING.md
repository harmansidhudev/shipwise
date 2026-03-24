# Contributing to Shipwise

Thanks for your interest in contributing to Shipwise!

## How to contribute

### Reporting issues
- Use GitHub Issues for bug reports and feature requests
- Include your Claude Code version and OS when reporting bugs
- For skill content issues, specify which skill and reference doc

### Adding or improving skills
1. Fork the repo and create a branch
2. Follow the skill template structure in `skills/XX-skill-name/SKILL.md`
3. Every reference doc must include at least one copy-paste code template
4. Include all three experience levels (beginner/intermediate/senior) in checklist items
5. Test trigger accuracy — does the skill fire on the right prompts?

### Adding reference docs
Reference docs follow this structure:
- **When to use** — one sentence
- **Decision framework** — flowchart or table (if applicable)
- **Copy-paste template** — working code with marked customization points
- **Customization notes** — what to change and why
- **Companion tools** — related ecosystem tools

### Hook changes
- Hooks must be idempotent (safe to run multiple times)
- Always read/write `shipwise-state.json`, never the markdown status file
- Test with `jq` available and without (graceful degradation)

### Code style
- Shell scripts: `#!/bin/bash`, quote variables, use `set -e` where safe
- JSON: 2-space indent
- Markdown: ATX headings, one sentence per line in source

## License
By contributing, you agree that your contributions will be licensed under the MIT License.
