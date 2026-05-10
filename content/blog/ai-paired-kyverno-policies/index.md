---
title: "Hardening Multi-Tenant Kubernetes with AI-Paired Kyverno"
date: 2026-09-01
publishDate: 2026-09-01
draft: false
description: "Multi-tenant Kubernetes needs admission-control teeth, but Kyverno policy authoring is tedious. Here is how AI-paired drafting made the backlog tractable."
slug: "ai-paired-kyverno-policies"
tags:
  - AI
  - Kubernetes
  - Kyverno
  - EKS
  - GKE
  - Claude
  - Cursor
---

Every multi-tenant Kubernetes cluster eventually faces the same question: when a workload misbehaves in one tenant's namespace, how confident are you that it cannot reach into another tenant's? The honest answer in most production clusters is "somewhat confident, on a good day." The teeth that turn that answer from "somewhat" into "yes, and here is the policy that enforces it" come from admission control. **Kyverno** is the most ergonomic admission controller in the Kubernetes ecosystem right now, and AI-paired authoring is what makes maintaining a real Kyverno policy library tractable.

We rolled out a Kyverno-based policy library across multi-tenant **EKS** and **GKE** clusters at a multi-tenant SaaS platform, paired with **Claude** and **Cursor** through every iteration. This is the deep-dive: what we enforced, why those policies matter for tenant isolation, what AI-paired authoring actually accelerated, and the parts where the AI was unhelpful or actively wrong. The patterns transfer cleanly to most multi-tenant [Kubernetes engagements](/services/kubernetes-containers/).

## Why Is Multi-Tenant Kubernetes a Security Exposure Waiting to Happen?

A "multi-tenant cluster" with no admission control is a single shared blast radius. Pod-level isolation in Kubernetes is real but partial: the kernel boundary is a meaningful security control, but the cluster's API surface, its node-level resources, its service-level networking, and its ambient credentials all sit above the pod boundary, and a tenant that can land a pod with the wrong configuration can affect the cluster in ways that cross tenant lines.

Concrete examples that turn up in real clusters: a tenant running a privileged pod that reads from the host filesystem, a tenant scheduling pods that request the entire cluster's GPU pool, a tenant attaching a pod to the host network and listening on a port that shadows another tenant's service, a tenant pulling images from a registry that has not been allowlisted, or a tenant deploying a `ClusterRole` that grants more access than namespace-scoped roles would permit. Each example is a policy gap, not a code bug. The fix is a policy that refuses the misconfiguration at admission time.

Without admission control, the team's only enforcement is review. Reviews scale up to a point and then fail open. Admission control scales linearly with the policy library and does not get tired. That is the lever.

## What Does Kyverno Actually Enforce?

Kyverno is a Kubernetes-native policy engine that runs as a validating and mutating admission controller. Policies are themselves Kubernetes resources written in YAML, which makes them reviewable in PRs, deployable through GitOps, and queryable through the same tooling the rest of the cluster uses. Kyverno can validate (reject resources that fail policy), mutate (add or modify fields on resources at admission), generate (create related resources when a triggering resource is admitted), and verify images (check signatures and registries before scheduling).

The "policies are Kubernetes resources" property is the operational unlock. There is no separate policy language to learn, no separate deployment pipeline to maintain, and no separate audit trail. A Kyverno policy is reviewed in the same PR flow as a deployment manifest, lands through the same ArgoCD sync, and is debuggable through the same `kubectl describe` familiar to every cluster operator.

The cost is verbosity. Kyverno policies are precise; they are also long. A pod-security baseline policy that enforces nonroot, read-only rootfs, dropped capabilities, and seccomp can run hundreds of lines of YAML once you cover all the resource types and exemption paths. That length is where AI-paired authoring delivers most of its leverage.

## What Policies Actually Matter for Multi-Tenant Isolation?

Five categories of policy did the heavy lifting on multi-tenant isolation at this engagement. Other categories existed; these five are the ones that produced most of the security benefit.

**Pod security baseline.** Enforce the Kubernetes Pod Security Standards "restricted" profile or close to it, with explicit exceptions for the workloads that genuinely need them. This is the core defense against pods doing things they should not, including running as root, mounting hostPath, requesting privileged capabilities, or using the host network.

**Image-source allowlisting.** Refuse to admit pods whose container images are pulled from registries that are not on a documented allowlist. This prevents tenants from accidentally or deliberately pulling images from public registries that have not been vetted, and gates the supply-chain story at the cluster boundary.

**Namespace-scoped resource constraints.** Bound CPU, memory, GPU, and storage that any single namespace can request, so a tenant cannot exhaust cluster-wide resources. ResourceQuotas are the native primitive; Kyverno enforces that ResourceQuotas are present and correctly bounded across every tenant namespace.

**ClusterRole creation gating.** Refuse `ClusterRole` and `ClusterRoleBinding` resources from tenant namespaces. Cluster-scoped RBAC is platform-team territory, and a tenant should never be able to grant itself cluster-wide permissions through a manifest. This gate alone closes a large class of privilege-escalation paths.

**Network policy enforcement.** Validate that every tenant namespace has a default-deny `NetworkPolicy` plus tenant-specific allow rules. Without a default-deny baseline, lateral movement between tenants is effectively unrestricted at L3.

Each of these categories is straightforward in concept and tedious in implementation. A pod-security baseline policy that handles every controller type, every exemption path, and every error message is dozens of policy rules. The aggregate library at this engagement was thousands of lines of YAML. Authoring and maintaining it is the bottleneck.

## How AI-Paired Authoring Changed the Policy Iteration Loop

The traditional Kyverno authoring loop is human-only: an engineer studies the Pod Security Standards documentation, writes a policy, applies it in audit mode against a representative cluster, observes the violations, refines the policy, and repeats. The loop is slow because each iteration requires re-reading the spec, rewriting verbose YAML, and reconciling the YAML against the observed violations.

AI-paired authoring compresses each step in the loop without removing any of the safety controls. The shape of the loop did not change. What changed was the time per cycle and the size of the team's working memory.

A representative interaction:

> "Read the Pod Security Standards 'restricted' profile. Draft a Kyverno
> ClusterPolicy that enforces it across all namespaces matching label
> `tenant-namespace=true`. Exclude namespaces with the label
> `policy-exempt=approved-by-platform-team`. Output the policy in audit
> mode initially, with each rule's `validationFailureAction` set to
> `audit`. Comment any rule where the spec is ambiguous or where you are
> uncertain about the correct field. After the policy, list the
> Kubernetes resource kinds and fields it does NOT cover, so I can fill
> the gaps."

The output was a draft policy that captured roughly 80% of the work. The remaining 20% was the engineer's review: confirming the field names matched the actual API, validating against the cluster in audit mode, and tuning the exception path. The 80/20 split was consistent across categories of policy.

The list-what-it-does-not-cover ask was the high-leverage prompt habit. AI tools tend toward overconfidence; explicitly asking for the gaps surfaced the parts the AI was about to silently miss. The list was not always complete, but it was usefully correlated with where the actual coverage gaps lived.

## A Concrete Example: Pod Security Baseline Policy

Here is an excerpt from the policy that emerged from one of those AI-paired loops, lightly edited for publication. The full policy is longer, but this fragment shows the shape:

```yaml
# Tested with Kyverno 1.12, Kubernetes 1.29
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: tenant-pod-security-restricted
  annotations:
    policies.kyverno.io/title: "Tenant Pod Security: Restricted Profile"
    policies.kyverno.io/category: "Pod Security Standards"
    policies.kyverno.io/severity: "high"
spec:
  validationFailureAction: Enforce
  background: true
  rules:
    - name: tenant-namespaces-disallow-privileged
      match:
        any:
          - resources:
              kinds: [Pod]
              namespaceSelector:
                matchLabels:
                  tenant-namespace: "true"
                matchExpressions:
                  - key: policy-exempt
                    operator: NotIn
                    values: ["approved-by-platform-team"]
      validate:
        message: >
          Pods in tenant namespaces must not be privileged. Run as nonroot,
          drop ALL capabilities, and avoid hostPath/hostNetwork. See:
          https://kubernetes.io/docs/concepts/security/pod-security-standards/
        pattern:
          spec:
            =(initContainers):
              - securityContext:
                  =(privileged): "false"
                  =(allowPrivilegeEscalation): "false"
                  capabilities:
                    drop: [ALL]
                  runAsNonRoot: true
            containers:
              - securityContext:
                  =(privileged): "false"
                  =(allowPrivilegeEscalation): "false"
                  capabilities:
                    drop: [ALL]
                  runAsNonRoot: true
            =(hostNetwork): "false"
            =(hostPID): "false"
            =(hostIPC): "false"
```

The shape of this rule is what the AI handled well. Kyverno's pattern syntax (the `=()` operators, the conditional matching) is verbose, error-prone to write by hand, and easy to get subtly wrong in ways that pass unit tests but fail at admission time. The AI-drafted version was correct on the first iteration roughly 70% of the time, and the remaining 30% was caught at audit-mode validation against the real cluster.

The exemption path through the `policy-exempt` namespace label is the part nobody skips and everyone underestimates. Without an exemption mechanism, every infrastructure component that legitimately needs privileged access ends up either breaking or needing a per-resource carve-out, both of which are operationally bad. Building the exemption into the namespace label keeps the exemption visible and reviewable, with the platform team owning the approval.

## What About ArgoCD Multi-Tenancy and AppProject Scoping?

Kyverno handles admission-time enforcement on the cluster. **ArgoCD** AppProject scoping handles deploy-time enforcement on what the GitOps controller is allowed to ship. Both layers are necessary; neither is sufficient alone.

We hardened the ArgoCD multi-tenant story in parallel: per-team AppProjects restricted source repositories, destination namespaces, and cluster-scoped resource kinds, with ArgoCD RBAC mapped through Okta OIDC group claims. Platform-admin access to ArgoCD itself was gated behind a separate MFA-required Okta group. The combination meant that a tenant's application repository could only deploy into the tenant's own namespaces, only with the resource kinds the platform team had vetted, and only with permissions the tenant's Okta groups had been granted.

The interaction between Kyverno and AppProject scoping is the thing to watch. AppProject restrictions catch deploy-time violations before they reach the cluster; Kyverno catches everything that bypasses ArgoCD. A tenant who somehow deploys directly through `kubectl` rather than through the GitOps pipeline still hits Kyverno at admission. Defense in depth is two layers, not one.

## Where the AI Accelerated the Work, With Examples

Three categories of contribution showed up consistently across the policy library work.

**Schema-aware boilerplate.** Kyverno policies have a verbose, predictable schema. Generating a new policy with the right `apiVersion`, `kind`, `match`/`exclude` structure, and `validate` block from a verbal description was the most consistent AI win. The hours of "remembering which field goes where" disappeared.

**Test fixtures.** For every policy we shipped, we wanted a passing fixture and a failing fixture as automated tests. Generating those fixtures from the policy text was a near-perfect AI job: small, well-specified, easy to verify. The test suite grew much faster than it would have without AI assistance.

**Cross-policy consistency.** When we updated a convention (renaming a label, changing an annotation pattern), asking the AI to apply the convention across the entire policy library produced a sweep diff in seconds that would have taken half a day by hand. Each diff still went through code review, but the review was reading rather than typing.

## Where the AI Did Not Help, and Why

Two categories of work were not improved by AI.

**Threat-model-level decisions.** Whether to enforce a particular policy as `Enforce` or `Audit` is a tradeoff between security posture and operational risk, and the right answer depends on the cluster's specific tenant population, the team's capacity to respond to broken admissions, and the rollout sequencing across environments. The AI happily defaulted to `Enforce` when asked, and that default was wrong about half the time. The threat-model conversation has to happen with humans who understand the cluster's tenants.

**Operational-rollout sequencing.** When to introduce a policy into a live cluster, how to run it in audit mode first, when to flip to enforce, and how to communicate the change to tenants is a coordination question, not a YAML question. The AI was unhelpful here, and trying to use it for sequencing produced a consistently optimistic plan that did not survive contact with real tenants.

The pattern is consistent with every AI-paired engineering loop we have run: the AI accelerates the well-patterned work, and the human handles the work that requires judgment about people and risk. The split is stable and easy to teach to a new team member.

## How to Roll Kyverno Policies Into a Live Cluster Without Breaking Workloads

A clean rollout has three stages. We ran every policy through all three.

**Audit mode in a non-production cluster.** Apply the policy with `validationFailureAction: Audit` against a staging cluster that hosts a representative slice of tenant workloads. Observe the violations the policy reports. Iterate on the policy until the violations match expectations.

**Audit mode in production.** Apply the same policy in audit mode in production. The audit reports surface real-world violations the staging cluster did not produce. This stage usually runs for a sprint or two while the team works with affected tenants to remediate.

**Enforce mode in production.** Once audit-mode reports are clean, flip to `Enforce`. The policy now refuses non-compliant resources at admission. The tenant teams have already been notified and have already remediated; the flip is a formality at this point.

Skipping any stage produces incidents. Skipping the staging cluster produces production incidents from policy bugs. Skipping the production audit phase produces incidents from real workload patterns the team did not predict. Stage and audit before enforce, every time.

## The Bottom Line

Multi-tenant Kubernetes security is policy work, and policy work scales when the authoring loop is fast. Kyverno provides the enforcement primitive; AI-paired authoring provides the speed-up that makes a comprehensive policy library tractable rather than aspirational. The combination is what turns "we have admission control" from a directional claim into a defensible posture with documented coverage and reviewed exemptions.

The work is not glamorous. It is YAML, audit reports, tenant conversations, and the same five categories of policy that every multi-tenant cluster needs. AI-paired authoring is what makes it sustainable for a small platform team to maintain that library across multiple clusters and multiple cloud providers without becoming a bottleneck.

If your team is responsible for multi-tenant Kubernetes and the admission-control story is mostly aspirational, our [Kubernetes & Container consulting](/services/kubernetes-containers/) engagements start with exactly this kind of policy and AI-paired-authoring rollout.

For a deeper look at how multi-tenant Kubernetes platforms scale, read our case study on [building a multi-tenant Kubernetes platform](/case-studies/kubernetes-multi-tenancy-scaling/).
