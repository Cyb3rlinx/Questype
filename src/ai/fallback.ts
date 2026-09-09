import { validateInterpretation, type Interpretation } from './contracts.js';
import type { StructuredProfile } from '../domain/scoring/profile.js';
import type { Locale } from '../i18n/locale.js';
import { localizeArchetype } from '../i18n/archetypes.js';
import { archetypeResultCopy } from '../i18n/result-copy.js';

/** Registry-based development fallback, not an AI generation. */
export function deterministicInterpretation(profile: StructuredProfile, locale: Locale = 'en'): { provider: 'deterministic'; model: 'registry-1.0'; prompt_version: 'fallback.v1'; interpretation: Interpretation } {
  const primary = localizeArchetype(profile.registry_snapshot.find(a => a.slug === profile.archetypes.primary.slug)!, locale);
  const secondary = localizeArchetype(profile.registry_snapshot.find(a => a.slug === profile.archetypes.secondary.slug)!, locale);
  const pressure = localizeArchetype(profile.registry_snapshot.find(a => a.slug === profile.archetypes.shadow.slug)!, locale);
  const resultCopy = archetypeResultCopy(profile.archetypes.primary.slug, locale);
  if (locale === 'es') {
    const supported = profile.archetypes.shadow.evidence === 'supported';
    const interpretation = validateInterpretation({
      character_title: profile.character.title,
      summary: `Tu recorrido se alinea con mayor fuerza con el arquetipo ${primary.name}, mientras ${secondary.name} también influye en el patrón. Tus decisiones sugieren una inclinación hacia ${primary.core_desire.toLowerCase()}. Esto no describe cada parte de ti: refleja las estrategias que elegiste dentro de una situación imaginada. A lo largo del camino pudiste actuar, investigar, cooperar, cuidar y reconsiderar. La combinación muestra una tensión valiosa entre ${primary.core_motivation.toLowerCase()} y ${secondary.core_motivation.toLowerCase()}. Ninguna de estas maneras necesita imponerse en todas las situaciones. Puede ayudarte observar cuándo tu respuesta habitual abre posibilidades y cuándo otra respuesta daría más espacio a lo que hoy necesitas. Toma este resultado como una invitación a compararlo con tu propia experiencia: conserva lo que resuene, cuestiona lo que no y recuerda que tus patrones pueden cambiar con el contexto, la práctica y las decisiones que todavía no has tomado.`,
      strengths: primary.strengths.slice(0, 4).map((description, i) => ({ title: resultCopy.strengthTitles[i]!, description: `Tus elecciones sugieren esta capacidad: ${description.charAt(0).toLowerCase()}${description.slice(1)}.` })),
      blind_spots: primary.shadow_traits.slice(0, 3).map((description, i) => ({ title: `Patrón a observar ${i + 1}`, description: `Bajo presión, es posible que ${description.charAt(0).toLowerCase()}${description.slice(1)}.` })),
      decision_style: `Ante la incertidumbre, tiendes a buscar una respuesta coherente con el impulso de ${primary.name}. En situaciones de riesgo, considera qué podría enseñarte un experimento pequeño antes de comprometer todos tus recursos. En un conflicto, pregunta qué intenta proteger cada estrategia. Frente a la complejidad, alterna comprensión y acción; al liderar, deja claras las responsabilidades y abre espacio para que otras perspectivas modifiquen el plan.`,
      relationships: `Tu recorrido sugiere que construyes vínculos desde las cualidades del arquetipo ${primary.name}: presencia, intención y una forma particular de aportar. La influencia de ${secondary.name} añade otra posibilidad para relacionarte. La confianza, la independencia y la expresión emocional cambian según el contexto; por eso conviene preguntar y escuchar antes de asumir qué necesita la otra persona.`,
      motivation_analysis: `El índice de motivación más alto dentro de esta historia es ${profile.character.dominant_motivation}. Puedes explorar cómo este impulso sostiene tus compromisos actuales y qué otras motivaciones necesitan más espacio. Estos índices comparan tus elecciones dentro del contenido de la experiencia; no son percentiles de población ni mediciones clínicas.`,
      shadow_analysis: supported ? `Varias decisiones tomadas bajo presión contribuyeron al patrón ${pressure.name}. ${pressure.shadow_traits[0]}. Es una tendencia contextual para observar, no una identidad fija ni una conclusión clínica.` : `Existe evidencia ${profile.archetypes.shadow.evidence === 'limited' ? 'limitada' : 'insuficiente'} para el patrón de presión ${pressure.name}. No hay suficiente repetición para considerarlo una tendencia estable; úsalo únicamente como una pregunta tentativa para la reflexión.`,
      growth_path: ['Haz una pausa antes de repetir tu respuesta más familiar y nombra qué intenta proteger.', 'Prueba una acción pequeña inspirada por una estrategia distinta a la habitual.', 'Lleva ese aprendizaje a una decisión cotidiana y observa el resultado sin juzgarte.'].map((description, i) => ({ title: `Práctica ${i + 1}`, description })),
      ideal_environment: `Puede ayudarte un entorno que deje espacio para ${primary.core_motivation.toLowerCase()}, y que al mismo tiempo invite comentarios honestos de personas con enfoques distintos al tuyo.`,
      final_reflection: 'Piensa en una decisión reciente que se haya sentido como este viaje. ¿Qué protegió tu estrategia habitual y qué habría hecho posible una respuesta diferente?',
      social: { instagram_caption: `Mi viaje reveló una afinidad con ${primary.name} y ${secondary.name}. Una historia para reflexionar y un camino que todavía puede cambiar.`, linkedin_caption: `Completé una experiencia interactiva de autoconocimiento sobre decisiones y motivaciones. Mi mayor afinidad fue ${primary.name}, seguida de ${secondary.name}. Ahora observo cómo estas estrategias influyen en mi trabajo y mis relaciones.`, x_caption: `Mi viaje reveló ${primary.name} ${profile.archetypes.primary.normalized_percentage}% · ${secondary.name} ${profile.archetypes.secondary.normalized_percentage}%. Descubre el camino que muestran tus decisiones.`, quote: resultCopy.quote },
    }, profile);
    return { provider: 'deterministic', model: 'registry-1.0', prompt_version: 'fallback.v1', interpretation };
  }
  const summary = `Your journey most strongly aligns with the ${primary.name} archetype, with the ${secondary.name} also shaping the pattern. Your choices suggest that you may be drawn to ${primary.core_desire.toLowerCase()}. This does not describe every part of you: it reflects the strategies you selected in a particular imagined setting. Across the road, you had opportunities to act, investigate, cooperate and reconsider. The combination suggests a useful tension between ${primary.core_motivation.toLowerCase()} and ${secondary.core_motivation.toLowerCase()}. Neither approach has to win in every situation. You may find it useful to notice when your familiar response helps and when another response would create more room. Treat the result as an invitation to compare the story with your own experience, keeping what resonates and questioning what does not.`;
  const shadow = profile.archetypes.shadow.evidence === 'supported'
    ? `Several choices under pressure contributed to the ${pressure.name} pattern. ${pressure.shadow_traits[0]}. This is a contextual tendency to reflect on, not a fixed identity or a clinical finding.`
    : `There is ${profile.archetypes.shadow.evidence} evidence for the ${pressure.name} pressure pattern. There is not enough repeated evidence to treat this as an established tendency; use it only as a tentative reflection prompt.`;
  const interpretation = validateInterpretation({
    character_title: profile.character.title, summary,
    strengths: primary.strengths.slice(0, 4).map((description, i) => ({ title: resultCopy.strengthTitles[i]!, description: `Your choices suggest a capacity that ${description.charAt(0).toLowerCase()}${description.slice(1)}.` })),
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
      quote: resultCopy.quote,
    },
  }, profile);
  return { provider: 'deterministic', model: 'registry-1.0', prompt_version: 'fallback.v1', interpretation };
}
