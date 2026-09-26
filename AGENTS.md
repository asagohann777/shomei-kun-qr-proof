English | [日本語](AGENTS.ja.md)

# Working rules for this repository

## Purpose

Build a new open-source reference implementation and demo app based on the existing Shomei-kun from the Tennchiai Project. Distinguish the existing project from work in this repository. The target features, technology stack, and public license remain to be decided.

## Working directory

- This repository is an exception to the global worktree requirement. You may work directly in the current checkout without creating a worktree.
- At the start of work, check the current directory and Git root. Do not change the existing Shomei-kun project or other repositories.
- Do not turn assumptions about unresolved matters into confirmed specifications.

## Specifications and development records

- Save the purpose, target features, requirements, and acceptance criteria in `specs/SPEC.md`.
- Save the architecture, data flow, technology choices, and reasons in `specs/ARCHITECTURE.md`.
- Record pre-hackathon work, sources, reuse scope, and licenses in `specs/PRE_EXISTING_WORK.md`.
- Record hackathon changes, verification results, human contributions, and AI use in `specs/HACKATHON_CHANGES.md`. Identify work whose timing relative to the hackathon has not been verified.
- Save additional plans and design documents in `specs/`. Do not leave decisions only in conversations or local temporary files.

## Prompt preservation

- The `UserPromptSubmit` hook in `.codex/hooks.json` saves user input in `docs/prompts/`. See `docs/prompts/README.md` for setup and collection scope.
- Do not exclude prompt records from Git. Include specifications, plans, and prompts associated with changes in the submission repository.
- Manually add prompts used before the hook or in other AI tools, attachments, and reusable instructions or templates. State their source and preservation method. Do not claim that they were saved automatically.
- Save adopted plans from AI responses in `specs/`. The hook does not collect responses, internal reasoning, or attachments.
- Do not include private keys, credentials, or real customer data in prompts. Review records before publication and document the reason for any redaction.

## Hackathon submission

The [ETHGlobal Tokyo 2026 rules](https://ethglobal.com/events/tokyo2026/info/details) were checked on 2026-09-25.

- Include specifications, prompts, and plans used in spec-driven development in the submission repository.
- Distinguish existing work from new work and identify files and purposes involving AI.
- The participation track is not yet decided. Do not assume that creating a new OSS repository alone satisfies Classic eligibility. When using existing work, check the Continuity requirements and the requirements of the intended prize.
- Keep history detailed enough to explain development. Follow the user's instructions for commits, pushes, submissions, and deployments.
