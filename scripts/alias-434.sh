#!/bin/bash
set -e
TOK="$(grep -oE 'vcp_[A-Za-z0-9]+' /data/workspace/env)"
/data/.npm-global/bin/vercel alias set dashboard-cd0bx86wm-mattiasadem-5021s-projects.vercel.app ecommerce-ops-iota.vercel.app --token "$TOK"
