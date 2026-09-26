# SPDX-License-Identifier: MIT
import concurrent.futures
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parent.parent
COMMAND = json.loads((ROOT / ".codex/hooks.json").read_text())["hooks"]["UserPromptSubmit"][0]["hooks"][0]["command"]


class SavePromptTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="prompt test ")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        subprocess.run(["git", "init", "-q", str(self.root)], check=True)
        (self.root / "scripts").mkdir()
        shutil.copy(ROOT / "scripts/save_prompt.py", self.root / "scripts/save_prompt.py")
        self.event = {
            "hook_event_name": "UserPromptSubmit",
            "cwd": str(self.root),
            "session_id": "session/../../example",
            "turn_id": "turn-1",
            "prompt": '日本語\n"quotes" \\ $HOME $(touch injected) `touch injected`\n',
            "model": "test-model",
            "transcript_path": "/private/session.jsonl",
        }

    def run_hook(self, event=None, cwd=None, raw=None):
        return subprocess.run(
            ["sh", "-c", COMMAND], cwd=cwd or self.root,
            input=raw if raw is not None else json.dumps(event if event is not None else self.event),
            text=True, capture_output=True,
        )

    def records(self):
        return [json.loads(path.read_text()) for path in self.root.glob("docs/prompts/*/*.json")]

    def test_exact_prompt_and_metadata_from_subdirectory(self):
        nested = self.root / "nested directory"
        nested.mkdir()
        self.event["cwd"] = str(nested)
        result = self.run_hook(cwd=nested)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, "")
        record, = self.records()
        self.assertEqual(record["prompt"], '日本語\n"quotes" \\ $HOME $(touch injected) `touch injected`\n')
        self.assertEqual(record["session_id"], "session/../../example")
        self.assertEqual(record["turn_id"], "turn-1")
        self.assertEqual(record["model"], "test-model")
        self.assertEqual(record["source"], "codex:UserPromptSubmit")
        self.assertNotIn("cwd", record)
        self.assertNotIn("transcript_path", record)
        self.assertFalse((nested / "injected").exists())

    def test_concurrent_prompts_in_same_turn_are_preserved(self):
        events = [dict(self.event, prompt=f"prompt {i}") for i in range(8)]
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(self.run_hook, events))
        self.assertTrue(all(result.returncode == 0 for result in results))
        self.assertEqual(sorted(r["prompt"] for r in self.records()), [f"prompt {i}" for i in range(8)])
        self.assertEqual(list(self.root.glob("docs/prompts/*/*.tmp")), [])

    def test_invalid_input_blocks_without_record(self):
        for raw in ("{", "[]", '{}', json.dumps(dict(self.event, prompt=None))):
            with self.subTest(raw=raw):
                result = self.run_hook(raw=raw)
                self.assertEqual(result.returncode, 2)
                self.assertIn("Prompt archive failed", result.stderr)
        self.assertEqual(self.records(), [])

    def test_write_failure_blocks(self):
        (self.root / "docs").write_text("not a directory")
        result = self.run_hook()
        self.assertEqual(result.returncode, 2)
        self.assertNotIn(self.event["prompt"], result.stderr)

    def test_other_repository_is_rejected(self):
        other = self.root / "other"
        other.mkdir()
        subprocess.run(["git", "init", "-q", str(other)], check=True)
        result = self.run_hook(dict(self.event, cwd=str(other)))
        self.assertEqual(result.returncode, 2)
        self.assertEqual(self.records(), [])

    def test_empty_prompt_and_repeat_delivery_are_kept(self):
        self.event["prompt"] = ""
        self.event.pop("model")
        self.assertEqual(self.run_hook().returncode, 0)
        self.assertEqual(self.run_hook().returncode, 0)
        self.assertEqual([r["prompt"] for r in self.records()], ["", ""])
        self.assertTrue(all("model" not in record for record in self.records()))


if __name__ == "__main__":
    unittest.main()
