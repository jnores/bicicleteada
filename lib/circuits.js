// Circuitos pre-cargados - Los Polvorines, Malvinas Argentinas, Buenos Aires
// Punto de inicio/llegada: El Campito - Baroni 891, Los Polvorines
// Zona delimitada por Ruta 8, Ruta 197 (Av. del Sesquicentenario), Ruta 202 (Av. Perón) y Ramos Mejía

// Coordenadas del punto de inicio/llegada (El Campito, Baroni 891)
export const START_POINT = [-34.512679, -58.715693];

export const CIRCUITS = {
  circuito_1: {
    id: 'circuito_1',
    name: 'Circuito Mini',
    description: '~2.8 km',
    color: '#e03131',     // rojo fuerte — visible en luz solar
    distance: '~2.8 km',
    difficulty: 'Fácil',
    // Centro y zoom para ver el circuito completo
    center: [-34.514023, -58.714270],
    zoom: 15,
    // Ruta: sale de El Campito, da una vuelta pequeña por el barrio y vuelve
    route: [
      [-34.512679, -58.715693], // el campito
      [-34.514071, -58.718160],
      [-34.514531, -58.718846],
      [-34.516591, -58.717211],
      [-34.518054, -58.715292],
      [-34.518562, -58.715823],
      [-34.519194, -58.714911], // plaza Los Pinos
      [-34.518191, -58.713845],
      [-34.517802, -58.714321],
      [-34.516153, -58.712536],
      [-34.517028, -58.711270],
      [-34.516498, -58.710732], // Orquesta
      [-34.514827, -58.712763],
      [-34.514023, -58.714270], // Capilla
      [-34.514827, -58.712763],
      [-34.514226, -58.712262],
      [-34.513152, -58.713639],
      [-34.512087, -58.714476],
      [-34.512679, -58.715693], // el campito
    ],
    checkpoints: [
      // { name: 'el campito', coords: [-34.512679, -58.715693] },
      { name: 'plaza Los Pinos', coords: [-34.519194, -58.714911] },
      { name: 'Orquesta', coords: [-34.516498, -58.710732] },
      { name: 'Capilla', coords: [-34.514023, -58.714270] },
    ]
  },

  circuito_2: {
    id: 'circuito_2',
    name: 'Maratón',
    description: '~10 km · Av. Ramos Mejía hasta Ruta 197',
    color: '#2f9e44',     // verde — contraste sobre asfalto/verde
    distance: '~10 km',
    difficulty: 'Moderado',
    center: [-34.5020, -58.7090],
    zoom: 14,
    route: [
      [-34.512679, -58.715693], // el campito
      [-34.511163, -58.710022], // ES14 / EP 18
      [-34.507114, -58.705673], // EP 34 ( Nancy) / Ctro Salud El Sol ( Antonella)
      [-34.501216, -58.709533], // ES 12 ( Leandro y David)
      [-34.506229, -58.712638], // Ep 35/ ES 42 / Ctro de Salud Magdalena
      [-34.506724, -58.718580], // San Nicolás
      [-34.509616, -58.726023], // EP11/ ES 29/ Jardín 915
      [-34.512281, -58.722938], // Club de Futbol Almafuerte
      [-34.511251, -58.721451], // Ctro salud Unión y Progreso / Centro de Jubilados San Roque
      [-34.512679, -58.715693], // el campito
    ],
    checkpoints: [
      { name: 'San Nicolás', coords: [-34.506724, -58.718580] },
      { name: 'Jardín 915', coords: [-34.509616, -58.726023] },
      { name: 'Club de Futbol Almafuerte', coords: [-34.512281, -58.722938] },
      { name: 'Centro de Jubilados San Roque', coords: [-34.511251, -58.721451] },
      { name: 'ES 12 / EP 34', coords: [-34.511251, -58.721451] },
    ]
  },

  circuito_3: {
    id: 'circuito_3',
    name: 'Bicicleteada',
    description: '~18 km · Ruta 8, Ruta 202 y límites del partido',
    color: '#1971c2',     // azul — alta visibilidad en luz
    distance: '~18 km',
    difficulty: 'Exigente',
    center: [-34.5010, -58.7000],
    zoom: 13,
    route: [
      [-34.512679, -58.715693], // el campito
      [-34.506724, -58.718580], // San Nicolás
      [-34.509616, -58.726023], // EP11/ ES 29/ Jardín 915

      [-34.527847, -58.707880],  // Cotolengo

      [-34.520462, -58.700101], // UNGS


      [-34.501216, -58.709533], // ES 12 ( Leandro y David)

      [-34.512679, -58.715693], // el campito
    ],
    checkpoints: [
      { name: 'San Nicolás', coords: [-34.506724, -58.718580] },
      { name: 'Jardín 915', coords: [-34.509616, -58.726023] },
      { name: 'Cotolengo', coords: [-34.527847, -58.707880] },
      { name: 'UNGS', coords: [-34.520462, -58.700101] },
      { name: 'ES 12', coords: [-34.511251, -58.721451] },
    ]
  }
};

export const CIRCUIT_LIST = Object.values(CIRCUITS);

// Vista que muestra todos los circuitos
export const ALL_CIRCUITS_VIEW = {
  center: [-34.5020, -58.7090],
  zoom: 13,
};

export const PARTICIPANT_COLORS = [
  '#c92a2a', // rojo oscuro
  '#e67700', // naranja
  '#2f9e44', // verde
  '#1971c2', // azul
  '#6741d9', // violeta
];
