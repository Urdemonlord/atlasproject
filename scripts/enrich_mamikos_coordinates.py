#!/usr/bin/env python3
import argparse
import json
import random
import re
import ssl
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path('/home/meowlabs/atlasproject')
DATA_PATH = ROOT / 'mamikos_listings.json'
BACKUP_PATH = ROOT / 'mamikos_listings.pre_coordinates_backup.json'
PROGRESS_PATH = ROOT / 'mamikos_progress.json'
PATTERN = re.compile(r'"latitude"\s*:\s*(-?\d+\.\d+)\s*,\s*"longitude"\s*:\s*(-?\d+\.\d+)')
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
    'Cache-Control': 'no-cache',
}
ssl._create_default_https_context = ssl._create_unverified_context


def save_json(path: Path, payload):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2))


def now_iso() -> str:
    return time.strftime('%Y-%m-%dT%H:%M:%S')


def fetch_coords(url: str, timeout: int = 20):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=timeout) as response:
        html = response.read().decode('utf-8', 'ignore')
    match = PATTERN.search(html)
    if not match:
        return None, 'coords_not_found'
    lat, lng = match.groups()
    return (float(lat), float(lng)), None


def fetch_with_retry(item, max_retries: int, base_delay: float, jitter: float, timeout: int):
    url = item.get('url')
    if not url:
        return None, 'missing_url', 0

    attempts = 0
    while True:
        attempts += 1
        try:
            coords, error = fetch_coords(url, timeout=timeout)
            return coords, error, attempts
        except urllib.error.HTTPError as exc:
            if exc.code == 429 and attempts <= max_retries:
                sleep_for = (base_delay * (2 ** (attempts - 1))) + random.uniform(0, jitter)
                print(f"429 for {item.get('id')} attempt={attempts} sleep={sleep_for:.1f}s", flush=True)
                time.sleep(sleep_for)
                continue
            return None, f'HTTPError {exc.code}', attempts
        except Exception as exc:
            return None, f'{type(exc).__name__}: {exc}', attempts


def write_progress(progress, stats):
    payload = {
        'updated_at': now_iso(),
        'stats': stats,
        'recent': progress[-25:],
    }
    save_json(PROGRESS_PATH, payload)


def main():
    parser = argparse.ArgumentParser(description='Throttled Mamikos coordinate enrichment')
    parser.add_argument('--limit', type=int, default=0, help='Process at most N pending listings (0 = all pending)')
    parser.add_argument('--min-delay', type=float, default=2.0, help='Minimum delay between successful requests')
    parser.add_argument('--max-delay', type=float, default=5.0, help='Maximum delay between successful requests')
    parser.add_argument('--retry-429', type=int, default=4, help='Max retries after HTTP 429')
    parser.add_argument('--retry-base-delay', type=float, default=15.0, help='Base backoff seconds for HTTP 429')
    parser.add_argument('--retry-jitter', type=float, default=5.0, help='Random jitter added to 429 backoff')
    parser.add_argument('--checkpoint-every', type=int, default=10, help='Persist data every N processed items')
    parser.add_argument('--timeout', type=int, default=20, help='Per-request timeout seconds')
    args = parser.parse_args()

    start = time.time()
    raw = json.loads(DATA_PATH.read_text())
    listings = raw['listings'] if isinstance(raw, dict) and 'listings' in raw else raw

    if not BACKUP_PATH.exists():
        BACKUP_PATH.write_text(json.dumps(raw, ensure_ascii=False))

    pending = [
        item for item in listings
        if item.get('url') and (item.get('latitude') is None or item.get('longitude') is None)
    ]
    if args.limit > 0:
        pending = pending[:args.limit]

    stats = {
        'started_at': now_iso(),
        'target_count': len(pending),
        'success': 0,
        'failed': 0,
        'rate_limited': 0,
        'processed': 0,
    }
    progress = []

    print(f"pending={len(pending)} min_delay={args.min_delay}s max_delay={args.max_delay}s retries={args.retry_429}", flush=True)

    for idx, item in enumerate(pending, 1):
        coords, error, attempts = fetch_with_retry(
            item,
            max_retries=args.retry_429,
            base_delay=args.retry_base_delay,
            jitter=args.retry_jitter,
            timeout=args.timeout,
        )

        row = {
            'id': item.get('id'),
            'name': item.get('name'),
            'attempts': attempts,
            'url': item.get('url'),
        }

        if coords:
            lat, lng = coords
            item['latitude'] = lat
            item['longitude'] = lng
            item.pop('coordinate_error', None)
            stats['success'] += 1
            row['status'] = 'success'
            row['latitude'] = lat
            row['longitude'] = lng
            print(f"[{idx}/{len(pending)}] ok {item.get('id')} {item.get('name')} -> {lat},{lng}", flush=True)
        else:
            item['coordinate_error'] = error
            stats['failed'] += 1
            if error == 'HTTPError 429':
                stats['rate_limited'] += 1
            row['status'] = 'failed'
            row['error'] = error
            print(f"[{idx}/{len(pending)}] fail {item.get('id')} {item.get('name')} -> {error}", flush=True)

        stats['processed'] += 1
        progress.append(row)

        if idx % args.checkpoint_every == 0 or idx == len(pending):
            save_json(DATA_PATH, raw)
            write_progress(progress, stats)

        if idx < len(pending):
            time.sleep(random.uniform(args.min_delay, args.max_delay))

    save_json(DATA_PATH, raw)
    stats['seconds'] = round(time.time() - start, 2)
    stats['finished_at'] = now_iso()
    write_progress(progress, stats)
    print(json.dumps(stats, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
