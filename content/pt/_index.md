---
title: Bited Life
type: home
---
Um santuário digital para preservação e compartilhamento de conhecimento. Aqui você encontrará documentação técnica, reflexões pessoais e projetos interessantes.

## Posts Recentes

{{ $posts := where .Site.RegularPages "Type" "posts" }}
{{ $posts = $posts | sortBy "Date" "desc" | first 5 }}

{{ range $posts }}
- [{{ .Title }}]({{ .RelPermalink }}) - {{ .Date.Format "02 de Jan de 2006" }}
{{ end }}

[Ver todos os posts](/posts/)
