import type { SignalContext, SignalKey } from '../../signals/contracts.js';
import {
  buildDraftJourney,
  type BilingualSeed,
  type ChoiceSeed,
  type SceneSeed,
} from '../draft-authoring.js';
import { stormboundPassageMetadata } from './metadata.js';

const b = (en: string, es: string): BilingualSeed => [en, es];
const benefits = [
  b(
    'Integrates both priorities into one deliberate response.',
    'Integra ambas prioridades en una respuesta deliberada.',
  ),
  b(
    'Protects the first priority with a clearer commitment.',
    'Protege la primera prioridad con un compromiso más claro.',
  ),
  b(
    'Protects the second priority while reducing immediate exposure.',
    'Protege la segunda prioridad mientras reduce la exposición inmediata.',
  ),
  b(
    'Limits immediate complexity and preserves scarce capacity.',
    'Limita la complejidad inmediata y conserva capacidad escasa.',
  ),
] as const;
const tradeoffs = [
  b(
    'Coordination and preparation consume part of the available window.',
    'La coordinación y la preparación consumen parte del margen disponible.',
  ),
  b(
    'The second priority receives less attention if conditions shift.',
    'La segunda prioridad recibe menos atención si cambian las condiciones.',
  ),
  b(
    'The first priority may be delayed or carried by someone else.',
    'La primera prioridad puede demorarse o quedar en manos de otra persona.',
  ),
  b(
    'Both priorities may remain less expressed while the situation keeps moving.',
    'Ambas prioridades pueden quedar menos expresadas mientras la situación sigue avanzando.',
  ),
] as const;

function choices(en: readonly string[], es: readonly string[]) {
  return en.map(
    (text, index) =>
      [b(text, es[index]!), benefits[index]!, tradeoffs[index]!] as ChoiceSeed,
  ) as unknown as SceneSeed['choices'];
}

function scene(input: {
  title: BilingualSeed;
  narrative: BilingualSeed;
  pair: readonly [SignalKey, SignalKey];
  facets: readonly [string, string];
  contexts: readonly [SignalContext, SignalContext];
  pressure?: boolean;
  visual: BilingualSeed;
  en: readonly [string, string, string, string];
  es: readonly [string, string, string, string];
}): SceneSeed {
  return {
    title: input.title,
    narrative: input.narrative,
    purpose: b(
      `Move the same expedition through ${input.title[0].toLowerCase()} without creating a separate route or outcome.`,
      `Hacer avanzar la misma expedición a través de ${input.title[1].toLowerCase()} sin crear una ruta ni un desenlace separado.`,
    ),
    psychology: b(
      `Observe a contextual trade-off between ${input.pair[0]} and ${input.pair[1]} without treating either strategy as inherently superior.`,
      `Observar un intercambio contextual entre ${input.pair[0]} y ${input.pair[1]} sin tratar ninguna estrategia como inherentemente superior.`,
    ),
    primary: input.pair,
    facets: input.facets,
    contexts: input.contexts,
    pressure: input.pressure,
    visual: input.visual,
    continuity: b(
      'The crew, vessel and destination remain fixed after this decision; later scenes may echo the reasoning but never branch the plot.',
      'La tripulación, la embarcación y el destino permanecen fijos después de esta decisión; las escenas posteriores pueden reflejar el razonamiento, pero nunca ramifican la trama.',
    ),
    choices: choices(input.en, input.es),
  };
}

export const stormboundPassageContent = buildDraftJourney({
  id: stormboundPassageMetadata.id,
  slug: stormboundPassageMetadata.slug,
  title: b(
    stormboundPassageMetadata.title.en,
    stormboundPassageMetadata.title.es,
  ),
  acts: stormboundPassageMetadata.acts.map((act) => b(act.en, act.es)),
  scenes: [
    scene({
      title: b('The Red Horizon', 'El horizonte rojo'),
      narrative: b(
        'Your expedition is one tide from departure when a red shelf of cloud forms beyond the harbor stones. The passage normally takes two days; waiting may close the northern channel for a month.',
        'Tu expedición está a una marea de partir cuando una franja roja de nubes se forma más allá de las piedras del puerto. La travesía suele durar dos días; esperar puede cerrar el canal del norte durante un mes.',
      ),
      pair: ['risk_tolerance', 'openness_to_uncertainty'],
      facets: ['calculated_risk', 'ambiguity_tolerance'],
      contexts: ['physical_risk', 'uncertainty'],
      visual: b(
        'Expedition vessel below a red storm horizon, stone harbor and symbolic pennants, no readable text.',
        'Embarcación de expedición bajo un horizonte rojo de tormenta, puerto de piedra y banderines simbólicos, sin texto legible.',
      ),
      en: [
        'Review the hazards, reduce exposed cargo and depart with a fixed turn-back point.',
        'Take the sheltered route after calculating its longer distance and reserve cost.',
        'Wait one tide to observe the cloud line while keeping several plans ready.',
        'Delay until the passage looks reliable even if the seasonal channel closes.',
      ],
      es: [
        'Revisas los peligros, reduces la carga expuesta y partes con un punto fijo de retorno.',
        'Tomas la ruta protegida después de calcular su mayor distancia y costo de reservas.',
        'Esperas una marea para observar las nubes mientras mantienes varios planes listos.',
        'Postergas hasta que la travesía parezca confiable aunque se cierre el canal estacional.',
      ],
    }),
    scene({
      title: b('The Damaged Barometer', 'El barómetro dañado'),
      narrative: b(
        'Outside the breakwater, the barometer needle catches between two marks. Tide tables, cloud movement and an old captain’s memory offer useful clues, but none provides a complete forecast.',
        'Fuera del rompeolas, la aguja del barómetro queda atrapada entre dos marcas. Las tablas de mareas, el movimiento de las nubes y la memoria de un viejo capitán ofrecen pistas útiles, pero ninguna da un pronóstico completo.',
      ),
      pair: ['structure', 'knowledge_orientation'],
      facets: ['preparation', 'information_prioritization'],
      contexts: ['uncertainty', 'knowledge_gap'],
      visual: b(
        'Damaged brass barometer beside tide instruments and symbolic weather diagrams, open sea beyond.',
        'Barómetro de bronce dañado junto a instrumentos de marea y diagramas meteorológicos simbólicos, con el mar abierto al fondo.',
      ),
      en: [
        'Rank the evidence, set observation intervals and define what would change the route.',
        'Choose the most stable source and build the voyage plan around it.',
        'Keep gathering observations before committing the crew to a detailed sequence.',
        'Use the standard passage procedure and conserve attention for later hazards.',
      ],
      es: [
        'Ordenas la evidencia, fijas intervalos de observación y defines qué cambiaría la ruta.',
        'Eliges la fuente más estable y construyes el plan alrededor de ella.',
        'Sigues reuniendo observaciones antes de comprometer a la tripulación con una secuencia detallada.',
        'Usas el procedimiento habitual y conservas atención para peligros posteriores.',
      ],
    }),
    scene({
      title: b('The Last Harbor Signal', 'La última señal del puerto'),
      narrative: b(
        'A signal fire flashes twice behind you, an old warning whose second meaning was never standardized. Turning back is still possible, but everyone on deck is watching how you receive the uncertainty.',
        'Un fuego de señales parpadea dos veces detrás de ti, una advertencia antigua cuyo segundo significado nunca fue estandarizado. Aún es posible regresar, pero todos en cubierta observan cómo recibes la incertidumbre.',
      ),
      pair: ['autonomy', 'emotional_regulation'],
      facets: ['independent_judgment', 'emotional_awareness'],
      contexts: ['uncertainty', 'social_risk'],
      pressure: true,
      visual: b(
        'Small harbor signal fire far astern, crew faces in cold dawn light, no letters or numbers.',
        'Pequeño fuego de señales a popa, rostros de la tripulación bajo la luz fría del amanecer, sin letras ni números.',
      ),
      en: [
        'Name your concern, decide from the available evidence and explain the choice to the deck.',
        'Choose privately to continue and ask the crew to focus on assigned stations.',
        'Invite the navigator to interpret the signal while you steady the crew’s immediate fear.',
        'Turn back until the warning can be clarified by harbor authorities.',
      ],
      es: [
        'Nombras tu preocupación, decides con la evidencia disponible y explicas la elección en cubierta.',
        'Decides continuar en privado y pides a la tripulación concentrarse en sus puestos.',
        'Invitas a la navegante a interpretar la señal mientras estabilizas el miedo inmediato de la tripulación.',
        'Regresas hasta que las autoridades del puerto puedan aclarar la advertencia.',
      ],
    }),
    scene({
      title: b('The Torn Sail', 'La vela rasgada'),
      narrative: b(
        'The first squall tears the forward sail along an old repair. The original route remains possible at reduced speed, while a smaller storm sail would force a different handling plan.',
        'La primera ráfaga rasga la vela de proa sobre una reparación antigua. La ruta original sigue siendo posible a menor velocidad, mientras una vela de tormenta más pequeña exigiría otro plan de maniobra.',
      ),
      pair: ['adaptability', 'persistence'],
      facets: ['strategy_revision', 'goal_commitment'],
      contexts: ['change', 'physical_risk'],
      pressure: true,
      visual: b(
        'A torn forward sail in hard rain, sailors holding rigging and a smaller storm sail ready below.',
        'Una vela de proa rasgada bajo lluvia intensa, marineros sosteniendo cabos y una vela de tormenta lista abajo.',
      ),
      en: [
        'Change sails, revise the route and keep the destination fixed.',
        'Patch the damaged sail and continue the original plan while monitoring the seam.',
        'Adopt the storm sail but ask another officer to redesign the route as you preserve crew effort.',
        'Heave to briefly and protect the remaining equipment before recommitting.',
      ],
      es: [
        'Cambias la vela, revisas la ruta y mantienes fijo el destino.',
        'Reparas la vela dañada y continúas el plan original mientras vigilas la costura.',
        'Adoptas la vela de tormenta, pero pides a otro oficial rediseñar la ruta mientras sostienes el esfuerzo de la tripulación.',
        'Te mantienes a la capa brevemente y proteges el equipo restante antes de volver a comprometerte.',
      ],
    }),
    scene({
      title: b('The Channel of Black Water', 'El canal de agua negra'),
      narrative: b(
        'Dark water marks a fast channel between reefs. It could save six hours before the storm closes in, but the latest depth chart is two seasons old.',
        'El agua oscura marca un canal rápido entre arrecifes. Podría ahorrar seis horas antes de que cierre la tormenta, pero la última carta de profundidad tiene dos temporadas.',
      ),
      pair: ['risk_tolerance', 'structure'],
      facets: ['downside_tolerance', 'planning'],
      contexts: ['physical_risk', 'time_pressure'],
      pressure: true,
      visual: b(
        'Black current between pale reefs, old depth-chart symbols and a storm wall closing behind the vessel.',
        'Corriente negra entre arrecifes pálidos, símbolos antiguos de profundidad y un muro de tormenta acercándose detrás de la embarcación.',
      ),
      en: [
        'Sound the channel ahead, define abort markers and take the faster passage.',
        'Enter on the old chart with strict speed, spacing and lookout rules.',
        'Use the longer outer route after reorganizing watches and supplies.',
        'Hold outside the reef until visibility improves despite the closing storm.',
      ],
      es: [
        'Sondeas el canal, defines señales de abandono y tomas el paso rápido.',
        'Entras con la carta antigua bajo reglas estrictas de velocidad, separación y vigilancia.',
        'Usas la ruta exterior más larga después de reorganizar guardias y suministros.',
        'Esperas fuera del arrecife hasta que mejore la visibilidad pese a la tormenta que se acerca.',
      ],
    }),
    scene({
      title: b('Fear Below Deck', 'Miedo bajo cubierta'),
      narrative: b(
        'A crash in the dark sends several passengers toward the ladders at once. No one is injured, but one frightened voice insists the hull has split and others begin repeating it.',
        'Un golpe en la oscuridad hace que varios pasajeros corran hacia las escaleras. Nadie está herido, pero una voz asustada insiste en que el casco se abrió y otros comienzan a repetirlo.',
      ),
      pair: ['emotional_regulation', 'empathy_cooperation'],
      facets: ['affect_tolerance', 'prosocial_response'],
      contexts: ['time_pressure', 'caregiving'],
      pressure: true,
      visual: b(
        'Lantern-lit lower deck, frightened passengers near ladders, crew inspecting intact hull beams, no text.',
        'Cubierta inferior iluminada por faroles, pasajeros asustados cerca de las escaleras y tripulación inspeccionando vigas intactas, sin texto.',
      ),
      en: [
        'Acknowledge the fear, verify the hull aloud and guide people back in small groups.',
        'Contain the rush first, then deliver only the verified facts in a steady voice.',
        'Stay with the most frightened passengers while an officer restores deck order.',
        'Clear the lower deck and postpone explanation until the inspection is complete.',
      ],
      es: [
        'Reconoces el miedo, verificas el casco en voz alta y guías a las personas de regreso en grupos pequeños.',
        'Contienes primero la estampida y luego comunicas solo los hechos verificados con voz estable.',
        'Permaneces con los pasajeros más asustados mientras un oficial restablece el orden.',
        'Despejas la cubierta inferior y postergas la explicación hasta completar la inspección.',
      ],
    }),
    scene({
      title: b('The Route That Vanished', 'La ruta que desapareció'),
      narrative: b(
        'Rain erases the coastal peaks used for navigation, and the current no longer matches the morning estimate. The crew can preserve its watch system or reorganize around instruments and soundings.',
        'La lluvia borra los picos costeros usados para navegar y la corriente ya no coincide con la estimación de la mañana. La tripulación puede conservar sus guardias o reorganizarse alrededor de instrumentos y sondeos.',
      ),
      pair: ['structure', 'adaptability'],
      facets: ['organization', 'contextual_switching'],
      contexts: ['uncertainty', 'change'],
      visual: b(
        'Coastal peaks disappearing behind rain, compass, lead line and crew changing stations, no readable markings.',
        'Picos costeros desapareciendo tras la lluvia, brújula, escandallo y tripulación cambiando de puesto, sin marcas legibles.',
      ),
      en: [
        'Reassign watches around new instruments and set frequent course reviews.',
        'Preserve the watch structure but replace visual bearings with measured soundings.',
        'Switch to short rotating teams and let each update the route from fresh conditions.',
        'Reduce sail and wait for one reliable landmark before reorganizing.',
      ],
      es: [
        'Reasignas guardias alrededor de nuevos instrumentos y fijas revisiones frecuentes del rumbo.',
        'Conservas la estructura de guardias, pero reemplazas referencias visuales por sondeos.',
        'Cambias a equipos rotativos breves y permites que cada uno actualice la ruta con condiciones nuevas.',
        'Reduces vela y esperas una referencia confiable antes de reorganizar.',
      ],
    }),
    scene({
      title: b('The Failing Pump', 'La bomba que falla'),
      narrative: b(
        'A bilge pump begins losing pressure. Repeated repair keeps it working for minutes at a time, while replacing its valve would stop pumping during the most violent part of the squall.',
        'Una bomba de achique empieza a perder presión. Las reparaciones repetidas la mantienen funcionando por minutos, mientras reemplazar la válvula detendría el bombeo durante la parte más violenta de la ráfaga.',
      ),
      pair: ['persistence', 'emotional_regulation'],
      facets: ['frustration_tolerance', 'impulse_regulation'],
      contexts: ['physical_risk', 'time_pressure'],
      pressure: true,
      visual: b(
        'Crew around a failing brass bilge pump, rising water, spare valve and restrained urgency.',
        'Tripulación alrededor de una bomba de achique de bronce que falla, agua subiendo, válvula de repuesto y urgencia contenida.',
      ),
      en: [
        'Keep repairs going while calmly preparing one controlled replacement window.',
        'Continue the proven temporary repair and suppress changes until the squall eases.',
        'Pause repair attempts, steady the team and let the engineer decide the replacement moment.',
        'Seal the compartment and conserve the crew for hazards that have clearer solutions.',
      ],
      es: [
        'Mantienes las reparaciones mientras preparas con calma una ventana controlada para el reemplazo.',
        'Continúas la reparación temporal probada y evitas cambios hasta que ceda la ráfaga.',
        'Pausas los intentos, estabilizas al equipo y dejas que la ingeniera decida el momento del reemplazo.',
        'Sellas el compartimento y conservas a la tripulación para peligros con soluciones más claras.',
      ],
    }),
    scene({
      title: b('One Cup Short', 'Una taza menos'),
      narrative: b(
        'Saltwater reaches one freshwater barrel. The remaining supply is enough only if labor, the injured navigator and frightened passengers accept different portions.',
        'El agua salada alcanza un barril de agua dulce. La reserva restante alcanza solo si los trabajadores, la navegante herida y los pasajeros asustados aceptan porciones diferentes.',
      ),
      pair: ['empathy_cooperation', 'leadership_initiative'],
      facets: ['perspective_taking', 'coordination'],
      contexts: ['resource_scarcity', 'group_coordination'],
      visual: b(
        'A damaged freshwater barrel, measured cups and three waiting groups on a dim deck, no labels.',
        'Un barril de agua dulce dañado, tazas medidas y tres grupos esperando sobre una cubierta oscura, sin etiquetas.',
      ),
      en: [
        'Hear each group’s functional need, set portions and explain who will review them.',
        'Set portions immediately from work demands and assign distribution to trusted crew.',
        'Ask representatives to propose the ration plan while you protect the injured navigator’s voice.',
        'Issue equal portions until more information about duration is available.',
      ],
      es: [
        'Escuchas la necesidad funcional de cada grupo, fijas porciones y explicas quién las revisará.',
        'Fijas porciones según las tareas y asignas la distribución a tripulantes de confianza.',
        'Pides a representantes proponer el racionamiento mientras proteges la voz de la navegante herida.',
        'Entregas porciones iguales hasta tener más información sobre la duración.',
      ],
    }),
    scene({
      title: b('The Lantern Reef', 'El arrecife de los faroles'),
      narrative: b(
        'Three drifting lights appear where no harbor is charted. They may mark fishing boats, a reef passage or wreckage moving in the current; the storm is closing from the west.',
        'Tres luces a la deriva aparecen donde no hay ningún puerto registrado. Pueden señalar barcos pesqueros, un paso entre arrecifes o restos movidos por la corriente; la tormenta se cierra desde el oeste.',
      ),
      pair: ['risk_tolerance', 'autonomy'],
      facets: ['commitment_under_uncertainty', 'self_directed_action'],
      contexts: ['uncertainty', 'exploration'],
      pressure: true,
      visual: b(
        'Three lanterns drifting above black water near unseen reefs, expedition vessel under a closing storm.',
        'Tres faroles a la deriva sobre agua negra cerca de arrecifes ocultos, embarcación bajo una tormenta que se cierra.',
      ),
      en: [
        'Approach to a measured distance, set an escape bearing and decide from your own observation.',
        'Commit to passing the lights on your chosen side without seeking group agreement.',
        'Send a sounding boat while the vessel holds position under the navigator’s command.',
        'Turn away from the uncharted lights and accept the longer stormward route.',
      ],
      es: [
        'Te acercas hasta una distancia medida, fijas un rumbo de escape y decides según tu observación.',
        'Te comprometes a pasar las luces por el lado elegido sin buscar acuerdo grupal.',
        'Envías un bote de sondeo mientras la embarcación espera bajo el mando de la navegante.',
        'Te alejas de las luces no registradas y aceptas la ruta más larga hacia la tormenta.',
      ],
    }),
    scene({
      title: b('The Mast Gives Way', 'El mástil cede'),
      narrative: b(
        'The upper mast cracks and traps a line across the steering deck. The original rig can be saved with concentrated effort, or the crew can cut it free and redesign the vessel’s balance.',
        'El mástil superior se quiebra y atrapa un cabo sobre la cubierta de gobierno. El aparejo original puede salvarse con esfuerzo concentrado, o la tripulación puede liberarlo y rediseñar el equilibrio del barco.',
      ),
      pair: ['adaptability', 'leadership_initiative'],
      facets: ['resource_reallocation', 'delegation'],
      contexts: ['change', 'time_pressure'],
      pressure: true,
      visual: b(
        'Cracked upper mast and trapped steering line, crews poised at axes and rigging under driving rain.',
        'Mástil superior quebrado y cabo atrapado sobre el timón, equipos listos con hachas y aparejos bajo lluvia intensa.',
      ),
      en: [
        'Cut the damaged section, reassign crews and build a smaller balanced rig.',
        'Change the rig yourself and give each team a precise new responsibility.',
        'Ask the boatswain to redesign the rig while you shift people and supplies around the change.',
        'Secure the mast in place and preserve the current command structure until the sea eases.',
      ],
      es: [
        'Cortas la sección dañada, reasignas equipos y construyes un aparejo menor y equilibrado.',
        'Cambias el aparejo tú mismo y das a cada equipo una responsabilidad nueva y precisa.',
        'Pides al contramaestre rediseñar el aparejo mientras redistribuyes personas y suministros.',
        'Aseguras el mástil en su lugar y conservas la estructura de mando hasta que calme el mar.',
      ],
    }),
    scene({
      title: b('Voices Against the Helm', 'Voces contra el timón'),
      narrative: b(
        'Two experienced officers disagree at the helm: one wants the open sea, the other the lee of unknown islands. Their argument spreads through a tired crew that now wants certainty more than nuance.',
        'Dos oficiales experimentados discrepan en el timón: uno quiere mar abierto y la otra el reparo de islas desconocidas. La discusión se extiende por una tripulación cansada que ahora desea certeza más que matices.',
      ),
      pair: ['emotional_regulation', 'social_confidence'],
      facets: ['composure_under_pressure', 'disagreement_tolerance'],
      contexts: ['interpersonal_conflict', 'social_risk'],
      pressure: true,
      visual: b(
        'Two officers arguing beside the helm, exhausted crew, open sea on one side and dark islands on the other.',
        'Dos oficiales discutiendo junto al timón, tripulación agotada, mar abierto a un lado e islas oscuras al otro.',
      ),
      en: [
        'State what is known, let each officer challenge your reasoning and choose without disguising the tension.',
        'Choose a route firmly and end the public argument before it destabilizes the watch.',
        'Slow the exchange, ask one clarifying question and let the navigator announce the route.',
        'Move the debate below deck and keep the current heading until agreement appears.',
      ],
      es: [
        'Declaras lo conocido, permites que cada oficial cuestione tu razonamiento y eliges sin ocultar la tensión.',
        'Eliges una ruta con firmeza y terminas la discusión pública antes de que desestabilice la guardia.',
        'Desaceleras el intercambio, haces una pregunta aclaratoria y dejas que la navegante anuncie la ruta.',
        'Trasladas el debate bajo cubierta y mantienes el rumbo hasta que aparezca un acuerdo.',
      ],
    }),
    scene({
      title: b('The False Calm', 'La calma falsa'),
      narrative: b(
        'Near midnight the wind dies so completely that relief moves across the deck. The pressure keeps falling, however, and dismantled equipment still covers half the passageways.',
        'Cerca de la medianoche el viento desaparece por completo y el alivio recorre la cubierta. Sin embargo, la presión sigue cayendo y el equipo desmontado aún cubre la mitad de los pasillos.',
      ),
      pair: ['persistence', 'adaptability'],
      facets: ['sustained_effort', 'feedback_learning'],
      contexts: ['change', 'responsibility'],
      visual: b(
        'Unnaturally still black sea, exhausted crew among dismantled gear and low storm clouds pressing overhead.',
        'Mar negro extrañamente quieto, tripulación agotada entre equipos desmontados y nubes bajas de tormenta.',
      ),
      en: [
        'Use the calm to finish essential work, then revise the watch from the falling pressure.',
        'Continue the repair sequence exactly while the favorable window lasts.',
        'Change priorities toward securing the deck and rotate tired workers out early.',
        'Let everyone rest until the weather gives an unmistakable new signal.',
      ],
      es: [
        'Usas la calma para terminar lo esencial y luego revisas la guardia según la presión descendente.',
        'Continúas exactamente la secuencia de reparaciones mientras dure la ventana favorable.',
        'Cambias prioridades para asegurar la cubierta y relevas temprano a quienes están agotados.',
        'Dejas descansar a todos hasta que el clima dé una señal nueva e inequívoca.',
      ],
    }),
    scene({
      title: b('The Rescue Light', 'La luz de rescate'),
      narrative: b(
        'A single light rises from a damaged skiff beyond the safe turning arc. Reaching it risks the repaired mast and water reserve; passing it preserves the expedition but leaves strangers in the storm.',
        'Una sola luz surge de un bote dañado más allá del arco seguro de giro. Alcanzarlo arriesga el mástil reparado y la reserva de agua; seguir de largo conserva la expedición, pero deja desconocidos en la tormenta.',
      ),
      pair: ['risk_tolerance', 'empathy_cooperation'],
      facets: ['calculated_risk', 'interpersonal_concern'],
      contexts: ['physical_risk', 'caregiving'],
      pressure: true,
      visual: b(
        'A damaged skiff holding one rescue lantern beyond rough water, expedition vessel turning under strained rigging.',
        'Un bote dañado con un farol de rescate más allá de aguas violentas, embarcación girando con el aparejo bajo tensión.',
      ),
      en: [
        'Calculate one rescue pass, name the abort limit and ask volunteers to crew it.',
        'Commit the vessel to the rescue because the exposure is acceptable for the lives at stake.',
        'Launch a light boat with supplies while keeping the main vessel outside the dangerous turn.',
        'Mark the position for the nearest patrol and preserve the expedition’s remaining safety.',
      ],
      es: [
        'Calculas una pasada de rescate, nombras el límite de abandono y pides voluntarios.',
        'Comprometes la embarcación con el rescate porque la exposición es aceptable ante las vidas en juego.',
        'Lanzas un bote ligero con suministros mientras mantienes la nave principal fuera del giro peligroso.',
        'Marcas la posición para la patrulla más cercana y conservas la seguridad restante de la expedición.',
      ],
    }),
    scene({
      title: b('The Second Wall', 'El segundo muro'),
      narrative: b(
        'The calm ends beneath a second wall of rain coming from the opposite direction. Every earlier forecast is now partly wrong, and the repaired deck must be prepared in minutes.',
        'La calma termina bajo un segundo muro de lluvia que llega desde la dirección opuesta. Todos los pronósticos anteriores están ahora parcialmente equivocados y la cubierta reparada debe prepararse en minutos.',
      ),
      pair: ['structure', 'openness_to_uncertainty'],
      facets: ['prioritization', 'possibility_holding'],
      contexts: ['time_pressure', 'uncertainty'],
      pressure: true,
      visual: b(
        'Two storm fronts meeting above a repaired vessel, crew securing lines among shifting wind and rain.',
        'Dos frentes de tormenta encontrándose sobre una embarcación reparada, tripulación asegurando cabos bajo viento cambiante.',
      ),
      en: [
        'Set three immediate priorities while keeping alternate responses ready for the collision of fronts.',
        'Use the most likely wind sequence to issue one clear preparation order.',
        'Keep several interpretations open and prepare modular equipment for whichever arrives.',
        'Reduce all activity to sheltering people until the new pattern becomes clear.',
      ],
      es: [
        'Fijas tres prioridades inmediatas mientras mantienes respuestas alternativas para el choque de frentes.',
        'Usas la secuencia de viento más probable para dar una orden clara de preparación.',
        'Mantienes varias interpretaciones abiertas y preparas equipo modular para la que llegue.',
        'Reduces toda actividad a proteger personas hasta que el nuevo patrón sea claro.',
      ],
    }),
    scene({
      title: b('The Night Watch Breaks', 'La guardia nocturna se quiebra'),
      narrative: b(
        'Fatigue causes two watch teams to miss the same change in current. No disaster follows, but another lapse in the final channel could place the entire vessel on rock.',
        'La fatiga hace que dos equipos de guardia omitan el mismo cambio de corriente. No ocurre un desastre, pero otra falla en el canal final podría llevar a toda la nave contra las rocas.',
      ),
      pair: ['leadership_initiative', 'emotional_regulation'],
      facets: ['mobilization', 'recovery'],
      contexts: ['responsibility', 'time_pressure'],
      pressure: true,
      visual: b(
        'Exhausted night watches around dim instruments, final rocky channel faintly visible ahead.',
        'Guardias nocturnas agotadas alrededor de instrumentos tenues, con el canal rocoso final apenas visible.',
      ),
      en: [
        'Acknowledge the lapse, reorganize the watches and personally cover the transition.',
        'Issue a stricter rotation immediately and keep your own focus on the helm.',
        'Let the rested boatswain rebuild the watch while you help the teams recover composure.',
        'Slow the vessel and suspend nonessential duties until fatigue is reduced.',
      ],
      es: [
        'Reconoces la falla, reorganizas las guardias y cubres personalmente la transición.',
        'Impones de inmediato una rotación más estricta y mantienes tu atención en el timón.',
        'Dejas que el contramaestre descansado reconstruya la guardia mientras ayudas a los equipos a recuperar la calma.',
        'Reduces la velocidad y suspendes tareas no esenciales hasta disminuir la fatiga.',
      ],
    }),
    scene({
      title: b('The Final Channel', 'El canal final'),
      narrative: b(
        'At first light the destination appears beyond a narrow channel. The storm still pushes from behind, the soundings vary, and turning back now would mean facing the same sea with fewer reserves.',
        'Con la primera luz aparece el destino más allá de un canal estrecho. La tormenta aún empuja desde atrás, los sondeos varían y regresar ahora significaría enfrentar el mismo mar con menos reservas.',
      ),
      pair: ['risk_tolerance', 'persistence'],
      facets: ['commitment_under_uncertainty', 'goal_commitment'],
      contexts: ['physical_risk', 'time_pressure'],
      pressure: true,
      visual: b(
        'Narrow rocky channel at first light, destination harbor beyond, storm pressing behind the worn vessel.',
        'Canal rocoso estrecho con la primera luz, puerto de destino al fondo y tormenta presionando detrás de la nave desgastada.',
      ),
      en: [
        'Commit after fresh soundings, define the point of no return and sustain the passage together.',
        'Enter now and hold the chosen line despite the changing depths.',
        'Keep working toward land while letting the navigator decide whether each sounding justifies another turn.',
        'Anchor outside the channel and accept exposure while waiting for steadier conditions.',
      ],
      es: [
        'Te comprometes después de nuevos sondeos, defines el punto sin retorno y sostienes la entrada en conjunto.',
        'Entras ahora y mantienes la línea elegida pese a los cambios de profundidad.',
        'Sigues trabajando hacia tierra mientras dejas que la navegante decida si cada sondeo justifica otro giro.',
        'Anclas fuera del canal y aceptas la exposición mientras esperas condiciones más estables.',
      ],
    }),
    scene({
      title: b('The Account of the Storm', 'El relato de la tormenta'),
      narrative: b(
        'Safe inside the breakwater, the crew gathers around the damaged barometer. Some want a simple story of courage; others want every uncertainty, error and change preserved for the next expedition.',
        'A salvo dentro del rompeolas, la tripulación se reúne alrededor del barómetro dañado. Algunos quieren una historia sencilla de valentía; otros quieren conservar cada incertidumbre, error y cambio para la próxima expedición.',
      ),
      pair: ['knowledge_orientation', 'openness_to_uncertainty'],
      facets: ['reflective_analysis', 'incomplete_answer_tolerance'],
      contexts: ['knowledge_gap', 'loss'],
      visual: b(
        'Worn crew gathered around the same damaged barometer at sunrise inside a safe breakwater, symbolic log diagrams only.',
        'Tripulación agotada alrededor del mismo barómetro dañado al amanecer dentro de un rompeolas seguro, solo diagramas simbólicos.',
      ),
      en: [
        'Record what changed, what remains unexplained and which decisions deserve later review.',
        'Build one coherent account from the strongest evidence and publish its practical lessons.',
        'Preserve conflicting interpretations beside the observations so future crews can test them.',
        'Record only the confirmed route and losses, leaving uncertain judgments private.',
      ],
      es: [
        'Registras qué cambió, qué sigue sin explicación y qué decisiones merecen revisión posterior.',
        'Construyes un relato coherente con la evidencia más sólida y publicas sus lecciones prácticas.',
        'Conservas interpretaciones en conflicto junto a las observaciones para que futuras tripulaciones puedan probarlas.',
        'Registras solo la ruta y las pérdidas confirmadas, dejando en privado los juicios inciertos.',
      ],
    }),
  ],
});
