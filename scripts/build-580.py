#!/usr/bin/env python3
"""Build skill/580 — clone skill/579 and replace RGAT axis with PFAT axis."""
import re, json

SRC = "/data/workspace/ecommerce-ops/skills/579-pdp-review-highlight-cross-channel-creator-disclosure-region-aggregation-tier-bias.md"
DST = "/data/workspace/ecommerce-ops/skills/580-pdp-review-highlight-cross-channel-creator-disclosure-payment-frequency-aggregation-tier-bias.md"

with open(SRC, "r", encoding="utf-8") as f:
    md = f.read()

swaps = [
    ("region-aggregation-tier-bias", "payment-frequency-aggregation-tier-bias"),
    ("Region-Aggregation", "Payment-Frequency-Aggregation"),
    ("region_aggregation", "payment_frequency_aggregation"),
    ("region-aggregation", "payment-frequency-aggregation"),
    ("Region Aggregation", "Payment Frequency Aggregation"),
    ("REGION AGGREGATION", "PAYMENT FREQUENCY AGGREGATION"),
    ("Region aggregation", "Payment frequency aggregation"),
    ("captivatea-rgat1-zero-aggregation-2026", "captivatea-pfat1-zero-aggregation-2026"),
    ("captivatea-rgat2-annual-rail-aggregation-2026", "captivatea-pfat2-annual-rail-aggregation-2026"),
    ("captivatea-rgat3-quarterly-rail-aggregation-2026", "captivatea-pfat3-quarterly-rail-aggregation-2026"),
    ("captivatea-rgat4-monthly-rail-aggregation-2026", "captivatea-pfat4-monthly-rail-aggregation-2026"),
    ("captivatea-rgat5-daily-rail-aggregation-2026", "captivatea-pfat5-daily-rail-aggregation-2026"),
    ("captivatea-disclosure-region-aggregation-2026", "captivatea-disclosure-payment-frequency-aggregation-2026"),
    ("captivatea-disclosure-region-aggregation-roi-2026", "captivatea-disclosure-payment-frequency-aggregation-roi-2026"),
    ("captivatea-disclosure-region-aggregation-cvp-2026", "captivatea-disclosure-payment-frequency-aggregation-cvp-2026"),
    ("captivatea-rgat-classifier-vocabulary-2026", "captivatea-pfat-classifier-vocabulary-2026"),
    ("captivatea-rgat-fit-vocabulary-2026", "captivatea-pfat-fit-vocabulary-2026"),
    ("captivatea-rgat-canonical-vocabulary-2026", "captivatea-pfat-canonical-vocabulary-2026"),
    ("captivatea-rgat-confidence-rubric-2026", "captivatea-pfat-confidence-rubric-2026"),
    ("captivatea-rgat-fit-rubric-2026", "captivatea-pfat-fit-rubric-2026"),
    ("captivatea-rgat-readback-vocabulary-v38-2026", "captivatea-pfat-readback-vocabulary-v39-2026"),
    ("captivatea-rgat-readback-vocabulary-v37-2026", "captivatea-pfat-readback-vocabulary-v37-2026"),
    ("captivatea-rgat-readback-vocabulary-v36-2026", "captivatea-pfat-readback-vocabulary-v36-2026"),
    ("captivatea-rgat-readback-vocabulary-v35-2026", "captivatea-pfat-readback-vocabulary-v35-2026"),
    ("captivatea-rgat-disclosure-cadence-2026", "captivatea-pfat-disclosure-cadence-2026"),
    ("captivatea-rgat-disclosure-mode-2026", "captivatea-pfat-disclosure-mode-2026"),
    ("captivatea-rgat-disclosure-tooling-2026", "captivatea-pfat-disclosure-tooling-2026"),
    ("captivatea-rgat-disclosure-jurisdiction-2026", "captivatea-pfat-disclosure-jurisdiction-2026"),
    ("captivatea-rgat-disclosure-mode-aggregation-2026", "captivatea-pfat-disclosure-mode-aggregation-2026"),
    ("captivatea-rgat-disclosure-platform-native-aggregation-2026", "captivatea-pfat-disclosure-platform-native-aggregation-2026"),
    ("captivatea-rgat-disclosure-engagement-rate-aggregation-2026", "captivatea-pfat-disclosure-engagement-rate-aggregation-2026"),
    ("captivatea-rgat-disclosure-language-aggregation-2026", "captivatea-pfat-disclosure-language-aggregation-2026"),
    ("captivatea-rg1-us-default-2026", "captivatea-pf1-monthly-default-2026"),
    ("captivatea-rg2-eu-default-2026", "captivatea-pf2-quarterly-default-2026"),
    ("captivatea-rg3-uk-default-2026", "captivatea-pf3-bi-monthly-default-2026"),
    ("captivatea-rg4-jp-default-2026", "captivatea-pf4-annual-default-2026"),
    ("captivatea-rg5-br-default-2026", "captivatea-pf5-semi-annual-default-2026"),
    ("captivatea-rg6-mx-default-2026", "captivatea-pf6-net30-default-2026"),
    ("captivatea-rg7-de-default-2026", "captivatea-pf7-net60-default-2026"),
    ("captivatea-rg8-fr-default-2026", "captivatea-pf8-net90-default-2026"),
    ("captivatea-rg9-multi-region-default-2026", "captivatea-pf9-multi-frequency-default-2026"),
    ("captivatea-creator-region-2026", "captivatea-creator-payment-frequency-2026"),
    ("captivatea-rg-fit-rubric-2026", "captivatea-pf-fit-rubric-2026"),
    ("captivatea-rg-confidence-rubric-2026", "captivatea-pf-confidence-rubric-2026"),
    ("captivatea-rgat-cross-region-aggregation-mart-2026", "captivatea-pfat-cross-payment-frequency-aggregation-mart-2026"),
    ("captivatea-rgat-ccpa-cpra-2026", "captivatea-pfat-ccpa-cpra-2026"),
    ("captivatea-rgat-pipeda-2026", "captivatea-pfat-pipeda-2026"),
    ("captivatea-rgat-lgpd-2026", "captivatea-pfat-lgpd-2026"),
    ("captivatea-rgat-pdpa-sg-2026", "captivatea-pfat-pdpa-sg-2026"),
    ("captivatea-rgat-cross-region-aggregation-attestation-2026", "captivatea-pfat-cross-payment-frequency-aggregation-attestation-2026"),
    ("captivatea-rgat-region-aggregation-rollup-deadline-2026", "captivatea-pfat-payment-frequency-aggregation-rollup-deadline-2026"),
    ("ftc-disclosure-region-aggregation-2026", "ftc-disclosure-payment-frequency-aggregation-2026"),
    ("eu-ucpd-disclosure-region-aggregation-2026", "eu-ucpd-disclosure-payment-frequency-aggregation-2026"),
    ("eu-ucpd-region-aggregation-rollup-2026", "eu-ucpd-payment-frequency-aggregation-rollup-2026"),
    ("uk-cma-region-aggregation-rollup-2026", "uk-cma-payment-frequency-aggregation-rollup-2026"),
    ("germany-tmg-region-aggregation-rollup-2026", "germany-tmg-payment-frequency-aggregation-rollup-2026"),
    ("france-loi-confiance-region-aggregation-rollup-2026", "france-loi-confiance-payment-frequency-aggregation-rollup-2026"),
    ("japan-appi-region-aggregation-rollup-2026", "japan-appi-payment-frequency-aggregation-rollup-2026"),
    ("brazil-cdc-region-aggregation-rollup-2026", "brazil-cdc-payment-frequency-aggregation-rollup-2026"),
    ("mexico-profeco-region-aggregation-rollup-2026", "mexico-profeco-payment-frequency-aggregation-rollup-2026"),
    ("meta-disclosure-region-aggregation-2026", "meta-disclosure-payment-frequency-aggregation-2026"),
    ("tiktok-disclosure-region-aggregation-2026", "tiktok-disclosure-payment-frequency-aggregation-2026"),
    ("youtube-disclosure-region-aggregation-2026", "youtube-disclosure-payment-frequency-aggregation-2026"),
    ("instagram-disclosure-region-aggregation-2026", "instagram-disclosure-payment-frequency-aggregation-2026"),
    ("linkedin-disclosure-region-aggregation-2026", "linkedin-disclosure-payment-frequency-aggregation-2026"),
    ("pinterest-disclosure-region-aggregation-2026", "pinterest-disclosure-payment-frequency-aggregation-2026"),
    ("snap-disclosure-region-aggregation-2026", "snap-disclosure-payment-frequency-aggregation-2026"),
    ("creatoriq-creator-region-2026", "creatoriq-creator-payment-frequency-2026"),
    ("ltk-region-2026", "ltk-payment-frequency-2026"),
    ("liketoknowit-region-2026", "liketoknowit-payment-frequency-2026"),
    ("Instagram-native-no-rail-pool", "monthly-fee-no-rail-pool"),
    ("TikTok-Creator-Marketplace-annual-rail-pool", "quarterly-fee-annual-rail-pool"),
    ("YouTube-native-quarterly-rail-pool", "bi-monthly-fee-quarterly-rail-pool"),
    ("LinkedIn-Paid-Promotion-monthly-rail-pool", "annual-fee-monthly-rail-pool"),
    ("Pinterest-Paid-Promotion-pinterest-daily-rail-pool", "Pinterest-Creator-Fee-net30-fee-daily-rail-pool"),
    ("Pinterest-native-daily-rail-pool", "net30-fee-daily-rail-pool"),
    ("Pinterest-Paid-Promotion-daily-rail-pool", "Pinterest-Creator-Fee-net30-fee-daily-rail-pool"),
    ("Meta-Brand-Collabs-Manager-no-rail-pool", "Meta-Brand-Collabs-Manager-no-frequency-rail-pool"),
    ("US-FTC-no-rail-pool", "US-FTC-no-frequency-rail-pool"),
    ("EU-UCPD-annual-rail-pool", "EU-UCPD-annual-frequency-rail-pool"),
    ("UK-CMA-quarterly-rail-pool", "UK-CMA-quarterly-frequency-rail-pool"),
    ("Germany-TMG-monthly-rail-pool", "Germany-TMG-monthly-frequency-rail-pool"),
    ("France-Loi-Confiance-daily-rail-pool", "France-Loi-Confiance-daily-frequency-rail-pool"),
    ("in-caption-no-rail-pool", "in-caption-no-frequency-rail-pool"),
    ("in-caption-#ad-no-rail-pool", "in-caption-#ad-no-frequency-rail-pool"),
    ("in-caption-#ad-US-FTC-no-rail-pool", "in-caption-#ad-US-FTC-no-frequency-rail-pool"),
    ("vintage-disclosed-at-onboard-daily-rail-pool", "vintage-disclosed-at-onboard-daily-frequency-rail-pool"),
    ("credentials-disclosure-quarterly-rail-pool", "credentials-disclosure-quarterly-frequency-rail-pool"),
    ("#affiliate-rail-disclosure-annual-rail-pool", "#affiliate-rail-disclosure-annual-frequency-rail-pool"),
    ("#sponsored-disclosure-monthly-rail-pool", "#sponsored-disclosure-monthly-frequency-rail-pool"),
    ("MSA-archive-link-daily-rail-pool", "MSA-archive-link-daily-frequency-rail-pool"),
    ("in-house-disclosure-rollup-monthly-rail-pool", "in-house-disclosure-rollup-monthly-frequency-rail-pool"),
    ("no-rail-pool", "no-frequency-rail-pool"),
    ("no-rail-", "no-frequency-rail-"),
    ("no-rail-maint", "no-frequency-rail-maint"),
    ("multi-region", "multi-frequency"),
    ("Multi-Region", "Multi-Frequency"),
    ("MULTI-REGION", "MULTI-FREQUENCY"),
    ("cross-region", "cross-payment-frequency"),
    ("Cross-Region", "Cross-Payment-Frequency"),
    ("CROSS-REGION", "CROSS-PAYMENT-FREQUENCY"),
    ("cross-border", "cross-payment-rail"),
    ("Cross-Border", "Cross-Payment-Rail"),
    ("CROSS-BORDER", "CROSS-PAYMENT-RAIL"),
    ("RGAT", "PFAT"),
    ("rgat_", "pfat_"),
    ("rgat-", "pfat-"),
]

out = md
for a, b in swaps:
    out = out.replace(a, b)

# Move-number 51 → 52
out = out.replace("47.5.1.1.1.51", "47.5.1.1.1.52")
# Slug 579 → 580
out = out.replace("skills/579", "skills/580")
out = out.replace("579-...", "580-...")

# Title frontmatter (preserves capitalization)
out = re.sub(
    r'^(title:\s*")(.*?)("\s*)$',
    lambda m: m.group(1) + m.group(2) + m.group(3),
    out,
    count=1,
    flags=re.MULTILINE,
)

# Update cross-axis closure counts: 39 → 40
out = out.replace("now with **THIRTY-NINE** cross-axes", "now with **FORTY** cross-axes")
out = out.replace("= 39 cross-axis closures", "= 40 cross-axis closures")
out = out.replace("= 38 prior + PFAT = 39", "= 39 prior + PFAT = 40")
out = out.replace("+ RGAT + 16 RGAT-fields", "+ PFAT + 16 PFAT-fields")
out = out.replace("+ per-cohort-LTV = 39 cross-axes", "+ per-cohort-LTV = 40 cross-axes")
out = out.replace("cross-axes layered onto the bandit picker (the new RGAT axis joins",
                  "cross-axes layered onto the bandit picker (the new PFAT axis joins")
out = out.replace("+ RGAT = 39", "+ PFAT = 39")
out = out.replace("the new RGAT axis joins 38 prior", "the new PFAT axis joins 38 prior")

# V10 schema v38 → v39
out = out.replace("creator-disclosure-payment-frequency-aggregation-resonant readback v38",
                  "creator-disclosure-payment-frequency-aggregation-resonant readback v39")
out = out.replace(
    "v38 = TF + WR + WFT + WAT + FH + FHFT + FHAT + CR + CRAT + TFAT + DCAT + DTAT + JAT + DMAT + PNAT + ERAT + AEAT + LGAT + PFAT + 16 PFAT-fields + 38 base dimensions = 56 dimensions per arm",
    "v39 = TF + WR + WFT + WAT + FH + FHFT + FHAT + CR + CRAT + TFAT + DCAT + DTAT + JAT + DMAT + PNAT + ERAT + AEAT + LGAT + PFAT + 16 PFAT-fields + 38 base dimensions = 56 dimensions per arm",
)
out = out.replace("creator-disclosure-payment-frequency-aggregation-resonant readback v38 schema",
                  "creator-disclosure-payment-frequency-aggregation-resonant readback v39 schema")

# Update "this skill" identifier
out = out.replace("skill/579 (this skill)", "skill/580 (this skill)")

# Update How to extend suggestion (skill/580 → skill/581)
out = re.sub(
    r"The natural next-axis creator-disclosure-payment-frequency-aggregation add-on is \*\*Move #47\.5\.1\.1\.1\.53 / skill/581 —[^.]+\.",
    "The natural next-axis creator-disclosure-payment-frequency-aggregation add-on is **Move #47.5.1.1.1.53 / skill/581 — creator-disclosure-content-freshness-aggregation-tier-bias (CFAT1 zero-aggregation + CFAT2 annual-rail-aggregation + CFAT3 quarterly-rail-aggregation + CFAT4 monthly-rail-aggregation + CFAT5 daily-rail-aggregation per CaptivateA Disclosure Content Freshness Aggregation 2026 + Meta Brand Collabs Manager 2026 + TikTok Creator Marketplace 2026 + YouTube Paid Promotion Badge 2026 + Instagram Paid Partnership Tag 2026 + LinkedIn Paid Promotion 2026 + Pinterest Paid Promotion 2026 + FTC 16 CFR Part 255 2026 + EU UCPD 2026 + UK CMA 2024 + Germany TMG §6 2026 + France Loi Confiance 2026).**",
    out,
)

# === Sanity probes ===
rgat_count = out.count("RGAT") + out.count("rgat")
pfat_count = out.count("PFAT")
print("RGAT residual:", rgat_count)
print("PFAT count:", pfat_count)
print("region-aggregation residual:", out.count("region-aggregation"))
print("region_aggregation residual:", out.count("region_aggregation"))
print("multi-region residual:", out.count("multi-region"))
print("cross-region residual:", out.count("cross-region"))
print("cross-border residual:", out.count("cross-border"))
print("skills/580:", out.count("skills/580"))
print("skills/579:", out.count("skills/579"))
print("47.5.1.1.1.52:", out.count("47.5.1.1.1.52"))
print("len:", len(out))

with open(DST, "w", encoding="utf-8") as f:
    f.write(out)
print("WROTE:", DST)
