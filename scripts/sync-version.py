#!/usr/bin/env python3
"""Propagate the plugin version to every file that displays it.

`.claude-plugin/plugin.json` is the single source of truth — the bump-version
workflow writes it, and everything else follows from here.

    ./scripts/sync-version.py            rewrite all targets to match plugin.json
    ./scripts/sync-version.py --check    exit 1 if any target is out of sync

Run with --check in CI so version drift can never reach main again.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / ".claude-plugin" / "plugin.json"

# (path, regex with a {v} placeholder for the version, replacement template)
# Each pattern must match exactly the version text, so the sub is surgical.
TARGETS = [
    (
        ROOT / ".claude-plugin" / "marketplace.json",
        r'("version":\s*")\d+\.\d+\.\d+(")',
        r"\g<1>{v}\g<2>",
    ),
    (
        ROOT / "README.md",
        r"(\[!\[Version:\s*)\d+\.\d+\.\d+(\]\(https://img\.shields\.io/badge/Version-)\d+\.\d+\.\d+(-)",
        r"\g<1>{v}\g<2>{v}\g<3>",
    ),
    (
        ROOT / "docs" / "index.html",
        r'(class="ver">v)\d+\.\d+\.\d+',
        r"\g<1>{v}",
    ),
]


def current_version() -> str:
    version = json.loads(SOURCE.read_text())["version"]
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        sys.exit(f"error: {SOURCE.name} version {version!r} is not semver")
    return version


def main() -> int:
    check_only = "--check" in sys.argv
    version = current_version()
    drifted, changed = [], []

    for path, pattern, template in TARGETS:
        if not path.exists():
            sys.exit(f"error: missing target {path}")

        text = path.read_text()
        updated, count = re.subn(pattern, template.format(v=version), text)

        if count == 0:
            # A pattern that stops matching means the file was restructured and
            # this script silently stopped protecting it. Fail loudly instead.
            sys.exit(f"error: no version marker found in {path.relative_to(ROOT)}")

        rel = path.relative_to(ROOT)
        if updated != text:
            drifted.append(str(rel))
            if not check_only:
                path.write_text(updated)
                changed.append(str(rel))

    if check_only:
        if drifted:
            print(f"Version drift against plugin.json ({version}):")
            for name in drifted:
                print(f"  out of sync: {name}")
            print("\nRun ./scripts/sync-version.py to fix.")
            return 1
        print(f"All version references are in sync at {version}.")
        return 0

    if changed:
        print(f"Synced to {version}:")
        for name in changed:
            print(f"  updated: {name}")
    else:
        print(f"Already in sync at {version}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
