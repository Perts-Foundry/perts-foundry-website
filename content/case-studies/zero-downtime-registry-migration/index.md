---
title: "5+ PB Registry Migration with Zero Downtime"
description: "Completed a 5+ petabyte container registry migration from GCR to GAR with zero service disruption ahead of Google's deprecation deadline."
slug: "zero-downtime-registry-migration"
weight: 20
featured: true
draft: false
params:
  client: "enterprise data platform"
  industry: "Enterprise SaaS / Data"
  challenge: "Google's deprecation of Container Registry required migrating 5+ petabytes of container images across dev, staging, and production environments to Artifact Registry without disrupting running workloads or CI/CD pipelines."
  result: "5+ petabytes migrated with zero downtime, completed ahead of Google's deprecation deadline."
tags:
  - GCP
  - GCR
  - GAR
  - Containers
---

_This case study has been anonymized at the client's request._

## The Challenge

Google announced the deprecation of Google Container Registry (GCR), setting a hard deadline for all customers to migrate their container image infrastructure to Artifact Registry (GAR). For an enterprise data platform, this was not a simple cutover. Their registry footprint spanned over 5 petabytes of container images across dev, staging, and production environments in multiple regions, with CI/CD pipelines and running workloads continuously pulling images from GCR.

The scale was compounded by sprawl. Years of organic growth had left container images scattered across a large number of projects, and it was not always clear which images were still actively consumed by critical workloads and which were remnants of decommissioned services. Any disruption during migration would ripple outward: broken image pulls would block deployments, and running services referencing GCR paths could fail at restart or scale-up. The migration needed to be completely invisible to downstream teams.

## Our Approach

We focused on three workstreams, executing the migration over the course of two quarters:

- **Discovery and Triage** -- Before migrating anything, we needed to understand the sprawl. We wrote custom scripts to query image usage across projects, identify which registries were actively consumed by critical workloads, and flag unused or orphaned images. The scripts ranked projects by usage volume, giving us a clear picture of where the highest-risk and highest-value migrations were. This triage phase doubled as a cleanup opportunity, allowing us to reduce the migration surface by retiring images and registry resources that were no longer serving a purpose, which also reduced ongoing storage costs.

- **Migration Execution** -- We used GCP's built-in migration path as the primary tooling, which handled the bulk of the image transfer cleanly. The migration was phased deliberately: development environments first, then staging, then production, with each region validated independently before proceeding to the next. This sequencing allowed us to catch any issues in lower environments where the blast radius was smaller, building confidence at each stage before moving to production.

- **Transparent Cutover** -- To ensure zero downstream impact, we configured automatic network redirection so that old GCR endpoints redirected seamlessly to the new GAR endpoints. This meant that even services and pipelines still referencing GCR paths would have their requests routed to GAR transparently, with no code changes or configuration updates required on the consumer side. Downstream teams required no awareness of the migration and experienced no disruption. CI/CD pipelines and running workloads continued pulling images without interruption throughout the transition.

## Results

| Metric                    | Before                      | After                                     |
| ------------------------- | --------------------------- | ----------------------------------------- |
| Registry platform         | GCR (deprecated)            | GAR                                       |
| Data migrated             | --                          | 5+ PB across dev, staging, and production |
| Service disruption        | --                          | Zero downtime                             |
| Downstream team awareness | --                          | Fully transparent (no action required)    |
| Deadline compliance       | Google deprecation deadline | Completed ahead of schedule               |

The migration was completed ahead of Google's deprecation deadline with no service disruption and no downstream coordination required. Over 5 petabytes of container images were moved to Artifact Registry while CI/CD pipelines and running workloads continued operating as if nothing had changed. Not a single team needed to take action or even be aware that the migration was happening.

The discovery and triage phase provided a secondary benefit beyond the migration itself. By mapping which images were actively consumed and which were orphaned, the team gained visibility into their container registry footprint that had not previously existed. The cleanup of unused resources reduced ongoing storage costs and operational surface area, turning a compliance-driven migration into an opportunity to leave the environment leaner than before.

## Key Technologies

GCP, GCR, GAR
