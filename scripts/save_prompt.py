#!/usr/bin/env python3
"""Archive a Codex UserPromptSubmit event in this repository."""

import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from uuid import uuid4


def save_prompt(event):
    if not isinstance(event, dict) or event.get("hook_event_name") != "UserPromptSubmit":
        raise ValueError("expected UserPromptSubmit")
    for field in ("cwd", "session_id", "turn_id", "prompt"):
        if not isinstance(event.get(field), str):
            raise ValueError(f"expected string field: {field}")

    root = Path(__file__).resolve().parent.parent
    git_root = subprocess.run(
        ["git", "-C", event["cwd"], "rev-parse", "--show-toplevel"],
        check=True, capture_output=True, text=True,
    ).stdout.strip()
    if Path(git_root).resolve() != root:
        raise ValueError("event cwd belongs to another repository")

    now = datetime.now(timezone.utc)
    record = {
        "schema_version": 1,
        "source": "codex:UserPromptSubmit",
        "captured_at": now.isoformat(),
        "session_id": event["session_id"],
        "turn_id": event["turn_id"],
        "prompt": event["prompt"],
    }
    if isinstance(event.get("model"), str):
        record["model"] = event["model"]

    directory = root / "docs" / "prompts" / now.strftime("%Y-%m-%d")
    directory.mkdir(parents=True, exist_ok=True)
    destination = directory / f"{now.strftime('%H%M%S-%f')}-{uuid4().hex}.json"
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=directory, suffix=".tmp", delete=False
        ) as output:
            temporary = Path(output.name)
            json.dump(record, output, ensure_ascii=False, indent=2)
            output.write("\n")
            output.flush()
            os.fsync(output.fileno())
        os.replace(temporary, destination)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def main():
    try:
        save_prompt(json.load(sys.stdin))
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        print(f"Prompt archive failed ({type(error).__name__}); repair docs/prompts before retrying.", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
