import { archetypes } from '../registry/archetypes.js';
import { dimensions } from '../registry/dimensions.js';
import { deepFreeze, journeyContentSchema, type ScoreEffects } from '../types.js';

type DraftChoice = { text: string; scores: Partial<ScoreEffects> };
const option = (text: string, scores: Partial<ScoreEffects>): DraftChoice => ({ text, scores });
const scene = (order: number, act: number, title: string, narrative: string, choices: DraftChoice[], is_pressure = false) => ({
  id: `scene_${String(order).padStart(2, '0')}`, order, act, title, narrative, is_pressure,
  image_prompt: `${title}. ${narrative.split('. ')[0]}. Subject reference only; visual style to be supplied separately.`,
  choices: choices.map((choice, i) => ({ ...choice, id: `scene_${String(order).padStart(2, '0')}_choice_${'abcd'[i]}` })),
});

export const journeyV1 = deepFreeze(journeyContentSchema.parse({
  id: 'archetype-journey', slug: 'the-unwritten-road', title: 'The Unwritten Road',
  journey_version: '1.0', scoring_version: '1.0', archetypes, dimensions,
  scenes: [
    scene(1, 1, 'The Letter Without a Seal',
      'At dusk, an unsealed letter slides beneath your door. Inside is a fragment of a map, its ink still moving. Where the road home should be, there is only a blank space. A bell sounds from the abandoned waystation beyond the fields. Before the sound fades, you decide how to begin.', [
        option('Follow the moving line of ink while it is still showing a way.', { archetypes: { explorer: 3, magician: 1 }, motivations: { freedom: 2 }, decision_styles: { intuitive: 1 }, traits: { curiosity: 1 } }),
        option('Compare the fragment with the oldest maps before leaving.', { archetypes: { sage: 3, ruler: 1 }, motivations: { knowledge: 2 }, decision_styles: { rational: 2 } }),
        option('Ask a neighbor whose company you value to come with you.', { archetypes: { lover: 3, everyman: 1 }, motivations: { connection: 2 }, traits: { social_trust: 1 } }),
        option('Pack provisions that could help you or someone you meet along the road.', { archetypes: { caregiver: 3, hero: 1 }, motivations: { protection: 2 }, decision_styles: { protective: 1, strategic: 1 } }),
      ]),
    scene(2, 1, 'The Last Market',
      'At the waystation, a night market is packing away. A merchant will exchange your letter for one thing to carry onward. None is certain to help, and there is room in your pack for only one. The merchant waits without offering advice while the bell continues somewhere beyond the stalls.', [
        option('Take a set of adaptable tools, useful for making what the road has not provided.', { archetypes: { creator: 3, sage: 1 }, motivations: { creation: 2 }, decision_styles: { strategic: 1 } }),
        option('Take a promise-token, honored by those who still believe travelers should be welcomed.', { archetypes: { innocent: 3, lover: 1 }, motivations: { connection: 1, protection: 1 }, traits: { social_trust: 2 } }),
        option('Trade for a shortcut the roadkeepers have forbidden people to use.', { archetypes: { outlaw: 3, explorer: 1 }, motivations: { freedom: 2 }, shadow: { rebellion: 1 }, traits: { autonomy: 1 } }),
        option('Choose a pouch of stories and a game that can turn strangers into companions.', { archetypes: { jester: 3, everyman: 1 }, motivations: { connection: 2 }, decision_styles: { intuitive: 1 } }),
      ]),
    scene(3, 2, 'The River Without a Bridge',
      'The road ends at a fast river. On the far bank, a marker bears the same unfinished line as your map. The remains of a bridge hang downstream; upstream, mist hides the bend. Rain is approaching, but there is enough daylight to try one approach carefully. What do you attempt?', [
        option('Secure a rope and test the shallowest crossing yourself.', { archetypes: { hero: 3, explorer: 1 }, decision_styles: { impulsive: 2 }, traits: { risk_tolerance: 2 }, shadow: { self_sacrifice: 1 } }),
        option('Watch floating branches and chart where the current weakens.', { archetypes: { sage: 2, ruler: 1 }, motivations: { knowledge: 1 }, decision_styles: { rational: 2, strategic: 1 } }),
        option('Use the fallen bridgewood to make a different kind of crossing.', { archetypes: { creator: 3, magician: 1 }, motivations: { creation: 2 }, decision_styles: { intuitive: 1 } }),
        option('Follow the bank beyond the map, accepting that the route may take longer.', { archetypes: { explorer: 2, innocent: 1 }, motivations: { freedom: 2 }, shadow: { avoidance: 1 }, traits: { autonomy: 1 } }),
      ], true),
    scene(4, 2, 'The Toll of Names',
      'Beyond the river stands a gate watched by a keeper. The inscription says that no one may pass alone, yet the keeper carries a key made for a single hand. Several travelers wait nearby. The keeper asks what guarantee you can offer that the road will be used well. You have no official letter of passage.', [
        option('Ask the waiting travelers to make a shared pledge with you.', { archetypes: { everyman: 3, caregiver: 1 }, motivations: { connection: 2 }, decision_styles: { protective: 1 }, traits: { social_trust: 1 } }),
        option('Ask the keeper to explain why the rule should still bind anyone.', { archetypes: { outlaw: 3, sage: 1 }, motivations: { freedom: 1 }, decision_styles: { rational: 1 }, shadow: { rebellion: 2 } }),
        option('Negotiate clear terms for passage and accept responsibility for meeting them.', { archetypes: { ruler: 3, hero: 1 }, motivations: { power: 2 }, decision_styles: { dominant: 1, strategic: 1 }, shadow: { control: 1 } }),
        option('Offer your open hand and trust the keeper to recognize your intention.', { archetypes: { innocent: 3, lover: 1 }, motivations: { protection: 1 }, decision_styles: { intuitive: 1 }, traits: { social_trust: 2 } }),
      ], true),
    scene(5, 3, "The Stranger's Fire",
      'At the next shelter, a stranger has made a fire from branches that burn blue. They are traveling toward the same beacon but have followed a different map. Neither map seems complete. There is time to rest before the next stretch, and the stranger asks what you would like to do with the evening.', [
        option('Compare what each of you has learned and note where the maps disagree.', { archetypes: { sage: 3, magician: 1 }, motivations: { knowledge: 2 }, decision_styles: { rational: 1 } }),
        option('Share the quiet watch and learn what brought the stranger onto this road.', { archetypes: { lover: 3, caregiver: 1 }, motivations: { connection: 2 }, traits: { empathy: 2 } }),
        option('Sketch a new travel plan together from the useful parts of both maps.', { archetypes: { creator: 2, magician: 2 }, motivations: { creation: 2 }, decision_styles: { intuitive: 1 } }),
        option('Invite the other people at the shelter to add their experiences to the conversation.', { archetypes: { everyman: 3, jester: 1 }, motivations: { connection: 2 }, traits: { social_trust: 1 } }),
      ]),
    scene(6, 3, 'The Caravan Dispute',
      'A caravan blocks a narrow pass. One wheel is trapped, and the travelers disagree about whether to repair it or turn back. Supplies are being used while the debate continues. The driver asks you for a suggestion, but the others are listening too. You choose where to put your effort first.', [
        option('Work out what needs doing and agree on who will handle each part.', { archetypes: { ruler: 3, everyman: 1 }, motivations: { power: 2 }, decision_styles: { dominant: 2 }, shadow: { control: 1 } }),
        option('Take a lever to the wheel so everyone has something concrete to respond to.', { archetypes: { hero: 3, creator: 1 }, decision_styles: { impulsive: 2 }, traits: { persistence: 1 } }),
        option('Turn competing suggestions into a quick trial, with a playful wager to release the tension.', { archetypes: { jester: 3, magician: 1 }, motivations: { connection: 1 }, decision_styles: { intuitive: 2 } }),
        option('Question whether this pass is still worth using and investigate the dismissed route.', { archetypes: { outlaw: 3, explorer: 1 }, motivations: { freedom: 2 }, shadow: { rebellion: 1, avoidance: 1 } }),
      ]),
    scene(7, 4, 'The Orchard of Glass',
      'The caravan reaches an orchard where glass fruit stores the last light of the day. The villagers need some of it to keep their paths visible, but harvesting too quickly can shatter the branches. No one agrees on how much the orchard can spare. You are offered a small section in which to try your approach.', [
        option('Make protective channels so falling fruit can be gathered without damaging the roots.', { archetypes: { caregiver: 3, creator: 1 }, motivations: { protection: 2 }, decision_styles: { protective: 2 } }),
        option('Experiment with the notes the branches make when the wind passes through them.', { archetypes: { magician: 3, jester: 1 }, motivations: { knowledge: 1, creation: 1 }, traits: { curiosity: 2 } }),
        option('Organize a timed harvest that leaves each tree a measured share of light.', { archetypes: { ruler: 3, sage: 1 }, motivations: { power: 1, protection: 1 }, decision_styles: { strategic: 2 } }),
        option('Keep a small grove untouched and tend the ground around it for the next season.', { archetypes: { innocent: 3, caregiver: 1 }, motivations: { protection: 2 }, decision_styles: { protective: 1 }, shadow: { avoidance: 1 } }),
      ]),
    scene(8, 4, 'The Broken Observatory',
      'Above the orchard, an observatory once guided travelers to the beacon. Its great lens is broken, its records scattered, and three distant lights no longer blink together. There is no single obvious repair. You have an afternoon, the contents of your pack and a few people willing to help.', [
        option('Reconstruct the observations to understand what the instrument used to measure.', { archetypes: { sage: 3, innocent: 1 }, motivations: { knowledge: 2 }, decision_styles: { rational: 2 }, shadow: { obsession: 1 } }),
        option('Build a smaller lens from the surviving pieces and test what it can show.', { archetypes: { creator: 3, hero: 1 }, motivations: { creation: 2 }, decision_styles: { strategic: 1 } }),
        option('Try bringing the distant lights into rhythm, even before the old mechanism is repaired.', { archetypes: { magician: 3, creator: 1 }, motivations: { creation: 1 }, decision_styles: { intuitive: 2 }, shadow: { control: 1 } }),
        option('Climb above the clouds to see whether a different vantage point reveals the route.', { archetypes: { explorer: 3, hero: 1 }, motivations: { freedom: 2 }, traits: { risk_tolerance: 1, curiosity: 1 } }),
      ]),
    scene(9, 4, 'The Night of Rising Water',
      'That night the river rises through the camp. Everyone has warning, but there is only time to move what matters most. The crossing needs steady hands, the stores need sorting, and several travelers cannot move quickly. People begin taking different tasks. Where do you place yourself?', [
        option('Hold the crossing steady while the others carry people and supplies over it.', { archetypes: { hero: 3, caregiver: 1 }, motivations: { protection: 2 }, decision_styles: { impulsive: 1 }, shadow: { self_sacrifice: 2 } }),
        option('Set the order of evacuation and redirect effort whenever a bottleneck forms.', { archetypes: { ruler: 3, hero: 1 }, motivations: { power: 2 }, decision_styles: { dominant: 2 }, shadow: { control: 2 } }),
        option('Stay with the slower travelers and move at a pace they can manage.', { archetypes: { caregiver: 3, lover: 1 }, motivations: { protection: 2 }, decision_styles: { protective: 2 }, shadow: { self_sacrifice: 1 } }),
        option('Form a relay so that every traveler has a manageable part in getting the camp across.', { archetypes: { everyman: 3, ruler: 1 }, motivations: { connection: 2 }, decision_styles: { strategic: 1 }, traits: { empathy: 1 } }),
      ], true),
    scene(10, 5, 'The Room of Unclaimed Gifts',
      'Near the beacon, a room holds gifts left by earlier travelers. A message says you may choose one, but its usefulness will depend on what you do with it. There is a key that fits no familiar lock, a voice held in a shell, a mirror without a reflection, and a table that folds into a pocket.', [
        option('Choose the key, which promises access to doors that do not yet appear on any map.', { archetypes: { explorer: 3, outlaw: 1 }, motivations: { freedom: 2 }, shadow: { avoidance: 1 }, traits: { autonomy: 1 } }),
        option('Choose the shell, whose voice reminds people of something still worth hoping for.', { archetypes: { innocent: 3, hero: 1 }, motivations: { protection: 1, connection: 1 }, decision_styles: { intuitive: 1 } }),
        option('Choose the mirror, which shows how one small change could alter a whole situation.', { archetypes: { magician: 3, outlaw: 1 }, motivations: { creation: 2 }, shadow: { obsession: 1 }, traits: { curiosity: 1 } }),
        option('Choose the table, which always has room for one more person to sit down.', { archetypes: { everyman: 3, lover: 1 }, motivations: { connection: 2 }, shadow: { self_sacrifice: 1 } }),
      ]),
    scene(11, 5, 'The Feast Before Dawn',
      'The beacon keepers invite you to a feast. By dawn, they will decide who may help shape the restored road. One keeper offers influence, a companion asks for a private conversation, music spills from an unguarded courtyard, and a ledger lies open beside an empty chair. The evening cannot hold everything.', [
        option('Negotiate a place in the council so you can help decide how the road will work.', { archetypes: { ruler: 3, outlaw: 1 }, motivations: { power: 3 }, decision_styles: { strategic: 1 }, shadow: { control: 1 } }),
        option('Give the evening to the conversation, even if useful introductions pass you by.', { archetypes: { lover: 3, innocent: 1 }, motivations: { connection: 3 }, shadow: { obsession: 1 } }),
        option('Follow the music and make an unscripted hour with whoever is there.', { archetypes: { jester: 3, explorer: 1 }, motivations: { freedom: 1, connection: 1 }, decision_styles: { impulsive: 2 }, shadow: { avoidance: 1 } }),
        option('Read the ledger to understand what maintaining the road actually costs.', { archetypes: { sage: 3, outlaw: 1 }, motivations: { knowledge: 2 }, decision_styles: { rational: 2 }, shadow: { emotional_detachment: 1 } }),
      ]),
    scene(12, 6, 'The Map That Failed',
      'At dawn, the maps disagree again. The group has lost time following directions that seemed reliable, and the keeper admits that an old bargain was left out of the account. Nobody has the full answer yet. Frustration is spreading, and you recognize that your own approach has reached a limit. What do you try next?', [
        option('Reduce the moving parts: set a tighter plan and give each person a clear role.', { archetypes: { ruler: 2, hero: 1 }, motivations: { power: 1 }, decision_styles: { dominant: 2 }, shadow: { control: 3 }, traits: { autonomy: -1 } }),
        option('Leave the disputed route for now and look for a way that does not depend on the maps.', { archetypes: { explorer: 2, outlaw: 1 }, motivations: { freedom: 2 }, decision_styles: { intuitive: 1 }, shadow: { avoidance: 3 } }),
        option('Repair the group’s depleted supplies while the others work out the next direction.', { archetypes: { caregiver: 2, lover: 1 }, motivations: { protection: 2 }, decision_styles: { protective: 1 }, shadow: { self_sacrifice: 3 } }),
        option('Bring the withheld bargain into the open, even if it unsettles the people guiding you.', { archetypes: { outlaw: 3, everyman: 1 }, motivations: { freedom: 1 }, decision_styles: { impulsive: 1 }, shadow: { rebellion: 3 }, traits: { social_trust: -1 } }),
      ], true),
    scene(13, 6, 'The Echo Chamber',
      'The final stair passes through a chamber that repeats your last decision in voices you recognize. Each echo offers a different account of what it meant. The doorway remains open, but the echoes make it difficult to move with confidence. You have a little time before the beacon must be lit. How do you use it?', [
        option('Test the repeating pattern until you find the assumption that keeps producing the echo.', { archetypes: { magician: 3, sage: 1 }, motivations: { knowledge: 2 }, decision_styles: { intuitive: 1 }, shadow: { obsession: 3 } }),
        option('Step apart from the voices and write down only what you can establish as fact.', { archetypes: { sage: 2, ruler: 1 }, motivations: { knowledge: 1 }, decision_styles: { rational: 2 }, shadow: { emotional_detachment: 3 }, traits: { empathy: -1 } }),
        option('Ask a companion to listen with you and share which echo is hardest to hear.', { archetypes: { lover: 3, hero: 1 }, motivations: { connection: 2 }, shadow: { emotional_detachment: -2 }, traits: { empathy: 1 } }),
        option('Answer the chamber with an unexpected rhythm and see whether its pattern loosens.', { archetypes: { jester: 3, outlaw: 1 }, motivations: { freedom: 1 }, decision_styles: { impulsive: 1 }, shadow: { avoidance: 2, rebellion: 1 } }),
      ], true),
    scene(14, 7, 'The Unlit Beacon',
      'At the summit, you find that the beacon is intact. What it lacks is a way to receive the light brought by many different travelers. The keepers can no longer decide this alone. Below, the village waits for a signal that the road can be used again. What contribution do you make to its return?', [
        option('Take on the difficult first watch and commit to keeping the light alive until help arrives.', { archetypes: { hero: 3, innocent: 1 }, motivations: { protection: 2 }, traits: { persistence: 2 } }),
        option('Reshape the mechanism so that many smaller lights can feed it together.', { archetypes: { creator: 3, magician: 1 }, motivations: { creation: 3 }, decision_styles: { strategic: 1 } }),
        option('Invite the village to choose a signal everyone can recognize and help maintain.', { archetypes: { everyman: 3, jester: 1 }, motivations: { connection: 2 }, decision_styles: { protective: 1 } }),
        option('Restore the small hearths around the beacon so the people tending it can stay.', { archetypes: { caregiver: 3, innocent: 1 }, motivations: { protection: 3 }, decision_styles: { protective: 2 } }),
      ]),
    scene(15, 7, 'The Road You Leave Behind',
      'Light reaches the valley, and your map finally shows a road home. It is not a single fixed line: it changes as people walk it. Before you leave, the next traveler asks what should be carried forward from this journey. You cannot choose their path for them, but you can leave one useful beginning.', [
        option('Leave a path with room for detours, so the next traveler can discover something of their own.', { archetypes: { explorer: 3, outlaw: 1 }, motivations: { freedom: 2 }, traits: { autonomy: 2 } }),
        option('Leave a guide to reading the road, including the questions your journey did not answer.', { archetypes: { sage: 2, creator: 1 }, motivations: { knowledge: 2 }, decision_styles: { rational: 1 } }),
        option('Leave a meeting place where travelers can exchange what mattered to them.', { archetypes: { lover: 3, jester: 1 }, motivations: { connection: 2 }, traits: { empathy: 1 } }),
        option('Entrust the beacon to the next traveler, with what they need to make a hopeful start.', { archetypes: { innocent: 3, hero: 1 }, motivations: { protection: 1, connection: 1 }, traits: { social_trust: 2 } }),
      ]),
  ],
}));
