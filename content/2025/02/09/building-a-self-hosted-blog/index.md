---
title: "Building a Self-Hosted Blog: A Journey of Patience, Docker, and Coffee"
date: 2025-02-09T00:00:00+00:00
draft: false
type: posts
section: posts
tags: ["Self-Hosted", "Docker", "Blog", "Ghost", "Raspberry Pi"]
---

# Building a Self-Hosted Blog: A Journey of Patience, Docker, and Coffee

## The Why

Recently, I felt the urge to share my knowledge with others, but I wasn't sure how. Being someone who avoids social media like the plague and has a natural aversion to cameras (seriously, who enjoys seeing themselves on video?), I opted for the written format.

## The What

Once I decided on text, I dove into research. Holy cow, there were too many options! My first filter was simple: it had to be free because this is a hobby, not a money-making scheme (and let's be honest, Portuguese salaries aren't exactly breaking records).

When I first arrived in Portugal, spending three months without my wife, I needed something to keep my mind occupied. I discovered the wonderful world of self-hosted solutions - a way to have complete control over technology, run it on cheap hardware, and improve my IT skills in networking, programming, and most importantly, patience.

## The Decision

With filters set to text-based, open-source, and self-hosted, the options narrowed significantly. After countless YouTube videos (my browser history was a mess), it came down to WordPress vs. Ghost. Both could run on a Raspberry Pi 5, but being a complete website noob, I chose the simpler option: Ghost.

For those curious, Ghost is an open-source project similar to WordPress, offering monetization options and easy configurations (perfect for a frontend-challenged person like me who considers UI a dark art). Check out [Ghost's website](https://ghost.org/) if you want to dive deeper.

## The Requirements

Before we dive into the hell that awaits (involving Docker, certificates, networking, nginx, and hours of chair-warming), here's what you'll need:

1. A Raspberry Pi (I went with the 5 with 8GB RAM because why not?)
2. A domain (unless you want to keep your brilliant thoughts to yourself)
3. Ubuntu Server 24 LTS running on the Pi (yes, I'm an Ubuntu person)
4. Internet connection (duh)
5. The patience of a saint

So look, I was that person who always installed stuff straight on my computer, even though Docker kept giving me the eye. Then, with absolutely zero knowledge about websites or Docker, I went full YOLO and decided to build a website using both Docker AND Ghost. Because why not make things extra spicy?

Before we dive in, you'll need a Raspberry Pi running Ubuntu Server 24.04. You also need to SSH into it (and no, I'm not teaching you that - Google exists for a reason). Oh, and if you're still using password login instead of SSH keys... I have nothing to say to you.

Sure, you could spend the next century reading the endless Docker docs over at [Ghost's Docker Hub](https://hub.docker.com/_/ghost/). But let's be real - you're here because you want the TL;DR version, and I got you fam.

## The Adventure Begins

First things first, let's be smart about your network setup. Set a fixed IP for your device (in this case, the Raspberry Pi) in your local network. Trust me, you don't want to play "find my Pi" every time you need to access your apps. With that sorted, let's move on to the fun stuff.

### Domain & DNS Setup

I chose Cloudflare for my domain because digital security was on my study list (trying to be a responsible adult here). After some research and being super careful with pricing because, let's face it, spending money sucks, I got theobredemann.com for just 10 dollars per year. That's less than a dollar per month - even my cheap self could live with that!

The cool thing about Cloudflare? They're massive. We're talking about handling 80.9% of all websites (according to Google). So if someone hacks them, my little blog will be the least of their concerns. Plus, they offer tons of security features and have so much documentation and tutorials that you can find help for literally anything. Seriously, whatever you need, it's there.

For DNS configuration, I added two records:

1. An A record for theobredemann.com pointing to my home IP (find yours at [checkip.amazonaws.com](https://checkip.amazonaws.com))
2. A CNAME record for www pointing to theobredemann.com

Both with Proxied option enabled because security is cool.

Easy peasy, right? Well... maybe not. What happens when your IP changes because your router decided to take a break, or because your internet provider just loves to mess with you? Don't worry - we can handle this using Cloudflare's APIs, and of course I'll help you because I'm such a nice person.

### Automatic IP Updates

Since ISPs love to change our IPs at the most inconvenient times, we need an automatic update solution. Here's how:

1. Create a Cloudflare API token (Profile -> API Tokens -> Create Token -> Edit zone DNS) with read and write permissions
2. Get your Zone_ID from the domain dashboard
3. Grab each DNS record ID using:

```bash
curl https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records \
    -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
    -H "X-Auth-Key: $CLOUDFLARE_API_KEY"
```

Create an update script - Thank me in your thoughts, I kind suffered a lot to make it work:

```bash
sudo nano /usr/local/bin/update_cloudflare_dns.sh

#!/bin/bash

# Cloudflare API configuration
AUTH_TOKEN="your_token"
ZONE_ID="your_zone_id"

# DNS Records to update - add your records here
declare -A DNS_RECORDS=(
    ["dummy.com"]="blablablabla"
)

# Get current public IP
CURRENT_IP=$(curl -s -X GET https://checkip.amazonaws.com)

# Update each DNS record
for DOMAIN in "${!DNS_RECORDS[@]}"; do
    RECORD_ID="${DNS_RECORDS[$DOMAIN]}"

    curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
         -H "Authorization: Bearer $AUTH_TOKEN" \
         -H "Content-Type: application/json" \
         -d "{
              \"type\":\"A\",
              \"name\":\"$DOMAIN\",
              \"content\":\"$CURRENT_IP\",
              \"ttl\":1,
              \"proxied\":true
            }"

    echo "$(date): Updated $DOMAIN to $CURRENT_IP" >> /var/log/cloudflare_update.log
done

sudo chmod +x /usr/local/bin/update_cloudflare_dns.sh
```

Add it to crontab to never touch it again:

```bash
sudo crontab -e
*/5 * * * * /usr/local/bin/update_cloudflare_dns.sh
```

## Docker Setup

### Directory Structure

First, let's create our workspace (I chose /srv because why not):

```bash
sudo mkdir -p /srv/containers/{ghost,nginx}
sudo mkdir -p /srv/containers/ghost/{data,settings}
sudo chown $USER:$USER -R containers
```

### Network Security

To make potential hackers' lives a bit harder (because we're nice like that), I created separate frontend and backend networks. The backend hosts Ghost and NGINX, while the frontend only has NGINX for local configuration. Having NGINX and Ghost on the same network also makes my life easier when setting things up.

### Docker-Composes

For Ghost, it's pretty straightforward without any complicated configurations to mess with.

Since I was already playing with docker-compose, I decided to set up NGINX too. I went with NPM (NGINX Proxy Manager) because it has a nice GUI and it's way more fun to click buttons than type commands.