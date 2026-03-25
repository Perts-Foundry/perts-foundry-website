---
title: "Saved Over $125,000 in Annual Cloud Spend"
description: "Eliminated over $125,000 in annual cloud waste through storage right-sizing, idle cluster decommissioning, and Soft Delete remediation across GCP."
slug: "finops-cloud-cost-savings"
weight: 10
draft: false
params:
  client: "enterprise data platform"
  industry: "Enterprise SaaS / Data"
  challenge: "Cloud costs had grown without systematic governance, with over-provisioned storage, idle clusters, and hidden charges from a platform default."
  result: "Over $125,000 in annual cloud spend eliminated and IaC defaults established to prevent cost drift."
tags:
  - GCP
  - GKE
  - GCS
  - Terraform
  - FinOps
---

_This case study has been anonymized at the client's request._

## The Challenge

An enterprise data platform had accumulated significant cloud waste across their GCP environment with no systematic cost governance in place. Persistent disks were provisioned on premium PD-SSD tiers for workloads where high-performance storage was unnecessary. GKE clusters that had been stood up for projects long since completed were still running, consuming compute and networking resources with no active consumers.

Compounding the problem, Google had enabled Soft Delete as a platform default across GCS buckets. Soft Delete retains a copy of every deleted object for a configurable retention period, and the organization is billed for that retained storage. For high-churn buckets with frequent writes and deletes, this default quietly generated substantial charges that nobody had accounted for.

The waste had accumulated gradually, across many projects and teams, with no single owner responsible for cost governance. Without tooling to surface where spend was concentrated or processes to review whether provisioned resources still matched actual workload requirements, the team had no way to prioritize or act. The longer it went unaddressed, the more it compounded.

## Our Approach

We focused on three parallel workstreams over the course of a quarter:

- **Storage Tier Right-Sizing** -- We audited persistent disks across the GCP environment, identified all disks in use, and ranked projects by spend to determine where the highest-impact migrations were. For each project, we assessed whether the workload's I/O profile actually required premium PD-SSD performance or whether PD-Balanced would meet its needs at a lower cost. Where high-performance storage was not critical, we migrated on a project-by-project basis, validating that performance characteristics remained acceptable after each transition. This workstream represented the largest share of the savings.

- **Idle Cluster Decommissioning** -- We identified GKE clusters with low or no utilization by analyzing usage patterns and cross-referencing with project ownership records. For each candidate, we confirmed with owning teams that the workloads were no longer active and that no downstream services depended on the cluster before proceeding with decommissioning. Associated resources including persistent volumes and networking configurations were cleaned up alongside the clusters.

- **GCS Soft Delete Remediation** -- We traced unexpected storage charges back to the Soft Delete feature, which had been enabled by a GCP platform default. Soft Delete retains a shadow copy of every deleted object, and for high-churn buckets with frequent write-and-delete cycles, the retained copies were generating storage charges that dwarfed the cost of the live data. We assessed each bucket's retention requirements and disabled Soft Delete across buckets where the retention was providing no operational value.

## Results

| Metric | Before | After |
| ------ | ------ | ----- |
| Annual cloud waste | Untracked | $125K+ eliminated |
| Storage tier (non-critical workloads) | PD-SSD (over-provisioned) | PD-Balanced |
| Idle GKE clusters | Running unmonitored | Decommissioned |
| GCS Soft Delete | Enabled by platform default | Disabled |

The storage tier migration accounted for roughly half of the total savings, with idle cluster decommissioning and Soft Delete remediation splitting the remainder.

Beyond the immediate cost reduction, the initiative established lasting guardrails that changed how the organization provisioned infrastructure going forward. Monitoring was put in place to track cost trends and surface anomalies before they accumulated into significant waste. Infrastructure-as-code defaults were updated to deny Soft Delete and use PD-Balanced by default, meaning new projects would start with cost-conscious configurations rather than inheriting expensive defaults. These changes shifted cost governance from a reactive cleanup exercise into a proactive part of how infrastructure was provisioned.

Results were presented to engineering leadership, connecting the technical findings to their business impact and building organizational awareness of cloud cost management as an ongoing discipline rather than a one-time project.

## Key Technologies

GCP, GKE, GCS, Terraform
