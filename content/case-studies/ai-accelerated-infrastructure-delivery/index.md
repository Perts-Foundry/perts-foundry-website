---
title: "AI-Accelerated Infrastructure Delivery Across Three Clouds"
description: "Used AI-assisted development to accelerate a Terraform framework redesign impacting 15-20 teams and zero-downtime Snowflake upgrades across AWS, GCP, and Azure."
slug: "ai-accelerated-infrastructure-delivery"
weight: 20
draft: false
params:
  client: "multi-cloud data platform"
  industry: "Enterprise SaaS"
  challenge: "Two large-scale infrastructure efforts with aggressive timelines demanded a development approach that could move faster than traditional methods allowed."
  result: "AI-assisted development with Cursor and Claude accelerated delivery of a Terraform framework redesign and ~15 zero-downtime Snowflake upgrades across three cloud providers."
tags:
  - Cursor
  - Claude
  - Terraform
  - Snowflake
  - AWS
  - GCP
  - Azure
  - AI
---

## The Challenge

Two major infrastructure projects were running in parallel, both with aggressive timelines and zero margin for error. The first was a fundamental redesign of a core Terraform configuration framework consumed by 15-20 downstream teams. Years of organic growth had left the framework difficult to extend, and every change required careful cross-team coordination to avoid breaking consuming projects. The second was a wave of production Snowflake upgrades spanning ~15 projects across AWS, GCP, and Azure, each with its own dependency graph, grant structures, and regional considerations.

Either project alone would have been a significant effort. Together, they demanded a pace of iteration that traditional development approaches could not sustain. The Terraform framework changes required rapid prototyping, cross-team requirements analysis, and iterative refinement through Atlantis-managed plan/apply cycles. The Snowflake upgrades required careful per-project analysis of provider configurations, grant management, and multi-region coordination. The team needed a way to move faster without sacrificing the thoroughness that production infrastructure demands.

## Our Approach

We integrated AI-assisted development tools into both workstreams from the start, using Cursor and Claude not as novelties but as core productivity multipliers.

- **AI-Assisted Framework Redesign** -- We used Cursor and Claude to accelerate the iterative cycle of the Terraform framework redesign. AI tools helped with rapid prototyping of new module structures, analyzing cross-team requirements across 15-20 consuming projects, and generating comprehensive test scenarios. Each iteration went through Atlantis-managed plan/apply workflows, giving downstream teams visibility into proposed changes before anything reached production. What would have been weeks of manual analysis and incremental changes compressed into focused iteration cycles.

- **Multi-Cloud Snowflake Upgrades** -- For the Snowflake migrations, AI-assisted development accelerated the per-project analysis that made zero-downtime upgrades possible. Each of the ~15 projects had unique provider configurations, grant structures, and regional dependencies across AWS, GCP, and Azure. Cursor and Claude helped generate provider-specific upgrade paths, identify grant management edge cases, and produce the detailed migration plans that made it possible to execute confidently across three cloud providers without service disruption.

- **Knowledge Sharing & Multiplication** -- The concrete workflows and techniques developed during both efforts became the basis for a technical presentation shared with the broader engineering organization. The presentation demonstrated how AI-assisted development had accelerated real infrastructure work at scale, moving the conversation from "should we use AI tools?" to "how are we already using them?" This catalyzed the organization-wide AI tooling evaluation that followed.

## Results

| Metric                      | Before                             | After                                                |
| --------------------------- | ---------------------------------- | ---------------------------------------------------- |
| Terraform framework         | Outdated, difficult to extend      | Redesigned for 15-20 downstream teams                |
| Snowflake projects upgraded | Pending across 3 cloud providers   | ~15 projects upgraded, zero downtime                 |
| AI development approach     | Not used for infrastructure work   | Integrated into daily workflow                       |
| Organizational AI awareness | Limited individual experimentation | Technical presentation catalyzed org-wide evaluation |

The broader impact extended beyond the two projects themselves. The team demonstrated that AI-assisted development was not just for greenfield application code; it could meaningfully accelerate the kind of complex, cross-cutting infrastructure work that traditionally moved slowly because of its blast radius. The Terraform framework redesign, which had been deferred for months due to the coordination overhead, shipped within the engagement window. The Snowflake upgrades, which spanned three cloud providers and dozens of dependencies, completed with zero downtime. Both outcomes would have been achievable without AI tooling, but not at the pace the timelines demanded.

## Key Technologies

{{< tech-tags "Cursor, Claude, Terraform, Atlantis, Snowflake, AWS, GCP, Azure" >}}

_This case study has been anonymized at the client's request._

**Related services:** [AI-Augmented Engineering Consulting](/services/ai-augmented-engineering/) | [Infrastructure as Code Consulting](/services/infrastructure-as-code/)
