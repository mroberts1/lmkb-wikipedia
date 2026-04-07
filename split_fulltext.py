#!/usr/bin/env python3
"""Split the combined full-text file into individual markdown files in data/fulltext/."""

import os
import re

SRC = "Lev_Manovich_All_Articles_1992_2007.md"
OUT_DIR = os.path.join("data", "fulltext")
os.makedirs(OUT_DIR, exist_ok=True)

with open(SRC, "r", encoding="utf-8") as f:
    content = f.read()

# Split on top-level headings (# Title), skipping "# Table of contents:"
parts = re.split(r'\n(?=# )', content)

articles = []
for part in parts:
    part = part.strip()
    if not part:
        continue
    # Extract heading
    m = re.match(r'^# (.+)', part)
    if not m:
        continue
    title = m.group(1).strip()
    if title.lower().startswith("table of contents"):
        continue

    # Extract author and year from _author:_ and _year:_ lines
    author_m = re.search(r'_author:\s*(.+?)_', part)
    year_m = re.search(r'_year:\s*(\d{4})_', part)
    author = author_m.group(1).strip() if author_m else "Lev Manovich"
    year = year_m.group(1) if year_m else ""

    # Remove the _author:_ and _year:_ lines from body
    body = part
    body = re.sub(r'_author:\s*.+?_\s*\n?', '', body)
    body = re.sub(r'_year:\s*\d{4}_\s*\n?', '', body)

    # Build filename from title
    safe_title = re.sub(r'[^\w\s-]', '', title).strip()
    safe_title = re.sub(r'\s+', '_', safe_title)
    if len(safe_title) > 80:
        safe_title = safe_title[:80]
    filename = f"{safe_title}.md"

    # Build frontmatter — use single quotes to avoid issues with quotes in titles
    escaped_title = title.replace("'", "''")
    frontmatter = f"""---
title: '{escaped_title}'
author: '{author}'
year: {year}
type: fulltext
---

"""
    full_content = frontmatter + body

    filepath = os.path.join(OUT_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(full_content)

    articles.append((title, year, filename))
    print(f"  Written: {filename}")

print(f"\nTotal: {len(articles)} articles extracted to {OUT_DIR}/")
