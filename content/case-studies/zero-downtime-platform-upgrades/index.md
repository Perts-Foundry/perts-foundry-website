---
title: "Zero-Downtime Platform Upgrades Across Three Cloud Providers"
description: "Upgraded ~15 Snowflake Terraform projects across AWS, GCP, and Azure, plus 3 EKS clusters through multiple major versions, all with zero downtime."
slug: "zero-downtime-platform-upgrades"
weight: 80
draft: false
params:
  client: "B2B technology company"
  industry: "Technology"
  challenge: "Production data platform and Kubernetes infrastructure required upgrades across three cloud providers, with zero tolerance for downtime and hard end-of-support deadlines approaching."
  result: "~15 Snowflake projects upgraded across three cloud providers, 3 EKS clusters upgraded through multiple major versions, and 2 unneeded clusters decommissioned, all with zero downtime."
tags:
  - Snowflake
  - Terraform
  - AWS
  - GCP
  - Azure
  - EKS
  - Kubernetes
  - Cursor
  - Claude
  - AI
---

## The Challenge

A B2B technology company running production infrastructure across AWS, GCP, and Azure was facing a category of work that every organization at scale must contend with: keeping the lights on. Critical platform infrastructure does not stay current on its own. Snowflake Terraform projects needed provider and configuration upgrades across all three cloud providers, and a multi-wave Snowflake account migration across providers and regions was required. Simultaneously, 5 AWS EKS clusters were approaching end-of-support deadlines that, if missed, would leave production Kubernetes workloads running on unsupported versions with no security patches. Some of these clusters had fallen multiple major versions behind, making the upgrade path significantly more complex.

Falling behind on platform upgrades creates a compounding problem. Each missed version increases the complexity of the eventual upgrade path, as breaking changes and API deprecations accumulate across version boundaries. For the EKS clusters that had fallen multiple major versions behind, the upgrade was no longer a single step but a sequence of carefully validated jumps, each carrying its own risk.

The stakes were straightforward but unforgiving. These upgrades had to happen across production environments with zero downtime. Downstream dependencies needed to be assessed and accounted for. And the work had to be completed ahead of the deadlines, not scrambled through at the last minute.

## Our Approach

We focused on two parallel workstreams:

- **Snowflake Infrastructure Upgrades** -- We upgraded approximately 15 production Snowflake Terraform projects spanning AWS, GCP, and Azure, using AI-assisted development tools (Cursor and Claude) to accelerate the per-project analysis and configuration work. Each project required careful assessment of its Terraform configuration, provider compatibility, and downstream dependencies before the upgrade could be executed. Beyond the individual project upgrades, we completed a multi-wave production Snowflake account migration across cloud providers and regions, sequencing the waves to maintain service continuity throughout. This was the longer effort of the two workstreams, spanning approximately six months.

- **EKS Cluster Assessment and Upgrades** -- We assessed all 5 AWS EKS clusters against their end-of-support deadlines and downstream dependencies. The assessment was not just about upgrading; it was about understanding whether each cluster still justified its existence. During this process, we determined that 2 of the 5 clusters were no longer needed, as the workloads they had originally been provisioned for had been retired or moved elsewhere. We decommissioned them to eliminate unnecessary cost and operational overhead. The remaining 3 clusters required upgrades through multiple major versions, which meant carefully stepping through each version boundary, validating workload compatibility, addressing breaking changes and API deprecations, and confirming stability before proceeding to the next version, all while keeping production workloads running.

## Results

| Metric                      | Before                            | After                                      |
| --------------------------- | --------------------------------- | ------------------------------------------ |
| Snowflake projects upgraded | Outdated across 3 cloud providers | ~15 upgraded (AWS, GCP, Azure)             |
| Snowflake account migration | Pre-migration                     | Completed across providers and regions     |
| EKS clusters                | 5 approaching end-of-support      | 3 upgraded through multiple major versions |
| Unneeded EKS clusters       | 2 running (unnecessary cost)      | Decommissioned                             |
| Service disruption          | --                                | Zero downtime across all upgrades          |

This was keep-the-lights-on work at its most demanding: not a single flashy migration with a clear finish line, but a sustained effort across multiple platforms, providers, and regions where the margin for error was zero. The dependency assessment that led to decommissioning 2 clusters demonstrated that keeping the lights on is not just about upgrading everything in place; sometimes the right answer is to turn off what is no longer needed. The production environment continued operating without interruption throughout, and the organization moved from a reactive posture of chasing deadlines to a position where critical infrastructure was current and right-sized.

## Key Technologies

{{< tech-tags "Snowflake, Terraform, AWS, GCP, Azure, EKS, Kubernetes, Cursor, Claude" >}}

_This case study has been anonymized at the client's request._

**Related services:** [Cloud Infrastructure Consulting](/services/cloud-infrastructure/) | [Cloud Migration Consulting](/services/cloud-migration/)
