---
title: "My AI Adventure: How Bird Poop and Solar Panels Led to My Academic Breakdown"
date: 2025-03-08T16:10:53Z
type: posts
tags:
  - "ai"
  - "study"
  - "en"
featured_image: "__GHOST_URL__/content/images/2025/03/patrick-tomasso-Oaqk7qqNh_c-unsplash.jpg"
---

*For the impatient ones, my thesis is below. But I wrote this with love so you can understand what was going through my head while writing this whole thesis. You're welcome. Ps.: It's in Brazilian Portuguese, enjoy! *

[

BDTA USP - Detalhe do registro: Identificação de anomalias ofensoras à geração de usinas solares fotovoltaicas

![](__GHOST_URL__/content/images/icon/faviconUSP.ico)

Detalhe do registro: Identificação de anomalias ofensoras à geração de usinas solares fotovoltaicas

![](__GHOST_URL__/content/images/thumbnail/orcid_16x16.png)

](https://bdta.abcd.usp.br/item/003227173)

## Spoiler Alert: What The Hell Was I Thinking?

As I spoiled in my previous [post](__GHOST_URL__/my-mba-journey/), my final project was about detecting anomalies in time series data collected from solar plant inverters. I chose this topic because I had access to a "good" database at the company I worked for (theoretically, but we all know how that usually turns out), plus colleagues who supposedly specialized in the subject, and an interesting use case that would surely not drive me to the brink of insanity.

Speaking of use cases, maintenance has always been the Achilles' heel for companies in this field, especially for Distributed Generation plants with relatively strict generation contracts and penalties. The Operations & Maintenance team has a massive job keeping a plant's performance optimal. Now imagine doing this across more than 50 plants – it's mind-bogglingly complex. Because apparently, one plant wasn't enough to torment these poor souls.

If I could somehow detect continuous performance degradation, I could alert someone before a specialist could spot it among the 10,000 line graphs they stare at daily. Yes, I was trying to save people from the exhilarating career of staring at graphs until their eyes bleed.

## "But Theo, Aren't Inverters Already Smart?"

"But Theo," you might say, "inverters are already smart and warn you about short circuits, derating, and other problems." (If you didn't understand any of those terms, read my thesis. Or don't. Ignorance is bliss.)

Yes, they do warn you, but how do you diagnose a plant that's losing performance without any inverter alarms? There could be various causes, such as:

- Dirty panels (common in rural areas where apparently dirt is a renewable resource)
- Cracked glass from hailstorms (Mother Nature's way of saying "nice investment, shame if something happened to it")
- Excessive bird poop (because birds have an uncanny ability to target the most expensive equipment)
- A UFO casting a shadow (hey, it could happen)
- Any number of things affecting performance that would make an engineer cry into their coffee

No, I'm not creating an algorithm that can identify each of these things specifically. I'm not a miracle worker, despite what my thesis advisor seemed to think. These are examples of issues that can cause performance loss without triggering alerts. My goal was to generate an alarm for someone to go check it out – a gain in predictive maintenance, and a loss in my sanity.

## The Road to Reality: Narrowing Down My Focus

*Buuuut* obviously I didn't arrive at this specific case without first going completely overboard thinking about a thousand and one applications, including concurrent fault detection with inverters, generation forecasting using LSTM, and other far-fetched ideas – all while knowing absolutely nothing about AI or how to build a scalable service for it. Ambition and ignorance: a match made in academic hell.

My delimitation to reach the subject I wanted was something less complex to implement, without major computational requirements (we're allergic to costs and love increasing our net margin, because heaven forbid we spend money on something useful), and something I could understand in depth. This was the topic of my first meeting with my advisor, [Jean Ponciano](https://sites.google.com/view/jeanponciano/home). As my oracle, he promptly suggested some alternatives to reach my goal, such as drift detection algorithms he used in one of his published works. From there, I took this as a tool and started developing, naively believing the worst was behind me.

![](__GHOST_URL__/content/images/2025/03/datadrift.png)

## The Technical Stuff (I'll Keep It Simple, Because Let's Face It, We're Both Tired)

Drift detection isn't new – the Page-Hinkley algorithm dates back to the 1950s and uses cumulative sum for deviation detection. There are other algorithms like ADWIN that uses time windows and compares values (I tested this one too, because apparently one algorithm wasn't enough punishment). The algorithm is relatively simple and doesn't demand great computational capacity – I could run it on an ESP32, for example, and put AI at the edge, which was a great idea for IoT hardware we developed and used at the company. Look at me, so innovative, using a 70-year-old algorithm.

The problem? It's not widely studied and has little quality academic material to serve as a bibliographic theoretical basis, but I used what I had and figured out how to understand it. Nothing like building your academic foundation on the equivalent of quicksand.

## Because One Algorithm Wasn't Painful Enough

Obviously, I wasn't satisfied with just implementing a Page-Hinkley algorithm, which already has Python libraries made. No, that would be too easy and sensible. I wanted to go further – could I use an LSTM to predict generation with 4 data series? That would be awesome. And by "awesome," I mean "a spectacular way to ensure I never sleep again."

At this point, I had:

- 2 algorithms to develop
- 1 final project
- 1 delusional dream
- 2 gray hairs (spoiler: they multiplied faster than bacteria)
- Over 100 million lines of data to play with (or be crushed by, semantics)

To make things better, I decided to write it in LaTeX, something I had never touched before, let alone had familiarity with. Because why use Word when you can spend hours debugging curly braces? If you're going to suffer, might as well go all in.

## Data Hell: Choosing My Case Study

Since I had a crapload of data, I needed to analyze which PV plant I would use as a case study. So the first step was to extract this entire mess of data, store it in a temporary database (I chose TimescaleDB in PostgreSQL because it's specific for time series and would make my life easier – narrator: it did not make his life easier), and then start discovery on the data. I narrowed it down to 3 plants and chose 1 in Bahia. Little did I know this would give me even more headaches. Because what's a thesis without a few migraines?

## Solar Panels That Generate More in Winter? What?

During the analysis of this plant, I noticed it generated more in winter than in summer. But how is that possible? Don't solar plants generate when there's sun? Has everything I learned been a lie?

Yes, and I killed myself trying to figure out why, because apparently the universe enjoys a good joke. Basically, panel performance drops above a certain temperature. And Bahia, my friend, is HOT. Like, "fry an egg on the solar panel" hot. So on very hot days, the panels exceeded the optimal operating temperature and generation began to degrade. While the irradiation graph went up, the generation went down. Well, since we're already in deep, let's keep going with this plant. It's a good use case for extreme conditions. And extreme mental suffering.

![](__GHOST_URL__/content/images/2025/03/trend_variaveis.png)

## Minimalist Variables and Maximum Headaches

The next step was choosing which variables I should use. I wanted a minimal set of variables for easy implementation. So I opted for module temperature, irradiation, and generation, with 2 of these variables coming from one piece of equipment and the other from the inverter. Because why make things simple when you can complicate them?

This meant I also had to analyze whether both pieces of equipment were working together throughout my chosen data window. Obviously, they weren't, because that would be too convenient. And additionally, the data collection time was different for each, because standardization is apparently a foreign concept. So I had to cut the historical series and normalize the timestamps so all time series were in the same step. I'm telling you, this was challenging. And it was about to get worse, because of course it was.

## The Implementation: Page-Hinkley and Its Rice Grains

After all this analysis, I moved on to implementing Page-Hinkley. Here was another challenge: defining the detector parameters, and I couldn't just guess some numbers, though at this point, throwing darts at a board seemed like a valid scientific method.

Page-Hinkley can be interpreted as a cup with someone putting rice grains in it. When the cup overflows, an alarm is generated, the cup is emptied, and the flow continues. Who knew my academic career would come down to imaginary rice?

## LSTM: Breaking My Computer and My Sanity

After Page-Hinkley, I moved on to LSTM. I was using a notebook with 16GB of RAM and an i7 processor, but the beast couldn't train and always crashed. I basically had to clean the entire Ubuntu, minimize everything, and run the training. It stayed on for 3 whole days to complete the training.

When it finished, I realized I'd forgotten to create a routine to save the trained model (hahaha... *cries in data scientist*). Well, 3 more days wasted because of this error. The results were good, but I had no idea how to implement this in production. I didn't give much importance to this training; it was just to test if the algorithm was capable of predicting generation with a certain accuracy. And to torture my poor laptop, apparently.

![](__GHOST_URL__/content/images/2025/03/predictions.png)

## The Final Rush: Proving It Actually Works (Or: The Academic Panic Attack)

With everything finished, it was time to write. The final and crucial step for the project was proving my algorithms were actually good. Just pointing out the drifts and saying they had X% accuracy wasn't worth anything for an academic project, and I had completely forgotten about this. Because planning ahead is overrated.

With few days left before submission, I desperately had to find some way to prove it. One option was to get the entire maintenance history of this plant from the client. Another way would be to show the results to experts (in this case, some people I worked with) and have them indicate that it made sense.

I opted for the second option for ease, but they didn't help me, being more concerned with other issues than the result itself. Desperately, I went for the first option and managed, with just 2 days left before project submission, to get the list of maintenance activities and the validation I needed. Indeed, the algorithm accurately anticipated problems that were detected by field teams. A miracle, if you believe in those.

## The End: Lessons Learned

All of this served as great learning – theoretical, practical, mental, and interpersonal. Some experiences I hope never to go through again, but I accomplished what I set out to do. And only lost a few years of my life expectancy in the process. Worth it? The jury's still out.

*Did you enjoy this journey through my AI thesis adventures? Let me know in the comments if you'd like to hear more about the technical details or if you've had your own academic nightmare projects! Misery loves company, after all.*
