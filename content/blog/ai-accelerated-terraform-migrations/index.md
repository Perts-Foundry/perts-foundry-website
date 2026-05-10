---
title: "Using AI to Accelerate Terraform Migrations"
date: 2026-08-15
publishDate: 2026-08-15
draft: false
description: "AI-paired engineering shrunk our Snowflake Terraform migration cycle dramatically. Here is how we worked with Claude and Cursor across cloud providers."
slug: "ai-accelerated-terraform-migrations"
tags:
  - AI
  - Terraform
  - Claude
  - Cursor
  - Snowflake
---

We migrated more than fifteen production **Snowflake** Terraform projects across **AWS**, **GCP**, and **Azure** with zero downtime, plus a multi-wave production Snowflake account migration across cloud providers and regions. The work that would have been a quarter of careful per-project translation became a fraction of that, because we paired the migration with **Claude** and **Cursor** and ran a tight four-step loop on every project.

The interesting result is not that AI made the work faster. It is which parts of the work AI made faster, and which parts still belonged to humans. This is the operational pattern we used at a cross-cloud data platform, with concrete examples of where the leverage was real and where it was not. The same pattern shows up across the [AI-augmented engineering work](/services/ai-augmented-engineering/) we lead on production infrastructure.

## Why Is Terraform Migration the Right Place to Apply AI?

Terraform migration has a structure that AI is unusually good at. The work is repetitive, the patterns are visible in the source code, the validation step is concrete (`terraform plan` either matches expectations or it does not), and the cost of a mistake is low when the cycle is "AI drafts, human reviews, plan validates, apply executes." Compare that to architecture decisions or production debugging, where the patterns are not visible from a single repository and the validation is often a long feedback loop. AI's leverage on Terraform migration is high because the work plays to AI's strengths.

The leverage is also high because the work is largely toil from the human side. Translating thirty similar resource definitions from one provider's schema to another's is the kind of task that produces no engineering insight per repetition; the second project teaches you what the first one didn't, and after that the work is just hours of attentive translation. Removing that hours-of-toil layer is exactly the kind of automation AI delivers cleanly, and the engineers spent their attention on the parts that needed engineering judgment instead of the parts that needed patience.

## What Does AI-Paired Migration Actually Look Like?

The honest version is "humans drive, AI accelerates." Engineers open the project, run an inspection pass to understand what the migration entails, prompt the AI to draft the migration steps, run `terraform plan`, review the diff against expectations, iterate with the AI on any unexpected differences, and apply once the plan matches. The human is in the loop for every decision. The AI is in the loop for the typing and the boilerplate.

The cycle was deliberate. We did not let AI drive the migration end-to-end, even when it would have been faster to do so on the easy projects. The reason is that the failure mode of an AI-driven Terraform migration is not "the plan fails to apply" (which is recoverable). It is "the plan applies cleanly but accidentally drops or recreates a resource that holds production data" (which is not). Keeping a human reviewing every plan output before apply was the safety control that made the speed-up safe.

## The Four-Step Migration Loop We Ran for Each Project

Every project went through the same loop. The loop is short, but every step matters.

**Step 1: Inspect.** A human read the project's existing Terraform, the upstream module versions, and the resource topology. The output of this step was a one-paragraph mental model of "what this project does and what specifically needs to change." AI was not yet involved at this step, because the inspection's purpose is for the human to form judgment about the work, not to generate output.

**Step 2: Prompt.** With that mental model in hand, the human prompted the AI with a specific, scoped instruction. Not "migrate this project," but "rewrite these three resource blocks from provider X to provider Y, preserving names, lifecycle, and dependency edges, and tell me explicitly if you change anything about state addressing." The prompt was scoped narrowly because narrow prompts produce reviewable diffs.

**Step 3: Plan.** The AI's draft went straight into `terraform plan`. The plan output was the source of truth. If the plan showed unexpected changes, the AI's draft was wrong somewhere, and the cycle went back to step 2 with a more specific prompt.

**Step 4: Review and apply.** A human read the plan output line by line and confirmed every change matched the migration intent. Only then did the apply happen. For multi-wave migrations, the apply happened to a non-production environment first, soaked, and then promoted.

The loop ran in tens of minutes for simple projects and a couple of hours for complex ones. The cycle time matters, but the predictability of the cycle matters more. Once the team had run the loop on the first three projects, every subsequent project was an instance of a known pattern, and the cognitive load dropped sharply.

## What Did the AI Handle Well?

Three categories of work consistently benefited from AI assistance.

**Schema translation.** Translating resource definitions from one provider's schema to another's is exactly the kind of mechanical, well-patterned work the AI was strong at. Differences in field names, default values, and nested-block conventions across provider versions are visible in published documentation, and the AI handled the translation without prompting drift. We caught one or two field translations the AI got wrong during plan review; we never caught one that survived plan review.

**Boilerplate reduction.** When a migration required adding new files, new module references, or new locals to support cross-cloud parity, the AI was excellent at producing the boilerplate from a verbal description. "Add a new module call that wires the existing variables into the new provider, with a `count` guarded on a flag," produces the right code on the first attempt almost every time.

**Explanation of unexpected plan output.** When `terraform plan` produced a change we did not expect, asking the AI "why might this resource be showing as recreated rather than updated in place" produced a useful diagnostic in seconds. Sometimes the answer was "the new provider version requires a recreation for this attribute change," which led to a different migration approach. Sometimes the answer was "you have a state-addressing mismatch," which led to a `terraform state mv` rather than a destroy-and-recreate. The AI was not always right, but it was a fast first pass at "what could explain this."

## Where Did the AI Fail, and What Did We Do About It?

Two categories of failure showed up reliably.

**State manipulation.** Terraform state operations are subtle, irreversible, and easy to get wrong in ways that look fine until production breaks. The AI suggested several `terraform state mv` operations that would have correctly preserved the state for the resource it was thinking about, while implicitly orphaning a different resource that was attached to the same state path. We caught these in review and never executed them. The lesson was to scope state-manipulation prompts very narrowly and treat any AI-generated `state mv` command with extreme suspicion.

**Cross-cloud differences in semantics, not just syntax.** Translating a GCP resource to its AWS equivalent is sometimes more than a name change; the semantics differ in subtle ways. The AI happily translated names without flagging that the underlying resource model was different in ways that mattered for the migration. The mitigation was to prompt explicitly for "translate this resource and explicitly call out any semantic differences between the source and destination providers that would change behavior at runtime." Once the prompt included that explicit ask, the AI surfaced the semantic differences reliably.

The pattern across both failure modes is that AI is unreliable on operations where the failure mode is silent. Operations that produce a visible plan diff are safe; operations that affect state without changing infrastructure, or that translate semantics implicitly, need narrower prompts and tighter review.

## What We Learned About Prompting for IaC

Three patterns produced consistently better output.

**Be specific about the boundary.** "Migrate this file" produces a wider, less reviewable diff than "rewrite the resource at lines 40 to 75 to use the new provider, preserving the `lifecycle` block and the explicit `depends_on` to `google_project.this`." The narrower the boundary, the smaller the diff, the faster the review, and the lower the chance of a silent error.

**Ask for the model's confidence and uncertainty.** Adding "and tell me which parts of this translation you are uncertain about, and why" to a prompt is one of the highest-leverage habits we developed. The AI's stated uncertainty is not always accurate, but it is usefully correlated with where the actual errors hide. Reviewing the parts the AI flagged as uncertain catches a meaningful share of the issues that plan review would have caught later.

**Show the AI the project's conventions.** Pointing the AI at a representative existing module before asking it to write a new one produces output that respects the project's conventions automatically. The AI is good at imitating patterns it has seen; it is less good at inventing patterns from a generic prompt. Always show before you tell.

A representative prompt that worked well in this engagement:

```text
Here are three existing modules from this project that follow our
conventions: [paths]. Read them first.

Now: in [target file], replace the resource blocks at lines 40 to 75
with the equivalent resources for the [destination] provider.
Preserve the `lifecycle` and `depends_on` blocks exactly. If any
field has a different default in the destination provider that
would change runtime behavior, set the field explicitly and call
out the change in a comment that starts with `# AI-NOTE:`.

Output only the replacement block. Do not modify anything else.
```

The `# AI-NOTE:` convention let humans grep for AI-flagged uncertainties across the diff in a single command, and the "output only the replacement" instruction kept the diff scoped.

## How to Apply This Pattern to Your Migrations

The pattern transfers cleanly to most large-scale Terraform migrations. The preconditions are that the project is under version control with a clean tree, the team has access to a capable AI tool with the project's source visible to it, and the migration has a defensible per-project verification step (usually `terraform plan` against a non-production environment).

Three guardrails to put in place before you start:

- **Make the verification step the source of truth, always.** Plan output is the contract; the AI's confident assertion is not. If the plan does not match expectations, the AI is wrong.
- **Refuse `terraform apply` without a human reviewer.** AI-paired Terraform migrations work because of the human-in-the-loop check at apply. Removing that check converts a productivity tool into a production hazard.
- **Write down the pattern.** After two or three migrations, the team should have a one-page playbook describing the loop, the prompts that worked, and the failure modes to watch for. The playbook is what scales the practice from "Seth ran it" to "the team runs it."

## The Bottom Line

AI-paired Terraform migration works because the work is structured, the validation is concrete, and the failure modes are mostly visible at plan time. The leverage is real on the mechanical and translational layers, and the human stays in the loop for every decision that involves state, semantics, or apply. The result is a migration cycle that compresses dramatically without sacrificing the safety controls that make production migrations defensible.

The same shape applies to most well-patterned IaC work, not just Terraform. Helm chart conversions, Kustomize refactors, CloudFormation translations, and CI/CD pipeline migrations all share the structural properties that make AI-pair-programming useful. Tooling matures month by month, and the gap between "we should try AI on this" and "we have a documented pattern for AI on this" is closing in production environments where the safety controls are taken seriously.

If your team has a Terraform migration ahead and is wondering where AI fits, our [AI-Augmented Engineering consulting](/services/ai-augmented-engineering/) engagements start with exactly this kind of operational pattern design.

For a deeper look at how this played out in practice, read our case study on [AI-accelerated infrastructure delivery](/case-studies/ai-accelerated-infrastructure-delivery/).
