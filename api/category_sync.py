import json
import ssl
import urllib.parse
import urllib.request
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
# than write a partial/wrong map over a previously-good one.
MIN_TOTAL_SYMBOLS = 200


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


def fetch_category(group: str, ctx: ssl.SSLContext) -> list:
    url = f"https://www.dsebd.org/latest_share_price_scroll_group.php?group={group}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=25.0) as response:
        html = response.read().decode("utf-8", errors="ignore")
    parser = CategoryTableParser()
    parser.feed(html)
    return parser.symbols


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            categories = {}
            counts = {}
            for group in CATEGORIES:
                symbols = fetch_category(group, ctx)
                counts[group] = len(symbols)
                for symbol in symbols:
                    categories[symbol] = group

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
