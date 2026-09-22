# TODO List

Open items only. Delete an item when it is done; never check it off or annotate it. A partly finished item is deleted and its remainder written as a new item.

## Deferred review findings

- **review-this-plan-i-composed-lynx-1** (reviewer-docs, 2026-09-22): CLAUDE.md's checks-must-pass count may be off by one, since two secret-scanning tools run in CI but only one is numbered; verify the actual check count and reconcile the wording.
- **review-this-plan-i-composed-lynx-2** (reviewer-prompts-schemas, 2026-09-22): the search-console skill's SKILL.md frontmatter sets no allowed-tools restriction, so nothing in the file itself limits it to the read-only tools the pipeline needs; add one.
- **review-this-plan-i-composed-lynx-3** (code-review, 2026-09-22): normalise.mjs turns a sitemap row's pending-status dash into null for two count fields the schema requires as non-nullable integers; decide whether to default those to zero or relax the schema, then fix.
- **review-this-plan-i-composed-lynx-4** (code-review, 2026-09-22): review.mjs's run() has no top-level error handling outside its CLI entry point, so an internal bug could surface as an unhandled promise rejection when called programmatically, as the test suite does; add a catch-all inside run().
- **review-this-plan-i-composed-lynx-5** (code-review, 2026-09-22): a CI step parses a test runner's human-readable summary line, which is fragile to format drift; a couple of report helpers do repeated rescans or sequential network fetches; a schema module has duplicate tree-walker helpers; and the new vitest exclude is broader than it needs to be. Tidy in a follow-up pass.
