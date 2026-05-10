---
title: "How to Upgrade EKS Without Downtime"
date: 2026-10-01
publishDate: 2026-10-01
draft: false
description: "EKS upgrades fail loudly when they fail at all. Here is the per-cluster upgrade playbook we ran across 5 production clusters with zero customer downtime."
slug: "zero-downtime-eks-upgrades"
tags:
  - AWS
  - EKS
  - Kubernetes
  - DevOps
---

We upgraded five production **EKS** clusters ahead of their end-of-support deadlines, all without a single user-visible disruption. The recipe is not exciting. It is rigorous, repeatable, and starts long before the first node refresh, which is also why most teams that get burned on EKS upgrades skip the parts of it that look like overhead.

This is the playbook, written from the perspective of a platform team that has run it more than once. The same sequence applies to GKE end-of-life testing with minor adjustments, and the discipline transfers to most managed-Kubernetes lifecycles. The work fits inside the broader [Kubernetes consulting](/services/kubernetes-containers/) we lead at scale.

## Why Do EKS Upgrades Fail (When They Fail)?

Most EKS upgrade incidents have one of three root causes, and none of them are "the upgrade itself broke."

The first is **API deprecations**. Kubernetes ships deprecation cycles that span multiple minor versions, and a cluster that has been running on `v1.25` for two years probably has manifests, controllers, or admission webhooks that still reference APIs that were removed in `v1.27`. The upgrade itself succeeds; the cluster comes up; and then a controller starts loop-crashing because the API it expected is gone.

The second is **third-party add-ons**. The CNI, the load balancer controller, the metrics server, the cluster autoscaler, the cert-manager, the ArgoCD agent, and a dozen other workloads each have their own version compatibility matrix against Kubernetes. Upgrading the cluster without verifying every add-on against the new minor version is the most common silent failure mode. The cluster works for 23 hours, then a cron-driven add-on misbehaves, and the war room opens.

The third is **assumptions baked into application manifests** that the cluster has been quietly tolerating. A `Deployment` that does not declare a `PodDisruptionBudget` works fine until the data plane upgrade evicts pods faster than they can come up healthy. A `StatefulSet` with no anti-affinity rules works fine until the upgrade schedules every replica onto the same replacement node. The application pretends to be highly available; the upgrade reveals that it never was.

Each of these failure modes is preventable, and each one is missed when the team treats the upgrade as a console click rather than as a release.

## What Is the Actual Sequence to Upgrade an EKS Cluster?

The shortest accurate answer is: inventory, control plane, add-ons, data plane, validate, repeat. The longer version expands each step into a checklist that has to be ticked before the next step starts.

```text
1. Inventory: APIs, add-ons, CRDs, applications.
2. Control plane upgrade (one minor version at a time).
3. Add-ons compatible with the new control plane.
4. Data plane upgrade (rolling node refresh, surge new, drain old).
5. Validate: app health, audit logs, add-on logs, customer metrics.
6. Repeat for the next minor version, with a soak between.
```

The "one minor version at a time" rule is the one that gets bent and the one that bites. EKS supports skip-version control plane upgrades in some configurations, but the third-party add-on ecosystem does not. Upgrading two minor versions in a single shot makes it impossible to isolate the cause of any add-on regression, and the rollback story is much worse. We ran every cluster one minor version at a time, with a soak window between.

## How to Inventory Downstream Dependencies Before Any Upgrade

The inventory step is the highest-leverage part of the playbook and the part teams most often shortcut. The goal is to surface every API, add-on, CRD, and application convention that the upgrade could plausibly break, before the upgrade starts.

We ran four queries before every upgrade.

**Deprecated APIs.** Use `kubectl-pluginversion-checker` or `pluto` (Fairwinds Ops) to scan all manifests in the cluster for API references that are deprecated or removed in the target Kubernetes version. The output is a list of resources to update before the upgrade.

```bash
# Tested with pluto v5+, kubectl 1.29
pluto detect-helm --target-versions k8s=v1.30.0 --output wide
pluto detect-files --directory ./manifests --target-versions k8s=v1.30.0
```

**Add-on compatibility.** For every add-on running in the cluster (`kubectl get pods -n kube-system`, `kubectl get pods -A` for everything else), check the add-on's compatibility matrix against the target Kubernetes version. The matrix is usually published as a table in the project's documentation. If the add-on does not support the target version, the add-on must be upgraded before or simultaneously with the cluster.

**CRDs and operators.** Custom Resource Definitions and the operators that manage them have their own compatibility constraints. `kubectl get crd` lists the CRDs in the cluster; the source of each CRD's operator should be checked against the target Kubernetes version.

**Application conventions.** PodDisruptionBudgets, anti-affinity rules, readiness probe configurations, and resource requests on every workload that matters. The upgrade exercises these in a way that normal traffic does not. A `Deployment` without a PDB or a `StatefulSet` without anti-affinity will produce eviction-related disruption during the data plane refresh, even if the upgrade itself succeeded.

The inventory produces a punch list. Every item on the punch list has to be addressed before the control plane upgrade starts. The punch list is also where most of the work hides; the upgrade itself takes minutes, the punch list resolution takes a sprint.

## The Control Plane Upgrade

The control plane upgrade is a managed operation in EKS. AWS handles the API server, etcd, and the control plane components. The upgrade is non-disruptive to running workloads in the sense that pods do not get evicted; it is potentially disruptive to controllers in the sense that any controller that talks to the API server during the upgrade may see momentary unavailability.

```hcl
# Tested with Terraform 1.9, AWS provider 5.x
resource "aws_eks_cluster" "this" {
  name     = var.cluster_name
  version  = "1.30"   # was 1.29; bumping one minor version at a time
  role_arn = aws_iam_role.cluster.arn

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = false
  }
}
```

We ran the control plane upgrade through Terraform rather than the AWS console, which gave us a reviewable change, a plan-before-apply checkpoint, and an audit trail. The plan output is what someone other than the operator reads to confirm the change is what was expected. Console upgrades produce no equivalent artifact.

## The Data Plane (Node Group) Upgrade

The data plane is where downtime actually happens if anything goes wrong, because it is where pods get evicted and rescheduled. The strategy that consistently produced zero customer-visible disruption was a surge-and-drain rolling refresh.

The pattern: increase the node group's desired capacity by one (or by a small percentage of total capacity), wait for the new node to come up healthy, drain one of the old nodes (`kubectl drain` with a respectful eviction policy), terminate the drained node, and repeat. EKS managed node groups can do this automatically with a `force=false` rolling update, but we generally drove it from a script that gave us per-node visibility and the ability to stop the rollout if anything looked off.

```bash
# Tested with kubectl 1.29, eksctl 0.180+
# Drain a node respecting PDBs, with a generous timeout for stateful workloads
kubectl drain ip-10-0-1-23.ec2.internal \
  --ignore-daemonsets \
  --delete-emptydir-data \
  --grace-period=300 \
  --timeout=10m
```

The `--grace-period=300` and `--timeout=10m` are deliberate. PodDisruptionBudgets are respected by default; the long grace period and timeout give the cluster time to actually move the pods rather than killing them. On clusters with stateful workloads (databases, queues, anything that takes more than a few seconds to come up healthy), a short timeout produces eviction-related incidents that look like upgrade failures and are actually impatience failures.

## Add-Ons, CRDs, and the Things That Fail Silently

The add-ons step is where the silent failures hide. The control plane is up, the data plane is refreshed, the cluster looks healthy, and somewhere a deprecated API call is being silently rejected by the new control plane and a controller is loop-crashing in a namespace nobody is watching.

The mitigation is to upgrade add-ons in lockstep with the cluster, verify each one against its own logs, and run a check across all `Deployment` and `StatefulSet` resources to confirm that none are stuck or unhealthy after the upgrade.

```bash
# Tested with kubectl 1.29
# Find any deployments that are not at desired replicas
kubectl get deployments -A \
  -o json \
  | jq -r '.items[]
      | select(.status.readyReplicas != .spec.replicas)
      | "\(.metadata.namespace)/\(.metadata.name): \(.status.readyReplicas)/\(.spec.replicas)"'

# Find pods stuck in CrashLoopBackOff or Error
kubectl get pods -A --field-selector=status.phase!=Running -o wide
```

Both queries are fast and cheap to run; both should produce empty output if the upgrade succeeded. If either produces output, that is the lead to chase before declaring the upgrade complete.

## How to Detect a Botched Upgrade

The leading indicators are the queries above. The lagging indicators are the customer-facing metrics: error rates, p99 latency, and any KPI the consuming product team treats as a reliability signal. The customer-facing metrics should be monitored continuously through the upgrade and for a soak window after; any anomaly in the lagging indicators that the leading indicators did not predict is a hint that the upgrade hit a failure mode the inventory missed.

We always set a tripwire on the customer-facing error rate during the data plane refresh: if the error rate exceeded a threshold for more than a configured window, the rollout paused automatically. The tripwire never fired in production, but we want it there because the day it does fire, the cost of paused rollout is much smaller than the cost of an unattended degradation.

## What About GKE End-of-Life? (The Parallels)

The structural sequence is the same on **GKE**. Node pools have an end-of-life cadence published by Google; a cluster has a control plane version that has to be upgraded before the deprecated node pool versions stop being supported. The mechanics differ in two notable ways.

Node pool refresh on GKE is more managed than on EKS. The GKE control plane orchestrates the node pool upgrade with surge-and-drain semantics that are usually better than what teams build by hand on EKS. The tradeoff is less per-node visibility during the rollout, which is fine for most workloads and slightly inconvenient for stateful workloads with long startup times.

Workload Identity has to be enabled at node pool creation rather than configured later, so end-of-life node pools that did not have Workload Identity enabled cannot acquire it through an in-place upgrade. The remediation is creating a new pool with Workload Identity, draining the old, and decommissioning. We ran this as part of the [workload identity migration](/blog/cloud-workload-identity-migration/) on the same engagement.

## The Bottom Line

EKS upgrades fail because of unpaid debt: deprecated APIs nobody removed, add-ons that drifted out of compatibility, and applications that have been pretending to be highly available without ever being tested. The control plane upgrade itself is the easy part. The inventory and the punch list resolution before the upgrade are where most of the actual work lives.

If your team has a managed Kubernetes cluster approaching end-of-support and the upgrade conversation has been postponed because nobody knows what would break, the answer is to start the inventory now. The upgrade itself is a console click. The inventory is a sprint, and the upgrade is much less terrifying with the punch list cleared.

If this pattern sounds familiar, our [Kubernetes & Container consulting](/services/kubernetes-containers/) engagements start with exactly this kind of upgrade-readiness assessment.

For a deeper look at how this fit into the broader platform-upgrade story, read our case study on [zero-downtime platform upgrades](/case-studies/zero-downtime-platform-upgrades/).
