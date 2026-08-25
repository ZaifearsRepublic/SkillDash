import json
import re
import html as html_lib
import urllib.request
import ssl
from html.parser import HTMLParser
from http.server import BaseHTTPRequestHandler

# dsebd.org's board prints its own authoritative session state near the top
# of the page, e.g.:
#   Tuesday, August 25, 2026  Current Time: 11:19:04 AM (BST)
#   Market Status: Open
#
# This is DSE telling us directly whether it is trading, which is strictly
# better evidence than our own hardcoded holiday calendar guessing at it.
# A wrong date in lib/bangladeshHolidays.ts once took the whole trading
# feature offline for a live session (2026-08-25); capturing this lets the
# app corroborate the calendar against reality instead of trusting it
# blindly. See lib/utils/marketHours.ts.
#
# Parsed off the tag-stripped text rather than a specific element, because
# the surrounding markup is incidental while this label has been stable.
# Returns None when it can't be found, and every consumer treats None as
# "no opinion" and falls back to the calendar — a parser break must never
# itself become an outage.
MARKET_STATUS_RE = re.compile(r'Market\s*Status\s*:\s*([A-Za-z][A-Za-z \-]{0,30})', re.I)


def extract_market_status(html_text):
    text = html_lib.unescape(re.sub(r'<[^>]+>', ' ', html_text))
    match = MARKET_STATUS_RE.search(text)
    if not match:
        return None
    # Collapse whitespace and drop any trailing words that ran on from the
    # next element once the tags were stripped.
    return ' '.join(match.group(1).split()).split('  ')[0].strip() or None

class DSEMarketParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_td = False
        self.current_cell_data = []
        self.current_row = []
        self.stocks = []

    def handle_starttag(self, tag, attrs):
        if tag == 'tr':
            self.current_row = []
        elif tag == 'td':
            self.in_td = True
            self.current_cell_data = []

    def handle_endtag(self, tag):
        if tag == 'td':
            self.in_td = False
            cell_text = "".join(self.current_cell_data).strip().replace(',', '')
            self.current_row.append(cell_text)
        elif tag == 'tr':
            if len(self.current_row) >= 10:
                symbol = self.current_row[1]
                if symbol != 'TRADING CODE' and symbol != '':
                    try:
                        ltp = float(self.current_row[2]) if self.current_row[2] not in ['--', '', '0'] else 0
                        high = float(self.current_row[3]) if self.current_row[3] not in ['--', ''] else 0
                        low = float(self.current_row[4]) if self.current_row[4] not in ['--', ''] else 0
                        close = float(self.current_row[5]) if self.current_row[5] not in ['--', ''] else 0
                        ycp = float(self.current_row[6]) if self.current_row[6] not in ['--', ''] else 0
                        change = float(self.current_row[7]) if self.current_row[7] not in ['--', ''] else 0
                        trade = float(self.current_row[8]) if self.current_row[8] not in ['--', ''] else 0
                        value = float(self.current_row[9]) if self.current_row[9] not in ['--', ''] else 0
                        volume = float(self.current_row[10]) if len(self.current_row) > 10 and self.current_row[10] not in ['--', ''] else 0
                        
                        # Calculate change percent safely
                        changePercent = round((change / ycp) * 100, 2) if ycp > 0 else 0

                        # A stock with zero matched trades today reads as LTP 0
                        # on this page (verified against the live board: every
                        # row with trade==0 also has ltp==0, and vice versa,
                        # with no exceptions across the full ~400-symbol list).
                        # YCP still carries the real last-known price in that
                        # case, so it's kept as-is rather than zeroed, letting
                        # consumers show "last close ৳X" instead of "৳0.00".
                        # `traded` is the single signal every consumer should
                        # gate on — trading, P&L math, and display all read
                        # this rather than re-deriving "no price" from ltp
                        # themselves.
                        traded = trade > 0

                        self.stocks.append({
                            "symbol": symbol,
                            "ltp": ltp,
                            "high": high,
                            "low": low,
                            "close": close,
                            "ycp": ycp,
                            "change": change,
                            "changePercent": changePercent,
                            "trade": trade,
                            "value": value,
                            "volume": volume,
                            "traded": traded
                        })
                    except ValueError:
                        pass 

    def handle_data(self, data):
        if self.in_td:
            self.current_cell_data.append(data)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            url = "https://www.dsebd.org/latest_share_price_scroll_l.php"
            
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            
            with urllib.request.urlopen(req, context=ctx, timeout=30.0) as response:
                html = response.read().decode('utf-8', errors='ignore')
                
            parser = DSEMarketParser()
            parser.feed(html)
            
            if len(parser.stocks) < 50:
                self.send_error_response(500, "Scraper returned unusually low results")
                return

            # Never let a status-parse problem fail the price sync — prices
            # are the critical payload, the status is a bonus signal.
            try:
                market_status = extract_market_status(html)
            except Exception:
                market_status = None

            self.send_success_response(parser.stocks, market_status)

        except Exception as e:
            self.send_error_response(500, f"Native Mass Sync Error: {str(e)}")

    def send_success_response(self, data, market_status=None):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        # Object form, replacing the bare array this used to return. The
        # Next.js consumer (app/api/stock-sync/route.ts) accepts both shapes
        # so the two can never be out of step during a rollout.
        payload = {"stocks": data, "marketStatus": market_status}
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def send_error_response(self, status, message):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode('utf-8'))