---
title: "Sold by Owner in Under Three Months"
date: 2026-10-08
description: "A custom listing website that served as the home base for a home sold by owner. Listed on the MLS in July 2026, the home sold in under three months."
slug: "fsbo-listing-website"
weight: 130
featured: false
draft: false
params:
  client: "homeowner selling by owner"
  industry: "Real Estate / For Sale by Owner"
  challenge: "A homeowner selling by owner needed a website that could present the property well, work for every visitor, and serve as the listing's home base."
  result: "The home was listed on the MLS in July 2026 and sold in under three months, with the website as the listing's home base."
tags:
  - Cloudflare
  - Terraform
  - GitHub Actions
---

## The Challenge

A homeowner decided to sell by owner, and the listing needed a home base of its own: a website that presented the property well, with every photo viewable at full size and a way to explore the home before visiting. It had to look polished on a phone as well as on a desktop monitor, and it had to work for visitors who navigate with a keyboard or a screen reader.

The site also had to keep pace with a live sale. Photos and wording change while a home is on the market, and every change needed a review before it reached buyers. Listing photos carry a hidden risk too: images straight from a camera or phone often embed GPS coordinates and other location data in the file itself, and those details travel with every copy a visitor downloads.

## Our Approach

We designed, built, and hosted a custom website for the listing at [4001mossy.com](https://4001mossy.com), and treated it with the same delivery discipline we bring to larger platforms:

- **Custom, Responsive Design** -- A layout designed around the property that adapts from phones to large screens. The page opens on a hero photo carousel with a slow zoom effect, and a photo gallery leads into an accessible full-screen photo viewer. The viewer behaves like a proper dialog: it moves keyboard focus to its close button, keeps focus inside while open, supports the arrow keys and Escape, and returns focus to the photo the visitor started from. Visitors whose device asks for reduced motion get the same page without the animations. The listing also carried an embedded interactive 3D tour.

- **Accessibility Checked on Every Change** -- Automated WCAG 2.1 AA accessibility checks run on every proposed change before it can go live. The same run checks every internal link and image reference, verifies that the page's key sections are present, scans for leaked secrets, and checks formatting. A change that fails any check cannot be deployed.

- **A Preview for Every Change** -- Every proposed change gets its own preview link before it goes live, so new photos and wording can be reviewed in a real browser first. Going live is a deliberate step taken only after the checks pass, which keeps half-finished edits off the public site.

- **Lean, Secure Platform** -- The site is plain HTML, CSS and a small amount of JavaScript with no build step, so the owner can edit photos and wording directly, and it is served from Cloudflare's global network. Security headers are applied at the edge, and the DNS records and hosting configuration are managed as code in Terraform rather than by hand. Search and social link previews are set up so a shared link shows the home's photo and a clear title. Every photo is stripped of GPS and location data before publishing, and each gallery photo ships as a small thumbnail plus a full-size version for the viewer, with off-screen images loading only as the visitor scrolls.

## Results

| Area              | Outcome                                         |
| ----------------- | ----------------------------------------------- |
| Listing           | Listed on the MLS in July 2026                  |
| Sale              | Sold by owner in under three months             |
| Accessibility     | Automated WCAG 2.1 AA checks on every change    |
| Change management | A preview link for every proposed change        |
| Photo privacy     | GPS and location data stripped from every photo |
| After the sale    | Kept online as a live portfolio piece           |

The home was listed on the MLS in July 2026 and sold by owner in under three months, with this website as the listing's home base throughout the sale.

After the sale, the site did not simply go dark. The listing content came down: the price, interior photos, floor plans and contact details were removed, and only exterior photos remain. The design, photo carousel and full-screen viewer stay live as working demos, and the 3D tour, deactivated after the sale, is now shown as a placeholder. The domain that once marketed the home now shows visitors the website that served as its home base.

## Key Technologies

{{< tech-tags "Cloudflare, Terraform, GitHub Actions" >}}

**Related service:** [Website Design & Build](/small-business/website-design/)
