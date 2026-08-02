---
title: "My Self-Hosted Journey (So Far): Or How I Learned to Stop Worrying and Love the Raspberry Pi"
date: 2026-01-25T12:30:14Z
type: posts
tags:
  - "en"
  - "self-hosting"
featured_image: "__GHOST_URL__/content/images/2026/01/selfhosted-art.webp"
---

Continuing the self-hosted saga, I think I've finally landed on the minimum set of services I need for now. After countless conversations with AI, diving deep into StackOverflow threads (yes, I'm old school), Reddit debates, and Medium posts, I've developed some solid skills across various domains. Oh, and I can't forget to mention that this hobby is expensive, demands patience, and involves strategic discussions with my wife about hiding the cables that now occupy our living room.

My main concern has always been keeping the things I need secure, and this is where I've spent most of my time studying, experimenting, and failing spectacularly. My internal Yin-Yang debate was whether to keep services exposed to the internet or locked down to my local network. The second option meant setting up a VPN to access everything I needed, which added another layer of complexity I wasn't sure I wanted to deal with.

## The Security Rabbit Hole

I initially tried exposing some services, but sleeping peacefully became impossible. I kept imagining some colorful-hat hacker testing my configurations (which, let's be honest, weren't exactly crafted by a professional). Even while keeping applications exposed, I learned quite a bit about Cloudflare, configuring access filters by country (which doesn't really make sense since anyone with a VPN could bypass it), using Cloudflare's Zero-Trust and 2FA, and half a dozen other configurations.

At first, it seemed secure enough. I configured SMTP email sending with my MailGun account for 2FA, set up Zero-Trust and some filters, but for all of this to work, I still needed to bypass my firewall to access the applications. That felt like a potential point of failure. After extensive research, I decided to keep most of my applications local with VPN access, and only one that I share with my family exposed to the internet but with various security filters and configurations. Mainly because I need time to explain to them how a VPN works without their eyes glazing over.

Having said that, let's see what I've built.

## Hardware Investments

Since my first post about self-hosting, I've made some hardware investments. I bought a semi-manageable switch to separate some local networks, organizing all the paraphernalia I have between IoT devices, "smart" gadgets, computers, servers, and so on. The second item was an HP EliteDesk G4 SFF desktop to serve as my cloud (NAS), hosting services like NextCloud, Immich, Jellyfin and running TrueNAS.

For my Raspberry Pi, I maintained this website, my network filtering service, a VPN, a Grafana instance for my side projects, a search engine (why not?), an MQTT broker, and my HTTPS server to access all of this. Everything runs in Docker containers to avoid polluting the Raspberry Pi's operating system.

Currently, the setup looks like this:

## The Raspberry Pi Stack

### Ghost

I've already posted about it, check it out here: [Building a Self-Hosted Blog: A Journey of Patience, Docker, and Coffee](__GHOST_URL__/building-a-self-hosted-blog/)

### PiHole + Unbound: Taking Back My DNS

The main headache was setting up network filtering and a recursive DNS resolver. I wanted to implement this to prevent my network queries from going to my internet provider and other companies like Google, who monetize this data. It might seem crazy, but if someone's making money from what I generate, I want to be compensated too. Otherwise, I'll do it myself because today it's actually possible.

I chose [Unbound](https://github.com/NLnetLabs/unbound) as my resolver. The idea is that all requests go through it, return the IP, and keep everything private, including DNS-Over-HTTPS (DoH). Configuring this in Docker on a Raspberry Pi was hell. I had to learn to mess with Linux network configurations like `/etc/hosts` and `/etc/resolv.conf`, traffic forwarding through the router, port opening, and a dozen other details because everything was running in Docker.

With Unbound configured, I set up [PiHole](https://github.com/pi-hole/pi-hole), which is my network filter. It's an incredible program where I can add various blocklists and remove, at the network level, all ads, trackers, malicious sites, and a bunch of other garbage. Additionally, I use it as my DHCP server to have more control over each device on my network, assigning fixed IPs and not relying solely on the internet company's router. Through it, I also configure my local addresses to access everything.

![](__GHOST_URL__/content/images/2026/01/817-378.png)

### VPN: The Gateway Home

One of my questions was how I could maintain access to things on my local network even when away from home. The solution was a VPN, but this VPN had to have applications for iOS, Android, macOS, and Windows so everyone in my family could access it, including me.

I chose to configure [Wireguard](https://www.wireguard.com) because it's open source and the foundation for several other VPNs, plus it has applications for almost all platforms. One of the things I liked most, even though the app is quite simple, is the On-Demand activation feature, which automatically activates when I leave my local network and deactivates when I get home. It was pretty straightforward to configure and use.

But because I wanted to complicate my life, I tried using [NetBird](https://github.com/netbirdio/netbird) as a VPN, which allowed me much greater control over access to my resources, with various configurations and tricks. I kept it running for a month in place of Wireguard, but found it too much work to maintain and configure, so I deactivated it for being overkill for what I needed. One of the main negatives was the iOS app constantly disconnecting and being very buggy. I never knew if I was connected or not, and it didn't have the on-demand connection option (which I think is basic). I think when I scale up my home setup more, I'll need to revisit this point, but for now, I've left it inactive.

### HTTPS Server: From NPM to Caddy

Finishing this tedious networking part, to provide access to services, I started with [NGINX Proxy Manager](https://github.com/NginxProxyManager/nginx-proxy-manager). It's an excellent service, good UI, very simple to configure, and I used it for several good months. When I tried using NetBird, I ran into some difficulties with NPM in redirecting services in gRPC and other newer protocols. I believe the difficulty was due to limited knowledge, but even with AI I couldn't solve it.

The solution was to move to another newer service, equally robust and open source: [Caddy](https://github.com/caddyserver/caddy). Unlike NPM, it doesn't have a UI, and all configuration is done in a file called Caddyfile. Obviously, I had a learning curve, but it's a very friendly and easy-to-configure file. Plus, it's written in Go and is basically forgettable because it's so stable. With it, I managed to configure everything I needed and even version each change I made in GitHub. It's thanks to Caddy that you can read this text right now.

### Private Search Engine: SearXNG

If I was already digging deep into privacy, I think what generates the most data is what we search for on Google. With each search we do, we feed their model of our interests, and this turns into ads, commerce, and so on. For a while, I used some other private search engines like Brave Search and DuckDuckGo, but reading some blogs I discovered [SearXNG](https://github.com/searxng/searxng), which I could also self-host. I found it incredible and decided to test it.

It has tons of settings related to content search, cookie configurations, and things I don't even know how to use yet. It works perfectly well, but there's an important point: I don't want to leave this public for anyone to use my search engine, with the danger of bringing down everything I have due to high demand. Oh, there's another important point: Safari doesn't let you use custom search engines, only if you use it in the new window configuration, which partially solves it. So I only use it locally and in Firefox.

I confess that it's often underutilized, but it's cool to have.

![](__GHOST_URL__/content/images/2026/01/Preferences.png)

### Grafana & MQTT Broker: Observability for Nerds

Since I wanted to venture into observability and also have a data visualization tool, I deployed [Grafana](https://github.com/grafana/grafana) with Prometheus to test my IoT projects and have more visualization of my Raspberry Pi's state, like CPU usage, memory, disk, generate alerts, and free my mind from small worries. I had used Grafana before, but hadn't gone so deep into configurations, alert rules, integrations, and other facilities the tool offers.

One of the things I'm analyzing now is the temperature and humidity of my apartment, correlating the effort my gas heater has to make to reach a comfortable temperature. These wall-mounted grid heaters are horrible, they use a lot of gas and take over 6 hours to heat the apartment by 2 degrees. So my next dream is to have a split AC in the apartment.

This project is an ESP32, connected to my self-hosted [Mosquitto](https://github.com/eclipse-mosquitto/mosquitto) broker, sending data from a DHT22. The project is in MicroPython to test how far I can create something with one of the least performant languages on limited hardware.

![](__GHOST_URL__/content/images/2026/01/Pasted-Graphic-2.png)

## The NAS: Where the Magic Happens

### NextCloud: My Personal Cloud Empire

I've always been a jumper between iOS and Android, and the most complicated thing was managing data between them. Beyond that, I had all my discomfort with my files on Google Drive, the terrible file management that iCloud has, and even the bugs in Proton Drive. After a few months in self-hosted forums, I read about [NextCloud](https://nextcloud.com/home-users/). It's a perfect cloud, with everything Google Drive offers, free, open source, and that I could include in my universe of applications.

I can't say how amazed I was with this and it was the first application I wanted to put on my NAS. It has Office, online and collaborative document editing, calendar, contacts, notes, all private, in one place. Do you realize how valuable this is? It also has applications for all platforms to do automatic backup and it's the application I share with my family.

Although it's already configured, with some test files I uploaded, I'm not using it 100% because the disk on my NAS is an old notebook disk I had. I want to set up a RAID-1 initially, and I want to start with 8TB disks. The problem is that AI is eating up all the hardware in the world and a disk like that is almost €300, and I'm postponing the purchase.

Well, even without the ideal disk, it's stable, with fast access and without corrupting any files. Obviously, I have backups of the data that's here.

![](__GHOST_URL__/content/images/2026/01/-e.png)

### Immich: Reclaiming My Photos

Well, what else besides files do we give as free information to train Big Tech AI? Our photos, obviously. And then I thought: well, NextCloud already has a photos section and I can use it. I tested it for a while and didn't like it. I wanted something that had a bit more intelligence and that I could manage my photos with more freedom.

So I researched and discovered [Immich](https://github.com/immich-app/immich), another magical and absurdly incredible application that's identical to Google Photos, private, and still has offline machine learning to identify people and organize photos. Everything Google Photos has, Immich has, being free. It has a map that organizes photos from each location by geolocation, duplicate removal, large file reviewer, album sharing, applications for all platforms. It's incredible and I can finally have my private, cross-platform place for my photos.

Obviously, just like NextCloud, I'm without my disk and still maintain photos on iCloud and Immich.

![](__GHOST_URL__/content/images/2026/01/E-ERE-EEEEELE.png)

### Jellyfin: The Netflix Replacement (Work in Progress)

The last application I installed and am still learning to use is [Jellyfin](https://github.com/jellyfin/jellyfin). The idea is to replace Netflix with it, especially because €23 per month is very overkill for what my wife and I consume on Netflix.

It's empty for now. I'm still reading the documentation to learn how to configure and use it, and it's also hanging on that single disk in the NAS that I don't want to stress anymore.

![](__GHOST_URL__/content/images/2026/01/Pasted-Graphic-5.png)

## Final Thoughts

The self-hosted world has opened my eyes to how much we don't know about the internet and how many incredible things are available for free, being maintained by people who use their time to contribute so these projects happen. The open-source community is incredible and whenever possible I contribute to projects as a way to encourage them and ensure this continues for a long time.

It wasn't easy to get to this level. I had to read a lot, learned a lot, and each day I sink deeper into my homelab and what else I can have without depending on Big Tech, relying only on my knowledge, curiosity, and community. Obviously, having this at home greatly reduces the convenience of having Google's infrastructure, or the worry that your data might disappear if you mess something up, but that's what drives me.

More updates coming soon.
