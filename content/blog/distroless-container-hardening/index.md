---
title: "Cutting 14 Critical CVEs by Going Distroless"
date: 2026-05-15
publishDate: 2026-05-15
draft: false
description: "A customer-facing Node service was running 14 CRITICAL CVEs in a 1.2 GB image. Here is how a four-stage distroless build cut every critical finding to zero."
slug: "distroless-container-hardening"
tags:
  - Containers
  - Distroless
  - Docker
  - DevOps
  - Kubernetes
---

We inherited a customer-facing Node and TypeScript service that was carrying 14 CRITICAL CVEs in a 1.2 gigabyte image. Six weeks later, the same service was running on a 180 megabyte distroless runtime with zero CRITICAL findings and a pod security context strict enough that the cluster admission policies stopped flagging it.

Most container hardening conversations stop at "scan for CVEs and patch." That is the easy part. The hard part is what to do when the patches do not exist, when the base image carries vulnerabilities you did not introduce, and when CI keeps failing because the cluster admission controller refuses to schedule the pod the way your application is currently written. This is the story of one such service at a multi-cloud SaaS platform and the four-stage approach that actually moved the numbers.

## Why CRITICAL CVE Counts Stay High No Matter How Often You Patch

If your image is built on Debian, Ubuntu, or even Alpine, the majority of the CVEs in your scan results probably do not come from your application code. They come from the package manager, the shell, the C library, the compiler runtimes, and the dozens of utilities that ship in a general-purpose base image. You can update them, but you cannot delete them, and the next scan finds a fresh batch.

The 1.2 GB image we inherited had this exact pattern. The application itself was a few hundred megabytes of Node modules and TypeScript output. Everything else was operating system. **Bash**, **apt-get**, **curl**, **gpg**, system Python, locale data, and a long list of libraries that were necessary at build time but completely unused at runtime. Trivy and Grype both reported the same 14 CRITICAL findings, and roughly 80% of them traced back to packages the application never invoked.

Patching faster does not solve this. Switching base image vendors does not solve it either. The only way to reliably push CRITICAL counts to zero is to remove the packages, which means removing the package manager, which means leaving general-purpose base images behind.

## What Is a Distroless Image, and Why Does It Matter?

A distroless image strips out everything that is not strictly needed at runtime. There is no shell, no package manager, and no userspace utilities. The runtime contains only the language runtime, your compiled application, and the certificates and timezone data your code needs to function. Attack surface drops, image size drops, and CVE counts drop with them.

The Google distroless project ships a small set of officially maintained variants: `gcr.io/distroless/static`, `gcr.io/distroless/base`, `gcr.io/distroless/cc`, `gcr.io/distroless/nodejs`, and a few language-specific images. They are SHA-pinnable, signed, and rebuilt regularly. Chainguard ships an alternative line of distroless images with a stronger SLA on rebuild cadence. Either is a defensible choice.

The tradeoff is that you cannot `kubectl exec` into the running container and poke around. There is no shell. For some teams, that feels like a regression. In practice, "exec into the running pod and run commands" is almost never how production debugging actually happens once you have decent logs and a metrics pipeline. The benefit of a smaller, harder runtime far outweighs the cost of losing an interactive shell that you should not have been relying on for production triage anyway.

## How a Four-Stage Build Collapses the Attack Surface

The Dockerfile we shipped used four explicit stages: a deps stage, a build stage, a prune stage, and a runtime stage. Each stage exists to push as much weight as possible out of the final image without losing the ability to debug build failures.

```dockerfile
# Tested with Docker 24, Node 20, distroless nodejs20-debian12

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev

FROM deps AS build
WORKDIR /app
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-bookworm-slim AS prune
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM gcr.io/distroless/nodejs20-debian12@sha256:<digest> AS runtime
WORKDIR /app
COPY --from=prune /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER nonroot
EXPOSE 3000
CMD ["dist/server.js"]
```

A few details matter more than they look. The **deps** stage is intentionally separate from **build** so that the dependency layer caches independently of source changes. The **prune** stage installs production dependencies from scratch rather than copying `node_modules` from `deps`, because dev dependencies have a habit of leaking into the production tree if you try to clean them up after the fact. The **runtime** stage copies only the artifacts it needs, runs as `nonroot`, and pins the distroless base by SHA so the image you build today is the image you build six months from now.

The SHA pin is the part most teams skip and regret later. Tag-based references like `gcr.io/distroless/nodejs20-debian12:nonroot` move when the image rebuilds, which means the bytes you scanned during PR review are not necessarily the bytes you ship. Pinning by digest closes that gap and makes Cosign signature verification meaningful.

## How Do You Run as Nonroot on a Read-Only Rootfs Without Breaking the App?

Most applications written for general-purpose base images assume they can write to `/tmp`, write to `/var/cache`, and reach for shell utilities at runtime. None of those assumptions hold under a strict pod security context. The way to keep them from breaking the workload is to give the application explicit, scoped writable mounts instead of relaxing the cluster baseline.

Our pod security context committed to the strict end of the spectrum:

```yaml
# Tested with Kubernetes 1.29, Kyverno baseline policies
securityContext:
  runAsNonRoot: true
  runAsUser: 65532
  fsGroup: 65532
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop: ["ALL"]
  seccompProfile:
    type: RuntimeDefault
volumes:
  - name: tmp
    emptyDir: {}
  - name: var-cache
    emptyDir: {}
volumeMounts:
  - name: tmp
    mountPath: /tmp
  - name: var-cache
    mountPath: /var/cache
```

The shape of this manifest matters as much as the values. A `readOnlyRootFilesystem: true` workload that needs to write somewhere gets `emptyDir` mounts at the specific paths it touches. Capabilities drop to ALL, then we add nothing back, because the application is HTTP and does not need raw socket access or any other privileged capability. The seccomp profile is `RuntimeDefault`, which on most container runtimes blocks the obscure syscalls that have historically been used in container escape exploits.

The temptation in environments with strict admission policies is to grant exceptions to the pod, especially when the application has run as root for years and "needs" to write everywhere on the filesystem. Resist that. The Kyverno-enforced cluster baseline at this engagement was non-negotiable, and the right move was to reshape the application to fit the policy rather than carve a hole in the policy to fit the application.

## Where Did the AI-Paired Authoring Actually Help?

We used **Claude** and **Cursor** throughout the Dockerfile, Kubernetes manifest, and Kyverno policy iteration loop. The contributions were faster cycles on repetitive work: drafting the multi-stage layout from a verbal description, regenerating manifests with security context fields in the right positions, and explaining why a Trivy finding existed in a Debian package the application never imported. Every AI-drafted artifact was reviewed before merge.

The work that AI did not replace was the judgment calls: which base image to commit to, whether to ship Cosign signatures from the start or add them later, and how to phase the rollout so that a single bad pin would not take down production. We treat [AI-paired authoring](/services/ai-augmented-engineering/) as a way to accelerate iteration, not a way to skip the security review. The pattern was the same one we have used to [accelerate Terraform migrations](/case-studies/ai-accelerated-infrastructure-delivery/) on the same engagement: AI drafts, humans verify, and nothing merges without a senior engineer signing off on the security implications.

## What We Deliberately Did Not Do

There were several tempting shortcuts we did not take, and the post would be incomplete without naming them.

We did not introduce a sidecar to handle the parts of the workload that did not fit the new security context. Sidecars create their own admission and CVE problems, and the right move was to push that work into the main container or eliminate it entirely.

We did not relax the cluster's Kyverno baseline. Once you ship one exception, every subsequent service argues for the same exception, and within a quarter the baseline is decorative. Several teams asked. We declined, and helped them refactor instead.

We did not switch to a smaller general-purpose base like Alpine. Alpine is smaller, but the CVE story is comparable to Debian once you account for musl quirks and the limited package set, and the runtime ergonomics are worse. The distroless commitment was the better path.

We did not build our own minimal base from scratch. That work has marginal upside over the maintained distroless variants and a long maintenance tail. Pin a published distroless base by SHA, verify the signature with Cosign, and let the upstream rebuild handle the rest.

## The Bottom Line

Cutting CRITICAL CVE counts to zero on a customer-facing service is a Dockerfile change, a manifest change, and a willingness to refactor the application around a strict admission policy instead of relaxing the policy. The distroless commitment is the headline. The four-stage build, the SHA pin, and the read-only rootfs with scoped emptyDir mounts are what make it stick.

If your scans keep returning the same CRITICAL findings month after month and your patches are not closing the gap, the answer is almost never "scan harder." It is "ship less." Distroless is the cleanest path to less, and the security ROI compounds every time the upstream base rebuilds and your dependencies update around it.

If your team's container security posture sounds like the one we walked into, our [DevSecOps & DevOps consulting](/services/devsecops-devops/) engagements start with exactly this kind of assessment.

For a deeper look at the broader security integration this fit into, read our case study on the [shift from DevOps to DevSecOps](/case-studies/devops-to-devsecops-transformation/).
