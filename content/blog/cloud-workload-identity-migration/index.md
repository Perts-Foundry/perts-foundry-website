---
title: "Replacing Static Cloud Credentials with Workload Identity"
date: 2026-09-15
publishDate: 2026-09-15
draft: false
description: "Long-lived AWS keys and GCP service account JSON belong in 2018, not your cluster. Here is how to migrate to workload identity on EKS and GKE safely."
slug: "cloud-workload-identity-migration"
tags:
  - AWS
  - GCP
  - Kubernetes
  - EKS
  - GKE
  - DevOps
---

If your cluster still has a Kubernetes `Secret` that contains an AWS access key, or a `serviceAccountKey.json` file mounted into a pod, you have a credential lifecycle problem you have not paid for yet. The bill comes due during incident response, during audit, during a rotation that did not propagate, or during the next time someone leaks that secret in a logger. The mitigation is workload identity, and on a modern cluster the migration is less risky than the credential it replaces.

We migrated to **AWS IRSA**, **EKS Pod Identity**, and **GCP Workload Identity** across multi-cluster Kubernetes at a multi-cloud SaaS organization, replacing long-lived static credentials with short-lived federated tokens scoped per **ServiceAccount**. This post is the migration playbook: the tradeoffs between IRSA and Pod Identity on EKS, the equivalent setup on GKE, the rollout sequence that kept workloads running, and what we would do differently next time. The work fits inside the broader [DevSecOps engagements](/services/devsecops-devops/) we lead at scale.

## Why Is a Long-Lived Cloud Credential in a Cluster a Security Tax?

A static cloud credential is a liability that grows monotonically with time. Every additional day the credential exists is another day it could leak, be cached on a developer laptop, end up in a backup that nobody remembers, or land in a logger that runs a verbose level somewhere unexpected. Rotation reduces the tax but does not eliminate it; rotation is also where most credential outages come from, because some downstream consumer is using the old value and nobody knew.

The hidden tax is operational. Static credentials require rotation policies, rotation runbooks, monitoring for failed rotations, alerting for unrotated credentials, and escalation paths for the inevitable cases where a rotation breaks a production workload at 3 AM. The team that runs the credential lifecycle is doing real work that produces no engineering value other than "we have not yet had an incident." That is the tax.

Workload identity closes the loop. The credential becomes ephemeral, scoped per `ServiceAccount`, issued by the cloud provider on demand, and never written to disk in the cluster. Rotation happens automatically as part of token issuance. The runbook for "rotate the credential" no longer exists, because there is nothing to rotate. The blast radius of a compromised pod no longer extends to "all the long-lived credentials on that pod," because there are none.

## What Is Workload Identity, and How Does It Fix This?

Workload identity is the umbrella term for a family of patterns where a workload presents a cloud-provider-issued, federated identity token at the time of API call, instead of carrying a static credential. The cloud provider verifies the token against a trust policy, issues a short-lived credential scoped to the workload's permissions, and returns it to the calling code transparently. There is nothing for the application to manage explicitly; the cloud SDK handles the token exchange under the hood.

In Kubernetes, the federation is wired through the cluster's projected `ServiceAccount` token. The pod's `ServiceAccount` is annotated with cloud-side metadata indicating which IAM role or service account the workload is allowed to assume. When the application code calls `aws.config()` or `google.auth.default()`, the SDK reads the projected token, exchanges it with the cloud provider for a short-lived credential, and uses it for the API call. The application code does not have to know the federation is happening.

The result is that the cluster's `ServiceAccount` is the unit of cloud authorization. Per-workload IAM policies become granular and reviewable. The cluster has no static credentials to leak, rotate, or misplace.

## EKS: IRSA Versus Pod Identity, and Which to Pick

AWS provides two paths to workload identity on EKS, and the choice between them is the most common question we get on this migration.

**IRSA (IAM Roles for Service Accounts)** is the older, more widely deployed path. The cluster runs an OIDC issuer; you create an IAM role with a trust policy that accepts tokens from that issuer, scoped to a specific `ServiceAccount` in a specific namespace. Pods that use the annotated `ServiceAccount` automatically get short-lived credentials for the role. IRSA is the default we still recommend for clusters where the configuration already exists or where the migration is more disruptive than the gain.

**EKS Pod Identity** is the newer path that AWS introduced to simplify the operational story. Instead of running a per-cluster OIDC issuer trust policy, EKS Pod Identity uses an in-cluster agent that brokers the credential exchange. Setup is simpler, the IAM trust policy structure is cleaner, and the per-pod attribution is more straightforward in CloudTrail. For new clusters, Pod Identity is generally the better choice. For existing clusters that already run on IRSA, the migration cost is rarely justified by the benefit.

The path we took at this engagement was hybrid: existing workloads stayed on IRSA, and new workloads were provisioned on Pod Identity. The hybrid path is operationally fine because both mechanisms coexist on a single cluster. The main downside is that the platform team has to maintain expertise in both, but the documentation and runbooks for IRSA are well-developed and the maintenance cost is low.

## GKE: Workload Identity Federation

GCP's equivalent is **Workload Identity**, which federates the cluster's `ServiceAccount` with a GCP service account through the GKE control plane. The setup is a one-time cluster configuration change (enabling Workload Identity on the node pool), plus per-workload annotation linking each Kubernetes `ServiceAccount` to a GCP service account through an IAM binding.

```hcl
# Tested with Terraform 1.9, GCP provider 5.x

resource "google_service_account" "data_loader" {
  account_id   = "data-loader"
  display_name = "Data loader workload identity"
}

resource "google_service_account_iam_binding" "data_loader_workload_identity" {
  service_account_id = google_service_account.data_loader.name
  role               = "roles/iam.workloadIdentityUser"
  members = [
    "serviceAccount:${var.project_id}.svc.id.goog[data-pipeline/data-loader]",
  ]
}

resource "kubernetes_service_account" "data_loader" {
  metadata {
    name      = "data-loader"
    namespace = "data-pipeline"
    annotations = {
      "iam.gke.io/gcp-service-account" = google_service_account.data_loader.email
    }
  }
}
```

The `members` field on the IAM binding is the federation contract: it says "the Kubernetes ServiceAccount `data-loader` in the namespace `data-pipeline` is allowed to act as the GCP service account `data-loader@<project>.iam.gserviceaccount.com`." Pods that mount the annotated Kubernetes `ServiceAccount` automatically get short-lived GCP credentials scoped to that GCP service account's permissions, with no static keys involved.

The GKE setup has a sharper constraint than EKS: every node pool must have Workload Identity enabled at creation. Migrating an existing node pool requires creating a new pool, draining the old one, and decommissioning. We treated this as a node pool refresh rather than an in-place migration, and ran it during a planned maintenance window per cluster.

## What Does the Migration Sequence Actually Look Like?

The high-level sequence is the same on both clouds. Workload identity gets enabled at the cluster or node-pool level first, then per-workload migrations roll forward through environments.

1. **Enable workload identity on the cluster.** On EKS, this is the OIDC issuer (IRSA) or the Pod Identity agent. On GKE, this is the node pool flag. This change is non-breaking; existing static-credential workloads continue working alongside the new mechanism.
2. **Provision the cloud-side IAM.** Create the IAM roles or service accounts, write trust policies that accept tokens from the cluster's federation source, and grant only the permissions the workload actually needs.
3. **Annotate the Kubernetes `ServiceAccount`.** This is the per-workload migration step. The `ServiceAccount` annotation tells the cloud SDK which role or service account to assume.
4. **Remove the static credential.** Once the workload is verified to be running on the federated identity, remove the Kubernetes `Secret` that holds the static key, and revoke the static key in the cloud provider.
5. **Verify in the audit log.** CloudTrail or Cloud Audit Logs should show API calls attributed to the federated identity, not to the static key. This is the lagging indicator that the migration succeeded.

Steps 1 and 2 can ship together in a single PR per workload. Step 3 is the production change; it is non-disruptive if the cloud-side IAM is correctly scoped. Steps 4 and 5 are the cleanup that closes out the migration.

## Code: a Pod-to-IAM Example on EKS

A representative IRSA setup, in Terraform:

```hcl
# Tested with Terraform 1.9, AWS provider 5.x, EKS 1.29
data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "data_loader_trust" {
  statement {
    effect = "Allow"
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.eks.arn]
    }
    actions = ["sts:AssumeRoleWithWebIdentity"]
    condition {
      test     = "StringEquals"
      variable = "${aws_iam_openid_connect_provider.eks.url}:sub"
      values   = ["system:serviceaccount:data-pipeline:data-loader"]
    }
  }
}

resource "aws_iam_role" "data_loader" {
  name               = "data-loader-role"
  assume_role_policy = data.aws_iam_policy_document.data_loader_trust.json
}

resource "kubernetes_service_account" "data_loader" {
  metadata {
    name      = "data-loader"
    namespace = "data-pipeline"
    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.data_loader.arn
    }
  }
}
```

The IAM trust policy's `sub` condition is what binds the role specifically to the named `ServiceAccount` in the named namespace. Without it, any pod in the cluster could assume the role; with it, only pods running under `system:serviceaccount:data-pipeline:data-loader` can. Getting that condition right is the single most common configuration mistake we see on IRSA migrations.

## What About CI/CD Pipelines (GitHub Actions OIDC)?

The same federation pattern applies outside the cluster. GitHub Actions can present an OIDC token that AWS or GCP will accept against a federated trust policy, eliminating the long-lived `AWS_ACCESS_KEY_ID` secret in the repository's CI configuration.

The wiring on AWS:

```yaml
# Tested with GitHub Actions, aws-actions/configure-aws-credentials@v4
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions-deploy
          aws-region: us-east-1
      - run: aws sts get-caller-identity
```

The IAM role on the AWS side has a trust policy that accepts tokens from `https://token.actions.githubusercontent.com` with conditions on the repo, the branch, and the workflow. The result is that the CI pipeline runs against short-lived, repo-scoped credentials, with no static AWS keys anywhere in GitHub. We migrated every CI pipeline that used static credentials to the OIDC pattern as part of the broader credential reduction.

## What We Did Differently in Retrospect

Two things would change on the next migration of this scale.

We would invest earlier in **a per-namespace IAM policy generator**. The per-workload IAM policies were written by hand initially and ended up inconsistent in their permission scoping. Halfway through the migration we built a Terraform module that generated the IAM policy from a declarative permission spec, and the consistency improved sharply. Starting with that module would have saved several days of cleanup.

We would also be more aggressive about **revoking the old static credentials on a tight schedule**. The risk during a credential migration is leaving the static key valid "just in case the migration breaks" indefinitely. We set a two-week deadline per workload between the federated cutover and the static-key revocation, and the deadline drove the cleanup. Without the deadline, several workloads would have lingered on dual credentials for months.

## The Bottom Line

Workload identity is the credential model modern Kubernetes clusters should be running on, and the migration from long-lived static credentials is less risky than the static credential itself. The pattern is consistent across EKS and GKE: enable federation at the cluster or node-pool level, provision per-workload cloud-side IAM, annotate the Kubernetes `ServiceAccount`, verify in the audit log, and revoke the old key. Each step is non-disruptive when the previous one is verified.

The operational dividend is the part most teams underestimate. The runbooks for "rotate the static cluster credential" stop existing. The 3 AM incident where a rotation broke a production workload stops happening. The auditor's question about credential lifecycle gets a satisfying answer for the first time in years.

If your cluster still has static cloud credentials and you have been postponing the workload identity migration, our [DevSecOps & DevOps consulting](/services/devsecops-devops/) engagements start with exactly this kind of credential reduction work.

For a deeper look at the broader security integration this fit into, read our case study on the [shift from DevOps to DevSecOps](/case-studies/devops-to-devsecops-transformation/).
