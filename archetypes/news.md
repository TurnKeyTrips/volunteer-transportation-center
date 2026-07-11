---
title: "{{ replace .Name "-" " " | title }}"
date: {{ time.Now.Format "2006-01-02" }}          # publish date (shows as "Posted")
event_date: {{ time.Now.Format "2006-01-02" }}    # when the event happens/happened
summary: ""               # one-sentence teaser shown on the news list cards
photos: []                # e.g. /images/news/my-event/photo-1.jpg (files go in assets/images/news/my-event/)
google_photos_album: ""   # optional link to a full album on Google Photos
flyer: ""                 # optional PDF, e.g. /files/flyers/my-event.pdf (file goes in static/files/flyers/)
draft: false
---

<!-- Write-up prompts: What happened? Who came? Any thank-yous? Results or totals? -->
