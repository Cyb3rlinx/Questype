# Scoring specification — 1.0

These are designed narrative signals, not a psychometrically validated instrument. Alignment percentages are shares within this model, not certainty, medical findings, or population percentiles.

## Inputs and trust

The engine accepts canonical versioned content and `{scene_id, choice_id}` answers. It rejects duplicate scenes, unknown choices, choices belonging to another scene, non-prefix answer sequences, and incomplete final profiles. It never accepts client-supplied weights. Partial scoring is available for internal analysis only. Identity and gender are absent from the scoring function signature.

The scene order, registry order, normalization temperature, content calibration and shadow matrix are versioned. No clocks or randomness enter production scoring. Randomness is used only in a seeded test simulator.

## Raw scores

For scene s, chosen option c(s), group g and key k, let w(s,c,g,k) be the integer effect, defaulting to 0. Then:

`R[g,k] = sum_s w(s,c(s),g,k)`.

All registered keys appear, including zero-evidence keys. The five groups are `archetypes`, `motivations`, `decision_styles`, `shadow`, `traits`. Additional trait dimensions need data, not new schema fields. Values are finite bounded integers. Registry validation rejects unknown keys in closed groups and undeclared traits in released content.

## Opportunity calibration

Raw scores are affected by how often writers offer a signal. For each archetype k, use all options in the exact content release to compute a uniform-choice mechanical baseline:

`mu[k] = sum_s mean_c(w[s,c,k])`

`variance[k] = sum_s mean_c((w[s,c,k] - mean_c(w[s,c,k]))^2)`

`z[k] = (R[k] - mu[k]) / sqrt(variance[k])`.

This assumes independent, equally likely choices only for mechanical calibration; it is not an assumption about real people. A zero-variance archetype invalidates released content. All fifteen scenes are used for final calibration; partial internal scoring calibrates only answered scenes. Preserve raw score, calibrated score, and percentage separately. A lower raw score can outrank a higher raw score when opportunities differ, so the UI must never describe raw points as the ranking criterion.

## Normalization and exact sum

Use stable softmax with temperature T=1.0:

`m = max_k z[k]`

`p[k] = exp((z[k] - m)/T) / sum_j exp((z[j] - m)/T)`.

Subtracting the maximum prevents overflow; finite negative raw/calibrated values are valid. Equal inputs produce equal ideal shares. Validate non-empty, finite inputs and T>0.

For MVP, display whole-number percentages to guarantee an exact sum in ordinary JavaScript as well as in storage. Let `u[k]=100*p[k]`, assign `floor(u[k])`, then distribute the remaining integer units to the largest fractional remainders. Break equal remainders using the registry order. This is the largest-remainder method; twelve identical inputs allocate 9% to the first four registry entries and 8% to the remaining eight. That rounding is display allocation only, never evidence of meaningful differences. Rank on unrounded z, not rounded percentages. Retain the unrounded proportion for later presentation precision changes.

## Ranking

Sort descending calibrated score, then ascending canonical registry index for exact ties. Select the first three unique archetypes. Preserve the tie set when top scores are equal so interpretation can acknowledge a close/mixed profile. Stable tie rules are independent of name, gender, user ID and randomness. Simulation audits quantify tie frequency and the effect of canonical tie order.

## Secondary dimensions

For each dimension, sum the minimum and maximum effects achievable in each scene:

`L[k] = sum_s min_c w[s,c,k]`, `U[k] = sum_s max_c w[s,c,k]`.

`index[k] = round(100 * (R[k]-L[k]) / (U[k]-L[k]))` clamped to [0,100]. If U=L, emit value 0 and `has_evidence=false`. These are independent content-relative indices; they do not sum to 100. Preserve bounds and raw values. Do not call them probabilities or cross-person percentiles. Zero positive observations and a value above zero can coexist when negative effects exist; interpretation must consult evidence, not infer behavior from an index alone.

## Shadow determination

Shadow is an independently derived pressure pattern, never the lowest archetype. Content explicitly marks pressure scenes. For shadow axis d:

`positive[d] = sum max(0,w[s,c,d])`

`pressure[d] = sum_{pressure scenes} max(0,w[s,c,d])`

`hits[d] = number of distinct scenes with w[s,c,d] > 0`

`E[d] = (positive[d] + pressure[d]) * min(1, hits[d]/3)`.

Thus pressure decisions receive additional weight and isolated answers are attenuated. Negative effects remain in the raw axis and secondary index but cannot create positive pressure evidence.

Each archetype has a versioned six-axis affinity vector A in [0,1], an optional contrasting archetype C, and a pressure-pattern explanation in the registry. For candidate k:

`base[k] = sum_d A[k,d] * E[d]`

`contradiction[k] = 0.15 * max(0, z[C(k)] - z[k])`

`shadow_score[k] = base[k] * (1 + min(0.5, contradiction[k]))`.

The contradiction multiplier can only amplify observed evidence; it cannot invent shadow evidence. Sort descending shadow score with the same stable tie order. Shadow may equal the primary archetype: one's strengths can become overextended. No artificial exclusion is imposed.

Evidence is `supported` only when a contributing axis appears in at least two scenes and at least one contributing pressure scene; otherwise `limited`. If every E is zero, return a deterministic primary-linked candidate with `evidence='insufficient'`, score 0 and no behavioral claim. Store axis evidence, supporting scene IDs, affinity and candidate scores in the private audit, not the public share projection. AI may explain the selected candidate; it cannot choose another.

## Balance validation

Static checks: 12 archetypes, 15 sequential scenes, seven acts, 3–4 unique choices each, all dimension keys registered, integer weights [-3,3], at least one nonzero effect per choice, 1–3 nonzero archetypes per typical choice, no zero-variance archetype, and identical scores across representation variants (variants contain strings only).

Report positive opportunity count, positive weight total, negative weight total, number of scenes, baseline mean/standard deviation, and scene concentration. Warn when positive opportunity exposure differs from the mean by more than 40%, a scene allocates over 55% of its positive archetype mass to one archetype, or a choice's total absolute signal mass exceeds 18.

Run 10,000 uniformly sampled journeys with a recorded seed. Report primary and secondary counts/frequencies, mean percentage, top ties and candidate-outcome witnesses. Flag a primary frequency below 3% or above 16%, or any never-observed archetype. A frequency warning is a content-review signal, not permission to rewrite weights solely to force a flat distribution. Greedy single-archetype maximizing paths supply constructive outcome witnesses when possible. Failure to find a witness is flagged as unproven reachability, not a mathematical proof of impossibility. An archetype with no attainable variation is a hard failure.

## Tests

Test signed and zero values, malformed/non-finite input, duplicate and out-of-order answers, deterministic outputs, exact percentage sum, overflow-safe normalization, ties, gender neutrality, shadow evidence gates, arbitrary trait extension, profile completeness, immutable session transitions, public DTO privacy, content integrity and seeded simulation repeatability. Database tests execute actual PostgreSQL semantics in an embedded engine and assert foreign keys, unique answers, versions, immutable releases and deletion cascades. A hosted PostgreSQL integration test is a later deployment gate.
