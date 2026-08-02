#!/usr/bin/env python3
"""Import published Ghost posts into Hugo Markdown."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from html import unescape
from html.parser import HTMLParser
from pathlib import Path


EXPORT = Path.home() / "Documents/bited-life.ghost.2026-03-08-21-08-38.json"
ROOT = Path(__file__).resolve().parents[1]


class HtmlToMarkdown(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.parts: list[str] = []
        self.links: list[str | None] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        if tag in {"p", "div", "section", "article", "blockquote"}:
            self._nl(2)
            if tag == "blockquote":
                self.parts.append("> ")
        elif tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self._nl(2)
            self.parts.append("#" * int(tag[1]) + " ")
        elif tag == "br":
            self.parts.append("\n")
        elif tag == "li":
            self._nl(1)
            self.parts.append("- ")
        elif tag in {"ul", "ol"}:
            self._nl(2)
        elif tag in {"strong", "b"}:
            self.parts.append("**")
        elif tag in {"em", "i"}:
            self.parts.append("*")
        elif tag == "code":
            self.parts.append("`")
        elif tag == "pre":
            self._nl(2)
            self.parts.append("```\n")
        elif tag == "a":
            href = attrs_dict.get("href")
            if href:
                self.parts.append("[")
            self.links.append(href)
        elif tag == "img":
            src = attrs_dict.get("src") or ""
            alt = attrs_dict.get("alt") or ""
            if src:
                self._nl(2)
                self.parts.append(f"![{alt}]({src})")
                self._nl(2)

    def handle_endtag(self, tag: str) -> None:
        if tag in {"p", "div", "section", "article", "blockquote", "ul", "ol"}:
            self._nl(2)
        elif tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self._nl(2)
        elif tag in {"strong", "b"}:
            self.parts.append("**")
        elif tag in {"em", "i"}:
            self.parts.append("*")
        elif tag == "code":
            self.parts.append("`")
        elif tag == "pre":
            self.parts.append("\n```")
            self._nl(2)
        elif tag == "a":
            href = self.links.pop() if self.links else None
            if href:
                self.parts.append(f"]({href})")

    def handle_data(self, data: str) -> None:
        self.parts.append(unescape(data))

    def handle_entityref(self, name: str) -> None:
        self.parts.append(unescape(f"&{name};"))

    def handle_charref(self, name: str) -> None:
        self.parts.append(unescape(f"&#{name};"))

    def markdown(self) -> str:
        text = "".join(self.parts)
        text = re.sub(r"[ \t]+\n", "\n", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip() + "\n"

    def _nl(self, count: int) -> None:
        current = "".join(self.parts[-3:])
        missing = count - len(current) + len(current.rstrip("\n"))
        if missing > 0:
            self.parts.append("\n" * missing)


def parse_date(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)


def frontmatter(post: dict, tags: list[str]) -> str:
    date = parse_date(post["published_at"]).strftime("%Y-%m-%dT%H:%M:%SZ")
    lines = ["---", f'title: "{post["title"].replace(chr(34), chr(92) + chr(34))}"', f"date: {date}", "type: posts"]
    if tags:
        lines.append("tags:")
        lines.extend(f'  - "{tag}"' for tag in tags)
    image = post.get("feature_image")
    if image:
        lines.append(f'featured_image: "{image}"')
    lines.append("---")
    return "\n".join(lines) + "\n\n"


def content_path(post: dict, tags: list[str]) -> Path:
    published = parse_date(post["published_at"])
    if post["slug"] == "about":
        return ROOT / ("content/pt/about/_index.md" if "pt" in tags else "content/about/_index.md")
    prefix = ROOT / "content"
    if "pt" in tags:
        prefix = prefix / "pt"
    return prefix / f"{published:%Y/%m/%d}" / post["slug"] / "index.md"


def html_to_markdown(html: str) -> str:
    parser = HtmlToMarkdown()
    parser.feed(html)
    return parser.markdown()


def main() -> None:
    data = json.loads(EXPORT.read_text())["db"][0]["data"]
    tags_by_id = {tag["id"]: tag["slug"] for tag in data["tags"]}
    post_tags: dict[str, list[str]] = {}
    for row in data["posts_tags"]:
        tag = tags_by_id[row["tag_id"]]
        if not tag.startswith("hash-"):
            post_tags.setdefault(row["post_id"], []).append(tag)

    for post in data["posts"]:
        if post.get("status") != "published":
            continue
        tags = post_tags.get(post["id"], [])
        target = content_path(post, tags)
        target.parent.mkdir(parents=True, exist_ok=True)
        body = html_to_markdown(post.get("html") or "")
        target.write_text(frontmatter(post, tags) + body)
        print(target.relative_to(ROOT))


if __name__ == "__main__":
    main()
