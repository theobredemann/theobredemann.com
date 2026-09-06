---
title: "Solar Plant Problem Detection: Why One Model Was Not Enough"
date: 2026-09-06T12:00:00Z
type: posts
tags:
  - "en"
  - "ai"
  - "solar-energy"
  - "machine-learning"
---

Solar plants look straightforward until you try to decide whether something is actually wrong. Generation falls: is it a cloud, high module temperature, dirt, a struggling inverter, a bad sensor, or a genuine fault? If the answer is simply “power is lower,” then every cloudy afternoon becomes an emergency. Nobody wants that dashboard.

This is why I returned to a subject that caused a respectable amount of suffering during my AI thesis: detecting underperformance in solar plants. This time, instead of trying to make one algorithm carry the entire project on its back, I built a small workflow where each model has one clear job.

The complete notebook project is available on [GitHub](https://github.com/theobredemann/solar-plant-problem-detection).

## Start with normal, not with failure

The first task was almost boring, which is exactly why it mattered. Before predicting anything, I checked whether the data behaved like solar data should. The Plant 1 measurements have no null values in the loaded columns, high timestamp completeness, and a very clear daily cycle: no meaningful generation at night, a morning ramp, a midday peak, and a decline in the evening.

That sounds obvious, but it changes the whole problem. A low value at midnight is not an anomaly. A low value while irradiation is high might be. In other words, raw power is not the signal; **power compared with the conditions** is the signal.

## One plant, two useful viewpoints

I modelled the data at two levels.

At **plant level**, inverter output is summed by timestamp. This answers the big operational question: *is the site producing what we would expect right now?* It is useful for a health dashboard, broad underperformance, and site-wide issues.

At **inverter level**, each source keeps its own history. This asks a more precise question: *which inverter-like source is behaving differently?* A plant can look reasonable in total while one device is quietly losing performance. Aggregating too early would hide that clue.

The point is not to choose one level forever. Plant-level monitoring tells us that something deserves attention; inverter-level diagnostics help us find where to look.

## The minimum bar: beat the obvious answer

Every model was compared with a naive baseline: predict that the next value will be the same as the last one. It is not glamorous, but it is honest. If a complex model cannot beat that rule, it has not earned the maintenance cost that comes with it.

The main metric is WAPE. Read it as the share of total generated energy that the model missed: **closer to zero is better**. A WAPE of `0.038` means the accumulated prediction error is about 3.8% of actual generation; `0.192` means about 19.2%. It is not a probability or a grade. It is simply a practical error ratio that remains sensible when solar production approaches zero at night.

## LSTM: useful memory, heavier machinery

An LSTM is a neural network that reads a sequence instead of a single row. Here it sees the previous 96 fifteen-minute observations — roughly one day — and learns whether production is ramping up, peaking, or fading away.

For individual inverters, the LSTM reached WAPE **0.225**, better than the naive baseline at **0.312**. That is useful, especially because the notebook can show which inverters and which times of day produce the largest errors.

At plant level, the LSTM also improved on the baseline: **0.274** versus **0.303**. So temporal memory clearly helps. But it is heavier to train, needs carefully continuous windows and scaling, and loses to models that can see the current weather directly.

That is not a defeat for the LSTM. It tells us where it belongs: a sequence benchmark and a diagnostic tool, rather than the default real-time estimator.

## Tree models: the practical winner for nowcasting

LightGBM and XGBoost work differently. Instead of carrying a long sequence in memory, they combine many small decisions: is irradiation high? is it midday? was production rising a few minutes ago? is module temperature unusually high?

With current weather available, this is a very good fit for solar generation. At inverter level, LightGBM reached WAPE **0.055** and XGBoost **0.062**, against **0.202** for the naive baseline. At plant level, LightGBM reached **0.038** and XGBoost **0.039**, while the naive baseline was **0.192**.

Those numbers make the decision reasonably clear: for estimating expected generation in the current moment, the tree models are the strongest and simplest option in this project.

There is one important caveat. This is **weather-conditioned nowcasting**, not pure future forecasting. The model uses current irradiation and temperature, which is perfect for monitoring. Predicting several hours ahead would require a weather forecast, or features that exist only in the past.

## Turning a prediction gap into a useful alert

Even a good expected-generation model should not send an alert for every small miss. Clouds move, sensors fluctuate, and solar generation is not a perfectly smooth machine.

For that step, I used Page-Hinkley, a lightweight change detector from the wonderfully non-fashionable world of old statistics. It watches a single degradation score:

```text
degradation_score = max(expected generation - actual generation, 0)
```

If the plant produces more than expected, the score is zero. If it repeatedly produces less, the score rises. Page-Hinkley looks for that persistent change instead of panicking over every isolated spike.

On the test period, it produced nine alerts. The largest was on 2020-06-14 at 13:45, with a degradation score of about 23,356. The alerts are saved as timestamps with a severity level, which means they can be inspected rather than admired in a chart and forgotten.

Can it be used? Yes — as an investigation trigger. It can tell an operator, “this period is unusual enough to inspect.” It cannot prove that an inverter failed. The data does not include labelled maintenance events, so there is no honest way to claim a false-positive rate or fault-detection accuracy yet. That validation needs field feedback.

## What I would actually use

If I were putting this into a real monitoring flow, I would start with plant-level LightGBM or XGBoost to estimate what the site should be producing. When the residual becomes meaningful, I would check inverter-level tree residuals to locate the likely source. Page-Hinkley would surface persistent gaps so they do not disappear inside thousands of ordinary readings.

The LSTMs would remain in the toolbox: useful for sequence analysis, diagnostics, and understanding how much history matters. They just would not be the first component I would deploy for this sensor-rich, current-weather use case.

The lesson was not that one model “won.” The useful result is the chain of reasoning:

```text
current weather + recent generation
        -> expected generation
        -> actual versus expected gap
        -> persistent-gap alert
        -> plant context + inverter investigation
```

That is far more useful than a fancy model predicting the next number in a spreadsheet. It gives a human being a reason to look in the right place.
