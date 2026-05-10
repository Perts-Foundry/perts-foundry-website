---
title: "Designing SLOs Engineering Teams Actually Use"
date: 2026-08-01
publishDate: 2026-08-01
draft: false
description: "Most SLOs become decorative because they are designed to be unfalsifiable. Here is how to design SLOs engineering teams will actually consult and act on."
slug: "slo-design-engineering-teams"
tags:
  - SRE
  - Incident Response
  - DevOps
  - GCP
---

Most SLO documents end up in a wiki, get cited once during on-call training, and never get consulted again. The team gets a participation trophy, the executive sponsor gets a slide, and reliability does not actually improve. Effective SLOs are different from this in kind, not in degree.

We built three SLOs covering availability, latency, and data freshness on a 12,000-QPS customer-facing data API, with a signed error-budget policy that paused non-critical deploys at 50% burn and a multi-window burn-rate alerting setup that the on-call team actually paid attention to. The combination changed how the team made deploy decisions, not just how they reported reliability. This is the design pattern that makes that work, drawn from the [reliability engagements](/services/incident-response/) we lead at scale.

## Why Do Most SLO Programs Become Decorative?

The most common failure mode is choosing SLO targets that nobody believes the team will ever miss. A 99.9% availability target on a service that has historically run at 99.99% is a vanity number. The error budget never gets meaningfully consumed, no deploy ever gets paused, no postmortem ever gets triggered, and the SLO becomes an artifact rather than a tool. Reliability work that the team should have been doing happens at the same cadence it was always going to happen, regardless of the SLO.

The second failure mode is choosing SLI definitions that drift from the user's actual experience. "99% of HTTP requests return a 2xx" sounds like a reasonable SLI, until you realize that the load balancer's health checks dwarf real user traffic and skew the number toward 100% even when real users are seeing failures. Or until you discover that a downstream service returns 200 with an error body, and your SLI counts those as successes because the status code lied. SLIs that do not reflect what users feel produce SLOs that are unfalsifiable in practice.

The third failure mode is the absence of an enforcement loop. An SLO without a written, signed policy that says "if budget is exhausted, here is what we do" is a number on a dashboard. The whole point of error budgets is to make reliability tradeoffs explicit and visible. Without the policy, the budget exhaustion produces no decision, and the SLO produces no behavior change.

## What Makes an SLO Actually Useful?

A useful SLO has three properties. It measures something the user actually feels, the target is set where the team is at meaningful risk of missing it, and the error budget enforcement is documented in a written policy that named individuals have signed. Anything missing those three properties produces a number that nobody will use to make decisions.

The "user feels it" requirement is the SLI design. The "meaningful risk" requirement is the SLO target. The "written and signed" requirement is the error budget policy. All three have to be present, and they have to be connected. The SLI feeds the SLO, the SLO feeds the budget, the budget feeds the policy, and the policy changes engineering behavior.

## Three SLOs, One API: Availability, Latency, Freshness

The API in question was a 12,000-QPS data-serving endpoint. It had three failure modes that mattered to users, and each one needed its own SLO because they could fail independently.

**Availability.** 99.9% non-5xx at the load balancer, measured over a rolling 28-day window. The SLI was the load balancer's view of response status, not the application's, because the load balancer is what the user actually hits. The 28-day window matched the deploy cadence and the team's reliability review rhythm.

**Latency.** 99% of requests under 150ms, measured over a rolling 28-day window. The SLI was the load balancer's request duration, again from the user's vantage rather than the application's. 150ms was chosen because it was the threshold above which the consuming product team had documented user-visible degradation.

**Data freshness.** 99.5% of responses served against a dataset less than 36 hours old, over a rolling 28-day window. The SLI here was custom, joining response metadata against the upstream pipeline's last-successful-load timestamp. This SLO existed because the API's user-facing utility was as much about freshness as it was about uptime; an API that returns stale data fast is broken in a different way than one that returns fresh data slowly.

The targets were chosen with input from the consuming product team and were calibrated against the previous quarter's actual performance. None of the targets were vanity numbers; the historical data showed each one was at meaningful risk of being missed during a bad month.

## How Error Budgets Change Deploy Decisions

A 99.9% availability target over 28 days produces an error budget of about 40 minutes of downtime per month. That budget is the actual reliability lever. The error budget policy turns the budget into a decision.

The policy at this engagement had two thresholds and one signature page:

```text
Error Budget Policy: Customer-Facing Data API

Threshold 1 (50% budget consumed within the rolling window):
  - All non-critical feature deploys to this service are paused.
  - The team's reliability backlog is prioritized over feature work
    until burn returns below the threshold.
  - Critical security and incident-response deploys are exempt.

Threshold 2 (100% budget consumed):
  - Postmortem is required within 5 business days.
  - A one-week reliability sprint is scheduled within the next two
    sprints to address the contributing factors.
  - Service owner reports the budget exhaustion at the next monthly
    reliability review.

Signed:
  - Engineering Manager (service owner)
  - Director of Reliability
  - Product Manager (consuming product)
```

The signed page is what makes the policy bind. Without signatures from the engineering manager who owns the service, the director who owns the reliability program, and the product manager whose roadmap is affected, the policy is a document. With signatures, the next time budget is exhausted, the decision is already made, the consequences are already agreed to, and the only question is execution.

The first time the policy actually paused a deploy was the moment the SLO program became real. Up to that point it had been a setup exercise. After that point, the team had a shared, repeatable answer to "how should we balance reliability work against feature work this sprint."

## What Is a Multi-Window Burn-Rate Alert, and Why Should You Care?

A burn-rate alert fires when the rate at which the error budget is being consumed is high enough that the budget would be exhausted significantly faster than the SLO window. A multi-window burn-rate alert pairs a fast-window detector (catches incidents quickly) with a slow-window detector (filters out short-lived noise), and only fires when both indicate a real problem.

The pattern that worked at this engagement was two paired detectors:

- **Fast pair (1 hour and 5 minutes).** Fires when both the 1-hour burn rate and the 5-minute burn rate exceed thresholds that would consume the entire 28-day budget in a few hours. This catches active incidents within minutes.
- **Slow pair (6 hours and 30 minutes).** Fires when both the 6-hour burn rate and the 30-minute burn rate exceed thresholds that would consume the budget over a day or two. This catches gradual degradations that the fast pair would miss.

The reason both windows are paired is that single-window burn-rate alerts produce noise. A 5-minute spike that is not sustained is not a real incident, and an alert that wakes the on-call team for it loses credibility. Pairing the fast detector with the 1-hour confirmation, and the slow detector with the 6-hour confirmation, dramatically reduces false positives without sacrificing detection time on real events.

## Why Differentiated Runbooks Matter

An alert that is just a metric value is useless on the worst day of the on-call rotation. The on-call engineer needs to know what to do, and they need to know it without having to interpret the metric value first.

We wrote separate runbooks for the fast and slow burn-rate alerts because the response shape is different. The fast-burn alert means an active incident is happening right now and the priority is mitigation: fail over, scale up, roll back the most recent deploy. The slow-burn alert means a gradual degradation is in progress and the priority is investigation: which dependency is regressing, when did the slope change, what shipped in the last 24 hours that might be related.

Each runbook had three sections: the dashboards to load first, the most likely causes ranked by historical frequency, and the named owners for each contributing system. The named-owners section was the highest-impact part. On the worst days, "who do I escalate to" is the question that takes the longest if it is not pre-answered. Pre-answering it cuts mean time to escalation by minutes that matter.

## How to Know If Your SLOs Are Actually Working

The leading indicator is "did anyone consult the SLO this sprint to make a decision." The lagging indicator is "did the team's reliability posture measurably improve over the last two quarters."

The leading indicator is the more useful one early. If the team is using the SLOs in deploy reviews, in roadmap planning, in postmortem follow-up, the program is working. If the SLOs only get cited in reports that go to leadership, the program is decorative no matter how good the dashboards look.

The lagging indicator is what justifies the program to executives. Two quarters into the program at this engagement, the API's reliability posture had improved on all three dimensions, the team had made several roadmap-shaping decisions citing budget burn, and the consuming product team had stopped escalating reliability concerns through informal channels because they had a shared, formal channel that was working.

## The Bottom Line

The difference between a decorative SLO program and one that changes engineering behavior is the policy, not the SLI definitions or the alert thresholds. Define SLIs that reflect what users actually feel, set targets where the team is at meaningful risk of missing them, and back the targets with a written, signed error-budget policy that has documented consequences. Pair burn-rate alerts across windows to keep noise down. Write differentiated runbooks because the response to a fast-burn alert is fundamentally different from the response to a slow-burn alert.

If your team has SLOs nobody consults and an error-budget policy nobody references, the answer is not "better dashboards." It is rebuilding the program around the policy and treating the SLO targets as decision tools.

If this pattern sounds familiar, our [Incident Response & Reliability consulting](/services/incident-response/) engagements start with exactly this kind of SLO and error-budget design work.

For a deeper look at how reliability work and incident response connect in practice, read our case study on [P0 incident leadership](/case-studies/incident-response-leadership/).
