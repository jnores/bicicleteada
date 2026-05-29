// Circuitos pre-cargados - Los Polvorines, Malvinas Argentinas, Buenos Aires
// Punto de inicio/llegada: El Campito - Baroni 891, Los Polvorines
// Zona delimitada por Ruta 8, Ruta 197 (Av. del Sesquicentenario), Ruta 202 (Av. Perón) y Ramos Mejía

// Coordenadas del punto de inicio/llegada (El Campito, Baroni 891)
export const START_POINT = [-34.5057, -58.7061];

export const CIRCUITS = {
  circuito_1: {
    id: 'circuito_1',
    name: 'Circuito Chico',
    description: '~4 km · Barrio La Loma y alrededores del campito',
    color: '#e03131',     // rojo fuerte — visible en luz solar
    distance: '~4 km',
    difficulty: 'Fácil',
    // Centro y zoom para ver el circuito completo
    center: [-34.5057, -58.7070],
    zoom: 15,
    // Ruta: sale de El Campito, da una vuelta pequeña por el barrio y vuelve
    route: [
      [-34.5057, -58.7061], // El Campito (inicio)
      [-34.5050, -58.7061], // Norte por Baroni
      [-34.5050, -58.7085], // Giro oeste por Quiroga
      [-34.5070, -58.7085], // Sur por Gascón
      [-34.5070, -58.7061], // Este por la paralela
      [-34.5070, -58.7040], // Continúa este
      [-34.5057, -58.7040], // Norte hacia Baroni
      [-34.5057, -58.7061], // Regreso al campito
    ],
    checkpoints: [
      { name: 'Baroni / Quiroga', coords: [-34.5050, -58.7085] },
      { name: 'Gascón / Sur', coords: [-34.5070, -58.7061] },
    ]
  },

  circuito_2: {
    id: 'circuito_2',
    name: 'Circuito Mediano',
    description: '~10 km · Av. Ramos Mejía hasta Ruta 197',
    color: '#2f9e44',     // verde — contraste sobre asfalto/verde
    distance: '~10 km',
    difficulty: 'Moderado',
    center: [-34.5020, -58.7090],
    zoom: 14,
    route: [
      [-34.5057, -58.7061], // El Campito (inicio)
      [-34.5040, -58.7061], // Norte por Baroni
      [-34.5040, -58.7085], // Oeste hacia Ramos Mejía
      [-34.5010, -58.7085], // Norte por Ramos Mejía
      [-34.4985, -58.7085], // Continúa norte hacia Ruta 197
      [-34.4975, -58.7105], // Giro oeste (Ruta 197 / Av. Sesquicentenario)
      [-34.4975, -58.7150], // Continúa oeste sobre Ruta 197
      [-34.5010, -58.7150], // Sur
      [-34.5040, -58.7150], // Continúa sur
      [-34.5060, -58.7130], // Giro este
      [-34.5060, -58.7090], // Este por calle paralela al campito
      [-34.5057, -58.7061], // Regreso al campito
    ],
    checkpoints: [
      { name: 'Ramos Mejía Norte', coords: [-34.4985, -58.7085] },
      { name: 'Av. Sesquicentenario (RP-24)', coords: [-34.4975, -58.7130] },
    ]
  },

  circuito_3: {
    id: 'circuito_3',
    name: 'Circuito Grande',
    description: '~18 km · Ruta 8, Ruta 202 y límites del partido',
    color: '#1971c2',     // azul — alta visibilidad en luz
    distance: '~18 km',
    difficulty: 'Exigente',
    center: [-34.5010, -58.7000],
    zoom: 13,
    route: [
      [-34.5057, -58.7061], // El Campito (inicio)
      [-34.5040, -58.7061], // Norte por Baroni
      [-34.5010, -58.7061], // Continúa norte
      [-34.4985, -58.7061], // Norte hasta cruce
      [-34.4960, -58.7061], // Hacia Ruta 197 zona norte
      [-34.4940, -58.7085], // Noroeste bordeando Ruta 197
      [-34.4930, -58.7130], // Continúa noroeste (Sesquicentenario)
      [-34.4940, -58.7190], // Giro sur-oeste
      [-34.4970, -58.7200], // Sur
      [-34.5010, -58.7190], // Continúa sur
      [-34.5050, -58.7180], // Sur oeste
      [-34.5080, -58.7160], // Giro sur - hacia Ruta 8
      [-34.5100, -58.7110], // Este sobre Ruta 8 / zona sur
      [-34.5090, -58.7060], // Giro este - hacia Ruta 202
      [-34.5070, -58.7020], // Norte por zona este (cerca Av. Perón / RP-23)
      [-34.5060, -58.7000], // Continúa norte
      [-34.5040, -58.7010], // Giro noroeste
      [-34.5040, -58.7040], // Oeste
      [-34.5057, -58.7061], // Regreso al campito
    ],
    checkpoints: [
      { name: 'Sesquicentenario (RP-24)', coords: [-34.4930, -58.7130] },
      { name: 'Zona Ruta 8', coords: [-34.5100, -58.7110] },
      { name: 'Av. Perón (RP-23)', coords: [-34.5060, -58.7000] },
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
