import { validateInterpretation, type Interpretation } from './contracts.js';
import type { StructuredProfile } from '../domain/scoring/profile.js';

/** Registry-based development fallback, not an AI generation. */
export function deterministicInterpretation(profile: StructuredProfile): { provider: 'deterministic'; model: 'registry-1.0'; prompt_version: 'fallback.v1'; interpretation: Interpretation } {
  const primary = profile.registry_snapshot.find(a => a.slug === profile.archetypes.primary.slug)!;
  const secondary = profile.registry_snapshot.find(a => a.slug === profile.archetypes.secondary.slug)!;
  const pressure = profile.registry_snapshot.find(a => a.slug === profile.archetypes.shadow.slug)!;
  const summary = `Your journey most strongly aligns with the ${primary.name} archetype, with the ${secondary.name} also shaping the pattern. Your choices suggest that you may be drawn to ${primary.core_desire.toLowerCase()}. This does not describe every part of you: it reflects the strategies you selected in a particular imagined setting. Across the road, you had opportunities to act, investigate, cooperate and reconsider. The combination suggests a useful tension between ${primary.core_motivation.toLowerCase()} and ${secondary.core_motivation.toLowerCase()}. Neither approach has to win in every situation. You may find it useful to notice when your familiar response helps and when another response would create more room. Treat the result as an invitation to compare the story with your own experience, keeping what resonates and questioning what does not.`;
  const shadow = profile.archetypes.shadow.evidence === 'supported'
    ? `Several choices under pressure contributed to the ${pressure.name} pattern. ${pressure.shadow_traits[0]}. This is a contextual tendency to reflect on, not a fixed identity or a clinical finding.`
    : `There is ${profile.archetypes.shadow.evidence} evidence for the ${pressure.name} pressure pattern. There is not enough repeated evidence to treat this as an established tendency; use it only as a tentative reflection prompt.`;
  const interpretation = validateInterpretation({
    character_title: profile.character.title, summary,
    strengths: primary.strengths.slice(0, 4).map((description, i) => ({ title: `Strength ${i + 1}`, description: `Your choices suggest a capacity that ${description.charAt(0).toLowerCase()}${description.slice(1)}.` })),
    blind_spots: primary.shadow_traits.slice(0, 3).map((description, i) => ({ title: `Pattern to notice ${i + 1}`, description: `Under pressure, you ${description.charAt(0).toLowerCase()}${description.slice(1)}.` })),
    decision_style: `In uncertainty, your choices suggest this approach: ${primary.decision_patterns.join('; ')}. With risk, consider what a smaller experiment could reveal. In conflict, ask what another strategy protects. With complexity, alternate understanding and action. In leadership, ${primary.leadership_patterns.join('; ')}.`,
    relationships: `Your choices suggest that you may connect in these ways: ${primary.relationship_patterns.join('; ')}. A secondary influence adds another possibility: ${secondary.relationship_patterns[0]}. Trust, independence and emotional communication can all change with the situation.`,
    motivation_analysis: `The strongest content-relative motivation index is ${profile.character.dominant_motivation}. It may be useful to ask how this motive supports your current commitments, and which other motives need space. These indices describe this journey, not population percentiles.`,
    shadow_analysis: shadow,
    growth_path: primary.growth_direction.slice(0, 3).map((description, i) => ({ title: `Practice ${i + 1}`, description })),
    ideal_environment: `You may find it useful to seek an environment that leaves room to ${primary.core_motivation.toLowerCase()}, while inviting feedback from people whose approaches differ from yours.`,
    final_reflection: 'Think of a recent choice that felt like this journey. What did your familiar strategy protect, and what might a different strategy have made possible?',
    social: {
      instagram_caption: `My journey revealed ${profile.character.title}: ${primary.name} with ${secondary.name}. A story to reflect on, and a road still open to change.`,
      linkedin_caption: `I completed an interactive self-discovery journey about decisions and motivation. My strongest alignment was ${primary.name}, followed by ${secondary.name}. I am reflecting on how these approaches influence my work and collaboration.`,
      x_caption: `My journey revealed ${profile.character.title}. ${primary.name} ${profile.archetypes.primary.normalized_percentage}% · ${secondary.name} ${profile.archetypes.secondary.normalized_percentage}%. Discover the road your choices reveal.`,
      quote: 'The road you choose can teach you something. It does not have to define every road ahead.',
    },
  }, profile);
  return { provider: 'deterministic', model: 'registry-1.0', prompt_version: 'fallback.v1', interpretation };
}
