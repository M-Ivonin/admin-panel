import type { Locale } from '@/lib/i18n/config';
import {
  getQuizDefinition,
  listQuizDefinitions,
} from '@/modules/quizzes/definitions';
import type {
  QuizAxisDefinition,
  QuizDefinition,
  QuizLandingStat,
  QuizQuestionDefinition,
  QuizResultDefinition,
} from '@/modules/quizzes/types';

interface QuizUiCopy {
  hubBreadcrumbLabel: string;
  hubTitle: string;
  hubMetaTitle: string;
  hubMetaDescription: string;
  hubIntro: string;
  hubChipLabel: string;
  hubEyebrow: string;
  openQuizLabel: string;
  questionsLabel: string;
  outcomesLabel: string;
  potentialOutcomesTitle: string;
  potentialOutcomesDescription: string;
  backButtonLabel: string;
  scoreProfileLabel: string;
  continueWithSirBroLabel: string;
  openDownloadPageLabel: string;
  sharedSuccessfullyLabel: string;
  linkCopiedLabel: string;
  shareUnavailableLabel: string;
  quizMetaSuffix: string;
  resultMetaLabel: string;
}

type LocalizedAxisCopy = Pick<
  QuizAxisDefinition,
  'label' | 'shortLabel' | 'hint' | 'zoneLabel'
>;
type LocalizedQuestionCopy = Pick<
  QuizQuestionDefinition,
  'text' | 'labelLeft' | 'labelRight'
>;
type LocalizedResultCopy = Pick<QuizResultDefinition, 'name' | 'description'>;
type LocalizedLandingStatCopy = Pick<QuizLandingStat, 'label'>;

interface LocalizedQuizCopy {
  title: string;
  hubSubtitle: string;
  hubStatLine: string;
  eyebrow: string;
  liveBadgeLabel: string;
  heroTitlePrimary: string;
  heroTitleAccent: string;
  landingDescription: string;
  landingEmphasis: string;
  landingStats: LocalizedLandingStatCopy[];
  questionnaireLabel: string;
  startButtonLabel: string;
  nextButtonLabel: string;
  finishButtonLabel: string;
  resultHeading: string;
  shareCardLabel: string;
  shareCallToActionLabel: string;
  retakeButtonLabel: string;
  shareButtonLabel: string;
  axes: LocalizedAxisCopy[];
  plotCenterLabel: string;
  questions: LocalizedQuestionCopy[];
  results: LocalizedResultCopy[];
}

const QUIZ_UI_COPY: Record<Locale, QuizUiCopy> = {
  en: {
    hubBreadcrumbLabel: 'Quizzes',
    hubTitle: 'Quizzes',
    hubMetaTitle: 'Football Quizzes',
    hubMetaDescription:
      'Test your football knowledge, discover your tactical DNA, and share your SirBro quiz result.',
    hubIntro:
      'Test your football knowledge, discover your tactical DNA, and share your results with the world.',
    hubChipLabel: 'SirBro Quizzes',
    hubEyebrow: 'Interactive football formats',
    openQuizLabel: 'Open quiz',
    questionsLabel: 'questions',
    outcomesLabel: 'outcomes',
    potentialOutcomesTitle: 'Potential outcomes',
    potentialOutcomesDescription:
      'The quiz keeps the SirBro public style but stays focused on one thing: a quick, clean result you can share.',
    backButtonLabel: 'Back',
    scoreProfileLabel: 'Score profile',
    continueWithSirBroLabel: 'Continue with SirBro',
    openDownloadPageLabel: 'Open the app download page',
    sharedSuccessfullyLabel: 'Shared successfully.',
    linkCopiedLabel: 'Link copied to clipboard.',
    shareUnavailableLabel: 'Unable to share this result on this device.',
    quizMetaSuffix: 'Quiz',
    resultMetaLabel: 'Result',
  },
  es: {
    hubBreadcrumbLabel: 'Quizzes',
    hubTitle: 'Quizzes',
    hubMetaTitle: 'Quizzes de futbol',
    hubMetaDescription:
      'Pon a prueba tus conocimientos de futbol, descubre tu ADN tactico y comparte el resultado de tu quiz de SirBro.',
    hubIntro:
      'Pon a prueba tus conocimientos de futbol, descubre tu ADN tactico y comparte tus resultados con el mundo.',
    hubChipLabel: 'Quizzes de SirBro',
    hubEyebrow: 'Formatos interactivos de futbol',
    openQuizLabel: 'Abrir quiz',
    questionsLabel: 'preguntas',
    outcomesLabel: 'resultados',
    potentialOutcomesTitle: 'Posibles resultados',
    potentialOutcomesDescription:
      'El quiz mantiene el estilo publico de SirBro, pero se centra en una sola cosa: un resultado rapido y limpio que puedas compartir.',
    backButtonLabel: 'Atras',
    scoreProfileLabel: 'Perfil de puntuacion',
    continueWithSirBroLabel: 'Sigue con SirBro',
    openDownloadPageLabel: 'Abrir la pagina de descarga de la app',
    sharedSuccessfullyLabel: 'Compartido con exito.',
    linkCopiedLabel: 'Enlace copiado al portapapeles.',
    shareUnavailableLabel:
      'No se puede compartir este resultado en este dispositivo.',
    quizMetaSuffix: 'Quiz',
    resultMetaLabel: 'Resultado',
  },
  pt: {
    hubBreadcrumbLabel: 'Quizzes',
    hubTitle: 'Quizzes',
    hubMetaTitle: 'Quizzes de futebol',
    hubMetaDescription:
      'Teste seus conhecimentos de futebol, descubra seu DNA tatico e compartilhe o resultado do seu quiz SirBro.',
    hubIntro:
      'Teste seus conhecimentos de futebol, descubra seu DNA tatico e compartilhe seus resultados com o mundo.',
    hubChipLabel: 'Quizzes do SirBro',
    hubEyebrow: 'Formatos interativos de futebol',
    openQuizLabel: 'Abrir quiz',
    questionsLabel: 'perguntas',
    outcomesLabel: 'resultados',
    potentialOutcomesTitle: 'Resultados possiveis',
    potentialOutcomesDescription:
      'O quiz mantém o estilo publico do SirBro, mas foca em uma coisa: um resultado rapido e direto que voce pode compartilhar.',
    backButtonLabel: 'Voltar',
    scoreProfileLabel: 'Perfil de pontuacao',
    continueWithSirBroLabel: 'Continue com o SirBro',
    openDownloadPageLabel: 'Abrir a pagina de download do app',
    sharedSuccessfullyLabel: 'Compartilhado com sucesso.',
    linkCopiedLabel: 'Link copiado para a area de transferencia.',
    shareUnavailableLabel:
      'Nao foi possivel compartilhar este resultado neste dispositivo.',
    quizMetaSuffix: 'Quiz',
    resultMetaLabel: 'Resultado',
  },
};

const LOCALIZED_QUIZ_COPY: Record<
  Exclude<Locale, 'en'>,
  Record<string, LocalizedQuizCopy>
> = {
  es: {
    'tactical-identity': {
      title: 'Identidad Tactica',
      hubSubtitle: 'Que tipo de mente futbolera eres?',
      hubStatLine: '10 preguntas · 3 arquetipos',
      eyebrow: 'SirBro presenta',
      liveBadgeLabel: 'Quiz en vivo',
      heroTitlePrimary: 'Identidad',
      heroTitleAccent: 'Tactica',
      landingDescription: '10 preguntas. 3 arquetipos. Un solo ADN tactico.',
      landingEmphasis: 'Donde encajas?',
      landingStats: [
        { label: 'Preguntas' },
        { label: 'Arquetipos' },
        { label: 'Jugadores' },
      ],
      questionnaireLabel: 'Quiz tactico',
      startButtonLabel: 'Empezar quiz',
      nextButtonLabel: 'Siguiente',
      finishButtonLabel: 'Revelar identidad',
      resultHeading: 'Tu identidad tactica',
      shareCardLabel: 'SirBro × ID Tactica',
      shareCallToActionLabel: 'Unete a mas de 50.000 mentes tacticas en SirBro',
      retakeButtonLabel: 'Repetir quiz',
      shareButtonLabel: 'Compartir resultado',
      axes: [
        {
          label: 'Purista',
          shortLabel: 'PUR',
          hint: 'Guardiola',
          zoneLabel: 'ARTISTA',
        },
        {
          label: 'Heavy Metal',
          shortLabel: 'HVM',
          hint: 'Klopp',
          zoneLabel: 'DESTRUCTOR',
        },
        {
          label: 'Pragmatico',
          shortLabel: 'PRA',
          hint: 'Mourinho',
          zoneLabel: 'ARQUITECTO',
        },
      ],
      plotCenterLabel: 'ESPECIALISTA',
      questions: [
        {
          text: 'Cual es tu filosofia futbolistica?',
          labelLeft: 'Ganar a cualquier precio',
          labelRight: 'Ganar con futbol bonito',
        },
        {
          text: 'Como defiende tu linea de fondo?',
          labelLeft: 'Autobus atras',
          labelRight: 'Presion alta con la linea adelantada',
        },
        {
          text: 'Quien es tu creador ideal?',
          labelLeft: 'Un diez paciente',
          labelRight: 'Un motor box-to-box',
        },
        {
          text: 'Cual es tu estrategia de fichajes?',
          labelLeft: 'Veteranos contrastados',
          labelRight: 'Joyas ocultas de los datos',
        },
        {
          text: 'Como te gustan las victorias?',
          labelLeft: 'Un 1-0 clinico',
          labelRight: 'Un caotico 4-3',
        },
        {
          text: 'Como funciona tu mediocampo?',
          labelLeft: 'Control de posesion',
          labelRight: 'Balones largos y directos',
        },
        {
          text: 'Acabas de perder el balon. Que pasa despues?',
          labelLeft: 'Replegar y reorganizarse',
          labelRight: 'Presionar al instante',
        },
        {
          text: 'Como evaluas el futbol moderno?',
          labelLeft: 'Mirar las estadisticas de xG',
          labelRight: 'Ojo, intuicion y pasion',
        },
        {
          text: 'Minuto 60 y el plan no funciona.',
          labelLeft: 'Ajuste tactico tardio en el 80',
          labelRight: 'Cambio de impacto ya',
        },
        {
          text: 'Como es tu estadio soñado?',
          labelLeft: 'Una fortaleza tradicional',
          labelRight: 'Una arena moderna optimizada por datos',
        },
      ],
      results: [
        {
          name: 'El Especialista',
          description:
            'Eres el camaleon tactico que toda directiva quiere en secreto. Darias una charla TED sobre gegenpressing y luego meterias el autobus en una final de copa sin pestañear.',
        },
        {
          name: 'El Purista',
          description:
            'Preferirias perder 5-4 jugando al tiki-taka antes que ganar 1-0 con un balon largo. Tu sabado ideal es ver highlights de Cruyff mientras pules una hoja de estadisticas de posesion.',
        },
        {
          name: 'El Pragmatico',
          description:
            'Los resultados son tu religion y las porterias a cero son tus himnos. Pondrias cinco centrales en una final del Mundial y dormirias como un bebe despues.',
        },
        {
          name: 'El Heavy Metal',
          description:
            'Tu idea de estrategia defensiva es marcar mas goles de los que encajas. Harias contra-presion hasta en tu boda si alguien intercepta la tarta.',
        },
      ],
    },
    'fan-archetype': {
      title: 'Arquetipo de Hincha',
      hubSubtitle: 'Analista, ultra o cazaglorias?',
      hubStatLine: '6 preguntas · 3 arquetipos',
      eyebrow: 'SirBro presenta',
      liveBadgeLabel: 'Quiz en vivo',
      heroTitlePrimary: 'Arquetipo',
      heroTitleAccent: 'de Hincha',
      landingDescription: '6 preguntas. 3 tipos de hincha. Una identidad.',
      landingEmphasis: 'Eres analista, ultra o cazaglorias?',
      landingStats: [
        { label: 'Preguntas' },
        { label: 'Arquetipos' },
        { label: 'Hinchas' },
      ],
      questionnaireLabel: 'Arquetipo de hincha',
      startButtonLabel: 'Empezar quiz',
      nextButtonLabel: 'Siguiente',
      finishButtonLabel: 'Revelar arquetipo',
      resultHeading: 'Tu arquetipo de hincha',
      shareCardLabel: 'SirBro × Arquetipo de Hincha',
      shareCallToActionLabel:
        'Unete a mas de 50.000 obsesos del futbol en SirBro',
      retakeButtonLabel: 'Repetir quiz',
      shareButtonLabel: 'Compartir resultado',
      axes: [
        {
          label: 'Analista',
          shortLabel: 'ANL',
          hint: 'Datos y xG',
          zoneLabel: 'CEREBRITO',
        },
        {
          label: 'Ultra',
          shortLabel: 'ULT',
          hint: 'Lealtad y ambiente',
          zoneLabel: 'FANATICO',
        },
        {
          label: 'Cazaglorias',
          shortLabel: 'CGL',
          hint: 'Estrellas y trofeos',
          zoneLabel: 'CAZADOR DE ESTRELLAS',
        },
      ],
      plotCenterLabel: 'HINCHA COMPLETO',
      questions: [
        {
          text: 'Por que apoyas a tu equipo?',
          labelLeft: 'Herencia local y tradicion familiar',
          labelRight: 'Exito global y poder de estrellas',
        },
        {
          text: 'Que haces justo despues de un partido?',
          labelLeft: 'Ver fan-cams y celebraciones',
          labelRight: 'Analizar mapas de calor y xG',
        },
        {
          text: 'Como consumes las noticias del mercado?',
          labelLeft: 'Tweets de Fabrizio Romano y drama',
          labelRight: 'Informes de scouts y perfiles de datos',
        },
        {
          text: 'Llega un jugador nuevo a tu club. Que importa mas?',
          labelLeft: 'Ventas de camisetas y sensaciones',
          labelRight: 'Estadisticas de pase progresivo',
        },
        {
          text: 'De que va realmente el futbol?',
          labelLeft: 'El alma del estadio',
          labelRight: 'Entretenimiento y marca global',
        },
        {
          text: 'Que hace de un jugador una verdadera leyenda?',
          labelLeft: 'Lealtad de por vida a un solo club',
          labelRight: "Balon de Oro y montones de trofeos",
        },
      ],
      results: [
        {
          name: 'El Hincha Completo',
          description:
            'Vives en la grada, manejas los numeros y ademas tienes todas las camisetas. Eres esa rara especie que puede cantar 90 minutos y luego debatir modelos de amenaza esperada en el parking.',
        },
        {
          name: 'El Fanatico de los Datos',
          description:
            'Sangras los colores de tu club, pero lo respaldas con hojas de calculo. Tu ritual de partido es mitad canto de grada, mitad seguimiento de xG en el movil.',
        },
        {
          name: 'El Analista',
          description:
            'Ves el juego en numeros. Mientras otros celebran el gol, tu ya estas revisando la linea temporal del xG. Tu navegador tiene mas pestañas de datos de futbol que un departamento de scouting.',
        },
        {
          name: 'El Ultra Ilustrado',
          description:
            'Traes ruido y conocimiento. Le ganas a cualquier grada en volumen y luego explicas con calma por que el trigger de presion estuvo mal usando datos de StatsBomb.',
        },
        {
          name: 'El Ultra',
          description:
            'El futbol no es un deporte para ti: es una religion. Naciste en este club y saldras de el en un ataud cubierto con sus colores. La atmosfera lo es todo.',
        },
        {
          name: 'El Rey del Oportunismo',
          description:
            'Sigues las luces brillantes, pero aun te queda la lealtad justa para defender tus decisiones. Tu armario es un 40% camisetas de clubes a los que "siempre apoyaste".',
        },
        {
          name: 'El Cazaglorias',
          description:
            'Si ganan, los estas viendo. Tu equipo favorito es el que acaba de fichar a la mayor estrella. Tienes tres "clubes principales" y cero verguenza por ello.',
        },
      ],
    },
    'transfer-guru': {
      title: 'Guru del Mercado',
      hubSubtitle: 'Moneyballer, purista de cantera o cazador de galacticos?',
      hubStatLine: '6 preguntas · 3 filosofias',
      eyebrow: 'SirBro presenta',
      liveBadgeLabel: 'Quiz en vivo',
      heroTitlePrimary: 'Guru',
      heroTitleAccent: 'del Mercado',
      landingDescription: '6 preguntas. 3 filosofias. Un ADN de fichajes.',
      landingEmphasis:
        'Eres moneyballer, purista de cantera o cazador de galacticos?',
      landingStats: [
        { label: 'Preguntas' },
        { label: 'Filosofias' },
        { label: 'Directores' },
      ],
      questionnaireLabel: 'Guru del mercado',
      startButtonLabel: 'Empezar quiz',
      nextButtonLabel: 'Siguiente',
      finishButtonLabel: 'Revelar resultado',
      resultHeading: 'Tu filosofia de fichajes',
      shareCardLabel: 'SirBro × Guru del Mercado',
      shareCallToActionLabel:
        'Unete a mas de 50.000 mentes de fichajes en SirBro',
      retakeButtonLabel: 'Repetir quiz',
      shareButtonLabel: 'Compartir resultado',
      axes: [
        {
          label: 'Moneyballer',
          shortLabel: 'MNY',
          hint: 'Datos y valor',
          zoneLabel: 'HOJA DE CALCULO',
        },
        {
          label: 'Cantera',
          shortLabel: 'CAN',
          hint: 'Juventud y lealtad',
          zoneLabel: 'JUVENIL',
        },
        {
          label: 'Galactico',
          shortLabel: 'GAL',
          hint: 'Estrellas y trofeos',
          zoneLabel: 'GRAN GASTADOR',
        },
      ],
      plotCenterLabel: 'EQUILIBRADO',
      questions: [
        {
          text: 'Hora de fichar una nueva estrella. A quien vas a por el?',
          labelLeft: 'Un joven de 19 años con xG elite',
          labelRight: 'Un supercrack contrastado de 28 años',
        },
        {
          text: 'Tienes 100 millones para gastar. Cual es el plan?',
          labelLeft: 'Tres promesas de cantera',
          labelRight: 'Un fichaje mundial de cartel',
        },
        {
          text: 'Donde encuentras tu proximo fichaje?',
          labelLeft: 'Tus ojos y la historia del club',
          labelRight: 'Algoritmos avanzados de datos',
        },
        {
          text: 'Como es tu plantilla ideal?',
          labelLeft: 'Leyendas locales y fieles',
          labelRight: 'Iconos globales e influencers',
        },
        {
          text: 'El valor de una estrella toca techo. Que haces?',
          labelLeft: 'Quedartelo hasta que se retire en el club',
          labelRight: 'Vender y reinvertir en el pico de valor',
        },
        {
          text: 'Describe tu fichaje ideal.',
          labelLeft: 'Una gema infravalorada de segunda division',
          labelRight: 'Un aspirante al Balon de Oro',
        },
      ],
      results: [
        {
          name: 'El Director Equilibrado',
          description:
            'Juegas todos los angulos: datos, juventud y estrellas. En tu sala de juntas hay una hoja de calculo, un mapa de scouting y un poster de Zidane. Eres basicamente Ed Woodward si Ed Woodward fuese competente de verdad.',
        },
        {
          name: 'El Scout de Datos',
          description:
            'Encuentras diamantes en bruto y los pules en casa. Tu portatil tiene mas pestañas abiertas que una biblioteca: mitad bases de scouting, mitad planes de desarrollo juvenil.',
        },
        {
          name: 'El Scout de Datos',
          description:
            'No ves highlights, ves graficas de goles esperados. Mientras otros persiguen nombres en la espalda de la camiseta, tu persigues valor por 90. Tu presupuesto de fichajes tiene mejor ROI que la bolsa.',
        },
        {
          name: 'El Visionario de la Cantera',
          description:
            'Formas a los tuyos y ademas lo respaldas con datos. Tu academia tiene una red de scouting mejor que muchos primeros equipos. El xG de cada canterano esta tatuado en tu cerebro.',
        },
        {
          name: 'El Visionario de la Cantera',
          description:
            'Para que comprar si puedes construir? Tu ventana de fichajes consiste en subir a otro chico de 17 años del sub-23. Tu idea de un bombazo es renovar a un canterano.',
        },
        {
          name: 'El Gran Gastador',
          description:
            'Quieres los nombres mas grandes, pero tienes debilidad por el chico del barrio. Tu once parece un FIFA Ultimate Team con una eleccion sentimental metida en la plantilla.',
        },
        {
          name: 'El Gran Gastador',
          description:
            'A lo grande o nada. Si no ha salido en la portada del FIFA, no te interesa. Tu presupuesto parece un numero de telefono y tu masa salarial hace llorar a los contables.',
        },
      ],
    },
    'goat-philosophy': {
      title: 'Filosofia G.O.A.T.',
      hubSubtitle: 'Estadistico, artista o ganador?',
      hubStatLine: '6 preguntas · 3 filosofias',
      eyebrow: 'SirBro presenta',
      liveBadgeLabel: 'Quiz en vivo',
      heroTitlePrimary: 'Filosofia',
      heroTitleAccent: 'G.O.A.T.',
      landingDescription: '6 preguntas. 3 filosofias. Un ADN G.O.A.T.',
      landingEmphasis: 'Eres estadistico, artista o ganador?',
      landingStats: [
        { label: 'Preguntas' },
        { label: 'Filosofias' },
        { label: 'Debatientes' },
      ],
      questionnaireLabel: 'Filosofia G.O.A.T.',
      startButtonLabel: 'Empezar quiz',
      nextButtonLabel: 'Siguiente',
      finishButtonLabel: 'Revelar resultado',
      resultHeading: 'Tu filosofia G.O.A.T.',
      shareCardLabel: 'SirBro × Filosofia G.O.A.T.',
      shareCallToActionLabel:
        'Unete a mas de 50.000 debatientes del GOAT en SirBro',
      retakeButtonLabel: 'Repetir quiz',
      shareButtonLabel: 'Compartir resultado',
      axes: [
        {
          label: 'Estadistico',
          shortLabel: 'EST',
          hint: 'Ronaldo',
          zoneLabel: 'RECORD',
        },
        {
          label: 'Artista',
          shortLabel: 'ART',
          hint: 'Zidane',
          zoneLabel: 'ROMANTICO',
        },
        {
          label: 'Ganador',
          shortLabel: 'GAN',
          hint: 'Pele',
          zoneLabel: 'TROFEO',
        },
      ],
      plotCenterLabel: 'LEGADO',
      questions: [
        {
          text: 'Que impresiona mas en un G.O.A.T.?',
          labelLeft: 'Marcar 30 goles durante 20 años seguidos',
          labelRight: '3 años de genialidad intocable',
        },
        {
          text: 'Que tan importante es el Mundial?',
          labelLeft: 'Solo es un torneo de 7 partidos',
          labelRight: 'El requisito definitivo para la grandeza',
        },
        {
          text: 'Que hace especial a un jugador?',
          labelLeft: 'Un fenomeno fisico: velocidad, potencia, resistencia',
          labelRight: 'Un maestro del balon: toque, vision y fantasia',
        },
        {
          text: 'Cual es el mayor legado?',
          labelLeft: 'Hacer un hat-trick en una final del Mundial',
          labelRight: 'Cambiar para siempre la forma en que se juega',
        },
        {
          text: 'Consistencia o pico: que importa mas?',
          labelLeft: 'Consistencia mecanica, año tras año',
          labelRight: 'Momentos de magia pura e irrepetible',
        },
        {
          text: 'La pregunta definitiva del G.O.A.T.:',
          labelLeft: 'El que tiene mas medallas y trofeos',
          labelRight: 'El jugador con mas habilidad de todos',
        },
      ],
      results: [
        {
          name: 'El Juez del Legado',
          description:
            'Lo sopesas todo: las estadisticas, la tecnica y la plata. No eliges bando en el debate del GOAT, escribes hilos de 3.000 palabras sobre el tema. Tu grupo teme tus audios.',
        },
        {
          name: 'El Rompe Records',
          description:
            'Te encantan los numeros, pero aprecias la fantasia. Tu GOAT tiene un reel de highlights y una pagina de Wikipedia que hace crashear el navegador. El numero de goles de Ronaldo es tu lenguaje del amor.',
        },
        {
          name: 'El Rompe Records',
          description:
            'Goles, asistencias, partidos: si no esta en la hoja de calculo, no paso. Tu GOAT es quien tiene los numeros mas grandes. Te sabes las estadisticas de carrera como otros se saben letras de canciones.',
        },
        {
          name: 'El Romantico del Futbol',
          description:
            'Amas el juego bonito y respetas los numeros. Tu GOAT deja rivales atras con un caño y tambien lidera la tabla de asistencias. La volea de Zidane en el Bernabeu vive gratis en tu cabeza.',
        },
        {
          name: 'El Romantico del Futbol',
          description:
            'Los trofeos son temporales, pero una elastica de Ronaldinho es para siempre. Tu GOAT es quien te hizo enamorarte del futbol. Has visto ese mismo compilado de YouTube unas 400 veces.',
        },
        {
          name: 'El Coleccionista de Trofeos',
          description:
            'Los trofeos van primero, pero aun quieres que lleguen con estilo. Tu GOAT levanta el Mundial y ademas hace un rainbow flick en la final. Elegirias a Messi, pero solo por 2022.',
        },
        {
          name: 'El Coleccionista de Trofeos',
          description:
            'Sin trofeo no hay charla. La pagina de Wikipedia de tu GOAT es solo una lista de medallas. Cierras cada debate con "pero cuantos Mundiales tiene?" y te vas antes de que respondan.',
        },
      ],
    },
  },
  pt: {
    'tactical-identity': {
      title: 'Identidade Tatica',
      hubSubtitle: 'Que tipo de mente futebolistica voce e?',
      hubStatLine: '10 perguntas · 3 arquetipos',
      eyebrow: 'SirBro apresenta',
      liveBadgeLabel: 'Quiz ao vivo',
      heroTitlePrimary: 'Identidade',
      heroTitleAccent: 'Tatica',
      landingDescription: '10 perguntas. 3 arquetipos. Um unico DNA tatico.',
      landingEmphasis: 'Onde voce se encaixa?',
      landingStats: [
        { label: 'Perguntas' },
        { label: 'Arquetipos' },
        { label: 'Jogadores' },
      ],
      questionnaireLabel: 'Quiz tatico',
      startButtonLabel: 'Comecar quiz',
      nextButtonLabel: 'Proxima',
      finishButtonLabel: 'Revelar identidade',
      resultHeading: 'Sua identidade tatica',
      shareCardLabel: 'SirBro × ID Tatica',
      shareCallToActionLabel:
        'Junte-se a mais de 50.000 mentes taticas no SirBro',
      retakeButtonLabel: 'Refazer quiz',
      shareButtonLabel: 'Compartilhar resultado',
      axes: [
        {
          label: 'Purista',
          shortLabel: 'PUR',
          hint: 'Guardiola',
          zoneLabel: 'ARTISTA',
        },
        {
          label: 'Heavy Metal',
          shortLabel: 'HVM',
          hint: 'Klopp',
          zoneLabel: 'DESTRUIDOR',
        },
        {
          label: 'Pragmatico',
          shortLabel: 'PRA',
          hint: 'Mourinho',
          zoneLabel: 'ARQUITETO',
        },
      ],
      plotCenterLabel: 'ESPECIALISTA',
      questions: [
        {
          text: 'Qual e a sua filosofia de futebol?',
          labelLeft: 'Vencer a qualquer custo',
          labelRight: 'Vencer com futebol bonito',
        },
        {
          text: 'Como a sua linha defensiva se comporta?',
          labelLeft: 'Estacionar o onibus',
          labelRight: 'Pressao alta com linha adiantada',
        },
        {
          text: 'Quem e o seu armador ideal?',
          labelLeft: 'Um camisa 10 paciente',
          labelRight: 'Um motor box-to-box',
        },
        {
          text: 'Qual e a sua estrategia de transferencias?',
          labelLeft: 'Veteranos comprovados',
          labelRight: 'Joias escondidas dos dados',
        },
        {
          text: 'Como voce gosta das suas vitorias?',
          labelLeft: 'Um 1 a 0 clinico',
          labelRight: 'Um caotico 4 a 3',
        },
        {
          text: 'Como o seu meio-campo funciona?',
          labelLeft: 'Controle de posse',
          labelRight: 'Bolas longas e diretas',
        },
        {
          text: 'Voce acabou de perder a bola. O que acontece agora?',
          labelLeft: 'Recuar e reorganizar',
          labelRight: 'Contra-pressionar imediatamente',
        },
        {
          text: 'Como voce avalia o futebol moderno?',
          labelLeft: 'Focar nas estatisticas de xG',
          labelRight: 'Olho, instinto e paixao',
        },
        {
          text: 'Minuto 60 e o plano nao esta funcionando.',
          labelLeft: 'Ajuste tatico tardio aos 80',
          labelRight: 'Substituicao de impacto agora',
        },
        {
          text: 'Como e o estadio dos seus sonhos?',
          labelLeft: 'Uma fortaleza tradicional',
          labelRight: 'Uma arena moderna otimizada por dados',
        },
      ],
      results: [
        {
          name: 'O Especialista',
          description:
            'Voce e o camaleao tatico que toda diretoria quer em segredo. Daria uma palestra TED sobre gegenpressing e depois estacionaria o onibus numa final de copa sem piscar.',
        },
        {
          name: 'O Purista',
          description:
            'Voce prefere perder por 5 a 4 jogando tiki-taka a ganhar por 1 a 0 com chutao. Seu sabado ideal e rever lances do Cruyff enquanto ajusta uma planilha de estatisticas de posse.',
        },
        {
          name: 'O Pragmatico',
          description:
            'Resultados sao sua religiao e clean sheets sao seus hinos. Voce escalaria cinco zagueiros numa final de Copa do Mundo e dormiria como um bebe depois.',
        },
        {
          name: 'O Heavy Metal',
          description:
            'Sua ideia de estrategia defensiva e marcar mais gols do que sofre. Voce faria contra-pressao ate no proprio casamento se alguem interceptasse o bolo.',
        },
      ],
    },
    'fan-archetype': {
      title: 'Arquetipo de Torcedor',
      hubSubtitle: 'Analista, ultra ou caca-gloria?',
      hubStatLine: '6 perguntas · 3 arquetipos',
      eyebrow: 'SirBro apresenta',
      liveBadgeLabel: 'Quiz ao vivo',
      heroTitlePrimary: 'Arquetipo',
      heroTitleAccent: 'de Torcedor',
      landingDescription: '6 perguntas. 3 tipos de torcedor. Uma identidade.',
      landingEmphasis: 'Voce e analista, ultra ou caca-gloria?',
      landingStats: [
        { label: 'Perguntas' },
        { label: 'Arquetipos' },
        { label: 'Torcedores' },
      ],
      questionnaireLabel: 'Arquetipo de torcedor',
      startButtonLabel: 'Comecar quiz',
      nextButtonLabel: 'Proxima',
      finishButtonLabel: 'Revelar arquetipo',
      resultHeading: 'Seu arquetipo de torcedor',
      shareCardLabel: 'SirBro × Arquetipo de Torcedor',
      shareCallToActionLabel:
        'Junte-se a mais de 50.000 obcecados por futebol no SirBro',
      retakeButtonLabel: 'Refazer quiz',
      shareButtonLabel: 'Compartilhar resultado',
      axes: [
        {
          label: 'Analista',
          shortLabel: 'ANL',
          hint: 'Dados e xG',
          zoneLabel: 'NERD',
        },
        {
          label: 'Ultra',
          shortLabel: 'ULT',
          hint: 'Lealdade e atmosfera',
          zoneLabel: 'FANATICO',
        },
        {
          label: 'Caca-Gloria',
          shortLabel: 'CGL',
          hint: 'Estrelas e trofeus',
          zoneLabel: 'CACADOR DE ESTRELAS',
        },
      ],
      plotCenterLabel: 'TORCEDOR COMPLETO',
      questions: [
        {
          text: 'Por que voce torce pelo seu time?',
          labelLeft: 'Heranca local e tradicao familiar',
          labelRight: 'Sucesso global e poder das estrelas',
        },
        {
          text: 'O que voce faz logo depois do jogo?',
          labelLeft: 'Assistir fan-cams e comemoracoes',
          labelRight: 'Analisar mapas de calor e xG',
        },
        {
          text: 'Como voce consome noticias de transferencias?',
          labelLeft: 'Tweets do Fabrizio Romano e drama',
          labelRight: 'Relatorios de scout e perfis de dados',
        },
        {
          text: 'Chega um jogador novo ao seu clube. O que mais importa?',
          labelLeft: 'Venda de camisas e vibes',
          labelRight: 'Estatisticas de passes progressivos',
        },
        {
          text: 'Sobre o que o futebol realmente fala?',
          labelLeft: 'A alma do estadio',
          labelRight: 'Entretenimento e marca global',
        },
        {
          text: 'O que faz de um jogador uma verdadeira lenda?',
          labelLeft: 'Lealdade vitalicia a um clube so',
          labelRight: 'Bola de Ouro e chuva de trofeus',
        },
      ],
      results: [
        {
          name: 'O Torcedor Completo',
          description:
            'Voce vive na arquibancada, domina os numeros e ainda tem todas as camisas. E a especie rara que canta por 90 minutos e depois debate modelos de ameaca esperada no estacionamento.',
        },
        {
          name: 'O Fanatico dos Dados',
          description:
            'Voce sangra as cores do clube, mas sustenta isso com planilhas. Seu ritual de jogo e metade canto de arquibancada, metade acompanhamento de xG no celular.',
        },
        {
          name: 'O Analista',
          description:
            'Voce ve o jogo em numeros. Enquanto os outros comemoram o gol, voce ja esta checando a linha do tempo do xG. Seu navegador tem mais abas de dados de futebol do que um departamento de scout.',
        },
        {
          name: 'O Ultra Esclarecido',
          description:
            'Voce traz o barulho e o conhecimento. Ganha qualquer setor no grito e depois explica com calma por que o gatilho de pressao estava errado usando dados do StatsBomb.',
        },
        {
          name: 'O Ultra',
          description:
            'Futebol nao e esporte para voce, e religiao. Voce nasceu nesse clube e vai sair dele num caixao coberto pelas suas cores. Atmosfera e tudo.',
        },
        {
          name: 'O Rei da Onda',
          description:
            'Voce segue as luzes mais fortes, mas ainda tem lealdade local suficiente para defender suas escolhas. Seu guarda-roupa e 40% camisas de clubes que voce "sempre torceu".',
        },
        {
          name: 'O Caca-Gloria',
          description:
            'Se estao vencendo, voce esta assistindo. Seu time favorito e quem acabou de contratar a maior estrela. Voce tem tres "clubes principais" e zero vergonha disso.',
        },
      ],
    },
    'transfer-guru': {
      title: 'Guru das Transferencias',
      hubSubtitle: 'Moneyballer, purista da base ou caca-galacticos?',
      hubStatLine: '6 perguntas · 3 filosofias',
      eyebrow: 'SirBro apresenta',
      liveBadgeLabel: 'Quiz ao vivo',
      heroTitlePrimary: 'Guru',
      heroTitleAccent: 'das Transferencias',
      landingDescription: '6 perguntas. 3 filosofias. Um DNA de recrutamento.',
      landingEmphasis:
        'Voce e moneyballer, purista da base ou caca-galacticos?',
      landingStats: [
        { label: 'Perguntas' },
        { label: 'Filosofias' },
        { label: 'Diretores' },
      ],
      questionnaireLabel: 'Guru das transferencias',
      startButtonLabel: 'Comecar quiz',
      nextButtonLabel: 'Proxima',
      finishButtonLabel: 'Revelar resultado',
      resultHeading: 'Sua filosofia de recrutamento',
      shareCardLabel: 'SirBro × Guru das Transferencias',
      shareCallToActionLabel:
        'Junte-se a mais de 50.000 mentes de recrutamento no SirBro',
      retakeButtonLabel: 'Refazer quiz',
      shareButtonLabel: 'Compartilhar resultado',
      axes: [
        {
          label: 'Moneyballer',
          shortLabel: 'MNY',
          hint: 'Dados e valor',
          zoneLabel: 'PLANILHA',
        },
        {
          label: 'Base',
          shortLabel: 'BAS',
          hint: 'Juventude e lealdade',
          zoneLabel: 'JUVENTUDE',
        },
        {
          label: 'Galactico',
          shortLabel: 'GAL',
          hint: 'Estrelas e trofeus',
          zoneLabel: 'GRANDE GASTADOR',
        },
      ],
      plotCenterLabel: 'EQUILIBRADO',
      questions: [
        {
          text: 'Hora de contratar uma nova estrela. Quem voce escolhe?',
          labelLeft: 'Um garoto de 19 anos com xG elite',
          labelRight: 'Um superstar comprovado de 28 anos',
        },
        {
          text: 'Voce tem 100 milhoes para gastar. Qual e o plano?',
          labelLeft: 'Tres promessas da base',
          labelRight: 'Uma contratacao mundial de impacto',
        },
        {
          text: 'Onde voce encontra a sua proxima contratacao?',
          labelLeft: 'Nos seus olhos e na historia do clube',
          labelRight: 'Algoritmos avancados de dados',
        },
        {
          text: 'Como e o seu elenco ideal?',
          labelLeft: 'Lendas locais e leais',
          labelRight: 'Icones globais e influenciadores',
        },
        {
          text: 'O valor de uma estrela bate o pico. O que voce faz?',
          labelLeft: 'Mantem ate se aposentar no clube',
          labelRight: 'Vende e reinveste no auge do valor',
        },
        {
          text: 'Descreva a sua contratacao ideal.',
          labelLeft: 'Uma joia subestimada da segunda divisao',
          labelRight: 'Um candidato a Bola de Ouro',
        },
      ],
      results: [
        {
          name: 'O Diretor Equilibrado',
          description:
            'Voce joga em todos os angulos: dados, juventude e estrelas. Sua sala de reuniao tem uma planilha, um mapa de observacao e um poster do Zidane. Voce e basicamente o Ed Woodward se o Ed Woodward fosse realmente competente.',
        },
        {
          name: 'O Scout da Planilha',
          description:
            'Voce encontra diamantes brutos e lapida tudo em casa. Seu laptop tem mais abas abertas do que uma biblioteca: metade bases de scouting, metade planos de desenvolvimento de base.',
        },
        {
          name: 'O Scout da Planilha',
          description:
            'Voce nao assiste highlights, assiste graficos de gols esperados. Enquanto os outros perseguem nomes nas costas da camisa, voce persegue valor por 90. Seu orçamento de transferencias tem ROI melhor do que a bolsa.',
        },
        {
          name: 'O Visionario da Base',
          description:
            'Voce forma os seus e ainda sustenta tudo com dados. Sua base tem uma rede de scouting melhor do que muito time principal. O xG de cada garoto esta tatuado no seu cerebro.',
        },
        {
          name: 'O Visionario da Base',
          description:
            'Por que comprar se voce pode construir? Sua janela de transferencias e promover mais um garoto de 17 anos do sub-23. Sua ideia de blockbuster e renovar com um jogador da casa.',
        },
        {
          name: 'O Grande Gastador',
          description:
            'Voce quer os maiores nomes, mas ainda tem carinho por um garoto da casa. Sua escalação parece um FIFA Ultimate Team com uma escolha sentimental perdida no meio.',
        },
        {
          name: 'O Grande Gastador',
          description:
            'Vai com tudo ou nao vai. Se nao esteve na capa do FIFA, nao te interessa. Seu orçamento parece numero de telefone e sua folha salarial faz contador chorar.',
        },
      ],
    },
    'goat-philosophy': {
      title: 'Filosofia G.O.A.T.',
      hubSubtitle: 'Estatistico, artista ou vencedor?',
      hubStatLine: '6 perguntas · 3 filosofias',
      eyebrow: 'SirBro apresenta',
      liveBadgeLabel: 'Quiz ao vivo',
      heroTitlePrimary: 'Filosofia',
      heroTitleAccent: 'G.O.A.T.',
      landingDescription: '6 perguntas. 3 filosofias. Um DNA G.O.A.T.',
      landingEmphasis: 'Voce e estatistico, artista ou vencedor?',
      landingStats: [
        { label: 'Perguntas' },
        { label: 'Filosofias' },
        { label: 'Debatedores' },
      ],
      questionnaireLabel: 'Filosofia G.O.A.T.',
      startButtonLabel: 'Comecar quiz',
      nextButtonLabel: 'Proxima',
      finishButtonLabel: 'Revelar resultado',
      resultHeading: 'Sua filosofia G.O.A.T.',
      shareCardLabel: 'SirBro × Filosofia G.O.A.T.',
      shareCallToActionLabel:
        'Junte-se a mais de 50.000 debatedores do GOAT no SirBro',
      retakeButtonLabel: 'Refazer quiz',
      shareButtonLabel: 'Compartilhar resultado',
      axes: [
        {
          label: 'Estatistico',
          shortLabel: 'EST',
          hint: 'Ronaldo',
          zoneLabel: 'RECORDE',
        },
        {
          label: 'Artista',
          shortLabel: 'ART',
          hint: 'Zidane',
          zoneLabel: 'ROMANTICO',
        },
        {
          label: 'Vencedor',
          shortLabel: 'VEN',
          hint: 'Pele',
          zoneLabel: 'TROFEU',
        },
      ],
      plotCenterLabel: 'LEGADO',
      questions: [
        {
          text: 'O que impressiona mais em um G.O.A.T.?',
          labelLeft: 'Marcar 30 gols por 20 anos seguidos',
          labelRight: '3 anos de genialidade intocavel',
        },
        {
          text: 'Qual e a importancia da Copa do Mundo?',
          labelLeft: 'E so um torneio de 7 jogos',
          labelRight: 'O requisito maximo para a grandeza',
        },
        {
          text: 'O que torna um jogador especial?',
          labelLeft: 'Um fenomeno da natureza: velocidade, potencia e resistencia',
          labelRight: 'Um mestre da bola: toque, visao e magia',
        },
        {
          text: 'Qual e o legado maior?',
          labelLeft: 'Fazer um hat-trick numa final de Copa',
          labelRight: 'Mudar para sempre a forma como o jogo e jogado',
        },
        {
          text: 'Consistencia ou pico: o que importa mais?',
          labelLeft: 'Consistencia de maquina, ano apos ano',
          labelRight: 'Momentos de magia pura e irrepetivel',
        },
        {
          text: 'A pergunta definitiva do G.O.A.T.:',
          labelLeft: 'Quem tem mais medalhas e trofeus',
          labelRight: 'Quem foi o jogador mais habilidoso de todos',
        },
      ],
      results: [
        {
          name: 'O Juiz do Legado',
          description:
            'Voce pesa tudo: estatisticas, tecnica e prata. Nao escolhe um lado no debate do GOAT, escreve threads de 3.000 palavras sobre isso. Seu grupo teme seus audios.',
        },
        {
          name: 'O Quebra-Recordes',
          description:
            'Voce ama os numeros, mas aprecia a arte. Seu GOAT tem um compilado de highlights e uma pagina na Wikipedia que derruba o navegador. A contagem de gols do Ronaldo e a sua linguagem do amor.',
        },
        {
          name: 'O Quebra-Recordes',
          description:
            'Gols, assistencias, jogos: se nao esta na planilha, nao aconteceu. Seu GOAT e quem tem os maiores numeros. Voce decorou estatisticas de carreira como outras pessoas decoram letras de musica.',
        },
        {
          name: 'O Romantico do Futebol',
          description:
            'Voce ama o jogo bonito e respeita os numeros. Seu GOAT dribla defensores e ainda lidera a tabela de assistencias. A volea do Zidane no Bernabeu mora de graca na sua cabeca.',
        },
        {
          name: 'O Romantico do Futebol',
          description:
            'Trofeus sao temporarios, mas um elastico do Ronaldinho e para sempre. Seu GOAT e quem te fez se apaixonar pelo futebol. Voce ja reviu aquele mesmo compilado no YouTube umas 400 vezes.',
        },
        {
          name: 'O Colecionador de Trofeus',
          description:
            'Trofeus vem primeiro, mas voce ainda quer conquista-los com estilo. Seu GOAT levanta a Copa do Mundo e ainda manda um rainbow flick na final. Voce escolheria o Messi, mas so por causa de 2022.',
        },
        {
          name: 'O Colecionador de Trofeus',
          description:
            'Sem trofeu, sem conversa. A pagina da Wikipedia do seu GOAT e so uma lista de medalhas. Voce encerra todo debate com "mas quantas Copas do Mundo ele tem?" e sai andando antes da resposta.',
        },
      ],
    },
  },
};

function localizeLandingStats(
  landingStats: QuizLandingStat[],
  localizedLandingStats: LocalizedLandingStatCopy[]
): QuizLandingStat[] {
  return landingStats.map((stat, index) => ({
    ...stat,
    label: localizedLandingStats[index]?.label ?? stat.label,
  }));
}

function localizeAxes(
  axes: QuizAxisDefinition[],
  localizedAxes: LocalizedAxisCopy[]
): QuizAxisDefinition[] {
  return axes.map((axis, index) => ({
    ...axis,
    ...localizedAxes[index],
  }));
}

function localizeQuestions(
  questions: QuizQuestionDefinition[],
  localizedQuestions: LocalizedQuestionCopy[]
): QuizQuestionDefinition[] {
  return questions.map((question, index) => ({
    ...question,
    ...localizedQuestions[index],
  }));
}

function localizeResults(
  results: QuizResultDefinition[],
  localizedResults: LocalizedResultCopy[]
): QuizResultDefinition[] {
  return results.map((result, index) => ({
    ...result,
    ...localizedResults[index],
  }));
}

export function getQuizUiCopy(locale: Locale): QuizUiCopy {
  return QUIZ_UI_COPY[locale];
}

export function buildQuizSummaryLine(
  locale: Locale,
  questionCount: number,
  resultCount: number
): string {
  const copy = getQuizUiCopy(locale);
  return `${questionCount} ${copy.questionsLabel} · ${resultCount} ${copy.outcomesLabel}`;
}

export function buildQuizMetaTitle(locale: Locale, quizTitle: string): string {
  const copy = getQuizUiCopy(locale);
  return `${quizTitle} ${copy.quizMetaSuffix}`;
}

export function buildQuizResultMetaTitle(
  locale: Locale,
  resultName: string,
  quizTitle: string
): string {
  if (locale === 'en') {
    return `${resultName} | ${quizTitle} Result`;
  }

  const copy = getQuizUiCopy(locale);
  return `${resultName} | ${copy.resultMetaLabel} de ${quizTitle}`;
}

export function buildQuizShareText(
  locale: Locale,
  resultName: string,
  quizTitle: string
): string {
  switch (locale) {
    case 'es':
      return `Acabo de obtener ${resultName} en el quiz ${quizTitle} de SirBro.`;
    case 'pt':
      return `Acabei de tirar ${resultName} no quiz ${quizTitle} do SirBro.`;
    default:
      return `I just got ${resultName} on SirBro's ${quizTitle} quiz.`;
  }
}

/**
 * Resolves one quiz definition localized for the requested locale.
 */
export function getLocalizedQuizDefinition(
  locale: Locale,
  slug: string
): QuizDefinition | null {
  const definition = getQuizDefinition(slug);

  if (!definition || locale === 'en') {
    return definition;
  }

  const localizedCopy = LOCALIZED_QUIZ_COPY[locale][slug];
  if (!localizedCopy) {
    return definition;
  }

  return {
    ...definition,
    title: localizedCopy.title,
    hubSubtitle: localizedCopy.hubSubtitle,
    hubStatLine: localizedCopy.hubStatLine,
    eyebrow: localizedCopy.eyebrow,
    liveBadgeLabel: localizedCopy.liveBadgeLabel,
    heroTitlePrimary: localizedCopy.heroTitlePrimary,
    heroTitleAccent: localizedCopy.heroTitleAccent,
    landingDescription: localizedCopy.landingDescription,
    landingEmphasis: localizedCopy.landingEmphasis,
    landingStats: localizeLandingStats(
      definition.landingStats,
      localizedCopy.landingStats
    ),
    questionnaireLabel: localizedCopy.questionnaireLabel,
    startButtonLabel: localizedCopy.startButtonLabel,
    nextButtonLabel: localizedCopy.nextButtonLabel,
    finishButtonLabel: localizedCopy.finishButtonLabel,
    resultHeading: localizedCopy.resultHeading,
    shareCardLabel: localizedCopy.shareCardLabel,
    shareCallToActionLabel: localizedCopy.shareCallToActionLabel,
    retakeButtonLabel: localizedCopy.retakeButtonLabel,
    shareButtonLabel: localizedCopy.shareButtonLabel,
    axes: localizeAxes(definition.axes, localizedCopy.axes),
    plot: {
      centerLabel: localizedCopy.plotCenterLabel,
    },
    questions: localizeQuestions(definition.questions, localizedCopy.questions),
    results: localizeResults(definition.results, localizedCopy.results),
  };
}

/**
 * Lists localized quiz definitions in the donor ordering used by the public hub.
 */
export function listLocalizedQuizDefinitions(locale: Locale): QuizDefinition[] {
  return listQuizDefinitions()
    .map((quiz) => getLocalizedQuizDefinition(locale, quiz.slug))
    .filter((quiz): quiz is QuizDefinition => quiz !== null);
}
