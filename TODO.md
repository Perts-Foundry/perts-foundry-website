# Review TODO

> Deferred findings from pre-PR reviews. Check off items as resolved.

## Blockers

## Important

## Suggestions

- [ ] **[CR-1]** Consider `steps.hugo-deploy.outcome == 'success'` in merge step `if:` for explicit dependency readability (code-reviewer, 2026-04-12)
- [ ] **[CR-3]** First live run will be unattended; optionally apply `manual-review` label to any in-flight Dependabot PRs before merging dry-run removal to watch the first live trigger (code-reviewer, 2026-04-12)
- [ ] **[AR-7]** Extract merge/delete/comment flow in `deploy.yml` and `dependabot-auto-deploy.yml` into a shared composite action to reduce drift (architecture-reviewer, 2026-04-12)
- [ ] **[AR-8]** `scheduled-deploy.yml` failures only write to `$GITHUB_STEP_SUMMARY`; add an open-issue-on-failure step or webhook notification (architecture-reviewer, 2026-04-12)
- [ ] **[AR-9]** `environment: production` has no protection rules; consider a deployment-branch rule restricting to `main` + `dependabot/**` (architecture-reviewer, 2026-04-12)
- [ ] **[AR-10]** Add post-deploy smoke test (curl `https://pertsfoundry.com/` + known string) to `hugo-deploy` composite action (architecture-reviewer, 2026-04-12)
- [ ] **[AR-11]** Add `rollback.yml` workflow (`wrangler rollback` via PR comment or workflow_dispatch) and document the procedure (architecture-reviewer, 2026-04-12)
- [ ] **[SA-6]** Already implemented: CI-path diffs (`.github/workflows/`, `.github/actions/`, `.github/scripts/`) now block auto-deploy; remove from TODO on confirmation (security-auditor, 2026-04-12)
- [ ] **[SA-7]** Consider required-reviewer gate on `production` environment for the first N Dependabot auto-deploys, then relax (security-auditor, 2026-04-12)
- [ ] **[SA-8]** Escape triple-backticks in `BUILD_OUTPUT` / `DEPLOY_OUTPUT` before interpolating into Markdown code blocks (security-auditor, 2026-04-12)
- [ ] **[SA-9]** Consider splitting `contents: write` and `pull-requests: write` across separate jobs for least privilege (security-auditor, 2026-04-12)
- [ ] **[SA-10]** Document branch-protection/merge-identity coupling in CLAUDE.md — **done in this PR**, remove on confirmation (security-auditor, 2026-04-12)
- [ ] **[IR-5]** Add cross-referencing comments between `deploy.yml`, `scheduled-deploy.yml`, and `dependabot-auto-deploy.yml` about the shared `deploy-production` concurrency group (infra-reviewer, 2026-04-12)
- [ ] **[IR-6]** Same as AR-10: post-deploy smoke test (infra-reviewer, 2026-04-12)
- [ ] **[IR-7]** Same as AR-11: rollback automation + runbook (infra-reviewer, 2026-04-12)
- [ ] **[IR-8]** Split Dependabot `github-actions` group into `deploy-critical` (wrangler-action, setup-node, setup-go) vs `ci-tooling` to shrink auto-deploy blast radius per PR (infra-reviewer, 2026-04-12)
