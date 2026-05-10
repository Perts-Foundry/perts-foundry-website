---
title: "{{ replace .File.ContentBaseName `-` ` ` | title }}"
date: {{ .Date }}
publishDate: {{ .Date }} # Set to a future date (YYYY-MM-DD) to schedule publication; keep `date` and `publishDate` aligned so the displayed date matches go-live
draft: true
description: ""
slug: "{{ .File.ContentBaseName }}"
tags: []
---
