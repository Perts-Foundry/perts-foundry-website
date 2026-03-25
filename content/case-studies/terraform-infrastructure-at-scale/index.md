---
title: "Scaled Terraform Operations Across 200+ Projects for an Enterprise SaaS Platform"
description: "Centralized module distribution, reduced CI/CD rate limiting by 85%, and redesigned a core Terraform framework consumed by 15-20 downstream teams."
slug: "terraform-infrastructure-at-scale"
weight: 30
draft: false
params:
  client: "enterprise SaaS platform"
  industry: "Enterprise SaaS"
  challenge: "Terraform usage had scaled to hundreds of projects, but module distribution was ad hoc, CI/CD workflows were hitting rate limits, and a core configuration framework needed restructuring to reduce maintenance overhead for downstream teams."
  result: "200+ projects migrated to a centralized registry, Atlantis rate limiting reduced by 85%, and automated dependency management established."
tags:
  - Terraform
  - HCP
  - Atlantis
  - GitHub
  - Renovatebot
---

_This case study has been anonymized at the client's request._

## The Challenge

An enterprise SaaS platform had grown its Terraform footprint to hundreds of projects across a multi-cloud environment. What had started as a manageable infrastructure-as-code practice had scaled past the point where ad hoc processes could sustain it.

Terraform modules were distributed without a centralized registry, making version management and consumption inconsistent across teams. The Atlantis CI/CD workflow that governed Terraform plan and apply operations was hitting GitHub API rate limits, causing silent failures. Roughly three users per week were reporting in Slack that their plans were not working, with no clear error pointing to the root cause. The silent nature of these failures eroded developer trust in the Terraform workflow; when plans fail without explanation, teams lose confidence in the tooling and start looking for workarounds. A core Terraform configuration framework consumed by 15-20 downstream teams had accumulated structural debt that made maintenance costly. And dependency upgrades across the infrastructure mono repo were handled manually, adding toil to an already stretched team.

The organization needed to professionalize its Terraform operations without disrupting the dozens of teams and hundreds of projects that depended on them daily.

## Our Approach

We focused on four workstreams:

- **Module Registry Centralization** -- We established HCP Private Registry as the central distribution point for Terraform modules and built a fully automated CI/CD pipeline around it. Module publishing, validation, and versioning were handled end-to-end: users created a PR, the pipeline ran checks, and on merge the module was published automatically. From the consumer's perspective, there was no DevOps team bottleneck; teams could publish and consume modules independently. We migrated over 200 consuming projects to the new registry over the course of a year.

- **Atlantis CI/CD Optimization** -- We upgraded Atlantis and integrated it with a GitHub App, replacing the previous authentication model that was responsible for the API rate limiting. This reduced rate limiting issues by 85% within the first month, turning a persistent source of developer friction into a non-issue. We also built a Large PR Detection check into Atlantis, giving all consuming projects an automatic guardrail against oversized infrastructure changes.

- **Core Framework Restructuring** -- We redesigned a core Terraform configuration framework consumed by 15-20 downstream teams. The work included updating the Terraform provider and restructuring the framework to reduce maintenance overhead, delivered iteratively through Atlantis-managed workflows to minimize disruption to consumers.

- **Automated Dependency Management** -- We deployed Renovatebot to production in the infrastructure mono repo, enabling automated dependency scanning and upgrade pull requests. This eliminated manual upgrade toil and kept Terraform providers and modules current without human intervention.

## Results

| Metric | Before | After |
| ------ | ------ | ----- |
| Module distribution | Ad hoc | Self-service via HCP Private Registry |
| Consuming projects migrated | -- | 200+ (over one year) |
| Atlantis rate limiting | ~3 failed plan reports per week | 85% reduction within one month |
| Dependency management | Manual | Automated via Renovatebot |
| Framework consumers | 15-20 teams (high maintenance overhead) | 15-20 teams (restructured, reduced overhead) |

The registry migration earned recognition across the organization for its quality and impact. With self-service module distribution, automated dependency management, and a significantly more reliable CI/CD workflow, the team had transformed Terraform from a scaling bottleneck into a well-governed platform supporting hundreds of projects and dozens of teams. The silent plan failures that had been a weekly source of developer frustration were effectively eliminated, restoring trust in the infrastructure workflow. And the automated dependency management meant the platform would stay current without requiring manual intervention, reducing the risk of falling behind on provider updates or security patches.

## Key Technologies

Terraform, HCP, Atlantis, GitHub, Renovatebot
