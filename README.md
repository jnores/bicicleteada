# Bicicleteada - Sistema de Seguimiento GPS

Sistema web para seguimiento en tiempo real de participantes en circuitos de ciclismo.

## Stack
- **Frontend**: Next.js 15 + Leaflet.js + OpenStreetMap (sin API key)
- **Real-time**: Firebase Realtime Database (plan gratuito)
- **Deploy**: Vercel

## Desarrollo local

```bash
# 1. Copiar variables de entorno
cp .env.example .env.local

# 2. Completar el .env.local con los datos de tu proyecto Firebase

# 3. Instalar dependencias
npm install

# 4. Iniciar en modo desarrollo
npm run dev
```

Abre http://localhost:3000

> Sin Firebase: Al abrir la app, podés elegir "Modo Demo" para ver la simulación sin configurar Firebase.

## Configurar Firebase (gratis)

1. Ir a https://console.firebase.google.com
2. Crear un proyecto nuevo
3. Activar **Realtime Database** (elegir región)
4. En **Reglas de Realtime Database**, usar estas reglas permisivas para empezar:

```json
{
  "rules": {
    "circuits": {
      "$circuitId": {
        "participants": {
          "$participantId": {
            ".read": true,
            ".write": true
          }
        }
      }
    }
  }
}
```

5. Ir a **Project Settings > General > Your apps** y copiar la configuración.

## API para la App Mobile

La app mobile debe hacer un POST a `/api/position` cada 5 segundos:

```
POST https://tu-app.vercel.app/api/position
Content-Type: application/json

{
  "circuitId": "circuito_1",
  "participantId": "uuid-o-id",
  "name": "Marcos",
  "lat": -34.5704,
  "lng": -58.4148,
  "speed": 22.5
}
```

## Circuitos pre-cargados

| ID | Nombre | Distancia | Dificultad |
|----|--------|-----------|------------|
| circuito_1 | Circuito Palermo | 12 km | Facil |
| circuito_2 | Circuito Puerto Madero | 18 km | Moderado |
| circuito_3 | Circuito San Isidro | 25 km | Exigente |

## Deploy en Vercel

Variables de entorno necesarias en Vercel (Settings > Environment Variables):
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_DATABASE_URL
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID


## Paginas Utiles

https://www.latlong.net/convert-address-to-lat-long.html