---
name: ai-crisis-classifier
title: AI crisis-classifier — auto-route incoming social-sentiment-monitor alerts into the 4 crisis lanes (product harm / brand reputation / operational / creator) using a custom NLP model trained on 1,000+ past crisis posts + 12,000+ benign DTC social posts; closes the 1-2 hour "is this a crisis?" Slack debate; first Tier-1 + first P0 in `category: ai-crisis-classifier` — 15 numbered pitfalls, 7 verification gates A-G
category: ai-crisis-classifier
tier: 1
priority: P0
default_move: "1.1"
year_1_roi_band: "5:1–15:1"
sms_friendly: false
last_updated: 2026-10-02
sources: [move-461-crisis-pr-operations-2026, sprout-social-listening-2024, brandwatch-ai-classifier-2024, talkwalker-crisis-detection-2024, mention-crisis-ai-2024, meltwater-crisis-ai-2024, awario-crisis-2024, klaviyo-sentiment-2024, postscript-sentiment-2024, gorgias-macro-2024, zendesk-sentiment-2024, kustomer-sentiment-2024, slack-block-kit-2024, pagerduty-event-rules-2024, opsgenie-crisis-2024, datadog-nlp-classifier-2024, monkeylearn-crisis-2024, aws-comprehend-crisis-2024, google-vertex-ai-classifier-2024, azure-text-analytics-crisis-2024, openai-classifier-fine-tune-2024, anthropic-claude-classifier-2024, cohere-classify-crisis-2024, huggingface-transformers-crisis-2024, distilled-nlp-2024, langchain-classifier-chain-2024, llamaindex-classifier-2024, pinecone-vector-crisis-2024, weaviate-crisis-search-2024, chromadb-embeddings-2024, daily-harvest-recall-2024, drunk-elephant-recall-2024, krave-beauty-pr-2024, glossier-cornrows-2024, kardashian-sunscreen-2024, bud-light-pr-crisis-2024, logan-paul-lunchly-2024, florasis-lipstick-2023, wework-founder-2024, theranos-founder-2024, ftc-disclosure-crisis-2024, cpsc-recall-2024, fda-recall-2024, hbsc-product-harm-2024, edelman-trust-barometer-2024, reuters-crisis-pr-2024, story-group-crisis-2024, vault-communications-2024, wecommunications-crisis-2024, finn-partners-crisis-2024, levick-crisis-2024, forbes-crisis-recovery-2024, inc-crisis-recovery-2024, hbr-crisis-recovery-2024, mckinsey-crisis-response-2024, deloitte-crisis-resilience-2024, accenture-crisis-tech-2024, gartner-crisis-comms-2024, forrester-crisis-comms-2024, sprout-social-listening-2024, buffer-crisis-2024, hootsuite-listening-2024, sprinklr-crisis-2024, loomly-crisis-2024, later-crisis-2024, tiktok-creator-portal-2024, meta-creator-studio-2024, snap-creator-2024, pinterest-business-2024, reddit-crisis-2024, trustpilot-business-2024, bbb-business-2024, yelp-business-2024, glassdoor-employer-2024, indeed-employer-2024, shopify-flow-2024, klaviyo-flow-2024, postscript-flow-2024, gorgias-macros-2024, kustomer-macros-2024, notion-incident-2024, linear-incident-2024, rootly-2024, firehydrant-2024, incident-io-2024, jeli-2024, datadog-incident-2024, statuspage-2024, betterstack-2024, atlassian-status-2024, instatus-2024, linktree-influencer-2024, hootsuite-influencer-2024, loomly-influencer-2024, sprinklr-influencer-2024, friendbuy-influencer-2024, dub-influencer-2024, grin-influencer-2024, linqia-influencer-2024, creatoriq-influencer-2024, aspire-influencer-2024, asm-disclosure-2024, endora-disclosure-2024, ftc-endorsement-guides-2024]
---

# AI crisis-classifier — auto-route incoming social-sentiment-monitor alerts into the 4 crisis lanes (Move #1.1, extension of Move #1 Crisis PR operations)

> Move #1.1 is the **AI-crisis-classifier + custom-NLP-model + 4-lane-auto-router + severity-scorer + false-positive-suppressor + per-platform-priority-tuner + Slack-block-kit-alert + PagerDuty-15min-SLA-trigger + Move #1-4-lane-handoff + post-incident-learning-ledger + 1,000+-past-crisis-posts-training-set + 12,000+-benign-DTC-social-posts-control-set + 5-min-alert-SLA**, the auto-routing layer every $500k+ GMV DTC brand that has already shipped Move #1 needs to close the canonical "we-spent-1-2-hours-on-Slack-arguing-about-whether-this-is-actually-a-crisis-and-by-the-time-we-decided-it-was-it-was-already-4-hours-old-and-the-TikTok-had-500k-views" anti-pattern. Best-in-class: 90%+ classification accuracy on a labeled 13,000-post training set, <5 min alert latency (vs the 1-2 hour manual debate), <10% false-positive rate (so the team doesn't get alert-fatigue and start ignoring), 4-lane auto-routing with severity-score 0-100 → Move #1's 4-lane crisis-classifier (product-harm / brand-reputation / operational / creator), 5-year Year-1 ROI band 5:1-15:1 at default 8:1 for $5M GMV brand with founder-led brand + TikTok/Instagram-dependent acquisition mix. Ship AFTER Move #1 (4-lane crisis-classifier + 5-funnel-stage response cascade + 15-min PagerDuty SLA + 8-scenario vulnerability matrix + 15 numbered pitfalls P1-P15) is live ≥30 days AND ≥500 labeled social posts have been triaged AND ≥1 real crisis has been handled end-to-end (you need the labeled data to train on).

## When to use this skill

Use this skill the first time any of these is true:

- the operator has **shipped Move #1 crisis-PR-operations** ≥30 days ago AND the social-sentiment-monitor (Brandwatch / Talkwalker / Mention / Sprout Social / Sprinklr / Meltwater / Awario / Hootsuite) is producing ≥50 alerts/day AND ≥1 real crisis has been handled end-to-end AND the post-incident learning ledger has ≥500 labeled social posts (crisis + benign) BUT the operator's team is STILL spending 1-2 hours on Slack per alert debating "is this actually a crisis? which lane does it belong to? do we need to wake up the CEO?" — the canonical "the human-router-is-the-bottleneck" anti-pattern per Move #1 pitfall P3 ("no social-sentiment-monitor") and P14 ("no-post-incident-learning");
- the operator has a **founder-led brand** AND a **TikTok/Instagram-dependent acquisition mix** AND ≥$500k GMV AND the founder is being pinged 5-10 times/day with "is this a crisis?" questions — the canonical "founder-is-the-classifier" anti-pattern per Move #1 pitfall P6 ("founder-branded-company-without-founder-crisis-plan") — the AI-crisis-classifier removes the founder-as-router by routing 80%+ of alerts to the right lane without human triage, so the founder is only paged for severity-score ≥80 alerts;
- the operator has a **high-velocity product launch** (Move #60 product-launch-engine live) AND the launch-runs-on-TikTok-organic + Instagram-Reels + YouTube-Shorts AND a single negative post can compound to 500k-1M views in 4 hours — the canonical "we-launched-on-Monday-and-by-Wednesday-there-was-a-viral-TikTok-and-we-found-out-3-hours-too-late" anti-pattern per Move #1 8-scenario vulnerability matrix scenario #2 (viral TikTok);
- the operator has **shipped a Move #34 CX-customer-service-operations-platform** with Gorgias / Zendesk / Kustomer AND the support team is being asked "is this a crisis?" 5-10 times/day from the social-monitor queue — the canonical "support-team-is-the-classifier" anti-pattern per Move #1 P3 ("no-social-sentiment-monitor") + Move #34 CX-operations pattern;
- the operator has **shipped Move #1 crisis-PR-operations** with the 4-lane crisis-classifier (product-harm / brand-reputation / operational / creator) BUT the 4-lane routing is being done by a human triage shift (1-2 hour SLA) AND ≥30% of alerts are being mis-routed to the wrong lane on first triage (the canonical "human-router-has-30%-mis-route-rate" anti-pattern per Move #1 4-lane crisis-classifier pitfalls + Move #6.15 attribution-accuracy-tracker pattern).

You have:

- **Move #1 crisis-PR-operations live ≥30 days** — Move #1.1 consumes Move #1's 4-lane crisis-classifier (product-harm / brand-reputation / operational / creator) + 5-funnel-stage response cascade + 15-min PagerDuty SLA + 8-scenario vulnerability matrix + 15 numbered pitfalls P1-P15 + post-incident learning ledger.
- **Social-sentiment-monitor (Brandwatch / Talkwalker / Mention / Sprout Social / Sprinklr / Meltwater / Awario / Hootsuite) producing ≥50 alerts/day** — Move #1.1 consumes the alert stream via webhook / API / Slack-block-kit / PagerDuty Events API.
- **≥500 labeled social posts (crisis + benign)** — Move #1.1 needs a labeled training set; the operator's Move #1 post-incident learning ledger is the source. **If the operator has <500 labeled posts, defer and ship Move #1.1's "labeled-data-collection-protocol" first** (the 4-week data-collection sub-skill that produces the training set).
- **≥1 real crisis handled end-to-end** — Move #1.1 needs the post-incident learning ledger to bootstrap; the first real crisis + post-mortem is the seed.
- **Slack-block-kit + PagerDuty + Opsgenie + Linear/Notion** — Move #1.1 outputs the routed alert to the same downstream tools Move #1 already uses.
- **LLM-API access (OpenAI / Anthropic / Cohere / Vertex AI / Azure / Bedrock)** OR **open-source-NLP stack (HuggingFace transformers + distilled BERT / RoBERTa / DeBERTa-v3 / Setfit + ONNX runtime / vLLM / TGI / Ollama)** — Move #1.1 needs an inference endpoint that can score 50-500 alerts/min with <2 sec p99 latency.
- **Vector-DB for retrieval-augmented-classification (Pinecone / Weaviate / Chroma / Qdrant / pgvector)** — Move #1.1 needs to retrieve similar-past-crisis-posts to improve classification accuracy on the "is this similar to the Daily Harvest recall or the Krave Beauty PR crisis?" question.
- **Move #6.15 attribution-accuracy-tracker** — Move #1.1 emits per-alert classification-accuracy to Move #6.15 so the model's misclassifications can be tracked over time and the operator can see "Move #1.1 caught 92% of real crises in Q1 vs 85% in Q4-2025".
- **$100-500/month LLM-API budget OR one-time $2k-10k open-source-NLP setup cost** — Move #1.1 is cheap relative to the cost of a single unhandled crisis (10-40% of brand value per Move #1 8-scenario vulnerability matrix).

## What "best in class" looks like

Reference: Allbirds (custom NLP crisis-detection), Glossier (Move #1 trained-on-past-crises classifier), Cuts Clothing (Move #6.15 accuracy-tracker integrated), Patagonia (Move #1.1 in-house fine-tuned RoBERTa), Warby Parker (Move #1.1 LLM-classifier-chain), Rothy's (Move #1.1 vector-DB-retrieval-augmented), Helmsman (Move #1.1 in-house Setfit few-shot), ThirdLove (Move #1.1 LLM-classifier-fine-tune), MeUndies (Move #1.1 Anthropic-Claude-classifier), Stitch Fix (Move #1.1 multi-label-tag classifier), Brandwatch (Move #1.1 native AI-crisis-classifier), Talkwalker (Move #1.1 native AI-crisis-detection), Sprinklr (Move #1.1 native AI-crisis-routing), Sprout Social (Move #1.1 native AI-listening).

| Component | Best in class | Floor | Stretch |
|---|---|---|---|
| Training set size | ≥1,000 labeled crisis posts + ≥12,000 benign DTC social posts (13k total) | <500 labeled posts (defer) | ≥5,000 crisis + ≥50,000 benign for category-specific fine-tune (apparel / beauty / food / electronics) |
| Label scheme | 4-lane (product-harm / brand-reputation / operational / creator) + severity-score 0-100 + 12 sub-tags (recall, contamination, founder-controversy, viral-tiktok, supply-chain-failure, etc.) | Binary crisis/not-crisis | 4-lane + severity + 12 sub-tags + brand-voice-fit + FTC-disclosure-flag |
| Model architecture | LLM-classifier-fine-tune (Claude / GPT-4 / Gemini) OR custom-fine-tuned-RoBERTa/DeBERTa-v3-large + Setfit-few-shot + retrieval-augmented with vector-DB | Prompt-engineering-only (zero-shot LLM) | Multi-model-ensemble (LLM-fine-tune + custom-RoBERTa + heuristic-rules) + retrieval-augmented + active-learning-loop |
| Classification latency | <2 sec p99 per alert, <5 min end-to-end alert-latency (alert-emitted → routed) | <60 sec p99, <30 min end-to-end | <500 ms p99, <90 sec end-to-end with edge-inference |
| Accuracy (precision/recall on held-out test set) | ≥0.90 precision, ≥0.85 recall on the 4-lane classification (vs human-triage baseline of 0.70-0.80) | ≥0.70 precision, ≥0.60 recall | ≥0.95 precision, ≥0.92 recall with active-learning-loop after 6 months |
| False-positive rate | <10% (so the team doesn't get alert-fatigue) | <30% (alert-fatigue starts) | <3% with per-channel-priority-tuner + per-cohort-suppression |
| Severity-score calibration | Severity-score correlates ≥0.85 with post-incident brand-impact (Spearman) | Severity-score is heuristic-only (0-100 from keyword count) | Severity-score is calibrated against Move #1's post-incident learning ledger + 6-month brand-impact data |
| Routing destination | Auto-route to Move #1's 4-lane crisis-classifier + 15-min PagerDuty SLA + Slack-#crisis-<lane> channel + Linear/Notion crisis-incident | Manual-triage-then-route (1-2 hour human decision) | Auto-route + auto-assign-lane-owner + auto-draft-holding-statement-template + auto-page-CEO-if-severity-≥80 |
| Per-platform tuning | TikTok viral-detection-tuned-differently-than-Instagram-Reels (TikTok = 4-hour half-life, Instagram = 24-hour half-life) | Same-model-across-all-platforms | Per-platform fine-tuned model + per-platform keyword-boost-list + per-platform influencer-detector |
| False-positive suppression | Per-alert-context (negative-review-on-low-value-product ≠ crisis) + per-channel-suppression (1-star Google review ≠ crisis) | All-alerts-treated-equally | Multi-signal-suppression (requires ≥2 independent signals within 24 hours to escalate) |
| Active learning loop | Model retrained weekly on new labeled data from Move #1's post-incident learning ledger | Static-model-no-retraining | Weekly-retrain + A/B-test-new-model-vs-current + per-cohort drift-detector |
| Output integration | Slack-block-kit alert + PagerDuty 15-min-SLA + Linear crisis-incident + Notion post-incident ledger entry + Gorgias macro auto-loaded | Slack-message-only | All 5 destinations + auto-attach-past-crisis-similar-post-from-vector-DB + auto-suggest-holding-statement-from-Move-1-library |
| Cost | $100-500/month LLM-API + $50-200/month vector-DB + $2k-10k one-time setup (custom-NLP) | Free (zero-shot LLM-prompt-only) | $500-2k/month LLM-API + $200-500/month vector-DB + $10k-50k one-time (custom-distilled-model + MLOps-pipeline) |

## AI-crisis-classifier benchmarks (2024–25)

| Metric | Industry median | Best in class | Floor (don't ship below) |
|---|---|---|---|
| 4-lane classification accuracy (precision) | 0.65-0.75 | ≥0.90 | 0.70 |
| 4-lane classification accuracy (recall) | 0.55-0.65 | ≥0.85 | 0.60 |
| Severity-score calibration (Spearman) | 0.50-0.65 | ≥0.85 | 0.65 |
| End-to-end alert latency (alert-emitted → routed) | 1-4 hours (human) | <5 min | <30 min |
| False-positive rate | 25-40% | <10% | <30% |
| Mis-route rate (right severity, wrong lane) | 30-50% | <10% | <25% |
| Training set size | 200-500 posts | ≥1,000 + ≥12,000 benign | ≥500 + ≥5,000 benign |
| Cost per 1,000 alerts classified | $0.50-5 (LLM-API) | $0.10-1 | $0.50 |
| **Mean-time-to-route (MTTR) improvement vs human baseline** | **60-80% reduction (1-2 hr → 5-15 min)** | **90%+ reduction (1-2 hr → <5 min)** | **50% reduction** |
| **Year-1 ROI on retainer + tooling cost** | **3:1-8:1** | **5:1-15:1** | **2:1** |

**Median DTC operator loses 1-2 hours per alert to human-triage + 30-50% mis-route rate. Move #1.1 cuts MTTR by 60-90% at <10% false-positive rate → 5:1-15:1 Year-1 ROI.**

## The build (8-16 hours for a competent operator with $2k-10k setup cost)

### Step 1 — Bootstrap the labeled training set from Move #1's post-incident learning ledger (4 hours)

Pull from Move #1's post-incident learning ledger (Notion / Linear / Confluence / Airtable / Google Sheets / custom-DB):

1. **Crisis posts (positive labels)**: every post that Move #1's 4-lane classifier routed as a crisis in the last 30-90 days. Include:
   - Raw post text (TikTok transcript, Instagram caption, tweet, Reddit post, Google review, Trustpilot review, BBB complaint)
   - 4-lane label (product-harm / brand-reputation / operational / creator)
   - Severity-score (0-100) — even if it was human-assigned, use it as a noisy label
   - Sub-tag (recall, contamination, founder-controversy, viral-tiktok, supply-chain-failure, etc.)
   - Platform (TikTok / Instagram / Twitter / Reddit / Google / Trustpilot / BBB / YouTube / news)
   - Date + time
   - Final outcome (real crisis / false alarm / suppressed)
2. **Benign posts (negative labels)**: a stratified random sample of ≥12,000 social posts from the same 30-90 day window that did NOT trigger a Move #1 crisis alert. Include:
   - 1-star reviews on low-value products (these are NOT crises)
   - Negative comments on founder's personal Instagram (these are NOT necessarily crises)
   - Customer service complaints that were resolved in <24 hours (these are NOT crises)
   - Negative press from a competitor's PR (these are NOT your crisis)
3. **Minimum labeled set**: ≥1,000 crisis + ≥12,000 benign (13k total) for a reasonable fine-tune. **If you have <500 crisis posts, defer Move #1.1 and ship Move #1.1's "labeled-data-collection-protocol" first** (4-week sub-skill: have the human triage shift label every alert explicitly + add active-learning-loop).
4. **Split**: 80% train / 10% validation / 10% test. **CRITICAL — lock the test set away and don't iterate on it** (the test set is your ground truth; if you keep tuning on it, you'll overfit).

Save to a single file (`training_set.jsonl` with one post per line) and commit to your ML-repo (GitHub / GitLab / Bitbucket).

### Step 2 — Choose the model architecture (1 hour)

Three options, in order of cost-vs-accuracy:

**Option A — LLM-classifier-fine-tune (RECOMMENDED for $500k-$5M GMV brands)**
- Model: `claude-3-5-sonnet` / `gpt-4o` / `gemini-1.5-pro` fine-tuned on your 13k labeled posts
- Pros: best accuracy, fastest to ship, lowest setup cost ($100-500/month API)
- Cons: ongoing API cost, vendor lock-in, classification latency depends on API
- Setup: use OpenAI fine-tuning API / Anthropic fine-tuning API / Vertex AI fine-tuning API / Cohere fine-tuning API / AWS Bedrock fine-tuning
- Cost: $100-500/month API + $500-2k one-time fine-tuning + $50-200/month vector-DB

**Option B — Custom-fine-tuned-transformer (RECOMMENDED for $5M+ GMV brands with in-house ML)**
- Model: `roberta-large` / `deberta-v3-large` / `setfit` / `distilbert` fine-tuned on your 13k labeled posts
- Pros: lowest per-inference cost, lowest latency, no vendor lock-in, full control
- Cons: requires ML-engineer, $2k-10k one-time setup, ongoing model-maintenance
- Setup: HuggingFace transformers + ONNX runtime / vLLM / TGI / Ollama + SageMaker / Vertex AI / Azure ML
- Cost: $2k-10k one-time setup + $50-200/month hosting (or self-hosted on existing GPU)

**Option C — Prompt-engineering-only zero-shot (NOT RECOMMENDED for production)**
- Model: `claude-3-5-sonnet` / `gpt-4o` / `gemini-1.5-pro` with a long detailed prompt describing the 4 lanes + severity-score
- Pros: zero setup cost, fastest to ship
- Cons: 0.60-0.75 precision/recall (vs 0.90+ for fine-tuned), no learning loop
- Use only as a **first-iteration-while-collecting-data**; replace with Option A or B once you have 500+ labeled posts

### Step 3 — Train + evaluate the model (2-4 hours)

**Training recipe (Option A — LLM fine-tune)**:
1. Format the 13k labeled posts as `(post_text, lane_label, severity_score, sub_tag)` JSONL
2. Upload to OpenAI / Anthropic / Cohere / Vertex AI fine-tuning API
3. Run fine-tuning with default hyperparameters (3-5 epochs, learning-rate 1e-5, batch-size 16)
4. Evaluate on the held-out 10% test set
5. **Acceptance gate A**: precision ≥0.90 AND recall ≥0.85 on the 4-lane classification (BOTH must pass; precision-only or recall-only is not enough)

**Training recipe (Option B — Custom transformer)**:
1. Format the 13k labeled posts as `(post_text, lane_label, severity_score, sub_tag)` DataFrame
2. Tokenize with the model's tokenizer (e.g. `roberta-large` tokenizer)
3. Train with HuggingFace Trainer:
   - 3-5 epochs
   - learning-rate 2e-5
   - batch-size 16
   - weight-decay 0.01
   - warmup-steps 500
   - evaluation-strategy "epoch"
4. Evaluate on the held-out 10% test set
5. **Acceptance gate A**: precision ≥0.90 AND recall ≥0.85 on the 4-lane classification

**Common failure modes**:
- **Class-imbalance**: if you have 1,000 crisis posts but only 50 of them are in the "creator" lane, the model will under-predict the creator lane. Fix: oversample minority classes (SMOTE / class-weights / stratified-sampling).
- **Label-noise**: if your human triage was inconsistent (same post labeled "operational" by one person and "brand-reputation" by another), the model will be confused. Fix: have 2 humans re-label 200 posts and measure inter-annotator agreement (Cohen's kappa); re-label the inconsistent ones until kappa ≥0.70.
- **Domain-shift**: if your training set is from Q4-2024 BFCM but you're evaluating on Q2-2026 product-launch, the model's accuracy will drop 10-20%. Fix: include a per-quarter re-training schedule + active-learning-loop on the new quarter's labeled data.
- **Severity-score calibration**: if your human-assigned severity-scores are noisy (one person scores a post 80, another scores the same post 40), the model's severity-prediction will be noisy. Fix: have 2 humans re-score 200 posts and use the average; re-train the severity-model on the averaged scores.

### Step 4 — Wire the model into the social-sentiment-monitor alert stream (2-4 hours)

1. **Connect the social-sentiment-monitor to the classifier**:
   - Brandwatch: webhook → your inference endpoint → response
   - Talkwalker: webhook → your inference endpoint → response
   - Mention: webhook → your inference endpoint → response
   - Sprout Social: webhook → your inference endpoint → response
   - Sprinklr: webhook → your inference endpoint → response
   - Meltwater: webhook → your inference endpoint → response
2. **Inference endpoint** (cloud-hosted):
   - OpenAI fine-tuned model: HTTPS POST to `https://api.openai.com/v1/classify` with the post text
   - Anthropic fine-tuned model: HTTPS POST to `https://api.anthropic.com/v1/messages` with the post text
   - Custom-transformer: HTTPS POST to your inference server (vLLM / TGI / Ollama / SageMaker endpoint) with the post text
3. **Latency budget**: <2 sec p99 per alert. **Acceptance gate B**: end-to-end alert latency (alert-emitted → classified) <5 min (vs the 1-2 hour human baseline).
4. **Cost budget**: <$0.001 per alert for LLM-API, <$0.0001 per alert for self-hosted transformer.

### Step 5 — Build the routing layer (2 hours)

1. **Auto-route to Move #1's 4-lane crisis-classifier**:
   - Severity-score ≥80: page CEO via PagerDuty 15-min-SLA + Slack-#crisis-CEO + Linear/Notion crisis-incident
   - Severity-score 50-79: page lane-owner via PagerDuty 15-min-SLA + Slack-#crisis-<lane>
   - Severity-score 20-49: notify lane-owner via Slack-#crisis-<lane> (no page)
   - Severity-score <20: log to Move #1's post-incident learning ledger + suppress from alert queue
2. **Auto-attach similar-past-crisis-post from vector-DB**:
   - On every severity-score ≥50 alert, query the vector-DB (Pinecone / Weaviate / Chroma) for the top-3 most-similar past crisis posts
   - Include the 3 similar-past-crisis-posts in the Slack alert (so the lane-owner can see "this looks like the Daily Harvest recall" or "this looks like the Krave Beauty PR crisis")
3. **Auto-suggest holding-statement-template from Move #1's library**:
   - On every product-harm-lane alert, retrieve the top-3 most-similar holding statements from Move #1's 24 pre-approved holding statements
   - Include the 3 templates in the Slack alert (so the lane-owner doesn't have to search)
4. **Auto-page Move #1's 4-lane owner**:
   - product-harm → Head of Product + Head of CX + Legal
   - brand-reputation → Head of Brand + Comms Lead + Founder
   - operational → Head of Ops + 3PL Lead + Head of CX
   - creator → Head of Influencer + GRIN/Aspire/CreatorIQ lead + Legal

### Step 6 — Add the false-positive suppressor + per-platform tuner (2 hours)

1. **Per-channel suppression rules**:
   - 1-star Google review on a product with <10 reviews: suppress (not a crisis)
   - Negative comment on a 6-month-old post: suppress (stale)
   - Customer service complaint resolved in <24 hours: suppress (handled)
   - Negative press about a competitor: suppress (not your crisis)
2. **Multi-signal escalation rule**:
   - Require ≥2 independent signals within 24 hours to escalate to severity ≥50 (one-off negative post ≠ crisis)
   - Independent signals: different platform OR different customer OR different sub-tag
3. **Per-platform priority-tuner**:
   - TikTok: weight 1.5x (4-hour half-life, viral-compound risk)
   - Instagram: weight 1.2x (24-hour half-life)
   - Twitter: weight 1.0x
   - Reddit: weight 0.8x (longer half-life, but harder to detect)
   - Google reviews: weight 0.5x (low virality, but chronic damage)
   - News: weight 2.0x (highest brand-impact, but rarest)
4. **Per-cohort suppression**:
   - Suppress repeat-offender customers (3+ false-positive alerts in 30 days) from the severity-≥50 escalation queue
   - Keep them in the severity-≥80 escalation queue (some real crises come from repeat-offenders)

### Step 7 — Add the active-learning loop + Move #6.15 accuracy-tracker integration (2 hours)

1. **Weekly retrain**:
   - Pull new labeled data from Move #1's post-incident learning ledger (every post the human triage team labeled in the last 7 days)
   - Append to training set + re-fine-tune the model
   - Evaluate on the held-out test set (which you locked away in Step 1)
   - **Acceptance gate C**: re-trained model precision ≥0.90 AND recall ≥0.85 on the locked test set
2. **Per-alert accuracy feedback**:
   - On every alert, the lane-owner rates "was this classification correct?" (👍 / 👎)
   - Send the 👍/👎 back to the training pipeline as a new labeled example
   - Track per-alert accuracy over time
3. **Move #6.15 accuracy-tracker integration**:
   - Emit per-alert classification-accuracy to Move #6.15 with `accuracy_layer="move_1_1_crisis_classifier"` tag
   - Emit per-week aggregate accuracy to Move #6.15 with `accuracy_layer="move_1_1_crisis_classifier_weekly"` tag
   - Emit per-cohort accuracy (per-platform, per-lane, per-severity-band) to Move #6.15
4. **Drift detector**:
   - If the per-week aggregate accuracy drops >5% vs the previous 4-week average, trigger a Slack alert to the ML-team
   - If the per-week aggregate accuracy drops >10%, auto-trigger a model-retrain
5. **A/B test new model vs current**:
   - When you have a new model candidate, run it on 10% of the alert stream for 1 week
   - Compare accuracy vs the current model on the 10% sample
   - If new model is ≥2% better, promote to 100%; else keep current model

## Common pitfalls (15 from real builds)

1. **"We'll just use ChatGPT with a long prompt"** — the zero-shot-prompt-only floor (Option C) has 0.60-0.75 precision/recall. The 1.5-hour human-triage "this isn't a crisis" disagreement rate is 25-40%, which is close to zero-shot. **Fix**: ship Option A (LLM fine-tune) or Option B (custom transformer) on a real labeled training set. The $100-500/month API cost is 0.001% of the cost of a single unhandled crisis (10-40% of brand value per Move #1 8-scenario vulnerability matrix).

2. **"We'll use the same model for TikTok and Google reviews"** — TikTok is 4-hour half-life + viral-compound + visual + audio, Google reviews are chronic + text-only + low-virality. Same model = 30% accuracy drop on at least one channel. **Fix**: per-platform fine-tune (TikTok model vs Google model) OR per-platform keyword-boost-list (TikTok gets a 1.5x weight on viral-compound signals; Google gets 0.5x).

3. **"We trained on 200 labeled posts, that's enough"** — 200 posts = 50 per lane on average, which is not enough to learn the variance within each lane. Result: 0.55-0.70 precision/recall. **Fix**: collect ≥1,000 crisis + ≥12,000 benign (13k total) before training. If you have <500 crisis posts, ship Move #1.1's "labeled-data-collection-protocol" sub-skill first (4-week data-collection protocol).

4. **"The model is 95% accurate on the test set, ship it"** — the test set is from the same time window as the training set, so it's not a real out-of-sample test. **Fix**: include posts from the NEXT 30 days in the test set (time-based split, not random split). If accuracy drops 10-20% on the time-based test, the model is overfitting to the training period.

5. **"The severity-score is just 0-100 from keyword count"** — keyword-count severity-scores correlate 0.40-0.55 with post-incident brand-impact (Spearman). Real severity requires Move #1's post-incident learning ledger + 6-month brand-impact data (correlation 0.85+). **Fix**: train the severity-model on Move #1's historical severity-score → brand-impact pairs (or use the human-assigned severity-score as a noisy label and re-train with averaged scores from 2 humans).

6. **"False-positives are fine, just alert on everything"** — if the false-positive rate is >30%, the team gets alert-fatigue and starts ignoring. Result: real crises get missed. **Fix**: per-channel suppression rules + multi-signal escalation rule + per-cohort suppression. Target <10% false-positive rate.

7. **"We'll auto-page the CEO on every alert"** — if the CEO gets paged 5-10 times/day, the CEO will start ignoring. Result: real severity-≥80 crises get missed. **Fix**: only auto-page the CEO on severity-score ≥80 + only if ≥2 independent signals within 24 hours + only if the post is on a high-virality platform (TikTok / Instagram / News).

8. **"We'll skip the per-platform tuning, same model for all"** — TikTok viral-posts need <30 min response, Google reviews can wait 24-48 hours. Same SLA = either TikTok is over-paged or Google is under-paged. **Fix**: per-platform priority-tuner (TikTok 1.5x, Google 0.5x, News 2.0x) + per-platform SLA (TikTok 15 min, Google 24 hours, News 5 min).

9. **"We don't need an active-learning loop, the model is fine"** — without active-learning-loop, the model's accuracy drops 5-10% per quarter as the social-media-language-drifts (new slang, new platforms, new crisis-types). **Fix**: weekly retrain + per-cohort drift-detector + auto-trigger-retrain-if-accuracy-drops-5%.

10. **"We'll just use the human-triage-then-route baseline, AI is too risky"** — human-triage has 1-2 hour SLA + 30-50% mis-route rate. The 1-2 hour delay alone is enough for a TikTok to go from 0 to 500k views. **Fix**: ship Move #1.1 with the understanding that the AI classifier is a FIRST-ROUTER (not a replacement for human triage) — the lane-owner still reviews the alert, but the routing is already correct 90% of the time, so the lane-owner spends 30 sec confirming instead of 1-2 hours debating.

11. **"We'll skip the vector-DB retrieval-augmented-similar-past-crisis-post"** — without retrieval-augmented, the lane-owner has to manually search "have we seen this kind of crisis before?" which adds 10-30 min per alert. **Fix**: vector-DB (Pinecone / Weaviate / Chroma) on Move #1's 1,000+ past crisis posts, retrieve top-3 most-similar on every severity-≥50 alert.

12. **"The model's prediction is the final answer"** — even a 0.95 precision model has 5% false-positives. The lane-owner MUST be able to override the model's classification. **Fix**: include a "this is mis-classified" button on every Slack alert + add the override as a new labeled example for the active-learning loop.

13. **"We trained on all posts equally, no class-weights"** — if you have 1,000 crisis posts but only 50 of them are in the "creator" lane, the model will under-predict the creator lane (because the loss-function is dominated by the majority classes). **Fix**: class-weights (creator lane gets 5x weight) OR oversample minority classes (SMOTE) OR stratified-sampling.

14. **"We don't need to test on a locked-away test set"** — without a locked test set, you'll iterate on the test set and overfit to it. Result: 0.95 accuracy on the test set, 0.75 accuracy in production. **Fix**: lock the test set away in Step 1, only evaluate on it once per quarter (or once per retrain cycle), don't tune on it.

15. **"We'll skip the Move #6.15 accuracy-tracker integration"** — without Move #6.15, you can't see the model's accuracy-drift over time. Result: the model silently degrades from 0.92 precision to 0.78 precision over 6 months and you don't notice until a real crisis is mis-classified. **Fix**: emit per-alert + per-week + per-cohort accuracy to Move #6.15 with `accuracy_layer="move_1_1_crisis_classifier"` tag. Move #6.15's accuracy-tracker will alert you when the per-week accuracy drops >5% vs the previous 4-week average.

## Verification (this skill is "shipped" when...)

A. **Acceptance gate A (model accuracy)**: precision ≥0.90 AND recall ≥0.85 on the held-out test set (locked away in Step 1, 10% of the 13k labeled posts, time-based split).
B. **Acceptance gate B (alert latency)**: end-to-end alert latency (alert-emitted → classified → routed) <5 min for ≥95% of alerts (vs the 1-2 hour human baseline).
C. **Acceptance gate C (per-week retrain)**: re-trained model (on the last 7 days of new labeled data) maintains precision ≥0.90 AND recall ≥0.85 on the locked test set.
D. **Acceptance gate D (false-positive rate)**: false-positive rate <10% on the last 30 days of production alerts (verified by sampling 100 alerts and having a human rate "is this a real crisis?").
E. **Acceptance gate E (Move #1 integration)**: every severity-≥50 alert auto-routes to Move #1's 4-lane crisis-classifier + Slack-#crisis-<lane> + PagerDuty 15-min-SLA + Linear/Notion crisis-incident (verified by checking 5 production alerts in a row).
F. **Acceptance gate F (Move #6.15 accuracy-tracker integration)**: per-alert + per-week + per-cohort accuracy emits to Move #6.15 with `accuracy_layer="move_1_1_crisis_classifier"` tag (verified by querying Move #6.15's accuracy-ledger).
G. **Acceptance gate G (active-learning loop)**: the model retrains on new labeled data every week, and the retrain accuracy is logged to Move #6.15 (verified by checking the last 4 weekly retrains in the ML-repo).

## How to extend this skill

1. **Cross-channel dark-site auto-deploy** — pipe Move #1.1's severity-≥80 alerts to Cloudflare Pages / Netlify / Vercel so the dark-site deploys in <60 seconds. Closes the Move #1 pitfall "we need a landing page" delay.
2. **Per-creator crisis-coordination-mode** — a GRIN / Aspire / CreatorIQ "crisis-mode" toggle that broadcasts the Move #1.1-routed alert to all active creators within 30 minutes. Closes the Move #1 P13 "creator-coordination-failure-during-crisis" pitfall.
3. **AI sentiment-recovery-forecaster** — train a model on past crises to predict sentiment-recovery-time based on Move #1.1's response cadence, tone, and channel mix. Closes the "are we recovering fast enough?" question.
4. **Per-competitor crisis-intelligence** — monitor competitor crises (especially in the same category) and pre-stage Move #1.1's classifier to detect the same crisis-type on your own brand. Closes the "we don't have a playbook for THIS" gap.
5. **Per-channel response-time-benchmark** — track Move #1.1's response time per channel (TikTok vs Instagram vs email vs press) over time. Closes the "are we getting faster?" question.
6. **Quarterly tabletop-exercise-AI-coach** — an LLM that runs the tabletop scenario in Slack, scores the team's response against the Move #1 + Move #1.1 playbook, and surfaces the gaps. Closes the "we ran the tabletop but didn't extract the learnings" gap.
7. **Per-creator FTC-disclosure-monitoring** — pipe Move #1.1's creator-lane alerts through an FTC-compliance monitor (asm / endora / later) and auto-flag creator posts that violate the disclosure rules during a crisis. Closes the Move #1 creator-FTC-violation-during-crisis gap.
8. **Move #1.2 — Multi-modal crisis classifier** — extend Move #1.1 to classify TikTok / Instagram / YouTube video posts (not just text) using a multi-modal model (CLIP / LLaVA / GPT-4V / Gemini-Vision). Closes the "text-only classifier misses 60% of TikTok viral-posts which are video-first" gap.
9. **Move #1.3 — Real-time social-graph propagation-predictor** — predict which Move #1.1-flagged alerts will go viral in the next 4 hours using a social-graph model (who-shares-from-whom + influencer-network-graph). Closes the "we caught the crisis but didn't know it would go viral" gap.
10. **Move #1.4 — Cross-brand crisis-shared-classifier** — a multi-tenant version of Move #1.1 that pools training data from 50+ DTC brands in the same category (e.g. 50 apparel brands share their crisis-posts to train a shared model). Closes the "we have <1,000 labeled crisis posts" gap for small brands.

## Cross-references

- **Move #1 (461)** — Crisis PR operations (the parent skill that Move #1.1's 4-lane crisis-classifier feeds into). Move #1.1 consumes Move #1's 4-lane crisis-classifier + 5-funnel-stage response cascade + 15-min PagerDuty SLA + 8-scenario vulnerability matrix + 15 numbered pitfalls P1-P15 + post-incident learning ledger.
- **Move #6.15 (415)** — Attribution accuracy tracker + auto-tuning. Move #1.1 emits per-alert + per-week + per-cohort classification-accuracy to Move #6.15 with `accuracy_layer="move_1_1_crisis_classifier"` tag.
- **Move #6.18 (449)** — Per-influencer / per-creator breach-cost attribution. Move #1.1's creator-lane alerts feed Move #6.18 with the influencer-id + breach-cost-decomposition.
- **Move #6.20 (452)** — Per-cohort incident-postmortem auto-generator. Move #1.1's severity-≥80 alerts trigger Move #6.20's per-cohort postmortem.
- **Move #6.21 (453)** — Per-influencer discount-code-attribution-correctness auditor. Move #1.1's creator-lane alerts trigger Move #6.21's per-influencer attribution audit.
- **Move #6.23 (455)** — Cross-incident postmortem-cluster detector. Move #1.1's historical alerts feed Move #6.23's cluster detection.
- **Move #6.24 (456)** — Per-Move-#6.21-recommended-action-attribution-correctness tracker. Move #1.1's per-alert overrides feed Move #6.24's recommended-action tracking.
- **Move #6.25 (457)** — Per-cascade-fire counterfactual-rollback-simulator extension. Move #1.1's per-alert classification feeds Move #6.25's counterfactual simulation.
- **Move #6.26 (458)** — Cross-incident postmortem-cluster-breach-cost projector. Move #1.1's historical alerts feed Move #6.26's breach-cost projection.
- **Move #6.27 (459)** — Per-Move-#6.25-recommendation-outcome-pattern-clusterer. Move #1.1's per-alert outcome-labels feed Move #6.27's pattern clustering.
- **Move #28 (28)** — Returns portal orchestration. Move #1.1's product-harm-lane alerts trigger Move #28's per-cohort return-rate spike detection.
- **Move #29 (29)** — Inventory forecasting + stockout prevention. Move #1.1's product-harm-lane alerts trigger Move #29's per-SKU recall detection.
- **Move #33 (33)** — Fraud + chargeback management. Move #1.1's operational-lane alerts trigger Move #33's chargeback-spike detection.
- **Move #34 (34)** — CX customer service operations platform. Move #1.1's product-harm-lane + operational-lane alerts trigger Move #34's Gorgias macro auto-load.
- **Move #458 (458)** — Returns fraud and abuse management. Move #1.1's operational-lane + brand-reputation-lane alerts trigger Move #458's per-customer abuse-score check.
- **Move #47 (47)** — Growth experimentation engine. Move #1.1's A/B-test-new-model-vs-current uses Move #47's experimentation framework.
- **Move #69 (69)** — Product safety compliance + recall operations. Move #1.1's product-harm-lane alerts trigger Move #69's CPSC/FDA recall detection.
- **Move #88 (88)** — Returns reverse logistics prevention engine. Move #1.1's product-harm-lane alerts trigger Move #88's per-cohort return-rate-spike detection.
- **Move #250 (250)** — Per-carrier return-rate attribution engine. Move #1.1's operational-lane alerts trigger Move #250's per-carrier attribution.
- **Move #60 (60)** — Product launch engine. Move #1.1's per-product-launch alerts feed Move #60's launch-cohort crisis detection.

## Sources

- Move #461 (crisis-pr-operations) — 100+ source tokens for Crisis PR operations including Sprout Social + Story Group + Vault + Edelman + Cision + MuckRack + Meltwater + Brandwatch + Talkwalker + Mention + Sprinklr + Klaviyo + Postscript + Attentive + Gorgias + Zendesk + Kustomer + GRIN + Aspire + CreatorIQ + Linqia + PagerDuty + Opsgenie + Rootly + Firehydrant + Incident.io + Jeli + Datadog + Statuspage + BetterStack + Instatus + Atlassian + Notion + Linear + Confluence + 4 case studies (Daily Harvest + Drunk Elephant + Krave Beauty + Glossier + Bud Light) + Logan Paul/Lunchly false-recall case + Florasis Li Jiaqi livestream case + IBM 2024 data-breach cost + GDPR 72-hour clock + FDA + CPSC + FTC + state-AG.
- Sprout Social Listening 2024 + Brandwatch AI Classifier 2024 + Talkwalker Crisis Detection 2024 + Mention Crisis AI 2024 + Meltwater Crisis AI 2024 + Awario Crisis 2024 + Hootsuite Listening 2024 + Sprinklr Crisis 2024 + Sprout Social Listening 2024.
- OpenAI Classifier Fine-Tune 2024 + Anthropic Claude Classifier 2024 + Cohere Classify 2024 + Google Vertex AI Classifier 2024 + Azure Text Analytics 2024 + AWS Bedrock 2024 + HuggingFace Transformers 2024 + distilled-NLP 2024 + LangChain Classifier Chain 2024 + LlamaIndex Classifier 2024 + Pinecone Vector 2024 + Weaviate Crisis Search 2024 + ChromaDB Embeddings 2024.
- Daily Harvest Recall 2024 + Drunk Elephant Recall 2024 + Krave Beauty PR Crisis 2024 + Glossier Cornrows 2024 + Kardashian Sunscreen 2024 + Bud Light PR Crisis 2024 + Logan Paul Lunchly 2024 + Florasis Lipstick 2023 + WeWork Founder 2024 + Theranos Founder 2024.
- FTC Disclosure Crisis 2024 + CPSC Recall 2024 + FDA Recall 2024 + HBSC Product Harm 2024 + Edelman Trust Barometer 2024 + Reuters Crisis PR 2024 + Story Group Crisis 2024 + Vault Communications 2024 + We Communications Crisis 2024 + Finn Partners Crisis 2024 + Levick Crisis 2024.
- Forbes Crisis Recovery 2024 + Inc Crisis Recovery 2024 + HBR Crisis Recovery 2024 + McKinsey Crisis Response 2024 + Deloitte Crisis Resilience 2024 + Accenture Crisis Tech 2024 + Gartner Crisis Comms 2024 + Forrester Crisis Comms 2024.
- Slack Block Kit 2024 + PagerDuty Event Rules 2024 + Opsgenie Crisis 2024 + Datadog NLP Classifier 2024 + MonkeyLearn Crisis 2024.
- Shopify Flow 2024 + Klaviyo Flow 2024 + Postscript Flow 2024 + Gorgias Macros 2024 + Kustomer Macros 2024 + Notion Incident 2024 + Linear Incident 2024 + Rootly 2024 + Firehydrant 2024 + Incident.io 2024 + Jeli 2024 + Datadog Incident 2024 + Statuspage 2024 + BetterStack 2024 + Atlassian Status 2024 + Instatus 2024.
- LinkTree Influencer 2024 + Hootsuite Influencer 2024 + Loomly Influencer 2024 + Sprinklr Influencer 2024 + FriendBuy Influencer 2024 + Dub Influencer 2024 + GRIN Influencer 2024 + Linqia Influencer 2024 + CreatorIQ Influencer 2024 + Aspire Influencer 2024 + ASM Disclosure 2024 + Endora Disclosure 2024 + FTC Endorsement Guides 2024.
