English | [日本語](LANGUAGES.ja.md)

# Documentation languages

English is the default for README files, specifications, plans, development reports, asset guides, and prompt-record guides. Use the language link at the top of a page to open its Japanese version.

Japanese documents that existed before this translation are preserved in sibling `.ja.md` files. Their prose is unchanged; navigation and links may point to Japanese counterparts. New Japanese translations accompany the existing English [README](../README.ja.md) and [ENS UI design](../specs/ENS_UI_DESIGN.ja.md). Japanese source snapshots are labeled as preserved originals; follow the English guide for updated issuance examples. Historical documents retain the decisions and limitations recorded at the time. Read the [current specification](../specs/SPEC.md) for current requirements.

The English [OpenAPI definition](../specs/openapi.yaml) remains the generator input. [openapi.ja.yaml](../specs/openapi.ja.yaml) preserves the Japanese description snapshot. API schemas, examples, and stored names have not been translated or altered.

Captured prompt JSON, supplied transcripts, image-generation reports in `.txt`, and raw verification artifacts remain in their original form. They are source evidence, not rewritten documentation. Their English guides explain provenance and limitations. Japanese quotations translated into English are identified as translations. The application's Japanese/English language switch and supplied artwork are unchanged.

The language-pair inventory and source hashes are in [languages.json](languages.json). Verify preserved Japanese bodies, reciprocal language links, and local documentation targets from the repository root:

```sh
python3 scripts/verify_documentation.py
```
