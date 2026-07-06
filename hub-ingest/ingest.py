"""Marketing Data Hub — ingest.

Reads the per-source `*-mi-pipeline` repo data (checked out under --sources-dir by
the refresh-data Action) and writes the dashboard's JSON feeds into assets/data/,
following design-system/DATA-MODEL.md. Also copies LinkedIn ad thumbnails into
assets/img/ so example ads can be shown.

Pure standard library — no pip install. Feeds are flat/typed so they drop into the
InfoSec Snowflake database later with no reshaping.

Usage:
  python hub-ingest/ingest.py --sources-dir sources --out assets/data --img assets/img
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
CFG = json.loads((HERE / "sources.json").read_text(encoding="utf-8"))
BRAND_MAP: dict = CFG["brand_map"]
BRAND_LABELS: dict = CFG["brand_labels"]

# Increase the csv field-size limit — some cells (LinkedIn ad copy) are long.
csv.field_size_limit(10_000_000)


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _slug(s: str) -> str:
    """Match the scraper's slug so scraped creatives line up by competitor."""
    return re.sub(r"[^a-z0-9]+", "_", (s or "").lower()).strip("_")


def read_csv(path: Path) -> list[dict]:
    """Read a pipeline latest.csv into a list of dict rows (or [] if absent)."""
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def num(v, default=0.0) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def brand_id(label: str) -> str | None:
    return BRAND_MAP.get((label or "").strip())


def clean(v):
    """Empty string -> None; 'True'/'False' -> bool; else the value."""
    if v is None:
        return None
    s = str(v).strip()
    if s == "" or s.lower() == "nan":
        return None
    if s in ("True", "true"):
        return True
    if s in ("False", "false"):
        return False
    return s


# --------------------------------------------------------------------------- #
# Smartsheet -> channel-tracker.json (marketing activities / map + list)
# --------------------------------------------------------------------------- #
_ACT_MAP = {
    "title": "Activity title", "channel": "Channel", "affiliate": "Affiliate",
    "strategy": "Affiliate strategy", "region": "Region", "subRegion": "Sub-region",
    "audience": "Audience", "lead": "Marketing lead", "status": "Status",
    "urgency": "Urgency", "startDate": "Start Date", "goLive": "Go Live Date",
    "endDate": "End Date", "keyActivity": "Key activity", "comments": "Comments",
}


def build_activities(src: Path) -> list[dict]:
    rows = read_csv(src / "smartsheets-API" / "data" / "channel_tracker_2026" / "latest.csv")
    out = []
    for r in rows:
        out.append({k: clean(r.get(col)) for k, col in _ACT_MAP.items()})
    return out


# --------------------------------------------------------------------------- #
# Google Analytics -> website.json
# --------------------------------------------------------------------------- #
def build_website(src: Path) -> dict:
    rows = read_csv(src / "GA-website-api" / "data" / "mi_traffic_by_channel" / "latest.csv")
    by_brand: dict[str, dict] = {}
    by_channel: dict[tuple, dict] = {}
    for r in rows:
        bid = brand_id(r.get("brand"))
        if not bid:
            continue
        b = by_brand.setdefault(bid, {"brand": bid, "label": BRAND_LABELS.get(bid, bid),
                                      "site": r.get("site"), "sessions": 0, "users": 0,
                                      "newUsers": 0, "engagedSessions": 0, "keyEvents": 0})
        b["sessions"] += num(r.get("sessions"))
        b["users"] += num(r.get("totalUsers"))
        b["newUsers"] += num(r.get("newUsers"))
        b["engagedSessions"] += num(r.get("engagedSessions"))
        b["keyEvents"] += num(r.get("keyEvents"))
        ch = (r.get("sessionDefaultChannelGroup") or "Unknown")
        c = by_channel.setdefault((bid, ch), {"brand": bid, "channel": ch, "sessions": 0, "users": 0})
        c["sessions"] += num(r.get("sessions"))
        c["users"] += num(r.get("totalUsers"))
    for b in by_brand.values():
        b["engagementRate"] = round(b["engagedSessions"] / b["sessions"], 4) if b["sessions"] else 0
        for k in ("sessions", "users", "newUsers", "engagedSessions", "keyEvents"):
            b[k] = int(b[k])
    for c in by_channel.values():
        c["sessions"] = int(c["sessions"]); c["users"] = int(c["users"])
    return {"generatedAt": _now(), "source": "GA4",
            "byBrand": sorted(by_brand.values(), key=lambda x: -x["sessions"]),
            "byChannel": sorted(by_channel.values(), key=lambda x: -x["sessions"])}


# --------------------------------------------------------------------------- #
# LinkedIn -> linkedin.json (+ copy ad thumbnails into assets/img)
# --------------------------------------------------------------------------- #
def build_linkedin(src: Path, img_out: Path) -> dict:
    li = src / "linkedin-API"
    camp = read_csv(li / "data" / "li_ads_by_campaign" / "latest.csv")
    by_brand: dict[str, dict] = {}
    for r in camp:
        bid = brand_id(r.get("brand"))
        if not bid:
            continue
        b = by_brand.setdefault(bid, {"brand": bid, "label": BRAND_LABELS.get(bid, bid),
                                      "currency": "GBP", "impressions": 0, "clicks": 0,
                                      "spend": 0.0, "reactions": 0, "shares": 0,
                                      "conversions": 0, "landingPageClicks": 0})
        b["impressions"] += num(r.get("impressions"))
        b["clicks"] += num(r.get("clicks"))
        b["spend"] += num(r.get("costInLocalCurrency"))
        b["reactions"] += num(r.get("reactions"))
        b["shares"] += num(r.get("shares"))
        b["conversions"] += num(r.get("externalWebsiteConversions"))
        b["landingPageClicks"] += num(r.get("landingPageClicks"))
    for b in by_brand.values():
        b["ctr"] = round(b["clicks"] / b["impressions"], 4) if b["impressions"] else 0
        b["spend"] = round(b["spend"], 2)
        for k in ("impressions", "clicks", "reactions", "shares", "conversions", "landingPageClicks"):
            b[k] = int(b[k])

    # Rank creatives by impressions (join creatives -> per-creative analytics).
    creat = read_csv(li / "data" / "li_ad_creatives" / "latest.csv")
    by_creative = read_csv(li / "data" / "li_ads_by_creative" / "latest.csv")
    impr: dict[str, float] = {}
    for r in by_creative:
        pv = (r.get("pivotValues") or "")
        # pivotValues is a JSON list string like ["urn:li:sponsoredCreative:123"]
        cid = pv.split(":")[-1].rstrip('"]') if "sponsoredCreative" in pv else None
        if cid:
            impr[cid] = impr.get(cid, 0) + num(r.get("impressions"))

    top: list[dict] = []
    for r in creat:
        bid = brand_id(r.get("brand"))
        cid_full = r.get("creative_id") or ""
        cid = cid_full.split(":")[-1]
        image = _copy_image(li, r.get("image_file"), img_out)
        top.append({
            "brand": bid, "creativeId": cid_full,
            "headline": clean(r.get("headline")), "copy": clean(r.get("copy")),
            "cta": clean(r.get("cta")), "landingPage": clean(r.get("landing_page")),
            "mediaType": clean(r.get("media_type")), "image": image,
            "impressions": int(impr.get(cid, 0)),
        })
    top.sort(key=lambda x: -x["impressions"])

    return {"generatedAt": _now(), "source": "LinkedIn Ads",
            "byBrand": sorted(by_brand.values(), key=lambda x: -x["impressions"]),
            "topCreatives": top[:40]}


def _copy_image(li_repo: Path, image_file: str | None, img_out: Path) -> str | None:
    """Copy a pipeline ad thumbnail into assets/img/ad_media/ and return the web path."""
    if not image_file:
        return None
    src_path = li_repo / image_file            # e.g. data/ad_media/igneo/123.jpg
    if not src_path.exists():
        return None
    rel = Path(image_file)
    rel = rel.relative_to("data") if rel.parts and rel.parts[0] == "data" else rel
    dest = img_out / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src_path, dest)
    return f"assets/img/{rel.as_posix()}"


# --------------------------------------------------------------------------- #
# Google Ads Transparency Center -> competitor-ads.json (competitor intelligence)
# --------------------------------------------------------------------------- #
def build_competitor_ads(src: Path) -> dict:
    rows = read_csv(src / "competitor-ads-mi-pipeline" / "data" / "competitor_ads" / "latest.csv")
    by_brand: dict[str, dict] = {}
    by_comp: dict[tuple, dict] = {}
    samples: list[dict] = []
    for r in rows:
        bid = brand_id(r.get("brand"))
        if not bid:
            continue
        comp = clean(r.get("competitor")) or "Unknown"
        last = clean(r.get("last_shown"))
        bb = by_brand.setdefault(bid, {"brand": bid, "label": BRAND_LABELS.get(bid, bid),
                                       "_comps": set(), "ads": 0})
        bb["_comps"].add(comp); bb["ads"] += 1
        bc = by_comp.setdefault((bid, comp), {"brand": bid, "competitor": comp, "ads": 0,
                                              "lastShown": None, "sampleImage": None})
        bc["ads"] += 1
        if last and (bc["lastShown"] is None or last > bc["lastShown"]):
            bc["lastShown"] = last
        if clean(r.get("media_url")):
            if not bc["sampleImage"]:
                bc["sampleImage"] = clean(r.get("media_url"))     # one creative per competitor
            samples.append({"brand": bid, "competitor": comp, "format": clean(r.get("format")),
                            "firstShown": clean(r.get("first_shown")), "lastShown": last,
                            "mediaUrl": clean(r.get("media_url")),
                            "previewUrl": clean(r.get("preview_url"))})
    for bb in by_brand.values():
        bb["competitors"] = len(bb.pop("_comps"))
    samples.sort(key=lambda s: (s.get("lastShown") or ""), reverse=True)
    return {"generatedAt": _now(), "source": "Google Ads Transparency Center",
            "byBrand": sorted(by_brand.values(), key=lambda x: -x["ads"]),
            "byCompetitor": sorted(by_comp.values(), key=lambda x: -x["ads"]),
            "sampleAds": samples[:60]}


# --------------------------------------------------------------------------- #
# LinkedIn Ad Library -> competitor-linkedin.json (competitor LinkedIn ads + geo)
# --------------------------------------------------------------------------- #
def build_competitor_linkedin(src: Path, img_out: Path) -> dict:
    rows = read_csv(src / "linkedin-API" / "data" / "competitor_linkedin_ads" / "latest.csv")
    media_dir = src / "linkedin-API" / "data" / "competitor_li_media"   # scraped creatives
    by_comp: dict[tuple, dict] = {}
    for r in rows:
        bid = brand_id(r.get("brand"))
        if not bid:
            continue
        comp = clean(r.get("competitor")) or "?"
        c = by_comp.setdefault((bid, comp), {"brand": bid, "competitor": comp,
                                             "advertiserUrl": clean(r.get("advertiser_url")),
                                             "ads": 0, "_countries": {}})
        c["ads"] = max(c["ads"], int(num(r.get("total_ads"))))     # true library-wide total
        ctry = clean(r.get("country"))
        if ctry:
            c["_countries"][ctry] = c["_countries"].get(ctry, 0) + 1
    comps = []
    for c in by_comp.values():
        ranked = sorted(c.pop("_countries").items(), key=lambda kv: -kv[1])
        c["topCountry"] = ranked[0][0] if ranked else None
        c["countries"] = [{"country": k, "count": v} for k, v in ranked[:6]]
        # A scraped creative image for this competitor, if the scraper produced one.
        cslug = _slug(c["competitor"])
        srcimg = media_dir / f"{cslug}.jpg"
        c["sampleImage"] = None
        if srcimg.exists():
            dest = img_out / "competitor_li" / f"{cslug}.jpg"
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(srcimg, dest)
            c["sampleImage"] = f"assets/img/competitor_li/{cslug}.jpg"
        comps.append(c)
    by_brand: dict[str, dict] = {}
    for c in comps:
        b = by_brand.setdefault(c["brand"], {"brand": c["brand"], "label": BRAND_LABELS.get(c["brand"], c["brand"]),
                                             "competitors": 0, "ads": 0})
        b["competitors"] += 1
        b["ads"] += c["ads"]
    return {"generatedAt": _now(), "source": "LinkedIn Ad Library",
            "byBrand": sorted(by_brand.values(), key=lambda x: -x["ads"]),
            "byCompetitor": sorted(comps, key=lambda x: -x["ads"])}


# --------------------------------------------------------------------------- #
# Alphix -> alphix.json (firmographics: which named firms viewed the estate)
# --------------------------------------------------------------------------- #
ALPHIX_DOMAIN_BRAND = {
    "fssaim.com": "fssa", "igneoip.com": "igneo",
    "firstsentierinvestors.com": "fsi", "firstsentierinvestors.com.au": "fsi",
    "scottishoriental.com": "stewart", "firststatestewart.net": "stewart",
    "firststatestewartasia.com": "stewart", "rqiinvestors.com": "rqi",
}


def _alx_brand(domain: str | None) -> str | None:
    d = (domain or "").lower().replace("www.", "").strip()
    return ALPHIX_DOMAIN_BRAND.get(d)


def build_alphix(src: Path) -> dict:
    base = src / "alphix-mi-pipeline" / "data"
    firms = read_csv(base / "mi_top_firms_viewing_estate" / "latest.csv")
    top_firms = [{"firm": clean(r.get("Firm")), "industry": clean(r.get("Firm Industry")),
                  "pageviews": int(num(r.get("Pageviews Human"))),
                  "ipCount": int(num(r.get("IP Count Human")))}
                 for r in firms
                 if clean(r.get("Firm")) and clean(r.get("Firm")) != "Unknown"][:50]
    traffic = read_csv(base / "mi_monthly_web_traffic_by_country" / "latest.csv")
    by_country: dict[str, float] = {}
    by_brand: dict[str, float] = {}
    for r in traffic:
        pv = num(r.get("Pageviews Human"))
        by_country[clean(r.get("Country")) or "Unknown"] = by_country.get(clean(r.get("Country")) or "Unknown", 0) + pv
        b = _alx_brand(r.get("Domain"))
        if b:
            by_brand[b] = by_brand.get(b, 0) + pv
    return {"generatedAt": _now(), "source": "Alphix",
            "topFirms": top_firms,
            "byCountry": sorted(({"country": k, "pageviews": int(v)} for k, v in by_country.items()),
                                key=lambda x: -x["pageviews"])[:30],
            "byBrand": sorted(({"brand": k, "label": BRAND_LABELS.get(k, k), "pageviews": int(v)}
                               for k, v in by_brand.items()), key=lambda x: -x["pageviews"])}


# --------------------------------------------------------------------------- #
# HubSpot -> hubspot.json (marketing engagement counts + campaign/email lists)
# --------------------------------------------------------------------------- #
def build_hubspot(src: Path) -> dict:
    base = src / "hubspot" / "data"
    emails = read_csv(base / "marketing_emails" / "latest.csv")
    forms = read_csv(base / "forms" / "latest.csv")
    camps = read_csv(base / "campaigns" / "latest.csv")
    deals = read_csv(base / "deals" / "latest.csv")
    campaigns = [{"name": clean(r.get("properties.hs_name")),
                  "status": clean(r.get("properties.hs_campaign_status")),
                  "startDate": clean(r.get("properties.hs_start_date")),
                  "endDate": clean(r.get("properties.hs_end_date"))}
                 for r in camps if clean(r.get("properties.hs_name"))]
    recent_emails = [{"name": clean(r.get("name")), "subject": clean(r.get("subject")),
                      "state": clean(r.get("state")), "publishDate": clean(r.get("publishDate"))}
                     for r in emails if clean(r.get("name"))][:40]
    return {"generatedAt": _now(), "source": "HubSpot",
            "counts": {"marketingEmails": len(emails), "forms": len(forms),
                       "campaigns": len(camps), "deals": len(deals)},
            "campaigns": campaigns, "recentEmails": recent_emails}


# --------------------------------------------------------------------------- #
def main() -> None:
    ap = argparse.ArgumentParser(description="Marketing Data Hub ingest")
    ap.add_argument("--sources-dir", default="sources", help="dir holding checked-out source repos")
    ap.add_argument("--out", default="assets/data", help="feed output dir")
    ap.add_argument("--img", default="assets/img", help="image output dir")
    args = ap.parse_args()

    src = Path(args.sources_dir)
    out = Path(args.out); out.mkdir(parents=True, exist_ok=True)
    img = Path(args.img)

    feeds = {
        "channel-tracker.json": build_activities(src),
        "website.json": build_website(src),
        "linkedin.json": build_linkedin(src, img),
        "competitor-ads.json": build_competitor_ads(src),
        "competitor-linkedin.json": build_competitor_linkedin(src, img),
        "alphix.json": build_alphix(src),
        "hubspot.json": build_hubspot(src),
    }
    for name, data in feeds.items():
        (out / name).write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
        n = len(data) if isinstance(data, list) else len(data.get("byBrand", []))
        print(f"wrote {out / name}  ({n} brand/activity records)")


if __name__ == "__main__":
    main()
