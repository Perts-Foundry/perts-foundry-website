---
title: "How We Fixed Atlantis Rate Limiting with a GitHub App"
date: 2026-04-06
draft: false
description: "Atlantis plan failures were silently hitting three users a week with no clear error message. Here is how migrating to a GitHub App cut rate limiting by 85%."
slug: "atlantis-rate-limiting-github-app"
tags:
  - Terraform
  - Atlantis
  - GitHub
  - CI/CD
---

Three users a week were reporting in Slack that their Terraform plans weren't working. No error message, no obvious log entry, no indication of what had gone wrong. The plans just silently failed.

Silent failures in CI/CD pipelines are worse than loud ones. When a pipeline throws a clear error, someone debugs it and moves on. When it silently does nothing, teams stop trusting the tooling. They start running `terraform plan` locally, skipping the PR workflow, applying changes without review. The infrastructure governance you spent months building erodes one workaround at a time.

That was the situation at a large engineering organization running over 200 Terraform projects through **Atlantis**. The workflow that governed all infrastructure changes had become unreliable, and the root cause turned out to be surprisingly straightforward: how Atlantis authenticated to GitHub.

## What Does Atlantis Rate Limiting Look Like?

Atlantis rate limiting shows up as Terraform plans that silently fail to produce output. An engineer comments `atlantis plan` on a PR, and nothing happens. No plan, no error, no feedback. Retrying sometimes works, which makes the problem harder to diagnose.

The reports followed a consistent pattern. Engineers opened a PR with a Terraform change, triggered a plan, and waited. Sometimes the plan appeared after a long delay. Sometimes it never appeared at all. The Atlantis logs weren't especially helpful either; there was no single log line that said "rate limited." The failures manifested as GitHub API calls returning unexpected responses, status checks that never posted, and plan outputs that never appeared on the PR.

From the user's perspective, Atlantis was broken. From Atlantis's perspective, GitHub wasn't cooperating. We were averaging about three of these reports per week, and each one required someone on the infrastructure team to investigate, retry, or work around the issue manually. That's not a high incident count, but it was a persistent source of friction that undermined confidence in the entire [Terraform CI/CD workflow](/services/cicd-automation/).

## Why Do OAuth Tokens Hit Rate Limits at Scale?

OAuth App tokens and Personal Access Tokens share a single fixed-rate API budget across all calls that use them. When Atlantis authenticates with one of these tokens, every plan, every status check update, and every PR comment draws from the same pool. At scale, that pool runs dry.

Here's the mechanical problem. A single Atlantis plan cycle makes multiple GitHub API calls: fetching PR metadata, cloning repository contents, posting the plan output as a comment, and updating commit status checks to reflect the result. Multiply that by dozens of active PRs per day across 200+ projects, and the API call volume adds up fast.

GitHub allocates a fixed number of requests per hour for each authenticated token. That number does not scale with your repository count, team size, or organization tier. And if you're running multiple Atlantis instances for high availability, they all share the same budget when using the same token, so scaling horizontally doesn't help. For a small team with a handful of repos, the budget is plenty. At the scale we were operating, the budget got exhausted regularly. When that happens, GitHub returns rate limit errors, and Atlantis does not always surface those errors clearly to the end user. That's why the failures appeared silent.

The problem compounds during busy periods. Monday mornings, end-of-sprint pushes, or any time multiple teams are actively working on infrastructure changes is when the rate limit hits hardest. Because the failures produced no clear error, nobody connected "the organization is busy" with "my plan doesn't work." The two facts lived in different people's heads.

## How Do GitHub App Tokens Solve This?

GitHub App installation tokens use a fundamentally different authentication model where the rate limit scales with organization size instead of staying fixed. The same volume of API calls that exhausted an OAuth token fits comfortably within a GitHub App's higher allocation.

Instead of a single shared token, a **GitHub App** generates installation access tokens that carry a higher baseline rate limit. That limit also scales with the number of repositories in the organization. Where an OAuth token has a fixed ceiling regardless of how many repos or teams are using it, a GitHub App's budget grows as your organization grows. For a team managing hundreds of Terraform projects, this is the difference between constantly bumping against the ceiling and having comfortable headroom.

Beyond rate limits, GitHub Apps offer more granular permission scoping. Instead of a token with broad repository access, the App requests only the permissions it needs: pull request read/write, status checks, and repository contents. This follows the principle of least privilege, which matters when your infrastructure automation has access to sensitive configuration across hundreds of repositories. GitHub Apps also provide better auditability at the organization level, making it easier to track what the automation is doing and why.

## How We Ran the Migration

Switching Atlantis from OAuth to GitHub App authentication is not a zero-risk operation when hundreds of projects depend on the workflow daily. The change touches every PR interaction, so getting the approach right mattered more than getting it done fast.

**Upgrading Atlantis first.** GitHub App support requires a relatively recent version of Atlantis. If you're on an older version, the upgrade is a prerequisite. We treated the Atlantis upgrade and the GitHub App configuration as a single coordinated change rather than two separate rollouts. Splitting them would have meant two disruption windows instead of one.

**Timing the cutover.** We configured the GitHub App integration during a low-traffic period. The authentication change affects every active PR, so you want to minimize the blast radius if something goes wrong. A busy Monday morning or the last day of a sprint is the worst possible time for this kind of change.

**Validating incrementally.** We tested the GitHub App configuration against a subset of repositories first, confirming that plan, apply, and status check behaviors all worked correctly before rolling it out organization-wide. This let us catch configuration issues in a low-stakes context instead of discovering them when dozens of teams are trying to ship.

**Communicating to teams.** This is one of those infrastructure changes that is invisible when it works. We notified teams that the authentication backend was changing, but that their workflow (comment `atlantis plan`, review the output, comment `atlantis apply`) would stay identical. No action required on their part. When the migration landed, the only visible difference was that plans started working reliably.

The entire migration completed without disrupting active workflows. Teams didn't need to reconfigure anything, update their PR habits, or even know the details of what changed under the hood.

## What Changed After the Migration

**Rate limiting issues dropped by 85% within the first month.** The weekly Slack reports of silent plan failures effectively stopped. Engineers could trust that commenting `atlantis plan` would actually produce a plan, and the infrastructure team stopped fielding weekly troubleshooting requests.

The quantitative improvement was only part of the story. The real win was restoring developer trust in the infrastructure workflow. When the CI/CD pipeline works reliably, teams use it. When it's unreliable, they route around it. Every silent failure had been an invitation for someone to skip the PR-based workflow and apply changes manually, bypassing code review and audit trails. Getting developers back to the intended workflow (plan via PR, review the diff, apply through automation) strengthened the governance model that [infrastructure as code is supposed to provide](/blog/infrastructure-as-code/).

We also took the opportunity to add a **Large PR Detection** check to Atlantis. This automatically flags pull requests that modify an unusually large number of resources, giving teams a guardrail against oversized infrastructure changes that are difficult to review and risky to apply. It was a small addition that addressed another common source of operational risk in [large-scale Terraform environments](/services/infrastructure-as-code/).

## When to Make the Switch

If your Atlantis installation serves more than a handful of teams and you're authenticating with an OAuth App or Personal Access Token, you're likely either hitting rate limits already or approaching the point where they will start appearing. Watch for these signals:

- **Intermittent plan failures with no clear error.** If users report that plans "sometimes don't work" and retries fix it, rate limiting is a strong candidate for the root cause.
- **Failures that correlate with team activity.** More failures on busy days (Mondays, sprint boundaries) point to a shared resource being exhausted rather than a bug in your configuration.
- **Growing Terraform project count.** Every new project and team adds API call volume. If your organization is scaling its infrastructure footprint, the rate limit problem will find you eventually.

The GitHub App migration is a well-scoped change with significant payoff. It doesn't alter the user-facing workflow at all, and the benefit is immediate. If you're running Atlantis at any meaningful scale, it is worth doing before rate limiting becomes a weekly frustration for your engineering teams.

For a deeper look at how this fit into a broader effort to professionalize Terraform operations across hundreds of projects, read our case study on [scaling Terraform across 200+ projects](/case-studies/terraform-infrastructure-at-scale/).

If your team's CI/CD workflows are hitting similar friction, our [CI/CD & Automation consulting](/services/cicd-automation/) engagements start with exactly this kind of assessment.
