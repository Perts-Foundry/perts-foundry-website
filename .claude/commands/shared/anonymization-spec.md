# Anonymization Specification

Shared anonymization boundaries for all content that references specific client work (case studies, blog war stories, portfolio-sourced content).

## SPEC-1 through SPEC-6

- **SPEC-1:** Never name the client organization. Use an anonymized descriptor (e.g., "enterprise SaaS platform", "defense software organization").
- **SPEC-2:** Do not disclose revenue, headcount, or other client business metrics not already in the portfolio data (work.yaml).
- **SPEC-3:** Do not name specific internal tools, products, or proprietary systems unless the technology is public (e.g., Snowflake, Terraform).
- **SPEC-4:** Do not reference specific teams, managers, or organizational structure by name.
- **SPEC-5:** When publishing multiple pieces from the same client, vary descriptors across content to reduce the correlation surface. Note that descriptor variation reduces casual identification but does not defeat deliberate correlation analysis; cross-content anonymization assessment is the primary control for multi-piece risk.
- **SPEC-6:** Do not use specific dates, quarters, or narrow time ranges. Use relative durations (e.g., "over the course of a quarter", "approximately six months") rather than calendar references.

## Cross-Content Assessment

When content references the same client engagement as an existing case study or blog post, evaluate whether the combination increases the identification surface beyond what either piece alone would reveal.

## Personal Information

Do not incorporate personal contact information from `basics.yaml` (phone, email, personal profile URLs) into generated content. Content should link to `/contact/` for reader follow-up.
