# Perts Foundry LLC — Website Action Plan

> **Archived:** 2026-04-03. All 6 phases complete. Current architecture documented in `CLAUDE.md`.

> **Note:** This was the initial planning document. The project deployed on Cloudflare Workers (not Cloudflare Pages as described below), and the infrastructure repo is named `Perts-Foundry/infrastructure` (not `perts-foundry-infra`). See `CLAUDE.md` for the current architecture.

## Overview

This action plan covers standing up a Hugo static site for Perts Foundry LLC, deployed to Cloudflare Pages, with all infrastructure managed by Terraform and CI/CD handled by GitHub Actions. The architecture uses two separate repositories — one for infrastructure, one for the Hugo site — under the existing `Perts-Foundry` GitHub organization.

**Existing state to account for:** The domain zone is already active in Cloudflare with DNS records for Proton Mail email routing and redirect rules in place. These will be imported into Terraform rather than recreated.

**Cost:** The entire stack runs on Cloudflare's free tier. R2 provides 10 GB of free storage with 10 million Class B and 1 million Class A operations per month — Terraform state files are kilobytes and will never approach these limits. Cloudflare Pages includes 500 deploys/month on the free plan.

---

## Phase 0: Bootstrap (Manual One-Time Setup)

Terraform needs certain resources to exist before it can manage anything. This is the chicken-and-egg problem — Terraform needs an R2 bucket for state, but Terraform is what creates R2 buckets. These steps are manual and should be documented in a `BOOTSTRAP.md` committed to the infra repo.

**0.1 — Create the R2 state bucket.** In the Cloudflare dashboard, navigate to Storage & Databases → R2 → Create bucket. Name it `perts-foundry-tf-state` with Automatic location.

**0.2 — Generate R2 S3-compatible API credentials.** Go to R2 → Overview → Manage R2 API Tokens → Create API Token. Scope it to Object Read & Write on the `perts-foundry-tf-state` bucket only. Copy the Access Key ID and Secret Access Key immediately — the secret is shown only once. These are S3-compatible credentials, separate from Cloudflare API tokens.

**0.3 — Create scoped Cloudflare API tokens.** Create two tokens in the Cloudflare dashboard (My Profile → API Tokens):

- **Terraform token** — Account permissions: Cloudflare Pages Edit, R2 Storage Edit, Account Settings Read. Zone permissions: Zone Read, Zone Settings Edit, DNS Edit. Scope to your specific account and zone.
- **Hugo deploy token** — Account permissions: Cloudflare Pages Edit only. This is the minimal permission needed for Wrangler's Direct Upload.

**0.4 — Note your Account ID and Zone ID.** Found on the Cloudflare dashboard overview page and zone overview page respectively. Both are needed throughout.

**0.5 — Document everything.** Write a `BOOTSTRAP.md` capturing what was created manually, when, and by whom. This is the audit trail for anything that lives outside Terraform's control.

---

## Phase 1: Repository Setup

Create two repositories in the `Perts-Foundry` GitHub organization.

### 1.1 — Infrastructure repo: `perts-foundry-infra`

This repo holds all Terraform code managing Cloudflare resources. Structure it with separate files by resource concern: provider/backend configuration, DNS records, Pages project, R2 bucket, variables, and outputs. Include the `.github/workflows/` directory for CI/CD, a `.gitignore` excluding `.terraform/`, `*.tfstate`, and `*.tfvars`, and the `BOOTSTRAP.md` from Phase 0.

### 1.2 — Website repo: `perts-foundry-website`

This repo holds the Hugo site codebase. Structure it with the standard Hugo directory layout (content, layouts, static, assets, themes) plus the `.github/workflows/` directory for CI/CD. Include a `static/_headers` file for security headers since Cloudflare Pages respects this convention.

### 1.3 — Configure GitHub secrets

Set up repository-level and environment-level secrets across both repos. Create a `production` GitHub environment on each repo with branch protection requiring `main`.

- **Infra repo secrets:** Cloudflare Account ID, Cloudflare API Token (Terraform-scoped), R2 Access Key ID, R2 Secret Access Key, Zone ID
- **Website repo secrets:** Cloudflare Account ID, Cloudflare API Token (Deploy-scoped)

### 1.4 — Branch protection

Enable branch protection on `main` in both repos: require pull request reviews, require status checks to pass, and prevent force pushes.

---

## Phase 2: Terraform Infrastructure

### 2.1 — Backend configuration

Configure the S3 backend pointing at R2 for remote state storage. R2 is S3-compatible, but Terraform's S3 backend assumes AWS by default — you'll need to set several `skip_*` flags and `use_path_style` to make it work. The R2 endpoint, access key, and secret key should be injected via environment variables or `-backend-config` flags, never hardcoded. Reference the Cloudflare Terraform R2 backend documentation for the exact configuration.

### 2.2 — Provider setup

Use the latest Cloudflare Terraform provider (v5). Be aware that v5 is a full rewrite from v4 with renamed resources and changed attribute names (e.g., `cloudflare_record` → `cloudflare_dns_record`, `value` → `content`). Check the v5 migration guide and the open issues tracker as some resources like `cloudflare_pages_domain` have had race condition bugs. Pin the provider version explicitly.

### 2.3 — Import existing DNS records

Since DNS is already configured for Proton Mail and other services, these records must be **imported** into Terraform state rather than created fresh. The process is:

1. Audit all existing DNS records in the Cloudflare dashboard — document every MX, TXT (SPF, DKIM, DMARC), CNAME, and any other records currently in place for Proton Mail and existing services.
2. Write corresponding Terraform resource definitions that match the current state exactly.
3. Use `terraform import` to bring each record into state. In v5, the import target for DNS records uses the composite ID format specific to the provider — check the v5 docs for the exact syntax.
4. Run `terraform plan` after imports and confirm **zero changes**. If the plan shows diffs, adjust your resource definitions until the plan is clean. Do not proceed until this is the case.

This step is critical — a careless `terraform apply` could delete your MX records and break Proton Mail routing.

### 2.4 — Define the Pages project

Create a `cloudflare_pages_project` resource (v5 naming) for the Hugo site. Use **Direct Upload mode** (no `source` block) so that GitHub Actions controls the build and deploy process. Configure the build settings with Hugo's build command, output directory, and pin `HUGO_VERSION` in the environment variables. Note: Direct Upload mode is an irreversible choice — you cannot switch to Git integration later.

### 2.5 — Define custom domain attachments

Attach both the apex domain and `www` subdomain to the Pages project. Add CNAME records pointing both to `<project-name>.pages.dev` with proxying enabled. The apex CNAME requires Cloudflare's CNAME flattening (automatic when proxied), since CNAMEs aren't technically valid at the zone apex. SSL is automatically provisioned.

Redirects between www and apex are already handled by your existing Cloudflare redirect rules, so no additional redirect configuration is needed here.

### 2.6 — Import the bootstrapped R2 bucket

After the first `terraform apply`, use `terraform import` to bring the manually created R2 state bucket under Terraform management. Write the resource definition first, import, then confirm a clean plan.

### 2.7 — Cloudflare zone settings (optional, recommended)

Consider managing zone-level settings in Terraform for reproducibility: SSL mode (Full Strict), Always Use HTTPS, Minimum TLS Version (1.2), Browser Cache TTL, Bot Fight Mode, and Email Address Obfuscation. These can also be configured manually in the dashboard first and Terraformed later.

---

## Phase 3: Terraform CI/CD Pipeline

### 3.1 — Workflow structure

Create a GitHub Actions workflow that runs `terraform plan` on every pull request and `terraform apply` on merge to `main`. The plan output should be posted as a comment on the PR for review. The apply job should be gated behind the `production` GitHub environment for an additional approval step if desired.

### 3.2 — State locking strategy

R2 doesn't support DynamoDB-style state locking. For a solo operator or small team, use **GitHub Actions concurrency control** — set a concurrency group on the workflow with `cancel-in-progress: false` to serialize all Terraform runs. This effectively prevents concurrent state modifications. If the team grows later, Terraform 1.10+ supports native S3 state locking via conditional writes (`use_lockfile = true`), and R2 supports the required `If-None-Match` header.

### 3.3 — Pipeline steps

The workflow should: check out code, install Terraform (pinned version), run `terraform init` with the R2 backend config, run `terraform fmt -check` and `terraform validate` as quality gates, run `terraform plan` (posting output to the PR), and on merge to `main`, run `terraform apply -auto-approve`. All Cloudflare and R2 credentials should be injected from GitHub secrets via environment variables.

---

## Phase 4: Hugo Site Scaffolding

### 4.1 — Initialize the Hugo site

Scaffold the Hugo project in the website repo. Choose and install a theme appropriate for a professional consulting business (e.g., PaperMod, Congo, Blowfish) as a git submodule.

### 4.2 — Configure Hugo

Set `baseURL` to your production domain, configure the site title and description for Perts Foundry LLC, and set up basic SEO metadata. Pin the Hugo version explicitly — Cloudflare's default Hugo version is outdated and will cause build failures if relied upon.

### 4.3 — Security headers

Add a `static/_headers` file with security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Strict-Transport-Security, and Content-Security-Policy. Cloudflare Pages natively respects this file convention.

### 4.4 — Content structure

Plan out the initial pages for a consulting business: homepage, services/capabilities (DevOps, DevSecOps, Cloud Engineering, CI/CD, Automation), about, and contact. Create placeholder content so the first deployment has something to render.

---

## Phase 5: Hugo CI/CD Pipeline

### 5.1 — Workflow structure

Create a GitHub Actions workflow that builds Hugo and deploys to Cloudflare Pages via Wrangler's Direct Upload on every push to `main`. On pull requests, deploy to a preview environment.

### 5.2 — Build process

The workflow should: check out the repo with submodules (for the theme), install Hugo (pinned version, extended edition), run `hugo --gc --minify`, and deploy the `public/` directory using Wrangler's `pages deploy` command.

### 5.3 — Preview deployments

Use Wrangler's `--branch` flag to control production vs. preview deployments. On PRs, pass the feature branch name — this creates a preview deployment at `<branch>.<project>.pages.dev`. Post the preview URL as a comment on the PR for easy review.

### 5.4 — Caching

Cache Hugo's `resources/_gen` directory between builds using GitHub Actions cache to speed up asset processing.

---

## Phase 6: Launch Checklist

### Pre-launch verification

1. Run `terraform plan` and verify all resources are correct — Pages project, DNS records (including all existing Proton Mail records unchanged), custom domains, R2 bucket
2. Merge the infra PR to trigger `terraform apply`
3. Verify the Pages project appears in the Cloudflare dashboard
4. Push the Hugo site to `main` to trigger the first deployment
5. Verify the site loads at `<project>.pages.dev`
6. Verify DNS propagation — the apex and www CNAME records should resolve to `<project>.pages.dev`
7. Verify the custom domain loads with a valid SSL certificate
8. Confirm existing redirects (www ↔ apex) still function correctly
9. Confirm Proton Mail email delivery is unaffected — send a test email
10. Run a security header scan (e.g., securityheaders.com)
11. Verify `robots.txt` and `sitemap.xml` are accessible

### Post-launch

- Disable `.pages.dev` subdomain indexing to prevent duplicate content — add a redirect rule or `_headers` entry with `X-Robots-Tag: noindex` on the `.pages.dev` domain
- Configure Cloudflare dashboard settings if not yet Terraformed: SSL Full Strict, Always Use HTTPS, Minimum TLS 1.2, Bot Fight Mode
- Monitor the first few GitHub Actions runs in both repos to confirm CI/CD stability

---

## Gotchas and Considerations

**Terraform v5 provider breaking changes.** Resource names and attributes changed significantly from v4. Since this is a greenfield project you won't have migration pain, but most documentation and examples online are written for v4. Translate resource names accordingly (e.g., `cloudflare_record` → `cloudflare_dns_record`). Check open issues before relying on any specific resource.

**DNS import is the highest-risk step.** A bad `terraform apply` before imports are complete could destroy MX records and break Proton Mail. Always import first, confirm a clean plan with zero changes, and only then begin adding new resources.

**Pages project mode is irreversible.** Creating the Pages project as Direct Upload (no Git integration source block) means you cannot later switch to Cloudflare's native Git integration. This is the right choice for CI/CD control through GitHub Actions, but be aware it's a one-way door.

**`HUGO_VERSION` must be pinned.** Cloudflare's default build image uses an ancient Hugo version. Even with Direct Upload (building in GitHub Actions), pin the version in both the GitHub Actions workflow and the Terraform Pages environment variables for consistency.

**R2 has no native Terraform state locking.** GitHub Actions concurrency control is the pragmatic solution for a solo/small-team workflow. Revisit if collaboration patterns change.
