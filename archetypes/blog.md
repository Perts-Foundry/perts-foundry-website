---
title: "{{ replace .File.ContentBaseName `-` ` ` | title }}"
date: {{ .Date }}
publishDate: {{ .Date }} # Set to a future date to schedule publication
draft: true
description: ""
slug: "{{ .File.ContentBaseName }}"
tags: []
showDate: false
---
