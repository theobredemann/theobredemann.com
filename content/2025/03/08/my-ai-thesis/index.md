---
title: "My AI Adventure: How Bird Poop and Solar Panels Led to My Academic Breakdown"
date: 2025-03-08T00:00:00+00:00
draft: false
type: posts
tags: ["AI", "Thesis", "Solar Energy", "Anomaly Detection", "USP"]
---

# My AI Adventure: How Bird Poop and Solar Panels Led to My Academic Breakdown

*For the impatient ones, my thesis is below. But I wrote this with love so you can understand what was going through my head while writing this whole thesis. You're welcome. Ps.: It's in Brazilian Portuguese, enjoy!*

[BDTA USP - Detalhe do registro: Identificação de anomalias ofensoras à geração de usinas solares fotovoltaicas](https://bdta.abcd.usp.br/item/003227173)

## Spoiler Alert: What The Hell Was I Thinking?

As I spoiled in my previous [post](https://theobredemann.com/my-mba-journey/), my final project was about detecting anomalies in time series data collected from solar plant inverters. I chose this topic because I had access to a "good" database at the company I worked for (theoretically, but we all know how that usually turns out), plus colleagues who supposedly specialized in the subject, and an interesting use case that would surely not drive me to the brink of insanity.

Speaking of use cases, maintenance has always been the Achilles' heel for companies in this field, especially for Distributed Generation plants with relatively strict generation contracts and penalties. The Operations & Maintenance team has a massive job keeping a plant's performance optimal. Now imagine doing this across more than 50 plants – it's mind-bogglingly complex. Because apparently, one plant wasn't enough to torment these poor souls.

If I could somehow detect continuous performance degradation, I could alert someone before a specialist could spot it among the 10,000 line graphs they stare at daily. Yes, I was trying to save people from the exhilarating career of staring at graphs until their eyes bleed.

## "But Theo, Aren't Inverters Already Smart?"

"But Theo," you might say, "inverters are already smart and warn you about short circuits, derating, and other problems." (If you didn't understand any of those terms, read my thesis. Or don't. Ignorance is bliss.)

Yes, the inverters do have some built-in detection, but they're limited to electrical issues. They can't detect when bird poop is blocking your solar panels, or when a tree branch is casting a shadow, or when your panels are just having a bad day. That's where my algorithm comes in.

## The Algorithm: Page-Hinkley Test

I implemented the Page-Hinkley test, a cumulative sum control chart method for detecting changes in time series data. It's particularly good at detecting small, sustained changes that might indicate performance degradation rather than sudden failures.

The basic idea:
1. Set a threshold for acceptable performance
2. Track cumulative deviations from this threshold
3. When the cumulative deviation exceeds a certain limit, flag it as an anomaly

Simple, right? Wrong. The devil is in the details.

## Challenges Faced

### 1. Data Quality Issues
- Missing data points (inverters offline, communication errors)
- Inconsistent sampling rates
- Outliers that made no sense (negative power generation, anyone?)

### 2. Algorithm Tuning
- Choosing the right threshold
- Setting appropriate sensitivity
- Dealing with seasonal variations

### 3. Validation
- Finding experts willing to validate my approach
- Getting access to real-world data for testing
- Proving the algorithm actually worked

## The Expert Problem

I won't delve too deeply into this part, but I had terrible experiences with "experts" who seemed more interested in criticism than assistance. These people apparently got their PhDs in "Making Others Feel Inadequate."

One particularly memorable experience involved an expert who:
1. Agreed to help validate my approach
2. Spent 30 minutes telling me everything I was doing wrong
3. Offered no constructive feedback
4. Left me questioning my entire existence

Thanks, doc. Really helpful.

## Results

Despite the challenges, I managed to:
- Implement a working anomaly detection system
- Test it on real solar plant data
- Detect performance issues that traditional methods missed
- Write a thesis that might actually be useful to someone

## Lessons Learned

1. **Data is never as good as you think it will be** - Always plan for missing, inconsistent, or just plain wrong data.

2. **Experts aren't always helpful** - Sometimes the people who know the most are the least willing to share.

3. **Simple algorithms can be powerful** - You don't always need the most complex solution to solve a problem.

4. **Persistence pays off** - Even when you want to give up, keep going. The breakthrough might be just around the corner.

5. **Bird poop is a real problem for solar panels** - Who knew?

## The Thesis Itself

If you're actually interested in reading my masterpiece (or just want to see what 8 months of my life produced), you can find it here:

[BDTA USP - Identificação de anomalias ofensoras à geração de usinas solares fotovoltaicas](https://bdta.abcd.usp.br/item/003227173)

It's in Portuguese, but Google Translate is your friend. The basic gist: I developed an algorithm to detect when solar panels aren't performing as well as they should be, which can help maintenance teams identify and fix issues faster.

## Final Thoughts

Was it worth it? Absolutely. Did it drive me slightly insane? Also absolutely. Would I do it again? Ask me after I've recovered from the trauma.

The journey was brutal, but I learned an incredible amount about AI, time series analysis, solar energy, and my own limits. And hey, I now have a fancy thesis to put on my resume. If nothing else, it proves I can survive 8 months of academic torture.

So if you're thinking about doing a thesis, especially in AI, my advice is: go for it. Just be prepared for the ride. And maybe invest in some therapy sessions in advance.