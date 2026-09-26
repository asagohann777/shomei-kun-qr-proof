English | [日本語](backend-design-decisions.ja.md)

# Backend design decisions

Codex manually summarized the selected answers on 2026-09-26 JST. This is a scope summary, not a verbatim question transcript. The hook did not capture the AI's questions, answers, or complete plans.

| Topic | Scope selected by the user |
| --- | --- |
| Mock coverage | Mock wallet signing and submission to Amoy as well as MultiBaas |
| State storage | Return fixed samples only; do not persist registration results or share them across devices |
| Functions to design | Design the Web API first; defer the issuer CLI |
| Registration input | Use fixed sample input; defer free-form nickname input |

The adopted plan was to document three APIs for card retrieval, registration preparation, and confirmation, along with a shared response format, fixed scenarios, verification conditions, and conditions for live integration. API server implementation was outside that task.

- [Exploration request](2026-09-25/140109-789742-3fa35cc7e2b54786aaaa64a589110919.json)
- [Instruction to execute the plan](2026-09-25/151125-676118-d1888c4c54d2401ea99965526e42e9fb.json)
- [Adopted plan](../../specs/PLAN.md)
- [Detailed design](../../specs/BACKEND_DESIGN.md)

Hook filenames use UTC. The execution instruction was saved on 2026-09-25 UTC, which was 2026-09-26 JST. Card-ID character restrictions, body size limits, and field names were design choices made by Codex while detailing the plan, not individually specified user requirements.
