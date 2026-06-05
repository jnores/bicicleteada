// API Route: POST /api/position
// Usado por la app mobile para enviar posición GPS
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

export async function POST(request) {
  try {
    const body = await request.json();
    const { circuitId, participantId, name, lat, lng, speed } = body;

    // Validaciones
    if (!circuitId || !participantId || lat === undefined || lng === undefined) {
      return Response.json(
        { error: 'Faltan campos requeridos: circuitId, participantId, lat, lng' },
        { status: 400 }
      );
    }

    const validCircuits = ['Mini', 'Bicicleteada', 'Caminata', 'Maraton', 'Caravana'];
    if (!validCircuits.includes(circuitId)) {
      return Response.json(
        { error: `circuitId inválido. Válidos: ${validCircuits.join(', ')}` },
        { status: 400 }
      );
    }

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return Response.json(
        { error: 'lat y lng deben ser números' },
        { status: 400 }
      );
    }

    // Escribir en Firebase
    const participantRef = ref(database, `circuits/${circuitId}/participants/${participantId}`);
    await set(participantRef, {
      id: participantId,
      name: name || `Participante ${participantId}`,
      lat,
      lng,
      speed: speed || 0,
      timestamp: Date.now(),
    });

    return Response.json({
      success: true,
      message: 'Posición actualizada',
      data: { circuitId, participantId, lat, lng, timestamp: Date.now() }
    });

  } catch (error) {
    console.error('Error actualizando posición:', error);
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    message: 'API de posiciones GPS - Bicicleteada',
    usage: {
      method: 'POST',
      endpoint: '/api/position',
      body: {
        circuitId: 'circuito_1 | circuito_2 | circuito_3 | circuito_otros',
        participantId: 'string único (ej: "p1", "uuid")',
        name: 'string (opcional)',
        lat: 'number (latitud)',
        lng: 'number (longitud)',
        speed: 'number (km/h, opcional)',
      }
    }
  });
}
