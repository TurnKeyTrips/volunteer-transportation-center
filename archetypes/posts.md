---
title: "{{ replace .Name "-" " " | title }}"
date: {{ time.Now.Format "2006-01-02" }}          # publish date (shows as "Posted")
event_date: ""            # optional — when the event happens/happened; leave empty if not about an event
summary: ""               # one-sentence teaser shown on the post list cards
photos: []                # e.g. /images/posts/my-event/photo-1.jpg (files go in assets/images/posts/my-event/)
google_photos_album: ""   # optional link to a full album on Google Photos
attachments: []           # optional PDF download buttons (files go in static/files/flyers/), e.g.:
                          #   - label: Download printable flyer
                          #     file: /files/flyers/my-event.pdf
carousel: true            # false hides the post from the home page carousel
draft: false
---

<!-- Write-up prompts: What happened? Who came? Any thank-yous? Results or totals? -->
