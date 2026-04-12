# Perts Foundry Website

[![Hugo](https://img.shields.io/badge/Hugo-0.157.0-ff4088)](https://gohugo.io/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020)](https://workers.cloudflare.com/)

Portfolio and credibility website for [Perts Foundry LLC](https://pertsfoundry.com), a DevOps, Cloud Engineering, and Automation consultancy.

Built with Hugo (Blowfish theme), deployed to Cloudflare Workers. Includes a contact form API endpoint powered by Resend and Cloudflare Turnstile.

## Tech Stack

- **Static site**: Hugo 0.157.0, Blowfish theme
- **API**: Cloudflare Worker (`src/worker.js`) handling `POST /api/contact`
- **Email**: Resend for transactional delivery
- **CAPTCHA**: Cloudflare Turnstile (explicit render mode)
- **Testing**: Vitest with `@cloudflare/vitest-pool-workers` (43 tests)
- **CI**: 10 validation checks (Vitest, Hugo build, htmltest, pa11y-ci, markdownlint, Prettier, actionlint, Gitleaks, homepage + inner page smoke tests)

## Development

```bash
# Content iteration (live-reload)
hugo server

# Production build
hugo --gc --minify --cleanDestinationDir

# Worker unit tests
npx vitest run

# Worker local dev (build Hugo first)
hugo --gc --minify --cleanDestinationDir
npx wrangler dev
```

## Project Structure

```
content/          Case studies, blog posts, services, about, contact
data/             Structured TOML (metrics, technologies, certifications, process)
assets/css/       9 modular CSS files loaded in numeric order
layouts/          Hugo layout overrides, shortcodes, homepage partials
src/              Cloudflare Worker source (contact form API)
.github/workflows CI: validate, deploy, scheduled-deploy, dependabot-auto-deploy
```

See the project [CLAUDE.md](CLAUDE.md) for detailed conventions, content structure, and architecture documentation.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

## License

- **Code** (templates, Worker, scripts, CSS, workflows): [MIT](LICENSE)
- **Content** (case studies, blog posts, service pages, data, images): [CC BY 4.0](LICENSE-CONTENT)

Maintained by [Perts Foundry LLC](https://pertsfoundry.com).
