import { deepFreeze, type ArchetypeKey, type MotivationKey, type ShadowKey } from '../types.js';

export const archetypeTitles = deepFreeze({
  innocent: ['Dawnkeeper', 'Hopebearer', 'Keeper of Beginnings'],
  explorer: ['Wayfinder', 'Wanderer', 'Horizon Seeker'],
  sage: ['Lorekeeper', 'Scholar', 'Keeper of Questions'],
  hero: ['Pathwarden', 'Guardian', 'Beacon Bearer'],
  outlaw: ['Unbound Traveler', 'Oathbreaker', 'Threshold Challenger'],
  magician: ['Magician', 'Alchemist', 'Keeper of Possibilities'],
  lover: ['Heartkeeper', 'Threadweaver', 'Keeper of Connection'],
  creator: ['Worldmaker', 'Artisan', 'Maker of Roads'],
  caregiver: ['Hearthkeeper', 'Steward', 'Shelter Weaver'],
  jester: ['Reveler', 'Mirthbringer', 'Keeper of Unexpected Doors'],
  ruler: ['Beacon Keeper', 'Marshal', 'Keeper of the Circle'],
  everyman: ['Companion', 'Bridgekeeper', 'Keeper of the Common Road'],
} satisfies Record<ArchetypeKey, string[]>);
const secondaryModifiers: Record<ArchetypeKey, string> = {
  innocent: 'Dawnlit', explorer: 'Wandering', sage: 'Knowing', hero: 'Steadfast', outlaw: 'Unbound', magician: 'Farseeing',
  lover: 'Devoted', creator: 'Inventive', caregiver: 'Sheltering', jester: 'Playful', ruler: 'Resolute', everyman: 'Kindred',
};
const motivationModifiers: Record<MotivationKey, string> = { power: 'Crowned', freedom: 'Roaming', connection: 'Kindred', creation: 'Inventive', knowledge: 'Seeking', protection: 'Watchful' };
const pressureModifiers: Record<ShadowKey, string> = { control: 'Crownless', avoidance: 'Returning', self_sacrifice: 'Boundless', rebellion: 'Unbound', obsession: 'Searching', emotional_detachment: 'Veiled' };

/** English titles are representation-neutral; gender stays in later pronoun/image adapters. */
export function generateCharacterCandidates(input: { primary: ArchetypeKey; secondary: ArchetypeKey; dominantMotivation: MotivationKey; shadowAxis: ShadowKey | null; shadowEvidence: 'supported' | 'limited' | 'insufficient' }): string[] {
  const titles = archetypeTitles[input.primary];
  const candidates = [
    `The ${secondaryModifiers[input.secondary]} ${titles[0]}`,
    `The ${motivationModifiers[input.dominantMotivation]} ${titles[1]}`,
    `The ${titles[2]}`,
  ];
  if (input.shadowAxis && input.shadowEvidence === 'supported') candidates.push(`The ${pressureModifiers[input.shadowAxis]} ${titles[0]}`);
  return [...new Set(candidates)];
}
