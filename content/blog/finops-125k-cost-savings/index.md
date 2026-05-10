---
title: "How We Saved $125K Annually with FinOps"
date: 2026-06-15
publishDate: 2026-06-15
draft: false
description: "PD-SSD over-provisioning, idle GKE clusters, and a hidden Soft Delete charge added up to $125K in annual waste. Here is how we found and eliminated it."
slug: "finops-125k-cost-savings"
tags:
  - FinOps
  - GCP
  - GKE
  - GCS
---

Three sources of cloud waste added up to over $125,000 a year on a single GCP environment, and not one of them showed up in the obvious places. No abandoned VM stood out on the cost dashboard. No team had over-provisioned a single resource recklessly. The waste compounded across years of small, individually reasonable decisions, and only became visible once we audited the categories most teams skip past.

This is what the FinOps audit looked like at a data analytics platform that had grown the cloud footprint faster than the cost discipline. Three workstreams produced the bulk of the savings, and a fourth set of changes to the IaC defaults made sure the savings did not regress. The same pattern repeats on most enterprise [FinOps engagements](/services/finops/) we walk into.

## Why Does Cloud Spend Creep Up Without Anyone Noticing?

Cloud spend creeps up because the default path of every cloud is "more, faster, premium." Every provisioning workflow defaults to the more expensive option. Every platform feature ships enabled. Every team optimizes for getting their workload running rather than for the long-tail cost of running it. None of that is malicious. It is the path of least resistance, and at scale it adds up.

The compounding effect is what nobody plans for. A single PD-SSD persistent disk on a workload that does not need premium storage costs maybe a few dollars a month. Multiply that across hundreds of disks across dozens of projects across years of organic growth, and you have a five-figure annual line item that nobody can pin to a specific decision. The same is true for clusters that outlived their workloads, or for buckets that quietly retain deleted data because the platform turned a feature on by default.

The instinct in most organizations is to treat this as a cleanup project, do one big sweep, and move on. The audit produces a one-time savings number, the team takes a victory lap, and twelve months later the same waste has accumulated again because nothing structural changed. The actual FinOps work is the structural part, not the sweep.

## How Did We Rank $125K of Waste Into Three Buckets?

We started with a spend ranking by project, then a spend ranking by service inside the top projects, then a categorization of "where does this spend come from and is it serving a current workload?" That sequence sounds obvious in retrospect. It is not what most teams do, because the immediate temptation is to chase whichever single line item looks largest on the dashboard.

Ranking by project surfaces concentration, not just absolute cost. A $5K-per-month service is not interesting if it is doing $5K of work, but a $5K-per-month service is very interesting if half of that is going to a feature nobody uses. Ranking by service inside each top project narrows the question. Categorizing by "is this serving a current workload" is what produces the FinOps verdict.

The three buckets that emerged at this engagement, in rough order of impact:

1. **Storage tier mismatch.** Persistent disks on PD-SSD where PD-Balanced would have been functionally identical. This was the largest line item.
2. **Hidden retention charges.** A GCS platform default was silently retaining deleted objects in high-churn buckets. The accumulation looked like normal storage growth on every dashboard.
3. **Idle infrastructure.** GKE clusters that had outlived the projects they were stood up for, with associated persistent volumes and networking still running.

The split was roughly half on storage tier, with the remaining half divided between Soft Delete cleanup and idle cluster decommissioning. Each workstream needed its own review path, its own owner conversation, and its own validation criteria, because each had a different "what could go wrong if we get this wrong" failure mode.

## What Is the Highest-Leverage FinOps Move? PD-SSD to PD-Balanced

For most workloads, PD-Balanced delivers the I/O profile the application actually exercises at a meaningfully lower price point than PD-SSD. The high-leverage FinOps move is to identify which disks were provisioned on PD-SSD by default rather than by requirement, and migrate them, validating performance one project at a time. This single move accounted for roughly half of the total savings.

The audit started with a gcloud query that listed every persistent disk in the environment, joined against project metadata to identify which team owned each disk, then sorted by spend. The list was longer than expected, which is itself a finding worth surfacing. Most teams cannot quickly answer "how many PD-SSD disks are we paying for and across which projects."

For each candidate disk, we asked the owning team three questions: what is the I/O pattern this disk actually exercises in production, how would they detect a regression if we migrated, and is there any application that has been benchmarked against PD-SSD specifically. Most of the answers were "we use it for general persistence, we monitor latency on the consuming service, and no, we have not benchmarked specifically against PD-SSD." Those teams were our easy migrations.

The migrations themselves were rolled per project. We created a snapshot, provisioned a PD-Balanced replacement, validated the workload against it for a soak window, and decommissioned the old disk. We hit no performance regressions on the migrations we ran. The disks that did not migrate were the few where a real I/O profile required premium storage, and we documented that requirement in the IaC so it would not be reopened in the next audit.

## How a Platform Default Quietly Added Five Figures: GCS Soft Delete

Google enabled Soft Delete as a platform default across GCS buckets, which retains a copy of every deleted object for a configurable retention window and bills you for the retained storage. For high-churn buckets that write and delete frequently, the retained-copy charge can dwarf the live-data charge, and the dashboard does not flag it as anomalous because it looks like normal storage growth.

The line item we traced was a single high-churn bucket that was generating tens of thousands of dollars a year in Soft Delete charges with no operational benefit. The bucket's data was already redundant: the upstream pipeline kept its own copy, and the downstream consumers did not need a recovery window for accidental deletions. The retention was burning money to provide a feature nobody had asked for.

The remediation was an audit of every bucket in the environment with the question "does this bucket actually need recovery from accidental deletion?" For most production data, the answer was yes, and we set a retention period sized appropriately. For the high-churn intermediate buckets where the data was reproducible from upstream, the answer was no, and we disabled the feature. The single highest-impact bucket alone closed a five-figure annual line item.

The lasting fix was the IaC default, not the bucket-level cleanup. We updated the shared **Terraform** module that provisioned GCS buckets to take an explicit retention parameter and default to disabled. New buckets started without Soft Delete unless someone made an active decision to enable it. The audit had to happen once. The default change made sure the audit would not have to happen again.

## When Idle Clusters Cost More Than the Workloads They Used to Run

The third workstream was the easiest to explain and the hardest to execute. Several **GKE** clusters had been stood up for projects that had since wound down, and were still running with no active consumers. The compute cost of an unused cluster is real, the persistent volumes attached to its nodes have their own cost, and the networking and load balancers add another layer.

The hard part was not finding the idle clusters. It was confirming they were truly idle. A GKE cluster that has not run a deploy in six months is not necessarily safe to delete. Some clusters host long-running batch jobs that fire monthly. Some clusters have a tiny dependency that turns out to be loadbearing for an annual report nobody documented. The discovery process for each candidate cluster involved tracing every Kubernetes object in the namespace, checking the audit log for activity in the last two quarters, and confirming with the owning team that the workloads were truly retired.

Several "idle" clusters turned out to have a single critical workload still running on them that nobody had thought to migrate. We migrated those before decommissioning. The clusters that were genuinely idle came down, along with their persistent volumes and load balancer rules, and the savings showed up on the next billing cycle.

## Where AI Helped (and Where It Did Not)

We used **Claude** and **Cursor** during the audit phase to accelerate the data wrangling and queries. Cost analysis at scale is not a single SQL query; it is dozens of related queries across billing exports, asset inventories, and project metadata, with frequent reshaping. AI-paired authoring made the iteration loop on those queries dramatically faster, especially for the BigQuery joins against billing data and the gcloud commands that listed assets across projects.

The work AI did not replace was the negotiation. Every migration involved a conversation with the owning team about acceptable risk, validation windows, and rollback criteria. Those conversations are where the FinOps work actually happens. AI shortens the time to "here is the data on what we are paying for." It does not shorten the time to "are you comfortable with us migrating this disk."

## The IaC Defaults That Prevent Regression

The audit produced a one-time $125K savings. The IaC default changes are what prevent the savings from eroding back to zero over the next twelve months.

We codified three changes in the shared **Terraform** modules that provisioned the relevant resources:

```hcl
# Tested with Terraform 1.9, GCP provider 5.x

# Default disk type to PD-Balanced; opt in to PD-SSD only with documented reason
variable "disk_type" {
  type    = string
  default = "pd-balanced"
  validation {
    condition     = contains(["pd-balanced", "pd-ssd", "pd-standard"], var.disk_type)
    error_message = "Disk type must be one of pd-balanced, pd-ssd, pd-standard."
  }
}

# Default GCS Soft Delete to disabled; opt in only where retention is required
resource "google_storage_bucket" "this" {
  name     = var.bucket_name
  location = var.location

  soft_delete_policy {
    retention_duration_seconds = var.soft_delete_retention_seconds
  }
}

variable "soft_delete_retention_seconds" {
  type    = number
  default = 0
}
```

The variable defaults are the actual prevention layer. Once `pd-balanced` and Soft Delete disabled are the defaults that ship with every new bucket and every new disk, the next two years of provisioning inherits the cost-conscious posture without any further enforcement. Anyone who needs the more expensive option has to make an explicit, reviewable decision to override the default. That visibility is what turns FinOps from a cleanup activity into a property of the platform.

## The Bottom Line

Most cloud waste is not visible to the people who are causing it, because it accumulates across decisions that were each individually reasonable. The audit is the easy part. Producing a one-time savings number is satisfying and ineffective. The actual FinOps engagement is the structural change that makes the next audit unnecessary, which means IaC default changes, monitoring on cost trends, and reviewable documentation for every workload that intentionally runs on the more expensive path.

If your cloud spend has grown faster than your traffic and nobody on the team can quickly answer where the largest concentrations of waste are, our [FinOps & Cloud Cost Optimization consulting](/services/finops/) engagements start with exactly this kind of audit.

For a deeper look at how this played out in practice, read our case study on [eliminating $125K in annual cloud spend](/case-studies/finops-cloud-cost-savings/).
