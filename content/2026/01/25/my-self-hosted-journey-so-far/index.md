---
title: "My Self-Hosted Journey So Far"
date: 2026-01-25T00:00:00+00:00
draft: false
type: posts
tags: ["Self-Hosted", "Homelab", "Raspberry Pi", "NAS", "Docker"]
---

# My Self-Hosted Journey So Far

Continuing the self-hosted saga, I believe I have now found the minimum services I need for the present. After many conversations with AI, reading StackOverflow topics (yes, I'm old), discussions on Reddit, and posts on Medium, I've managed to develop good skills in various fields. Oh, and I can't forget to mention that this hobby is expensive, requires patience, and involves strategic discussions with my wife about how to hide the cables that now occupy the rack in our living room.

## The Security Dilemma

My main concern has always been keeping the things I need secure, and this is where I've spent most of my time studying, trying, and making mistakes (lots of mistakes). My internal yin-yang was whether to keep services exposed to the internet or only on my local network. The second option meant setting up a VPN to access everything I needed, which added another layer of complexity that I wasn't sure I wanted to deal with.

## Hardware Investments

Since my first post about self-hosting, I've made some hardware investments. I bought a semi-managed switch to separate some local networks, to separate all the paraphernalia I have between IoT, "smart devices", computers, servers, etc.

The second item I bought was a small form factor HP desktop (HP EliteDesk G4 SFF) to be my cloud (NAS), hosting services like NextCloud, Immich, Jellyfin, and running TrueNas. For my Raspberry Pi, I kept this website, my network filtering service, a VPN, a Grafana instance for my side projects, a search engine (why not?), an MQTT broker, and my HTTPS server to access all of this, all in Docker containers to avoid polluting the Raspberry Pi's operating system.

## Security: To Expose or Not to Expose?

I first tried keeping some things exposed, but it was very difficult to sleep peacefully. Always thinking that some colored hat would test my configurations (which, let's admit, weren't made by a professional). Even when I kept the applications exposed, I learned a bit more about security.

### The VPN Solution

I decided that the VPN approach was the way to go. This way, I can access all my services securely without exposing them directly to the internet. I set up WireGuard, which is fast, modern, and relatively easy to configure.

Benefits of this approach:
- No services directly exposed to the internet
- All traffic encrypted
- Access from anywhere with internet
- Better sleep at night

Drawbacks:
- Need to connect to VPN to access services
- Slightly more complex setup
- Potential performance overhead

### VPN Configuration

Setting up WireGuard was relatively straightforward:

1. Install WireGuard on your server
2. Generate keys for server and clients
3. Configure the server with allowed IPs
4. Create client configurations
5. Set up firewall rules

The result is a secure connection that lets me access all my self-hosted services as if I were on my local network.

## Service Breakdown

Here's what I'm currently running and why:

### On the HP EliteDesk (NAS)

- **TrueNas** - Operating system with built-in NAS features
- **NextCloud** - File storage, synchronization, and sharing
- **Immich** - Photo backup and management (Google Photos alternative)
- **Jellyfin** - Media streaming (Plex/Emby alternative)
- **Transmission** - Torrent client
- **Sonarr/Radarr** - Media management

### On the Raspberry Pi

- **This website** - Ghost blogging platform
- **Pi-hole** - Network-wide ad blocking and DNS filtering
- **WireGuard** - VPN server
- **Grafana** - Monitoring and visualization for my side projects
- **Meilisearch** - Search engine for my personal data
- **Mosquitto** - MQTT broker for IoT
- **Nginx** - Reverse proxy and HTTPS server

## Network Setup

### Physical Network

- **Main router** - Handles internet connection and basic routing
- **Semi-managed switch** - Separates different types of traffic
- **VLANs** - Different networks for IoT, servers, computers, etc.

### Logical Network

- **Main network** - For regular devices (computers, phones, etc.)
- **Server network** - For my self-hosted services
- **IoT network** - For smart devices and IoT gadgets
- **Guest network** - For visitors

This separation helps with security and performance. IoT devices can't access my servers, and servers aren't exposed to the main network.

## Challenges Faced

### 1. Power Consumption

Running multiple servers 24/7 consumes electricity. I've tried to optimize:
- Using energy-efficient hardware
- Implementing sleep modes where possible
- Monitoring power usage

### 2. Noise

The HP EliteDesk is relatively quiet, but it's still noticeable. I've placed it in a location where the noise isn't too bothersome.

### 3. Heat

Both the Raspberry Pi and the HP EliteDesk generate heat. Proper ventilation is essential, especially in the summer.

### 4. Backups

With so much important data self-hosted, backups are crucial. My current setup:
- Regular backups to external drives
- Offsite backups to a friend's house
- Cloud backups for critical data

### 5. Maintenance

Self-hosting requires regular maintenance:
- Software updates
- Security patches
- Monitoring
- Troubleshooting

## Lessons Learned

### 1. Start Small

Don't try to self-host everything at once. Start with one or two services and expand as you gain confidence and experience.

### 2. Documentation is Key

Document everything:
- Configuration details
- Setup instructions
- Troubleshooting steps
- Recovery procedures

You will forget how you set things up. Trust me.

### 3. Backups are Non-Negotiable

If your data isn't backed up, it doesn't exist. Test your backups regularly.

### 4. Security First

Always prioritize security:
- Keep software updated
- Use strong passwords
- Implement proper network segmentation
- Monitor for suspicious activity

### 5. Expect Problems

Things will break. Services will stop working. You will lose data. Expect it and be prepared.

### 6. The Wife Factor

If you're married or in a serious relationship, involve your partner in the process. Explain what you're doing, why it's important, and how it affects them. Strategic discussions about cable management and noise levels are essential.

## Cost Analysis

Self-hosting isn't free. Here's a breakdown of my costs:

### Initial Investment

- Raspberry Pi 5 (8GB): ~$80
- HP EliteDesk G4 SFF: ~$200 (used)
- Semi-managed switch: ~$100
- External hard drives: ~$300
- UPS (Uninterruptible Power Supply): ~$150

Total: ~$830

### Ongoing Costs

- Electricity: ~$20/month
- Domain name: ~$10/year
- Occasional hardware replacements: ~$100/year

Total: ~$350/year

### Savings

By self-hosting, I've avoided:
- Cloud storage subscriptions: ~$100/year
- Media streaming services: ~$200/year
- Various SaaS subscriptions: ~$300/year

Total savings: ~$600/year

So while there are upfront costs, the long-term savings can be significant.

## The Future

My self-hosted journey is far from over. Some things I'm planning for the future:

### 1. Expand Storage

I'm running out of storage space. I'm considering:
- Adding more hard drives
- Implementing a proper RAID setup
- Exploring object storage options

### 2. Improve Redundancy

Currently, my redundancy is limited. I want to:
- Set up proper RAID for critical data
- Implement automated backups
- Add more offsite backup locations

### 3. Add More Services

Some services I'm considering adding:
- **Vaultwarden** - Self-hosted password manager
- **Bookstack** - Wiki and documentation
- **Calibre** - E-book management
- **Home Assistant** - Home automation

### 4. Improve Monitoring

Better monitoring of:
- Service health
- Performance metrics
- Security events
- Resource usage

### 5. Upgrade Hardware

As my needs grow, I may need to:
- Upgrade the HP EliteDesk
- Add more Raspberry Pis
- Invest in better networking equipment

## Conclusion

My self-hosted journey has been challenging, educational, and rewarding. I've learned a tremendous amount about technology, networking, security, and even patience. I've gained complete control over my digital life and the data that's important to me.

But it's not all sunshine and rainbows. Self-hosting requires time, money, and effort. It's not for everyone. But for those willing to put in the work, the rewards can be substantial.

If you're thinking about starting your own self-hosted journey, my advice is: start small, learn as you go, and don't be afraid to ask for help. The self-hosting community is incredibly supportive and knowledgeable.

And remember: the goal isn't to self-host everything. The goal is to self-host the things that are important to you, in a way that works for your situation and lifestyle.

Happy self-hosting!