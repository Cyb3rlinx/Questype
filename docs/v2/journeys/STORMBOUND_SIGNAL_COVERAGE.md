# Stormbound Passage — Signal Coverage

**Status:** Draft calibration, not psychometric validation  
**Simulation:** 3000 deterministic random-like paths  
**Seed:** 20260914  
**Maximum option-selection deviation:** 8.0%  
**Excessive scene density:** none

| Signal                    | Scenes | Facets | Contexts | + / − / 0 options | Min mass | Max mass | Simulated mean |
| ------------------------- | -----: | -----: | -------: | ----------------: | -------: | -------: | -------------: |
| `autonomy`                |      2 |      2 |        2 |             4/4/0 |     -1.4 |      1.4 |        -0.0003 |
| `structure`               |      4 |      4 |        2 |             8/8/0 |     -2.8 |      2.8 |         0.0233 |
| `risk_tolerance`          |      5 |      3 |        2 |           10/10/0 |     -3.5 |      3.5 |        -0.0024 |
| `openness_to_uncertainty` |      3 |      3 |        2 |             6/6/0 |     -2.1 |      2.1 |        -0.0064 |
| `knowledge_orientation`   |      2 |      2 |        1 |             4/4/0 |     -1.4 |      1.4 |          0.012 |
| `creation_orientation`    |      0 |      0 |        0 |             0/0/0 |      0.0 |      0.0 |              — |
| `empathy_cooperation`     |      3 |      3 |        2 |             6/6/0 |     -2.1 |      2.1 |        -0.0231 |
| `social_confidence`       |      1 |      1 |        1 |             2/2/0 |     -0.7 |      0.7 |              — |
| `leadership_initiative`   |      3 |      3 |        3 |             6/6/0 |     -2.1 |      2.1 |        -0.0167 |
| `persistence`             |      4 |      3 |        3 |             8/8/0 |     -2.8 |      2.8 |        -0.0007 |
| `adaptability`            |      4 |      4 |        1 |             8/8/0 |     -2.8 |      2.8 |         -0.011 |
| `emotional_regulation`    |      5 |      5 |        3 |           10/10/0 |     -3.5 |      3.5 |         0.0012 |

## Review

- Signals with fewer than two discriminating scenes: `creation_orientation`, `social_confidence`.
- Each designed opportunity is directionally balanced across four plausible strategies. A balanced simulation therefore centers near zero without inventing a neutral answer.
- The engine normalizes selected evidence against opportunities within this Journey; raw counts do not flow directly into the accumulated profile.
- Exact duplicate localized choices: 0.
- Missing constructs remain `insufficient` and `null`; they are never rendered as a midpoint.
- Social-desirability and construct-confound notes remain attached to every scene for editorial review.
