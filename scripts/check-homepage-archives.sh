#!/usr/bin/env sh
set -eu

hugo --gc --minify >/tmp/theobredemann-hugo-build.log

grep -q '2026-01' public/index.html
grep -q 'My Self-Hosted Journey So Far' public/index.html
if grep -q 'Minha Jornada Self-Hosted' public/index.html; then
  exit 1
fi
if grep -q 'href=/pt/' public/index.html; then
  exit 1
fi
if grep -Fq 'flex flex-col lg:flex-row gap-8' layouts/index.html; then
  exit 1
fi
if grep -q '>Posts<' public/index.html || grep -q '>2025<' public/index.html || grep -q '>2026<' public/index.html; then
  exit 1
fi
grep -q 'hextra-language-switcher' public/index.html
grep -q 'hextra-theme-toggle' public/index.html

grep -q '2026-01' public/pt/index.html
grep -q 'Minha Jornada Self-Hosted' public/pt/index.html
if grep -q 'My Self-Hosted Journey So Far' public/pt/index.html; then
  exit 1
fi
if grep -Fq 'flex flex-col lg:flex-row gap-8' layouts/index.html; then
  exit 1
fi

if test -f config/_default/languages.yaml; then
  exit 1
fi
