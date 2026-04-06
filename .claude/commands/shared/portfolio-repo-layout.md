# Portfolio Repository Layout

Shared prerequisite check for all content generation commands.

## Verification

Check that both `../professional-portfolio-source/data/work.yaml` and `../professional-portfolio-source/data/services.yaml` are present. If not, stop and report this error:

```
Portfolio repo not found. Expected layout:
  repos/Perts-Foundry/
  ├── perts-foundry-website/        ← you are here
  └── professional-portfolio-source/ ← must exist as sibling
```

## Data Files

Read all `*.yaml` files under `../professional-portfolio-source/data/`. This gives the full picture of professional experience: work history, services, skills, certifications, projects, education, and everything else in the portfolio. New data files added over time should be picked up automatically. All data is read for cross-referencing context (verifying technologies against work history, linking content to service offerings).
