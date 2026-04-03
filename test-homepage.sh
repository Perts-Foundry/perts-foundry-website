#!/usr/bin/env bash
# Homepage smoke test: validates the built HTML in public/index.html.
# Run after: hugo --gc --minify --cleanDestinationDir
#
# Usage:  bash test-homepage.sh
# Exit:   0 if all checks pass, 1 if any fail
#
# Covers:
#   - All 8 homepage section IDs (matches CI workflow)
#   - Data bindings from data/*.toml (technologies, metrics, process steps)
#   - Accessibility: aria-labelledby on sections, aria-labels on carousel buttons
#   - Navigation: CTA links to /contact/, /case-studies/, /services/
#   - Carousel infrastructure: JS-targeted DOM IDs for tech/services/cases
#   - Section ordering: metrics before services in DOM
# --------------------------------------------------------------------------

set -euo pipefail

HP="public/index.html"
ERRORS=""
PASS=0
FAIL=0

pass() {
  PASS=$((PASS + 1))
  echo "  PASS: $1"
}

fail() {
  FAIL=$((FAIL + 1))
  ERRORS="${ERRORS}  FAIL: $1\n"
  echo "  FAIL: $1"
}

# Matches both quoted and unquoted attribute values (Hugo minification strips quotes)
check_id() {
  if grep -qE "id=\"?$1\"?" "$HP"; then
    pass "section ID '$1' present"
  else
    fail "section ID '$1' missing"
  fi
}

check_text() {
  if grep -qF "$1" "$HP"; then
    pass "$2"
  else
    fail "$2 (expected '$1')"
  fi
}

check_regex() {
  if grep -qE "$1" "$HP"; then
    pass "$2"
  else
    fail "$2 (pattern: $1)"
  fi
}

# --------------------------------------------------------------------------
# Pre-flight
# --------------------------------------------------------------------------
echo "Homepage smoke test"
echo "=========================================="

if [ ! -f "$HP" ]; then
  echo "ERROR: $HP not found. Run 'hugo --gc --minify --cleanDestinationDir' first."
  exit 1
fi

# --------------------------------------------------------------------------
# 1. Section IDs (all 8 must be present, matching CI workflow)
# --------------------------------------------------------------------------
echo ""
echo "[Section IDs]"
for id in hero-heading tech-bar-heading problem-heading services-heading \
          metrics-heading cases-heading process-heading cta-heading; do
  check_id "$id"
done

# --------------------------------------------------------------------------
# 2. Accessibility: aria-labelledby on section elements
# --------------------------------------------------------------------------
echo ""
echo "[Accessibility: aria-labelledby]"
for id in hero-heading tech-bar-heading services-heading \
          metrics-heading cases-heading process-heading cta-heading; do
  check_regex "aria-labelledby=\"?${id}\"?" "aria-labelledby references '${id}'"
done

# --------------------------------------------------------------------------
# 3. Data bindings: technologies from data/technologies.toml
# --------------------------------------------------------------------------
echo ""
echo "[Data: Technologies]"
check_text "Kubernetes" "technology 'Kubernetes' present"
check_text "Terraform" "technology 'Terraform' present"
check_text "AWS" "technology 'AWS' present"
check_text "Docker" "technology 'Docker' present"

# --------------------------------------------------------------------------
# 4. Data bindings: metrics from data/metrics.toml
# --------------------------------------------------------------------------
echo ""
echo "[Data: Metrics]"
check_regex '125K' "metric value '125K' present"
check_regex '200' "metric value '200' present"

# --------------------------------------------------------------------------
# 5. Data bindings: process steps from data/process.toml
# --------------------------------------------------------------------------
echo ""
echo "[Data: Process steps]"
check_text "Discover" "process step 'Discover' present"
check_text "Build" "process step 'Build' present"
check_text "Scale" "process step 'Scale' present"
check_text "Own" "process step 'Own' present"

# --------------------------------------------------------------------------
# 6. Navigation links (CTA buttons link to real pages)
# --------------------------------------------------------------------------
echo ""
echo "[Navigation links]"
check_regex 'href="?/contact/"?' "contact page link present"
check_regex 'href="?/case-studies/"?' "case studies page link present"
check_regex 'href="?/services/"?' "services page link present"

# --------------------------------------------------------------------------
# 7. Carousel infrastructure (JS-targeted DOM IDs)
#    The footer JS references these IDs to drive carousel pagination.
#    If removed or renamed, carousels break silently.
# --------------------------------------------------------------------------
echo ""
echo "[Carousel infrastructure]"
check_regex 'id="?tech-carousel-items"?' "tech carousel list container"
check_regex 'id="?tech-carousel-dots"?' "tech carousel dots container"
check_regex 'id="?services-carousel-grid"?' "services carousel grid container"
check_regex 'id="?services-carousel-dots"?' "services carousel dots container"
check_regex 'id="?cases-carousel-grid"?' "cases carousel grid container"
check_regex 'id="?cases-carousel-dots"?' "cases carousel dots container"

# --------------------------------------------------------------------------
# 8. Carousel accessibility: prev/next buttons have aria-labels
# --------------------------------------------------------------------------
echo ""
echo "[Carousel accessibility]"
check_text "Previous technologies" "tech carousel prev button labeled"
check_text "Next technologies" "tech carousel next button labeled"
check_text "Previous services" "services carousel prev button labeled"
check_text "Next services" "services carousel next button labeled"
check_text "Previous case studies" "cases carousel prev button labeled"
check_text "Next case studies" "cases carousel next button labeled"

# --------------------------------------------------------------------------
# 9. Section ordering: metrics appears before services in DOM
# --------------------------------------------------------------------------
echo ""
echo "[Section ordering]"
METRICS_POS=$(grep -bon 'metrics-heading' "$HP" | head -1 | cut -d: -f1)
SERVICES_POS=$(grep -bon 'services-heading' "$HP" | head -1 | cut -d: -f1)
if [ -n "$METRICS_POS" ] && [ -n "$SERVICES_POS" ]; then
  if [ "$METRICS_POS" -lt "$SERVICES_POS" ]; then
    pass "metrics section appears before services section"
  else
    fail "metrics section should appear before services section"
  fi
else
  fail "could not determine section positions for ordering check"
fi

# --------------------------------------------------------------------------
# Summary
# --------------------------------------------------------------------------
echo ""
echo "=========================================="
TOTAL=$((PASS + FAIL))
echo "Results: $PASS passed, $FAIL failed ($TOTAL total)"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "Failures:"
  printf '%b' "$ERRORS"
  exit 1
fi
