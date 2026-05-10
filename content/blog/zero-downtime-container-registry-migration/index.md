---
title: "Migrating 5+ PB of Container Registry with Zero Downtime"
date: 2026-07-15
publishDate: 2026-07-15
draft: false
description: "Google deprecated GCR. We had to move 5+ petabytes of container images across dev, staging, and prod with zero downtime. Here is exactly how we did it."
slug: "zero-downtime-container-registry-migration"
tags:
  - GCR
  - GAR
  - GCP
  - Containers
  - CI/CD
---

Five petabytes of container images. Three environments across multiple regions. A hard deprecation deadline from Google. And not a single service or pipeline was allowed to feel a hiccup during the cutover. We led the migration from **GCR** to **GAR** at a data engineering organization, finished ahead of Google's deadline, and shipped a transparent cutover that downstream teams did not even need to be aware of.

This post is the migration playbook. The deprecation forced the work; the result of doing it well was a substantially leaner registry footprint, lower ongoing storage cost, and a discovery layer the team did not previously have. The pattern applies to most large [cloud migrations](/services/cloud-migration/) where a vendor deprecation collides with a multi-tenant production environment.

## Why Is Migrating a Multi-Petabyte Container Registry Harder Than It Looks?

A registry migration sounds like data movement. It is not, primarily. It is a coordinated change to every CI/CD pipeline, every running workload, every Helm chart, every Kustomize overlay, and every developer's local toolchain that ever pulls or pushes an image. The data movement is the easy part. The coordination is the part that takes a quarter.

Two characteristics make the work disproportionate to the size. The first is sprawl. A registry that started small grows organically across years and projects, and over time the question of "what is actually in here" becomes hard to answer authoritatively. The second is the long tail of consumers. The top ten consumers are obvious. The hundredth consumer is a half-decommissioned cron job that pulls one image once a quarter, will fail silently if its registry path stops resolving, and nobody on the platform team knows about it.

Both characteristics conspire to make the migration scary in proportion to the registry's age, not its size. A pristine 5 PB registry could be migrated in a weekend. A 5 PB registry with eight years of accumulation needs a discovery and triage phase before the data movement even starts.

## How Do You Discover What Is Actually in a 5+ PB Registry?

You write the queries that the registry's UI does not give you. The discovery phase is custom tooling work, not registry-tool-config work, and it is the highest-leverage stage of the migration.

We wrote a small set of scripts that ran across every project in the organization, listed every image in every registry path, joined that against the audit log of recent pulls and pushes, and produced a sorted report of "this image was last consumed N days ago by this consumer." A representative slice of the discovery query, simplified:

```bash
#!/usr/bin/env bash
# Tested with gcloud SDK 460+, jq 1.7
# Lists every image in every project's GCR, one row per image.
# Output columns (tab-separated): project, host, image_path

set -euo pipefail

for project in $(gcloud projects list --format='value(projectId)'); do
  for host in gcr.io us.gcr.io eu.gcr.io asia.gcr.io; do
    gcloud container images list \
      --repository="${host}/${project}" \
      --format=json 2>/dev/null \
      | jq -r --arg p "$project" --arg h "$host" \
          '.[] | "\($p)\t\($h)\t\(.name)"'
  done
done > inventory-raw.tsv
```

The script that ran in production was longer, joined against billing exports for size and against audit logs for last-pulled timestamps, and produced a usable report. The shape of the report is what made the next phase tractable. With a single sorted file, the team could see the top consumers, the obvious orphans, and the long tail of "we are paying to store this and nobody has touched it in two years."

## What We Learned from the Discovery Phase

The discovery phase always finds three things, and this engagement was no exception.

It finds **orphans**: images and registry paths nobody is consuming anymore. A meaningful share of the 5+ PB turned out to be images for services that had been retired without anyone cleaning up their registry footprint. Those images had been silently accumulating storage cost for years.

It finds **surprises**: long-tail consumers nobody knew about. A handful of one-off cron jobs, a few partner integrations, and several developers' local toolchains were referencing images by tag in ways that would have broken silently after the cutover if the discovery had not surfaced them. Each surprise needed an owner conversation and a remediation plan before migration.

It finds **opportunity**: cleanup that the team had wanted to do for years but had never had the discovery tooling to justify. The migration was the forcing function, and we used it to retire registry paths that no longer served any active workload, which both reduced the migration surface and reduced ongoing storage costs after the cutover.

The discovery phase does not produce migration progress in any direct sense. What it produces is a defensible plan for the migration, with each consumer accounted for and each orphan identified for retirement. Skipping it is the most expensive mistake on a multi-petabyte migration.

## The Phased Migration Playbook (Dev to Staging to Prod)

The migration ran in three phases, with each phase serving as a soak window for the next. The sequencing matters more than the data tools.

**Phase 1: development environments.** We migrated the dev registries first. Dev workloads tolerate disruption, dev pipelines are easier to recover, and dev cutovers expose configuration issues without customer-visible blast radius. Every cutover script and every fallback path was rehearsed here before it ever touched staging.

**Phase 2: staging environments.** Staging migrations exposed the second tier of issues: pipelines that worked in dev but referenced staging-only registry paths, integration tests that pinned images by registry hostname, and partner integrations that had staging-specific configuration. Two weeks in staging was enough to surface the issues that would have only become visible in production otherwise.

**Phase 3: production environments.** Production cut last, in batches sized by region and by application criticality. The lowest-risk regions and applications cut first to validate the production cutover sequence end-to-end. The highest-revenue and most-customer-facing services cut after the cutover sequence had been validated against several lower-risk applications.

The tooling that did the actual byte movement was Google's built-in migration path, which handles the heavy lifting cleanly once the registries are configured correctly. The orchestration layer around it was custom: a shell-and-Terraform pipeline that drove the cutover one batch at a time, with explicit go/no-go checkpoints between batches and a 10-minute soak after each batch before the next batch started.

## How a Transparent Network Redirect Kept Downstream Teams Unaware

The cutover requirement was zero awareness, not just zero downtime. The downstream teams should not need to know the migration was happening, and the artifact references in their pipelines should not need to change. The way to deliver that is a transparent network redirect that resolves old GCR endpoints to new GAR endpoints at the network layer.

The redirect was configured at the project's networking layer so that any image pull request that hit a `gcr.io/<project>/<image>` path automatically resolved to the corresponding `<region>-docker.pkg.dev/<project>/<repo>/<image>` path in GAR. From the consumer's perspective, the pull just worked, against the same hostname they had always used. From the registry's perspective, the request landed in the new repository.

This pattern is the difference between "we migrated the registry" and "the migration was invisible to the rest of the organization." Every pipeline that hard-coded a `gcr.io` path continued to work. Every Helm chart with a `gcr.io` image reference continued to pull. Every developer's local docker-compose stack continued to function. The team's eventual migration of those references to native GAR paths could happen on a relaxed timeline because nothing was actively broken.

## Where AI Helped During Discovery

The discovery phase was where AI tooling earned the most leverage. The shape of the work, dozens of related queries against billing exports, audit logs, and asset inventories, with frequent reshaping of output formats, is exactly the workload that **Claude** and **Cursor** accelerate. Drafting a `bq` query that joined billing data against image metadata, regenerating it five times as the requirements clarified, and translating the output into a format the migration tracker could consume, all happened in a fraction of the time a hand-written iteration would have taken.

What AI did not do was the migration itself. The cutover sequence, the batch sizing, the go/no-go criteria between batches, and the rollback decisions during production cuts were all human judgment. AI helped the platform team get to the point of having a defensible plan faster. The plan still belonged to humans.

## What We Would Do Differently in Retrospect

Two things would change on the next migration of this scale.

We would invest more in **automated rollback testing** during the staging phase. The cutover sequence had a documented rollback path, and we had rehearsed it in dev, but we did not rehearse it in staging at full scale. We never needed it in production, so the gap was invisible at the time. On a future migration, we would explicitly stage at least one rollback rehearsal in staging to make sure the rollback works under real production-like conditions.

We would also invest earlier in **deprecating the orphans identified during discovery**. The migration was the forcing function for cleanup, but a lot of the cleanup happened in parallel with the migration rather than ahead of it. Cleaning up first would have reduced the migration surface and made the data movement phase faster. The right sequence is discovery → cleanup → migration, and we ran it as discovery → migration with cleanup overlapped.

## The Bottom Line

A multi-petabyte registry migration is a coordination problem with a data movement problem inside it, not the other way around. The discovery and triage phase produces the plan; the byte movement runs the plan; the transparent redirect makes the plan invisible to downstream consumers. Phase by environment, soak between phases, and refuse to skip the discovery work even when the deadline is pressing.

The hidden upside on every forced migration is the cleanup it justifies. A registry that has been accumulating for years quietly carries inventory that nobody would defend if asked directly. The migration is the rare moment when "we should clean this up" becomes "we have to clean this up to make the migration tractable."

If your team is facing a vendor-deprecation-driven migration of similar scale, our [Cloud Migration consulting](/services/cloud-migration/) engagements start with exactly this kind of discovery and triage work.

For a deeper look at how this played out in practice, read our case study on [a 5+ PB registry migration with zero downtime](/case-studies/zero-downtime-registry-migration/).
