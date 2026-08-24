import json
import ssl
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from http.server import BaseHTTPRequestHandler

# api/category_sync.py
# Scrapes each DSE market-category board (A, B, G, N, Z) and returns a flat
# { symbol: category } map. Companion to api/market_sync.py, which scrapes
# live prices but was never given a category field to scrape — the app has
# had a `market_info/categories` Firestore doc and UI badges (see
# hooks/useSimulator.ts's categoryMap) wired up to read this since it was
# built, but nothing has ever written to that doc. This is that writer's
# data source.
#
# Source: https://www.dsebd.org/latest_share_price_scroll_group.php?group=X
# for X in A/B/G/N/Z — DSE's own "Latest Share Price by Category" board,
# confirmed against the live site (2026-08-24): each group returns a
# disjoint symbol list (zero overlap across categories in a 395-symbol
# sample), so a symbol's LAST category write wins only in the pathological
# case DSE itself lists it twice, which hasn't been observed.
#
# The page's own HTML is malformed — a single `<tbody>` opener is followed
# by one stray `</tbody>` after almost every `<tr>`, with no matching
# `<tbody>` reopenings. A browser's forgiving parser recovers from this
# silently; a strict tag-matching scrape (e.g. tracking `<tbody>`...`</tbody>`
# pairs) would stop after the first row. This parser doesn't track tbody at
# all — it scopes itself to the one `<table class="...shares-table...">`
# on the page via start/end `table` tags only, which round-trip correctly.
CATEGORIES = ["A", "B", "G", "N", "Z"]

# Every category board on a healthy day sums to ~390-400 symbols (see
# module docstring). A day where the combined total falls far short means
# DSE's page structure changed or a request failed silently — abort rather
# than write a partial/wrong map over a previously-good one. (The Next.js
# route layers a second, stateful check on top of this — see
# app/api/category-sync/route.ts — that compares against the last known-good
# count rather than a fixed number.)
MIN_TOTAL_SYMBOLS = 200

REQUEST_TIMEOUT_SECONDS = 12.0
MAX_ATTEMPTS_PER_CATEGORY = 3
RETRY_BACKOFF_SECONDS = 1.5


class CategoryTableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_table = False
        self.symbols = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "table" and "shares-table" in (attrs_dict.get("class") or ""):
            self.in_table = True
        elif tag == "a" and self.in_table:
            href = attrs_dict.get("href") or ""
            if "displayCompany.php" in href:
                query = urllib.parse.urlparse(href).query
                name = urllib.parse.parse_qs(query).get("name", [None])[0]
                if name:
                    self.symbols.append(name.strip().upper())

    def handle_endtag(self, tag):
        if tag == "table" and self.in_table:
            self.in_table = False


def fetch_category_once(group: str, ctx: ssl.SSLContext) -> list:
    url = f"https://www.dsebd.org/latest_share_price_scroll_group.php?group={group}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=REQUEST_TIMEOUT_SECONDS) as response:
        html = response.read().decode("utf-8", errors="ignore")
    parser = CategoryTableParser()
    parser.feed(html)
    return parser.symbols


def fetch_category_with_retry(group: str, ctx: ssl.SSLContext) -> tuple:
    """Returns (group, symbols, error). error is None on success — including
    a genuinely empty category (DSE can legitimately have 0 symbols in G or
    N), which is why an empty result on the first clean attempt is NOT
    retried as if it were a failure."""
    last_error = None
    for attempt in range(1, MAX_ATTEMPTS_PER_CATEGORY + 1):
        try:
            symbols = fetch_category_once(group, ctx)
            return (group, symbols, None)
        except Exception as e:  # noqa: BLE001 — genuinely want to retry on anything
            last_error = str(e)
            if attempt < MAX_ATTEMPTS_PER_CATEGORY:
                time.sleep(RETRY_BACKOFF_SECONDS)
    return (group, [], last_error)


def fetch_all_categories() -> dict:
    """Fetches all five category boards concurrently (not sequentially) so a
    single slow DSE response can't push total wall time past Vercel's
    60s function ceiling (vercel.json) — five sequential 12s-timeout
    requests with retries could otherwise sum past it on a bad day and get
    the whole invocation killed mid-run instead of failing cleanly."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    categories = {}
    counts = {}
    errors = {}

    with ThreadPoolExecutor(max_workers=len(CATEGORIES)) as pool:
        futures = [pool.submit(fetch_category_with_retry, group, ctx) for group in CATEGORIES]
        for future in as_completed(futures):
            group, symbols, error = future.result()
            counts[group] = len(symbols)
            if error:
                errors[group] = error
            for symbol in symbols:
                categories[symbol] = group

    return {"categories": categories, "counts": counts, "errors": errors}


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            result = fetch_all_categories()
            categories = result["categories"]
            counts = result["counts"]
            errors = result["errors"]

            # A category that raised an exception after every retry is
            # indistinguishable from "0 symbols" in `counts` alone — surface
            # it as a hard failure rather than silently treating an
            # unreachable board the same as a genuinely empty one (which
            # G/N legitimately are on a normal day).
            if errors:
                self.send_error_response(
                    502,
                    f"Failed to fetch {len(errors)} of {len(CATEGORIES)} category boards after retries: {errors}",
                )
                return

            if len(categories) < MIN_TOTAL_SYMBOLS:
                self.send_error_response(
                    500,
                    f"Scraper returned unusually low results ({len(categories)} total): {counts}",
                )
                return

            self.send_success_response(categories, counts)

        except Exception as e:
            self.send_error_response(500, f"Category Sync Error: {str(e)}")

    def send_success_response(self, categories, counts):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"categories": categories, "counts": counts}).encode("utf-8"))

    def send_error_response(self, status, message):
        self.send_response(status)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode("utf-8"))
