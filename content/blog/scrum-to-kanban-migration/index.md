---
title: "When to Switch from Scrum to Kanban"
date: 2026-11-01
publishDate: 2026-11-01
draft: false
description: "Most teams asking 'should we switch from Scrum to Kanban?' are asking a process question that has a flow problem underneath. Here is how to tell which fits."
slug: "scrum-to-kanban-migration"
tags:
  - Agile
  - Kanban
  - DevOps
---

The fastest improvement we ever drove on a software team was a transition from Scrum to Kanban that cut the median time an issue stayed open by 25%. The team was unhappy with Scrum and decided Kanban would fix it. They were right, but for the wrong reason. Kanban did not fix the unhappiness. Kanban surfaced the actual problem (uneven flow and wide work-in-progress) in a way Scrum's sprint cadence had been politely hiding.

Most "should we switch from Scrum to Kanban" conversations are process conversations with a flow problem underneath. The right answer is sometimes Kanban, sometimes a tighter Scrum, and occasionally something else entirely. This is the framework we use, drawn from a defense software organization where the transition was the right call, plus several other engagements where it would have been the wrong one. The work fits inside the broader [agile coaching engagements](/services/agile-coaching/) we lead with engineering teams.

## Why Is Scrum the Wrong Shape for Some Teams?

Scrum is built around a fixed sprint cadence: two weeks of committed work, planning at the start, review and retro at the end. The cadence is the feature. It produces predictability for stakeholders, batches review activities efficiently, and forces a regular conversation about priorities. For teams whose work fits cleanly into two-week boxes, Scrum is excellent.

The cadence becomes a tax for teams whose work does not fit cleanly into two-week boxes. The most common pattern is **uneven work shape**: the team's incoming requests vary wildly in size, urgency, and predictability, and forcing them into a sprint commitment produces a planning ceremony that is half-honest at best. Engineers commit to "what we think we can do" and then accept the half of the unplanned work that arrives mid-sprint, and the sprint commitment becomes a reporting fiction. The retro keeps surfacing the same complaint and nobody has a structural answer.

The second pattern is **operational work mixed with project work**. A team that supports a system in production while also building new features cannot honestly commit to a sprint backlog when the operational backlog is unbounded. Sprints either become operations-only with feature work permanently delayed, or they become feature-only with operations work accumulating. Neither produces flow.

The third pattern is **work that crosses team boundaries**. Sprint commitments assume the work is mostly the team's to control. When the work depends on a partner team's responsiveness, the dependency makes commitments unreliable in a way that Scrum has no clean handle on.

## What Does Kanban Actually Do Differently?

Kanban replaces the sprint cadence with two structural rules: visualize the work, and limit work in progress. The cadence dissolves; the discipline shifts to flow.

Visualizing the work means a board with explicit stages (todo, in progress, in review, done, or whatever the team's actual flow looks like) and every work item visible on the board at all times. The visualization is the diagnostic. A board with twelve cards in "in review" and three cards in "in progress" is showing you a review bottleneck. A board with cards aging silently in "blocked" is showing you an unresolved dependency that needs escalation. The information was always present; the board surfaces it.

Limiting work in progress means hard caps on how many cards can sit in any one stage. Work cannot start when the cap is reached; the team's incentive becomes finishing in-progress work before pulling new work. WIP limits are the enforcement layer that makes the visualization actionable. Without them, "we should start fewer things" is a wish; with them, "we cannot start a new thing because the cap is hit" is a system.

The trade-off Kanban accepts is that there is no built-in cadence for retrospectives, planning, or stakeholder reviews. Teams that adopt Kanban have to design those rituals separately, or they slowly stop happening. The most common Kanban failure mode is "we are doing Kanban but we forgot to keep the retro," and the team's improvement loop quietly degrades.

## When Should You Switch?

Switch when the team's work shape is genuinely poorly suited to Scrum's cadence and you have evidence that the cadence is producing dishonest commitments or unaddressed flow problems. Concrete signals:

- Sprints regularly close with significant unfinished work that gets carried over without an honest conversation about why.
- Mid-sprint scope changes are routine, and the team has stopped trusting the sprint plan.
- Work-in-progress is high enough that work items spend more time in transit than in active progress.
- The team's median cycle time is much longer than the team's median active-work time, indicating queueing and handoffs are dominating.
- Operational work is regularly displacing planned work, and the team has no structural way to balance the two.

If two or three of these are true and persistent, the cadence is the problem. Switching is likely to help.

## When Should You Not Switch?

Do not switch when the team's underlying problem is something other than flow. Three patterns to watch for.

If the team is unhappy with Scrum because **standups feel performative** or **retrospectives produce no follow-up**, the issue is ritual quality, not the cadence. Better facilitation fixes those without changing the framework.

If the team is unhappy because **stakeholders keep changing priorities mid-sprint**, the issue is the stakeholder relationship, not the framework. Kanban will not protect the team from a stakeholder who reprioritizes weekly; it will just make the disruption more visible without giving the team more leverage.

If the team is unhappy because **the workload is structurally too high for the team's size**, the framework switch will not help. Kanban will surface the WIP problem clearly, and the team will then have to make the same staffing or scope conversation that they would have had to make under any framework.

The pattern is that Kanban exposes flow problems and offers tools to address flow problems. It does not solve problems that are not about flow.

## How We Ran the Transition (Without Losing the Work)

The transition at the defense software engagement ran over the course of a month, not a quarter. The shape of the team's work was already obviously poorly suited to Scrum: a steady stream of incoming infrastructure tickets of wildly varying size, plus longer-term modernization workstreams, with no clean way to commit them to a sprint. Switching was a relief, not a controversy. The mechanics:

We **mapped the existing flow** before changing anything. The team's actual stages were clearer than the Scrum board's columns suggested: incoming, triage, in progress, in review with an external team, in deployment, and done. We made the map explicit before we touched the framework.

We **set initial WIP limits conservatively**. The first WIP limits were intentionally generous, because aggressively low WIP limits at the start produce frustration without producing flow. The limits tightened over the first six weeks as the team got comfortable with the new discipline.

We **kept the rituals we still needed**. Standups stayed daily and stayed short. Retrospectives moved from the end-of-sprint cadence to a fixed weekly slot. Planning ceremonies were replaced with a weekly priority review that confirmed the next-up cards in the "todo" column. The team did not lose the improvement loop; it ran on a different schedule.

We **measured cycle time from the first day**. Without before-and-after data, the transition's effect is debated rather than measured. The 25% reduction in median open time was visible on the cycle-time chart within six weeks, and the chart was the artifact that kept the change credible with skeptical stakeholders.

## What Changed, and What Stayed the Same

The team's velocity in the conventional sense did not change. The team was finishing roughly the same number of items per week before and after. What changed was that items finished sooner relative to when they started, the work-in-progress visible on the board dropped substantially, and the cycle-time variance compressed. From the stakeholders' perspective, the team had become more predictable. From the engineers' perspective, the work had stopped piling up in transit.

What stayed the same was the engineering culture and the team's underlying capability. The framework did not make engineers better; it just got out of their way. That is the right outcome for a process change. Process should make good work easier and bad work more visible, not change what good work looks like.

## The Bottom Line

The Scrum-to-Kanban question is rarely a framework question. It is a flow question with a framework consequence. Diagnose the flow first. If the cadence is producing dishonest commitments or hiding queueing problems, Kanban is likely a better fit. If the cadence is fine and the unhappiness is about ritual quality, stakeholder management, or capacity, the switch will not help.

Process changes are cheap when they are right and demoralizing when they are wrong. Take the time to confirm the diagnosis, and the team will land somewhere better than where it started.

If your team is wrestling with this decision and unsure which side of it you are on, our [Agile Coaching & Process Improvement consulting](/services/agile-coaching/) engagements start with exactly this kind of flow diagnosis.

For a deeper look at how an organization-wide agile transition played out, read our case study on [leading organization-wide agile adoption](/case-studies/agile-transformation-defense/).
