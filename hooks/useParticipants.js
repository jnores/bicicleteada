// Hook para suscribirse a posiciones en tiempo real de un circuito
import { useEffect, useState, useCallback } from 'react';
import { ref, onValue, off, set, serverTimestamp, remove } from 'firebase/database';
import { database } from '@/lib/firebase';

export function useParticipants(circuitId) {
  const [participants, setParticipants] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!circuitId || !database) return;

    const participantsRef = ref(database, `circuits/${circuitId}/participants`);
    
    const unsubscribe = onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Filtrar participantes activos (últimos 30 segundos)
        const now = Date.now();
        const active = {};
        Object.entries(data).forEach(([id, participant]) => {
          if (participant.timestamp && (now - participant.timestamp) < 30000) {
            active[id] = participant;
          }
        });
        setParticipants(active);
      } else {
        setParticipants({});
      }
    }, (err) => {
      setError(err.message);
    });

    return () => off(participantsRef);
  }, [circuitId]);

  const updatePosition = useCallback(async (circuitId, participantId, lat, lng, name) => {
    if (!database) return;
    const participantRef = ref(database, `circuits/${circuitId}/participants/${participantId}`);
    await set(participantRef, {
      id: participantId,
      name: name || `Participante ${participantId}`,
      lat,
      lng,
      timestamp: Date.now(),
      speed: 0,
    });
  }, []);

  const removeParticipant = useCallback(async (circuitId, participantId) => {
    if (!database) return;
    const participantRef = ref(database, `circuits/${circuitId}/participants/${participantId}`);
    await remove(participantRef);
  }, []);

  return { participants, error, updatePosition, removeParticipant };
}
