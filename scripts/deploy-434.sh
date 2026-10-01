#!/bin/bash
set -e
cd /data/workspace/ecommerce-ops/dashboard
/data/.npm-global/bin/vercel deploy --prod --yes --token "$(grep -oE 'vcp_[A-Za-z0-9]+' /data/workspace/env)"
