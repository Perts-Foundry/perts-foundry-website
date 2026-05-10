---
title: "Anatomy of a 6-Hour P0 NFS Outage"
date: 2026-06-01
publishDate: 2026-06-01
draft: false
description: "An NFS outage took down 100+ services for 6 hours. Here is the anatomy of the war room, the failure mode, the recovery sequence, and the postmortem that followed."
slug: "p0-nfs-outage-postmortem"
tags:
  - Incident Response
  - GCP
  - NFS
  - GKE
  - Kubernetes
---

The first sign was a wave of pod evictions on a Tuesday morning. Within ten minutes the production **NFS** instance that backed more than a hundred services was unreachable, and the on-call team was opening a P0 incident. Six hours later the war room closed and the postmortem began.

This is the anatomy of that incident. Not a sanitized "5 things to learn" listicle, but the actual sequence of decisions, the parts that almost worked, and the design choices that made the blast radius as wide as it was. We led the response and authored the postmortem, and the same patterns show up on roughly half the [P0s we walk into](/services/incident-response/) at enterprise SaaS engagements.

## How a Single NFS Instance Can Take Down 100+ Services

Shared file storage has a way of becoming load-bearing in places nobody intended. Over time, services that started with bespoke storage drift toward a single NFS mount because it is convenient, available, and "already there." Each individual decision is reasonable in isolation. The aggregate is a single point of failure shared by an unbounded set of consumers.

The NFS instance at this enterprise SaaS company hosted what started as a handful of build artifact directories and over time grew to back configuration data, model artifacts, intermediate processing outputs, and a long tail of one-off integrations. None of the consumers individually believed they were taking a critical dependency. Collectively, more than a hundred services had `volumeMounts` that pointed at the same backing instance.

The instance itself was a managed offering, but the failure mode that morning was at the storage layer underneath. From the workloads' perspective, the symptoms were uniform: file operations hung, pods went unready, liveness probes failed, and Kubernetes started evicting and rescheduling pods that promptly hung again on the same mount. A single failure was multiplying into a clusterwide cascade.

## What Did the First 30 Minutes Look Like?

The first half hour was almost entirely about scoping the blast radius. We needed to answer three questions before anything else: which services were affected, whether the underlying instance was returning or permanently degraded, and whether the data on it was safe. Until those three were answered, every "fix" was guesswork.

The on-call rotation paged a senior infrastructure engineer who opened a war room channel and pulled in the application teams whose services were paging. We spun up a shared incident document with a running timeline, a "who is doing what" assignment table, and a hypothesis log. Every action taken during the incident landed in the timeline, and every theory landed in the hypothesis log even when we were sure it was wrong, because the postmortem cares about both the path you took and the paths you ruled out.

Inside the first 30 minutes we had:

- Confirmed the failure was at the NFS instance, not in any individual workload's code or configuration.
- Confirmed the data volumes were intact at the storage layer, even though the file system was unreachable.
- Opened a P1 case with the cloud provider's support team and given them the relevant project IDs, instance names, and timestamps.
- Identified the subset of services that had at least partial degraded operation when their NFS mounts hung, versus those that hard-failed.

The third bullet matters more than it looks. P1 cases with hyperscaler support move at the speed of the information you give them. We had a runbook field for "what to attach to a P1 case" that captured exactly what their NFS team would need on first read, and we filled it in before the case was opened, not after.

## Why NFS Hangs Are Particularly Nasty in Kubernetes

This is the section we wish someone had written before this incident. NFS in Kubernetes has failure modes that are not obvious until you live through them.

A standard NFS mount in a Linux pod uses the kernel client, which in its default configuration treats hangs as recoverable. The mount blocks indefinitely waiting for the server to come back. Threads that touch the mount go into uninterruptible sleep (the dreaded `D` state in `ps`), and those threads cannot be killed even by `kill -9`. Pod termination quietly fails because `kubelet` cannot stop processes that are stuck in kernel I/O. Liveness probes time out, kubelet tries to evict the pod, the eviction times out, and the pod stays in `Terminating` state until the node is forcibly drained or rebooted.

The cascade gets worse when those pods are managed by a `StatefulSet` or a `Deployment` with rolling updates. The orchestrator wants to schedule a fresh pod, the old one will not terminate, the new one cannot start because of pod identity or volume reuse, and the surface area of "stuck" workloads grows by the minute. From the application team's perspective it looks like Kubernetes is broken. It is not broken. It is doing exactly what its NFS client asked it to do.

The mitigation, in retrospect, would have been mounting NFS with the `soft` and `intr` options so hangs would surface as I/O errors instead of indefinite blocks, plus aggressive `timeo` and `retrans` values. We did not have that configuration in place across the cluster, and the audit and rollout was a workstream that came out of the postmortem.

## How We Stood Up a Replacement Without Cutting Over Live

The cloud provider's support team confirmed the underlying instance would not be coming back on the original timeline. We had to decide whether to wait or to stand up a replacement, and the right answer is almost always "do both in parallel." Waiting on vendor recovery while doing nothing is a luxury you do not have during an active outage.

We provisioned a replacement NFS instance in a sibling zone using the same Terraform module that had originally created the failed one, and started restoring from snapshot. Snapshots existed because the original instance configuration had snapshot retention turned on; that configuration decision predated the incident and quietly became the most important one of the day. If snapshots had not been there, the recovery sequence would have been measured in days, not hours.

While the restore ran, we audited which workloads we would actually cut over to the replacement first. The answer was not "all of them at once." We staged the cutover by application criticality, with the highest-revenue and most-customer-visible services landing on the replacement first, then internal tooling, then long-tail integrations. The cluster admission and DNS changes that pointed mounts at the new instance were applied in batches, with a 10-minute soak between each batch to confirm nothing regressed before the next batch went out.

The original instance returned to a recoverable state several hours into the incident. By that point we had already cut the most critical workloads to the replacement, and we kept them there. Cutting back during an active incident introduces another change window, and "the replacement is working" is a very strong reason not to introduce another change.

## What Did the Postmortem Actually Say?

The postmortem ran two days after the incident closed. It was blameless in the sense that nobody was singled out for the failure, but it was direct about the design decisions that had created the blast radius. Pretending the architecture was fine and the outage was a freak event would have wasted everybody's time.

The five themes the postmortem documented:

1. **A single NFS instance backing 100+ services is a load-bearing single point of failure.** This was the headline. Every other action item flowed from it.
2. **The default NFS mount options were wrong for our environment.** Without `soft` and bounded retries, every hang was an unkillable hang. The reachability of the underlying instance was almost a side issue.
3. **Some "critical" services were not on a maintained recovery path.** The audit during the incident revealed several services with NFS dependencies that nobody on the platform team knew about, because they had been added without a consultation.
4. **Snapshot retention was a quiet hero, but it was not codified as a requirement.** The configuration was correct because someone had set it correctly. Nothing in the platform required it to stay correct, and configuration drift was a real risk over time.
5. **The on-call playbook for "shared storage hang" did not exist.** The team had playbooks for instance-level outages and for kubelet issues, but not for a hang in shared file storage with cluster-wide effect.

Two of those items had owners and timelines before the postmortem document closed. Three were added to the platform engineering backlog with priorities assigned during the same week.

## What We Changed for Next Time

The four follow-ups that landed in production over the next quarter:

- **Decoupling the largest consumers from shared NFS.** The five services that drove the most volume through the NFS were migrated to dedicated storage backends. This was not "rip out NFS everywhere." It was "stop having any single NFS handle a meaningful share of the cluster's I/O."
- **A shared mount-options module.** A Terraform module was added that configured NFS mount options consistently across the platform with `soft`, bounded `timeo` and `retrans`, and `intr`. Workloads opted in by reference rather than by reinventing the configuration.
- **Snapshot retention as a policy.** OPA-Gatekeeper-style policy was added to refuse Terraform plans that created NFS instances without snapshot configuration. Configuration drift could not silently delete the recovery path.
- **A real shared-storage runbook.** The on-call team had a documented sequence for "shared storage is hanging" with the exact commands, the exact field names to capture for vendor support, and the named owners for each consumer service.

The single largest reduction in blast radius came from the first item, not the third. Mount options are important. Snapshot policies are important. But neither replaces the simple architectural fact that a hundred services should not share a single piece of stateful infrastructure if any of them care about availability.

## The Bottom Line

Most six-hour P0s are not caused by a clever new failure mode. They are caused by an old, well-understood failure mode landing on an architecture that grew its blast radius slowly enough that nobody noticed. Shared NFS in Kubernetes is one of those well-understood patterns, and most teams that run it at scale eventually live this incident.

If you are running shared NFS today and you cannot quickly answer "which services depend on this and what happens if it hangs for two hours," the audit is worth doing now, when you can run it deliberately, rather than during a war room when you are running it under pressure. The postmortem will write itself either way; it is cheaper to do the work before the incident.

If your team is wrestling with similar reliability or shared-dependency questions, our [Incident Response & Reliability consulting](/services/incident-response/) engagements start with exactly this kind of audit.

For a deeper look at how we have led P0 resolution and structured postmortems on enterprise platforms, read our case study on [P0 incident leadership](/case-studies/incident-response-leadership/).
