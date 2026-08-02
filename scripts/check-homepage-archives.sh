#!/usr/bin/env sh
set -eu

hugo --gc --minify >/tmp/theobredemann-hugo-build.log
rsync -a --delete public/ ./ \
  --include='2025/***' \
  --include='2026/***' \
  --include='404.html' \
  --include='about/***' \
  --include='android-chrome-192x192.png' \
  --include='android-chrome-512x512.png' \
  --include='apple-touch-icon.png' \
  --include='categories/***' \
  --include='css/***' \
  --include='en/***' \
  --include='en.search*' \
  --include='favicon-16x16.png' \
  --include='favicon-32x32.png' \
  --include='favicon.ico' \
  --include='favicon.svg' \
  --include='images/***' \
  --include='index.html' \
  --include='index.xml' \
  --include='js/***' \
  --include='pt/***' \
  --include='pt.search*' \
  --include='site.webmanifest' \
  --include='sitemap.xml' \
  --include='tags/***' \
  --exclude='*'

grep -q '2026-01' index.html
grep -q 'My Self-Hosted Journey (So Far): Or How I Learned to Stop Worrying and Love the Raspberry Pi' index.html
grep -q 'strategic discussions with my wife about how to hide the cables' 2026/01/25/my-self-hosted-journey-so-far/index.html
if grep -q 'Minha Jornada Self-Hosted' index.html; then
  exit 1
fi
if grep -q 'href=/pt/' index.html; then
  exit 1
fi
if grep -Fq 'flex flex-col lg:flex-row gap-8' layouts/index.html; then
  exit 1
fi
if grep -q '>Posts<' index.html || grep -q '>2025<' index.html || grep -q '>2026<' index.html; then
  exit 1
fi
grep -q 'hextra-language-switcher' index.html
grep -q 'hextra-theme-toggle' index.html
grep -q 'home-archive' css/compiled/main.min.*.css
grep -q 'hx:mx-auto hx:flex hextra-max-page-width' index.html
grep -q 'Home' index.html
grep -q 'About' index.html

grep -q '2026-01' pt/index.html
grep -q 'Minha Jornada Self-Hosted (Até Agora): Ou Como Aprendi a Parar de Me Preocupar e Amar Meu Raspberry Pi' pt/index.html
grep -q 'discussões estratégicas com a esposa sobre como esconder os fios' pt/2026/01/25/minha-jornada-self-hosted-ate-agora-ou-como-aprendi-a-parar-de-me-preocupar-e-amar-meu-raspberry-pi/index.html
grep -q 'Bem-vindo ao Meu Jardim Digital' pt/about/index.html
grep -q 'O Rosto Por Trás da Tela' pt/about/index.html
grep -q 'A Parte Técnica' pt/about/index.html
if grep -q 'My Self-Hosted Journey So Far' pt/index.html; then
  exit 1
fi
if grep -Fq 'flex flex-col lg:flex-row gap-8' layouts/index.html; then
  exit 1
fi

if test -f config/_default/languages.yaml; then
  exit 1
fi

for asset in \
  'css/compiled/main.min.*.css' \
  'js/main-head.min.*.js' \
  'js/main.min.*.js' \
  'en.search-data.min.*.json' \
  'pt.search-data.min.*.json'
do
  set -- $asset
  test -f "$1"
done
