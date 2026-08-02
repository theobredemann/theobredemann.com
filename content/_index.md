---
title: Bited Life
type: home
---
A digital sanctuary for knowledge preservation and sharing. Here you'll find technical documentation, personal reflections, and interesting projects.

## Recent Posts

{{ $posts := where .Site.RegularPages "Type" "posts" }}
{{ $posts = $posts | sortBy "Date" "desc" | first 5 }}

{{ range $posts }}
- [{{ .Title }}]({{ .RelPermalink }}) - {{ .Date.Format "Jan 2, 2006" }}
{{ end }}

[View all posts](/posts/)
