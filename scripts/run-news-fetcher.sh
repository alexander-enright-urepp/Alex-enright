#!/bin/bash
# run-news-fetcher.sh
# Wrapper script for the news fetcher cron job

cd "$(dirname "$0")/.."
exec node scripts/fetch-news.js >> scripts/.news-cron.log 2>&1
