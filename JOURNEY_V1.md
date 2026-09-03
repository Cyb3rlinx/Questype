# Journey I — The Unwritten Road

Journey ID: `archetype-journey`. Journey version: `1.0`. Scoring version: `1.0`. Fifteen scenes, seven acts, four choices per scene. The story is written in second person; optional representation variants are nullable text only. Art prompts describe subject matter, leaving visual style unselected.

The kingdom of Veyr has lost its road home. A bell is heard from an abandoned waystation, and a fragment of an unfinished map arrives at your door. You travel toward a still-burning beacon, meet other travelers and discover that restoring a road requires choosing what the road should serve. The return resolves that choice without identifying any answer as correct.

These are content-design notes. Psychological tags and score maps are private, never part of the public journey DTO. Full narrative, choice text, IDs and scoring effects are seeded as structured data in `src/domain/content/`. Choices imply tendencies through repeated context; no option stands for a single fixed type.

| # | Act | Scene | Four defensible approaches | Focus |
| --- | --- | --- | --- | --- |
| 1 | I — The Call | The Letter Without a Seal | Follow the moving ink; compare the map with records; invite a neighbor; prepare provisions | Curiosity, knowledge, connection, preparation |
| 2 | I — The Call | The Last Market | Pack adaptable tools; take the old promise-token; trade for the forbidden shortcut; carry stories and a game | Creation, trust, autonomy, play |
| 3 | II — The Threshold | The River Without a Bridge | Test the crossing directly; chart the currents; weave a crossing; follow the bank beyond the map | Courage, strategy, ingenuity, uncertainty |
| 4 | II — The Threshold | The Toll of Names | Offer a shared pledge; challenge the gate's rule; negotiate clear passage terms; trust the keeper's open hand | Belonging, independence, authority, security |
| 5 | III — Allies & Strangers | The Stranger's Fire | Exchange research; share a quiet watch; draw a new travel plan together; make space for everyone's story | Knowledge, intimacy, creation, inclusion |
| 6 | III — Allies & Strangers | The Caravan Dispute | Divide responsibilities; intervene to unstick the wheel; ease the quarrel with a game; question the route everyone follows | Leadership, initiative, reframing, dissent |
| 7 | IV — The Trials | The Orchard of Glass | Build protective channels; experiment with the resonance; organize timed harvests; preserve a small untouched grove | Care, transformation, coordination, hope |
| 8 | IV — The Trials | The Broken Observatory | Reconstruct its records; improvise a new lens; synchronize its scattered lights; climb above the clouds | Reasoning, creation, transformation, exploration |
| 9 | IV — The Trials | The Night of Rising Water | Hold the crossing; coordinate evacuation; stay with the stranded; create a relay that gives each person a role | Courage, control, sacrifice, cooperation |
| 10 | V — The Temptation | The Room of Unclaimed Gifts | Take the key to uncharted doors; choose the voice that restores hope; choose the mirror that alters possibilities; choose a table with room for all | Freedom, optimism, transformation, belonging |
| 11 | V — The Temptation | The Feast Before Dawn | Bargain for a seat shaping the road; choose one honest conversation; steal an hour back for unscripted play; study what the feast conceals | Power, intimacy, immediacy, knowledge |
| 12 | VI — The Shadow | The Map That Failed | Tighten the plan and assign roles; leave its route to find another; stay behind to repair others' supplies; expose the keeper's withheld bargain | Control, avoidance, carrying too much, rebellion |
| 13 | VI — The Shadow | The Echo Chamber | Keep testing until the contradiction resolves; stand apart and work from facts; invite a companion to hear the echo; break its rhythm with an unexpected performance | Obsession, distance, vulnerability, reframing |
| 14 | VII — The Return | The Unlit Beacon | Commit to relighting it; reshape its mechanism; invite the village to choose its signal; restore the small hearths around it first | Purpose, making, belonging, protection |
| 15 | VII — The Return | The Road You Leave Behind | Leave a path that can change; teach others to read the road; make a place where strangers can connect; entrust the beacon to the next traveler | Freedom, knowledge, connection, trust |

## Behavioral content review

Pressure scenes are 3, 4, 9, 12 and 13. Other scenes can also add shadow evidence, but pressure context receives an explicit additional weight. Repeated evidence is required before stronger pressure language is allowed.

All choices have a useful rationale and a cost: acting may buy time but limit information; preparing may improve coordination but slow response; staying may preserve connection but defer exploration. Do not make kindness universally rewarded or dissent universally punished. Vary resources, opportunities, mystery, group dynamics and emotional stakes. Secondary signals are assigned by meaning rather than forced into the same pattern for every option.

The story is a linear spine with small response acknowledgments planned in Phase 2, not a combinatorial branching world. The shared premise and events remain coherent for every choice. The selected strategy changes interpretation rather than making later narrative assume an unchosen action. Scene 15 asks about a legacy, not a direct personality self-rating.

## Release procedure

Validate content and registries, run the seeded simulation, review all warnings, inspect constructive archetype paths, and freeze the content hash. After release, edits require `1.1` or another new release and an explicit scoring-version decision. A uniform random simulation is a mechanical check; before launch, a human pilot must check comprehension, socially desirable options, and whether repetition feels natural. No final art style is implied by scene image prompts.
