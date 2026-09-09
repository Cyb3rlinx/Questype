import type { ArchetypeKey } from '../domain/types.js';
import type { Locale } from './locale.js';

export interface ArchetypeResultCopy {
  headline: string;
  emphasis: string;
  threadLead: string;
  threadBody: string;
  quote: string;
  strengthTitles: readonly [string, string, string, string];
}

const resultCopy: Record<Locale, Record<ArchetypeKey, ArchetypeResultCopy>> = {
  es: {
    innocent: {
      headline: 'Conservar la luz',
      emphasis: 'sin negar la tormenta.',
      threadLead: 'Tu hilo es la confianza consciente: la capacidad de proteger lo bueno sin dejar de mirar con honestidad lo que podría amenazarlo.',
      threadBody: 'Cuando otros se preparan para perder, tu atención encuentra aquello que todavía puede ser cuidado. No se trata de ingenuidad, sino de una orientación interior hacia la claridad, la reparación y los comienzos posibles. Tu crecimiento aparece cuando permites que la evidencia difícil fortalezca tu esperanza en lugar de destruirla.',
      quote: 'La esperanza madura no cierra los ojos; aprende a mirar sin entregar la luz.',
      strengthTitles: ['Esperanza que orienta', 'Claridad sin artificios', 'Confianza que abre puertas', 'Memoria de lo esencial'],
    },
    explorer: {
      headline: 'Seguir el horizonte',
      emphasis: 'que se siente propio.',
      threadLead: 'Tu hilo es la búsqueda de una vida elegida desde dentro, incluso cuando avanzar implica abandonar una certeza conocida.',
      threadBody: 'La ruta segura puede ofrecer descanso, pero rara vez responde por completo a tu necesidad de descubrir. Lees cada límite como una pregunta sobre cuánto de tu vida has elegido realmente. Tu crecimiento consiste en permanecer el tiempo suficiente para que la libertad adquiera profundidad, dirección y un compromiso que también hayas escogido.',
      quote: 'No todo lo lejano es libertad; el verdadero horizonte comienza donde eliges con honestidad.',
      strengthTitles: ['Curiosidad ante lo desconocido', 'Rutas fuera de lo habitual', 'Adaptación en movimiento', 'Autonomía con criterio'],
    },
    sage: {
      headline: 'Comprender antes',
      emphasis: 'de entregar el rumbo.',
      threadLead: 'Tu hilo es la necesidad de distinguir señal de ruido y convertir lo observado en una comprensión que ayude a decidir mejor.',
      threadBody: 'Tu mente busca la estructura que une los hechos antes de aceptar una conclusión. Allí donde otros reaccionan a la primera impresión, tú abres espacio para una pregunta mejor. Tu crecimiento comienza cuando reconoces que una comprensión suficiente puede acompañar la acción, aunque la certeza total todavía no haya llegado.',
      quote: 'La verdad no siempre entrega certeza, pero puede darte una pregunta más honesta.',
      strengthTitles: ['Preguntas que revelan', 'Patrones bajo la superficie', 'Evidencia antes que suposición', 'Perspectiva para decidir'],
    },
    hero: {
      headline: 'Responder cuando el camino',
      emphasis: 'exige presencia.',
      threadLead: 'Tu hilo es la voluntad de convertir el valor en acción y asumir el peso de un momento cuando permanecer inmóvil también tiene un costo.',
      threadBody: 'Frente a una dificultad, tu energía se organiza alrededor de lo que debe hacerse. El desafío despierta disciplina, resistencia y una necesidad de demostrar el compromiso mediante actos visibles. Tu crecimiento surge al comprender que pedir apoyo, medir el costo y descansar a tiempo también pueden ser expresiones de valentía.',
      quote: 'El coraje no elimina el miedo; decide qué merece avanzar a pesar de él.',
      strengthTitles: ['El primer paso', 'Resistencia con propósito', 'Responsabilidad visible', 'Intención convertida en acción'],
    },
    outlaw: {
      headline: 'Abrir una salida donde obedecer',
      emphasis: 'ya no tiene sentido.',
      threadLead: 'Tu hilo es una sensibilidad aguda frente a los límites vacíos y el impulso de recuperar libertad cuando una estructura deja de servir.',
      threadBody: 'Percibes con rapidez cuándo una regla protege solo su propia existencia. Tu fuerza aparece al nombrar lo que otros toleran y abrir una alternativa donde parecía no haberla. Tu crecimiento se vuelve más profundo cuando la ruptura no termina en rechazo, sino que prepara una forma más libre y responsable de continuar.',
      quote: 'Romper una regla puede abrir el camino; saber qué construir después convierte la ruptura en libertad.',
      strengthTitles: ['Reglas puestas a prueba', 'Verdades que incomodan', 'Alternativas frente a la rigidez', 'Libertad con fundamento'],
    },
    magician: {
      headline: 'Transformar la mirada',
      emphasis: 'para transformar el camino.',
      threadLead: 'Tu hilo es percibir relaciones que otros todavía no ven y reunir intención, significado y acción hasta volver posible un cambio real.',
      threadBody: 'Tu atención se dirige hacia el patrón oculto: la relación entre una señal, una emoción y la posibilidad que todavía no tiene nombre. Puedes cambiar una situación al cambiar primero la manera de comprenderla. Tu crecimiento exige llevar la visión al terreno de la prueba, donde la transformación demuestra que puede sostenerse en la realidad.',
      quote: 'La transformación comienza como una nueva forma de mirar y se demuestra en lo que haces después.',
      strengthTitles: ['Conexiones invisibles', 'Perspectiva que transforma', 'Intuición hecha posibilidad', 'Visión sostenida con sentido'],
    },
    lover: {
      headline: 'Hacer del vínculo',
      emphasis: 'una forma de presencia.',
      threadLead: 'Tu hilo es reconocer que la calidad de una experiencia depende de cuánto significado, belleza y atención somos capaces de ofrecerle.',
      threadBody: 'No atraviesas el mundo como si las cosas fueran intercambiables: percibes matices, gestos y ausencias que revelan cuánto importa un vínculo. Tu presencia puede convertir un momento ordinario en algo significativo. Tu crecimiento aparece cuando proteges esa profundidad sin abandonar tus propios límites ni confundir intensidad con reciprocidad.',
      quote: 'Aquello que amas orienta tu atención; aquello que atiendes con presencia puede volverse hogar.',
      strengthTitles: ['Escucha del significado', 'Presencia que acerca', 'Belleza en los detalles', 'Humanidad en cada decisión'],
    },
    creator: {
      headline: 'Dar forma a aquello',
      emphasis: 'que todavía no existe.',
      threadLead: 'Tu hilo es la necesidad de convertir una visión interior en algo concreto, reconocible y capaz de permanecer más allá de la idea inicial.',
      threadBody: 'Donde otros ven materiales dispersos, tú imaginas una forma que aún no ha sido construida. Crear te permite ordenar la experiencia y dejar una huella que lleve tu lenguaje. Tu crecimiento ocurre al aceptar que terminar, compartir y revisar una obra también forman parte de su verdad, aunque nunca alcance la perfección imaginada.',
      quote: 'Crear es permitir que una posibilidad te cambie mientras aprendes a darle forma.',
      strengthTitles: ['Posibilidades originales', 'Ideas convertidas en forma', 'Diseño que eleva la experiencia', 'Paciencia para iterar'],
    },
    caregiver: {
      headline: 'Sostener aquello que permite',
      emphasis: 'que otros continúen.',
      threadLead: 'Tu hilo es advertir lo que necesita apoyo y convertir la empatía en una acción concreta que preserve a las personas y al camino.',
      threadBody: 'Notas el cansancio, la necesidad o la fragilidad antes de que alguien encuentre palabras para pedir ayuda. Tu cuidado crea continuidad y devuelve dignidad a los detalles que un grupo apresurado podría ignorar. Tu crecimiento comienza cuando incluyes tus propias necesidades en el círculo de atención y permites que otros también aprendan a sostener.',
      quote: 'Cuidar también es confiar en que el otro puede caminar sin que cargues todos sus pasos.',
      strengthTitles: ['Necesidades que no pasan inadvertidas', 'Ayuda concreta', 'Continuidad en la dificultad', 'Conciencia del costo humano'],
    },
    jester: {
      headline: 'Devolver movimiento',
      emphasis: 'a lo que se volvió rígido.',
      threadLead: 'Tu hilo es encontrar una abertura mediante el juego, la espontaneidad y una perspectiva inesperada cuando la tensión estrecha las posibilidades.',
      threadBody: 'Percibes cuándo una situación se ha vuelto prisionera de su propia solemnidad. Una pregunta irreverente, una risa o un giro inesperado pueden devolver aire al grupo y hacer visible otra salida. Tu crecimiento está en permitir que la ligereza acompañe la profundidad, quedándote también cuando el momento necesita escucha y continuidad.',
      quote: 'A veces la verdad entra por la puerta que la solemnidad dejó cerrada.',
      strengthTitles: ['Tensión liberada', 'Juego que invita', 'El ángulo inesperado', 'Presencia compartida'],
    },
    ruler: {
      headline: 'Construir el orden',
      emphasis: 'que vuelve posible avanzar.',
      threadLead: 'Tu hilo es crear dirección donde hay dispersión y establecer condiciones confiables para que una responsabilidad compartida pueda sostenerse.',
      threadBody: 'Ante el caos, observas recursos, consecuencias y responsabilidades hasta descubrir una estructura viable. Tu capacidad para organizar convierte una intención colectiva en un camino que puede sostenerse. Tu crecimiento aparece cuando el orden incluye conversación, reparte autoridad y conserva la flexibilidad necesaria para responder a lo que ningún plan pudo anticipar.',
      quote: 'La autoridad más firme no ocupa todo el espacio; crea las condiciones para que otros también respondan.',
      strengthTitles: ['Responsabilidades claras', 'Visión del plan completo', 'Recursos y consecuencias visibles', 'Sistemas que permanecen'],
    },
    everyman: {
      headline: 'Convertir el camino',
      emphasis: 'en un lugar compartido.',
      threadLead: 'Tu hilo es crear pertenencia desde la participación cotidiana y recordar que una contribución no necesita ser excepcional para ser valiosa.',
      threadBody: 'Tu fuerza nace de reconocer lo que las personas comparten sin borrar aquello que las hace distintas. Haces que participar resulte cercano, posible y digno, especialmente para quien podría quedar al margen. Tu crecimiento consiste en sostener esa pertenencia mientras expresas una preferencia propia, incluso cuando no exista un acuerdo inmediato.',
      quote: 'Pertenecer no exige desaparecer en el grupo; también necesita que lleves tu voz.',
      strengthTitles: ['Terreno común', 'Participación accesible', 'Responsabilidad compartida', 'Nadie queda fuera'],
    },
  },
  en: {
    innocent: {
      headline: 'Keep the light', emphasis: 'without denying the storm.',
      threadLead: 'Your thread is conscious trust: the capacity to protect what is good while looking honestly at what could threaten it.',
      threadBody: 'When others prepare for loss, your attention finds what can still be tended. This is not simple naïveté, but an inner orientation toward clarity, repair and possible beginnings. Your growth appears when difficult evidence is allowed to strengthen your hope instead of destroying it.',
      quote: 'Mature hope does not close its eyes; it learns to see without surrendering the light.',
      strengthTitles: ['Hope that gives direction', 'Clarity without pretense', 'Trust that opens doors', 'Memory of what matters'],
    },
    explorer: {
      headline: 'Follow the horizon', emphasis: 'that feels like your own.',
      threadLead: 'Your thread is the search for a life chosen from within, even when moving forward means leaving a familiar certainty behind.',
      threadBody: 'The safe route may offer rest, but it rarely answers your need to discover. You read each boundary as a question about how much of your life you have truly chosen. Growth asks you to stay long enough for freedom to acquire depth, direction and a commitment you have also chosen.',
      quote: 'Not everything distant is freedom; the true horizon begins where you choose honestly.',
      strengthTitles: ['Curiosity before the unknown', 'Routes beyond convention', 'Adaptation in motion', 'Autonomy with judgment'],
    },
    sage: {
      headline: 'Understand before', emphasis: 'you surrender the course.',
      threadLead: 'Your thread is the need to separate signal from noise and turn observation into understanding that helps people choose wisely.',
      threadBody: 'Your mind looks for the structure connecting the facts before accepting a conclusion. Where others react to a first impression, you create room for a better question. Growth begins when you recognize that sufficient understanding can travel beside action, even when complete certainty has not yet arrived.',
      quote: 'Truth does not always bring certainty, but it can give you a more honest question.',
      strengthTitles: ['Questions that reveal', 'Patterns beneath the surface', 'Evidence before assumption', 'Perspective for the choice'],
    },
    hero: {
      headline: 'Answer when the road', emphasis: 'asks you to be present.',
      threadLead: 'Your thread is the will to turn courage into action and carry the weight of a moment when standing still also has a cost.',
      threadBody: 'When difficulty appears, your energy gathers around what must be done. Challenge awakens discipline, endurance and a need to demonstrate commitment through visible action. Growth comes through understanding that asking for support, measuring the cost and resting in time can also be expressions of courage.',
      quote: 'Courage does not remove fear; it decides what deserves to move forward despite it.',
      strengthTitles: ['The first step', 'Endurance with purpose', 'Visible responsibility', 'Intention made action'],
    },
    outlaw: {
      headline: 'Open a way when obedience', emphasis: 'no longer makes sense.',
      threadLead: 'Your thread is a sharp sensitivity to empty limits and the drive to reclaim freedom when a structure stops serving its purpose.',
      threadBody: 'You quickly notice when a rule protects only its own existence. Your strength appears when you name what others tolerate and open an alternative where none seemed available. Growth deepens when disruption does not end in rejection, but prepares a freer and more responsible way to continue.',
      quote: 'Breaking a rule can open the road; knowing what to build next turns rupture into freedom.',
      strengthTitles: ['Rules put to the test', 'Truths that disturb', 'Alternatives to rigidity', 'Freedom with a foundation'],
    },
    magician: {
      headline: 'Transform the way you see', emphasis: 'to transform the road.',
      threadLead: 'Your thread is noticing relationships others cannot yet see and joining intention, meaning and action until real change becomes possible.',
      threadBody: 'Your attention moves toward the hidden pattern: the relationship between a signal, a feeling and a possibility that has no name yet. You can change a situation by first changing how it is understood. Growth asks you to bring the vision into testing, where transformation proves it can endure in reality.',
      quote: 'Transformation begins as a new way of seeing and proves itself in what you do next.',
      strengthTitles: ['Hidden connections', 'Perspective that transforms', 'Intuition made possible', 'Vision held with meaning'],
    },
    lover: {
      headline: 'Make connection', emphasis: 'a form of presence.',
      threadLead: 'Your thread is recognizing that the quality of an experience depends on the meaning, beauty and attention we are willing to bring to it.',
      threadBody: 'You do not move through the world as if things were interchangeable; you notice nuances, gestures and absences that reveal what a bond means. Your presence can make an ordinary moment significant. Growth appears when you protect that depth without abandoning your boundaries or mistaking intensity for reciprocity.',
      quote: 'What you love guides your attention; what you attend to fully can become a home.',
      strengthTitles: ['Listening for meaning', 'Presence that draws close', 'Beauty in the details', 'Humanity in each decision'],
    },
    creator: {
      headline: 'Give form to what', emphasis: 'does not exist yet.',
      threadLead: 'Your thread is the need to turn an inner vision into something tangible, recognizable and able to endure beyond the first idea.',
      threadBody: 'Where others see scattered materials, you imagine a form that has not been built. Creating lets you order experience and leave a mark that carries your language. Growth occurs when finishing, sharing and revising are accepted as part of the work’s truth, even when it never reaches the perfection first imagined.',
      quote: 'To create is to let a possibility change you while you learn to give it form.',
      strengthTitles: ['Original possibilities', 'Ideas given form', 'Design that deepens experience', 'Patience to iterate'],
    },
    caregiver: {
      headline: 'Sustain what allows', emphasis: 'others to continue.',
      threadLead: 'Your thread is noticing what needs support and turning empathy into concrete action that protects both people and the road ahead.',
      threadBody: 'You notice fatigue, need or fragility before someone finds the words to ask for help. Your care creates continuity and restores dignity to details a hurried group might miss. Growth begins when your own needs enter the circle of attention and you allow others to learn how to support as well.',
      quote: 'Care also means trusting others to walk without carrying every step for them.',
      strengthTitles: ['Needs that do not go unseen', 'Help made practical', 'Continuity through difficulty', 'Awareness of the human cost'],
    },
    jester: {
      headline: 'Return movement', emphasis: 'to what has grown rigid.',
      threadLead: 'Your thread is finding an opening through play, spontaneity and an unexpected perspective when tension narrows what seems possible.',
      threadBody: 'You sense when a situation has become trapped inside its own solemnity. An irreverent question, a laugh or an unexpected turn can return air to the group and reveal another exit. Growth lies in letting lightness accompany depth, while staying present when the moment also needs listening and follow-through.',
      quote: 'Sometimes truth enters through the door that solemnity left closed.',
      strengthTitles: ['Tension released', 'Play that invites', 'The unexpected angle', 'Shared presence'],
    },
    ruler: {
      headline: 'Build the order', emphasis: 'that makes progress possible.',
      threadLead: 'Your thread is creating direction amid dispersion and establishing reliable conditions where shared responsibility can endure.',
      threadBody: 'Faced with disorder, you examine resources, consequences and responsibilities until a workable structure appears. Your capacity to organize turns collective intention into a road that can last. Growth emerges when order includes conversation, distributes authority and preserves enough flexibility to meet what no plan could anticipate.',
      quote: 'The strongest authority does not occupy all the space; it creates conditions for others to answer too.',
      strengthTitles: ['Clear responsibilities', 'Sight of the whole plan', 'Visible resources and consequences', 'Systems that endure'],
    },
    everyman: {
      headline: 'Turn the road', emphasis: 'into common ground.',
      threadLead: 'Your thread is creating belonging through everyday participation and remembering that a contribution need not be exceptional to matter.',
      threadBody: 'Your strength begins with recognizing what people share without erasing what makes them different. You make participation feel approachable, possible and dignified, especially for someone at risk of being left outside. Growth means preserving that belonging while voicing a preference of your own, even when agreement is not immediate.',
      quote: 'Belonging does not ask you to disappear into the group; it also needs your voice.',
      strengthTitles: ['Common ground', 'Accessible participation', 'Shared responsibility', 'No one left outside'],
    },
  },
};

export function archetypeResultCopy(slug: ArchetypeKey, locale: Locale): ArchetypeResultCopy {
  return resultCopy[locale][slug];
}
