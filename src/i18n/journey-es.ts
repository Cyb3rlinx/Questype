export interface LocalizedScene {
  title: string;
  narrative: string;
  choices: readonly [string, string, string, string];
}

export const journeyEs: Record<string, LocalizedScene> = {
  scene_01: {
    title: 'La tinta aún está fresca',
    narrative: 'Despiertas con la última nota de una melodía olvidada todavía vibrando en el pecho. Frente a tu puerta hay una carta sin sello ni remitente. Dentro, un mapa rasgado muestra un camino, una antigua estación de viajeros abandonada y un faro más allá de la costa. La tinta aún está húmeda. Desde la estación vacía comienza a sonar una campana. No sabes quién te eligió, cómo llegó la carta ni adónde conduce realmente el camino. Solo sabes que la primera respuesta te pertenece.',
    choices: ['Partir de inmediato y seguir la campana antes de que la incertidumbre se convierta en duda.', 'Examinar el papel, la entrada y el suelo exterior en busca de algún detalle que haya dejado quien lo envió.', 'Esperar a que la campana vuelva a sonar y escuchar si existe un patrón antes de decidir cuándo avanzar.', 'Preparar agua, comida y vendajes para necesidades que el mapa no puede anticipar.'],
  },
  scene_02: {
    title: 'El mercader que reconoció la carta',
    narrative: 'El mapa te conduce por un mercado nocturno junto a la estación abandonada. Bajan los faroles y cierran los últimos puestos cuando un mercader ve tu carta y olvida su cansancio. Te cuenta que, al atardecer, un flautista enmascarado tocó bajo la luna llena y entregó cartas semejantes a unas pocas personas. Cada mapa señala el Faro de la Vigilia, aunque nadie sabe qué espera allí. El mercader no propone ningún trato. Solo te concede tiempo para una pregunta honesta antes de que continúes.',
    choices: ['Preguntar por la distancia, el terreno y los peligros entre el mercado y el faro.', 'Preguntar quién era el flautista y qué pudo guiar su elección de viajeros.', 'Preguntar qué sintió el mercader durante la melodía y por qué todavía la recuerda.', 'Aceptar que ninguna explicación será completa y preguntar qué esperanza atrae a las personas hacia el faro.'],
  },
  scene_03: {
    title: 'El puente roto',
    narrative: 'Más allá de la estación, el camino se estrecha sobre un desfiladero. Parte del viejo puente ha cedido y deja tablas mojadas, una cuerda guía desgastada y un tramo abierto sobre el río. Otros portadores de cartas han llegado al mismo obstáculo. Ningún mapa muestra una ruta alternativa y la tormenta a tus espaldas se acerca. El puente debe cruzarse; la manera en que enfrentas el peligro todavía es tuya.',
    choices: ['Atarte la cuerda y probar con el primer paso la sección que parece más firme.', 'Examinar los soportes y marcar las tablas con mayor probabilidad de sostener a todos.', 'Usar madera suelta y cuerda para reforzar el tramo abierto antes de que alguien cruce.', 'Observar el ritmo del viento y elegir el breve instante de calma en que sea posible avanzar.'],
  },
  scene_04: {
    title: 'La tormenta en la torre de vigilancia',
    narrative: 'Sin importar cómo cruzó cada viajero, todos alcanzan la otra orilla. La lluvia cubre el camino y el grupo se refugia antes del anochecer en una torre de vigilancia en ruinas. El agua entra por una ventana rota. Antiguas marcas de rutas cubren una pared, hay provisiones dispersas por el suelo y el miedo ha hecho que el lugar parezca más pequeño. La tormenta pasará por sí sola. Tú eliges cómo habitar esta espera.',
    choices: ['Ordenar el espacio seco, despejar las salidas y darle al lugar una estructura sencilla.', 'Estudiar las marcas desvanecidas para comprender qué caminos conectaban la torre con la costa.', 'Cubrir la ventana rota con tela y madera para que el refugio proteja a todos hasta la mañana.', 'Contar una historia que permita a los viajeros asustados colocar su atención en otro lugar.'],
  },
  scene_05: {
    title: 'Una desconocida junto al fuego',
    narrative: 'Al amanecer, la tormenta se ha agotado. Los viajeros se separan según su propio ritmo y regresas solo al camino. Al anochecer encuentras a una mujer llamada Mara junto al fuego. Su mapa muestra el mismo faro, aunque la costa está dibujada de otro modo. Ella no pide acompañarte y tú no necesitas decidir su futuro. Durante una noche, dos viajes inconclusos comparten la misma luz.',
    choices: ['Comparar los mapas con cuidado e identificar qué revela cada uno que el otro omite.', 'Preguntar qué mantuvo a Mara en movimiento y compartir la parte de tu propia razón que aún no has dicho en voz alta.', 'Dibujar una versión más clara del próximo tramo para que cualquiera de los dos pueda comprenderlo después.', 'Convertir la noche en un juego de historias imposibles y dejar que la risa abra espacio para la honestidad.'],
  },
  scene_06: {
    title: 'La carreta en el barro',
    narrative: 'Mara parte con la primera luz, siguiendo su propio ritmo. Cerca del mediodía llegas a un paso estrecho donde una carreta de suministros se ha hundido hasta el eje. Lleva aceite para lámparas, mantas y comida hacia el campamento costero bajo el faro. El conductor y los demás viajeros coinciden en el destino, pero no en qué hacer primero. La carreta avanzará cuando suficientes manos encuentren un ritmo común.',
    choices: ['Nombrar las tareas, asignarlas a manos dispuestas y coordinar un intento.', 'Colocar una palanca de madera bajo la rueda y darle al grupo un punto concreto contra el cual empujar.', 'Convertir las ideas en pruebas rápidas y usar el humor para evitar que el fracaso se vuelva culpa.', 'Cuestionar que toda la carga deba permanecer dentro y retirar el peso que puede llevarse por separado.'],
  },
  scene_07: {
    title: 'La criatura bajo el refugio',
    narrative: 'La carreta continúa y el camino desciende hacia un antiguo bosque de cedros. Bajo un refugio derrumbado escuchas una respiración demasiado profunda para ser humana. Un joven grifo está atrapado por una correa de cuero retorcida alrededor de una rama caída. Sus plumas están empapadas, un ala tiembla y el miedo vuelve peligroso cada movimiento. No conoce tu intención. Debes decidir qué significará tu presencia.',
    choices: ['Dejar agua a su alcance, mantener distancia y buscar señales de lesión antes de tocar la correa.', 'Estudiar los movimientos del grifo hasta comprender qué rama sostiene la tensión.', 'Construir un corredor claro con telas y ramas para que la criatura tenga una salida segura al quedar libre.', 'Pedir a todos que retrocedan, bajen la voz y permitan que vuelva la calma antes de actuar.'],
  },
  scene_08: {
    title: 'La costa bajo la luna',
    narrative: 'Cuando el grifo queda libre, desaparece entre los cedros sin mirar atrás. Al atardecer, el bosque se abre hacia la costa y ves por primera vez el Faro de la Vigilia. Se alza en una isla negra al otro lado de un canal estrecho. Un campamento de pescadores descansa sobre una terraza de piedra y se prepara para la luna llena. El viento está cambiando y los pescadores advierten que la marea podría cubrir los senderos bajos antes de medianoche.',
    choices: ['Revisar las salidas y el terreno elevado, y decidir qué senderos bajos deben cerrarse antes de que suba el agua.', 'Estudiar la costa y el faro desde todos los puntos disponibles antes de que caiga la oscuridad.', 'Ayudar a trasladar las últimas pertenencias desde las plataformas bajas antes de que la ruta deje de ser segura.', 'Reunir a los viajeros que llegan, compartir comida y asegurar que nadie prepare la noche en soledad.'],
  },
  scene_09: {
    title: 'La marea creciente',
    narrative: 'La advertencia se cumple. La luz de la luna vuelve plateado el canal mientras las olas cubren la plataforma de descarga y cortan la escalera inferior. El campamento permanece seguro arriba, pero varias personas todavía ascienden con niños, provisiones y mochilas empapadas. Ningún monstruo causó este peligro y ninguna victoria detendrá el mar. Lo que importa es el lugar que ocupas mientras todos alcanzan el mismo terreno seguro.',
    choices: ['Sostener la cuerda guía en el borde expuesto para que otros suban sin perder el equilibrio.', 'Separar el flujo de personas y carga para que ninguno bloquee la escalera estrecha.', 'Permanecer junto a un viajero asustado y seguir hablando hasta que el siguiente paso se sienta posible.', 'Formar una cadena estable para que cada persona cargue solo lo que puede llegar con seguridad al siguiente par de manos.'],
  },
  scene_10: {
    title: 'Los cuatro objetos',
    narrative: 'Con la marea baja, un sendero de piedra se abre hacia la isla. A mitad del cruce entras en una cámara tallada en el acantilado. Cuatro objetos reposan bajo una inscripción: Toma lo que crees necesitar. Descubre si puedes soltarlo. Hay una daga estrecha, una llave de hierro, un frasco de líquido ámbar y una capa gastada. Solo puedes tocar uno antes de que la cámara vuelva a abrirse.',
    choices: ['Elegir la daga: un filo preciso para cortar aquello que intente retenerte.', 'Elegir la llave: una invitación a entrar en aquello que ha permanecido cerrado y desconocido.', 'Elegir el frasco: la promesa de que la percepción puede cambiar antes que el mundo.', 'Elegir la capa: una protección que puede cubrirte o abrirse alrededor de alguien más.'],
  },
  scene_11: {
    title: 'El guardián del camino',
    narrative: 'La misma puerta se abre para cada elección. Del otro lado, un fauno espera junto a una piedra plana con una lámpara y un bastón gastado. Dice que el objeto nunca fue un pago ni un premio. Le pertenece al camino. Antes de mostrarte el ascenso final, debes colocar lo que elegiste sobre la piedra. El destino no cambiará. Solo te pertenece la manera en que decides soltarlo.',
    choices: ['Dejar el objeto de inmediato y confiar en un ritual que todavía no comprendes.', 'Preguntar qué ocurrirá con él y quién podría necesitarlo después; luego dejarlo sobre la piedra.', 'Marcar dónde fue encontrado para que el próximo viajero comprenda su historia; después soltarlo.', 'Pedir a otro viajero que coloque sus manos bajo las tuyas para convertir el acto de soltar en algo compartido.'],
  },
  scene_12: {
    title: 'El banquete de quienes llegaron',
    narrative: 'El fauno guía a cada viajero por la misma escalera oculta y se marcha antes de la puerta del faro. Dentro, una larga mesa ofrece pan, caldo y fruta a quienes cruzaron el camino. Rostros del puente, la torre y la costa aparecen entre desconocidos que llevaron mapas diferentes. Nadie te pide demostrar que perteneces. Antes de que comience la ceremonia, tienes tiempo para decidir cómo entrar en este círculo.',
    choices: ['Mover los lugares hasta que rostros conocidos y desconocidos compartan la mesa sin jerarquías.', 'Aceptar la comida y permitirte descansar antes de exigirle otra respuesta al camino.', 'Compartir un momento que fue importante para ti y escuchar cuál fue importante para alguien más.', 'Contar la parte más absurda del viaje y dejar que toda la mesa respire a través de la risa.'],
  },
  scene_13: {
    title: 'El faro apagado',
    narrative: 'Una cuidadora interrumpe el banquete con urgencia serena. La linterna superior se ha apagado y varios barcos ya esperan más allá del arrecife. En la sala de mantenimiento hay aceite por transportar, un soporte doblado, un horario que nadie ha acordado y una pared de pequeños reflectores. La luz solo puede regresar mediante esfuerzos distintos. ¿Qué tarea te atrae primero?',
    choices: ['Subir las reservas de aceite más pesadas y relevar a quienes ya están agotados por el ascenso.', 'Reparar el soporte con un refuerzo poco convencional hecho con las herramientas disponibles.', 'Coordinar el trabajo en turnos breves para que la luz pueda mantenerse después de esta noche.', 'Ordenar los pequeños reflectores para que una llama modesta alcance a cruzar el mar.'],
  },
  scene_14: {
    title: 'Lo que dejas al próximo viajero',
    narrative: 'La linterna reparada proyecta un haz amplio sobre el agua. Antes de la ceremonia de luna llena, la cuidadora abre un cuaderno gastado lleno de dibujos, advertencias y mensajes de quienes llegaron antes. Queda una sola página en blanco. Nada de lo que escribas cambiará el camino de esta noche, pero podría convertirse en la primera compañía de alguien que aún no ha recibido su carta.',
    choices: ['Escribir un mensaje con muchas voces y dejar espacio para que futuros viajeros agreguen sus propias líneas.', 'Dibujar las secciones difíciles del camino y las pequeñas mejoras que hicieron posible el paso.', 'Escribir una carta íntima sobre el momento que más te cambió, dirigida a quien la necesite.', 'Dejar un acertijo que transforme una verdad difícil en algo que el próximo viajero desee descubrir.'],
  },
  scene_15: {
    title: 'La melodía que te recordaba',
    narrative: 'A medianoche, los viajeros entran en una cámara circular abierta a la luna llena. El flautista enmascarado está en el centro, tal como lo describió el mercader. Te mira como si esta no fuera tu primera llegada y dice: «Esta vez llegaste hasta el final». A tu alrededor, los demás guardan silencio. La puerta permanece abierta, el faro arde sobre ustedes y el flautista eleva su instrumento. Antes de que la primera nota te alcance, ¿cómo eliges recibirla?',
    choices: ['Escuchar sin exigir que la melodía se explique antes de permitir que te alcance.', 'Permanecer cerca de la puerta abierta, consciente de tu respiración y del espacio que aún controlas.', 'Observar las pausas, el ritmo y las reacciones de las personas a tu alrededor.', 'Seguir el ritmo con los dedos y participar sin renunciar a tu conciencia.'],
  },
};
