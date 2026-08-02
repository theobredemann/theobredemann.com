---
title: "Building a Self-Hosted Blog: A Journey of Patience, Docker, and Coffee"
date: 2025-02-09T18:00:00Z
type: posts
tags:
  - "self-hosting"
  - "blog"
  - "en"
  - "en"
featured_image: "__GHOST_URL__/content/images/2025/02/praveen-thirumurugan-VHTVtYTNr8M-unsplash-1.jpg"
---

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

- A Raspberry Pi (I went with the 5 with 8GB RAM because why not?)
- A domain (unless you want to keep your brilliant thoughts to yourself)
- Ubuntu Server 24 LTS running on the Pi (yes, I'm an Ubuntu person)
- Internet connection (duh)
- The patience of a saint

So look, I was that person who always installed stuff straight on my computer, even though Docker kept giving me the eye. Then, with absolutely zero knowledge about websites or Docker, I went full YOLO and decided to build a website using both Docker AND Ghost. Because why not make things extra spicy?

Before we dive in, you'll need a Raspberry Pi running Ubuntu Server 24.04. You also need to SSH into it (and no, I'm not teaching you that - Google exists for a reason). Oh, and if you're still using password login instead of SSH keys... I have nothing to say to you.

Sure, you could spend the next century reading the endless Docker docs over at [Ghost's Docker Hub](https://hub.docker.com/_/ghost/). But let's be real - you're here because you want the TL;DR version, and I got you fam.

## The Adventure Begins

First things first, let's be smart about your network setup. Set a fixed IP for your device (in this case, the Raspberry Pi) in your local network. Trust me, you don't want to play "find my Pi" every time you need to access your apps. With that sorted, let's move on to the fun stuff.

### Domain & DNS Setup

I chose Cloudflare for my domain because digital security was on my study list (trying to be a responsible adult here). After some research and being super careful with pricing because, let's face it, spending money sucks, I got theobredemann.com for just 10 dollars per year. That's less than a dollar per month - even my cheap self could live with that!

The cool thing about Cloudflare? They're massive. We're talking about handling 80.9% of all websites (according to Google). So if someone hacks them, my little blog will be the least of their concerns. Plus, they offer tons of security features and have so much documentation and tutorials that you can find help for literally anything. Seriously, whatever you need, it's there.

For DNS configuration, I added two records:

- An A record for theobredemann.com pointing to my home IP (find yours at [checkip.amazonaws.com](https://checkip.amazonaws.com))
- A CNAME record for www pointing to theobredemann.com

Both with Proxied option enabled because security is cool.

Easy peasy, right? Well... maybe not. What happens when your IP changes because your router decided to take a break, or because your internet provider just loves to mess with you? Don't worry - we can handle this using Cloudflare's APIs, and of course I'll help you because I'm such a nice person.

### Automatic IP Updates

Since ISPs love to change our IPs at the most inconvenient times, we need an automatic update solution. Here's how:

- Create a Cloudflare API token (Profile -> API Tokens -> Create Token -> Edit zone DNS) with read and write permissions
- Get your Zone_ID from the domain dashboard
- Grab each DNS record ID using:

```
`curl https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records \
    -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
    -H "X-Auth-Key: $CLOUDFLARE_API_KEY"
`
```

Create an update script - Thank me in your thoughts, I kind suffered a lot to make it work:

```
`sudo nano /usr/local/bin/update_cloudflare_dns.sh

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

sudo chmod +x /usr/local/bin/update_cloudflare_dns.sh`

```

Add it to crontab to never touch it again:

```
`sudo crontab -e
*/5 * * * * /usr/local/bin/update_cloudflare_dns.sh`

```

## Docker Setup

### Directory Structure

First, let's create our workspace (I chose /srv because why not):

```
`sudo mkdir -p /srv/containers/{ghost,nginx}
sudo mkdir -p /srv/containers/ghost/{data,settings}
sudo chown $USER:$USER -R containers
`
```

### Network Security

To make potential hackers' lives a bit harder (because we're nice like that), I created separate frontend and backend networks. The backend hosts Ghost and NGINX, while the frontend only has NGINX for local configuration. Having NGINX and Ghost on the same network also makes my life easier when setting things up.

### Docker-Composes

For Ghost, it's pretty straightforward without any complicated configurations to mess with.

Since I was already playing with docker-compose, I decided to set up NGINX too. I went with NPM (NGINX Proxy Manager) because it has a nice GUI and it's way more fun to click buttons than type commands.

```
`# Custom Docker Networks
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

services:
  # NPM (NGINX Proxy Manager)
  npm:
    image: 'jc21/nginx-proxy-manager:latest'
    container_name: npm
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
      - ${WEBPORT}:${WEBPORT}
    environment:
      DB_SQLITE_FILE: "/data/database.sqlite"
      DISABLE_IPV6: 'true'

      # Security Settings
      SECURE_PROXY_SSL_HEADER: "true"
      REAL_IP_HEADER: "X-Real-IP"
      REAL_IP_RECURSIVE: "true"

      # Optimization
      WORKER_PROCESSES: "auto"
      WORKER_CONNECTIONS: "1024"
    volumes:
      - ${CONTAINER_PATH}/nginx/data:/data
      - ${CONTAINER_PATH}/nginx/letsencrypt:/etc/letsencrypt
      - ${CONTAINER_PATH}/nginx/logs:/var/log/nginx
    networks:
      - frontend
      - backend
    healthcheck:
      test: ["CMD", "/usr/bin/check-health"]
      interval: 30s
      timeout: 3s
      retries: 3

  # Ghost Blog
  ghost:
    image: 'ghost:latest'
    container_name: ghost
    restart: unless-stopped
    environment:
      # Blog URL
      url: ${BLOG_URL}

      # General configs
      NODE_ENV: 'production'

      # SQLite DB Configs
      database__client: 'sqlite3'
      database__connection__filename: '/var/lib/ghost/content/data/ghost.db'

      # Server Configs
      server__port: ${SERVER_PORT}
      server__host: ${SERVER_HOST}

      # Limits and Timeouts
      privacy__useTinfoil: true
      privacy__useUpdateCheck: true

      # Paths
      paths__contentPath: '/var/lib/ghost/content'

      # Logging
      logging__level: 'info'
      logging__rotation__enabled: true
      logging__rotation__count: 10

      # Cache Optimizations
      caching__frontend__maxAge: 3600
      caching__images__maxAge: 31536000

      # Security configs
      http__responseHeader__powered: false
      http__responseHeader__server: false
    volumes:
      - ${CONTAINER_PATH}/ghost:/var/lib/ghost/content
    networks:
      - backend

    depends_on:
      - npm`

```

### Port Configuration

Open necessary ports (assuming UFW is active and SSH is already allowed) - I recommend always using comments at it - *Pro tip: ALWAYS add comments when opening ports in UFW (assuming you have it enabled and port 22 open for SSH). Trust me, when you have a bunch of stuff running, trying to remember what each port is for becomes a nightmare. Here's how to open them*:

```
`sudo ufw allow 80/tcp comment "NGINX"
sudo ufw allow 443/tcp comment "NGINX"
sudo ufw allow 81/tcp comment "NGINX"`

```

After following all these detailed steps, just run everything:

```
`cd /srv/containers/ && docker-compose up`

```

## NGINX Configuration

Access NGINX Proxy Manager at your <ip_address:port> and let's make this thing secure:

### SSL Certificate Setup

To make your site trustworthy (and avoid those annoying security warning screens), you need an SSL certificate. I had two options: either get one from Cloudflare or use LetsEncrypt that comes with NGINX. I went with LetsEncrypt because it does everything automatically, and I was too lazy to configure Cloudflare's option manually (might switch in the future, but for now... meh, too much work).

Just keep in mind that this certificate expires every 3 months. Don't worry though - they'll send you an email to remind you to renew it.

Here's how I did it:

- Go to "SSL Certificates" -> "Add SSL certificate"
- Choose LetsEncrypt (because who has time for manual configuration?)
- Add your domain
- Select DNS challenge
- Generate and forget about it for 3 months

### Site Configuration

To make your site accessible to the outside world (and not just within my cozy little local network), I need to configure the host. In NPM, follow these steps:

In NPM, go to Hosts -> Proxy Hosts -> Add proxy host:

- Basic setup:

- Domain Names: your.domain.com
- Scheme: http
- Forward Hostname: ghost (container name)
- Enable all the fancy options (Cache assets, Block exploits, WebSocket support)

- SSL configuration:

- Select your certificate
- Enable all security options (Force SSL, HTTP/2, HSTS)

- Advanced configuration (because we're paranoid):

```
` location / {
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "upgrade-insecure-requests";

    proxy_pass $forward_scheme://$server:$port;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}`

```

## Security Headers Explained (For The Curious)

- **X-Frame-Options**: Prevents clickjacking attacks by controlling iframe embedding
- **X-Content-Type-Options**: Stops browsers from getting creative with MIME types
- **X-XSS-Protection**: Adds extra XSS protection because we're cautious
- **Referrer-Policy**: Controls information sharing between sites
- **Content-Security-Policy**: Forces HTTPS because it's 2025, come on

## Proxy Configuration Breakdown

- **proxy_pass**: Tells traffic where to go
- **proxy_http_version**: Uses HTTP/1.1 for persistent connections
- **Various headers**: Maintains original request information and enables real-time communication

## Final Steps

Access your site's admin panel at yourdomain.com/ghost and create your admin account. Please use a strong password unless you want random internet people redecorating your blog.

After that, it's all about making it pretty - themes, colors, and whatever else floats your boat.

If you've made it this far, congratulations! You're either really determined or really bored. Either way, you now have a secure, self-hosted blog running on a Raspberry Pi. Go forth and share your wisdom with the world!

*Remember: If something breaks (and it will), there's always ChatGPT (or DeepSeek if you are Chinese / China fan) to help you debug. Because let's face it, finding blogs at 2025 is too old school.*
