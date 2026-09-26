English | [日本語](README.ja.md)

# Prompt records

The Codex `UserPromptSubmit` hook saves the text it receives as JSON in this directory. Include these records in Git for the hackathon submission.

## Enable capture

1. Open this repository in Codex on a system with Python 3.10 or later and Git.
2. Trust the project settings. Reopen sessions that were already running before the settings were added.
3. In Codex CLI, use `/hooks` to review and trust the `UserPromptSubmit` hook in `.codex/hooks.json`.
4. After the next input, check that a JSON file appears under `docs/prompts/YYYY-MM-DD/`.

Hooks are enabled in `.codex/config.toml`. Global settings are unchanged. This repository permits work without creating a worktree.

Codex skips untrusted hooks. Adding the configuration files alone does not start capture. Capture is unavailable where administrators disable project hooks.

## Captured fields

- `prompt`: the text received by the hook, preserving line breaks, Japanese text, and quotation marks.
- `captured_at`: the UTC capture time, distinct from the time of the original input.
- `session_id`, `turn_id`, and `model` when supplied.
- `source` and `schema_version`.

Filenames combine UTC time with a random ID. Additional or concurrent inputs in the same turn never overwrite an existing file. A repeated event is also kept as a separate record.

The script writes a temporary file before finalizing the record. Invalid input or a storage failure causes exit code 2 and blocks the input to Codex. This does not guarantee capture if the hook itself is disabled, untrusted, or unable to start.

## Material to record manually

The hook captures user text only. Record earlier inputs, attachments, prompts from other tools, adopted plans, project instructions, and templates separately. It does not collect complete AI answers, internal reasoning, terminal absolute paths, or full session histories.

`bootstrap-request.md` is a manual transcription of the request to install the hook, not an automatically captured record. Ongoing project instructions belong in the root `AGENTS.md`; plans and specifications belong in `specs/`.

Do not enter private keys, credentials, or actual customer data. Review records before publication. If a record is redacted, identify the location and reason.

English documentation is the default. Japanese originals are available through the language links. Translated quotations in the English guides are translations, not verbatim user inputs. Captured JSON and supplied `.txt` transcripts remain unchanged in their source language to preserve provenance.

## Verify capture

Run this command at the repository root. The tests use temporary repositories and do not mix test input into submission records.

```sh
python3 -m unittest discover -s tests -v
```

## References

- [ETHGlobal Tokyo 2026 rules](https://ethglobal.com/events/tokyo2026/info/details): include specifications, prompts, and plans used for spec-driven development; disclose AI use and pre-existing work.
- [Official Codex hooks documentation](https://learn.chatgpt.com/docs/hooks): project hooks, `UserPromptSubmit` input and blocking, and `/hooks` trust settings.

Checked on 2026-09-25. Local CLI: `codex-cli 0.156.1`.

## Supplied image-generation records

- [Ojiichan Konbini's Prompt report 1, sections 1–28](asagohann777-prompt-report-1-2026-09-26.md). Received on 2026-09-26. The report describes UI design iterations and the separation of implementation assets.
