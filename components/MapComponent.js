'use client';

import { useEffect, useRef, useState } from 'react';
import { PARTICIPANT_COLORS, START_POINT } from '@/lib/circuits';

export default function MapComponent({ circuits, participants, activeCircuitFilter }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayersRef = useRef({});        // { circuitId: [layer, glowLayer] }
  const checkpointMarkersRef = useRef({});  // { circuitId: [markers] }
  const participantMarkersRef = useRef({});
  const startMarkerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Inicializar mapa (una sola vez)
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      import('leaflet').then(async (L) => {
        await import('leaflet-rotate');
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Fix HMR: si el contenedor ya tiene un mapa de Leaflet, lo destruimos antes
        if (mapRef.current._leaflet_id) {
          mapRef.current._leaflet_id = null;
        }

        const map = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
          rotate: true,
          touchRotate: true,
          rotateControl: {
            closeOnZeroBearing: false,
            position: 'topright'
          },
          bearing: 0,
        }).setView([-34.5020, -58.7090], 13);

        // Tile layer claro: CartoDB Positron — alta legibilidad a plena luz solar
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        // Attribution
        L.control.attribution({ position: 'bottomright', prefix: false })
          .addAttribution('© <a href="https://carto.com/">CARTO</a> | © <a href="https://www.openstreetmap.org/">OSM</a>')
          .addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;
        setMapReady(true);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        routeLayersRef.current = {};
        checkpointMarkersRef.current = {};
        participantMarkersRef.current = {};
        startMarkerRef.current = null;
      }
    };
  }, []);

  // Dibujar TODOS los circuitos cuando el mapa esté listo
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !circuits || circuits.length === 0) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;

      // Limpiar rutas anteriores
      Object.values(routeLayersRef.current).forEach(layers => layers.forEach(l => l.remove()));
      Object.values(checkpointMarkersRef.current).forEach(markers => markers.forEach(m => m.remove()));
      if (startMarkerRef.current) startMarkerRef.current.remove();
      routeLayersRef.current = {};
      checkpointMarkersRef.current = {};

      circuits.forEach((circuit) => {
        const markers = [];

        // Glow (halo debajo de la línea — más visible sobre fondo claro)
        const glowLayer = L.polyline(circuit.route, {
          color: circuit.color,
          weight: 14,
          opacity: 0.18,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);

        // Línea principal
        const routeLayer = L.polyline(circuit.route, {
          color: circuit.color,
          weight: 5,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);

        routeLayer.bindTooltip(circuit.name, {
          permanent: false,
          direction: 'center',
          className: 'circuit-tooltip',
        });

        routeLayersRef.current[circuit.id] = [glowLayer, routeLayer];

        // Checkpoints
        circuit.checkpoints.forEach((cp) => {
          const cpIcon = L.divIcon({
            className: '',
            html: `<div style="
              background: white;
              border: 2.5px solid ${circuit.color};
              border-radius: 6px;
              padding: 2px 7px;
              color: ${circuit.color};
              font-size: 10px;
              font-weight: 800;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.18);
              font-family: Inter, sans-serif;
            ">📍 ${cp.name}</div>`,
            iconSize: [null, null],
            iconAnchor: [0, 10],
          });
          const m = L.marker(cp.coords, { icon: cpIcon }).addTo(map);
          markers.push(m);
        });

        checkpointMarkersRef.current[circuit.id] = markers;
      });

      // Marcador de inicio/llegada compartido — prominente
      const startIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            background: #111827;
            color: white;
            border-radius: 10px;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 800;
            font-family: Inter, sans-serif;
            box-shadow: 0 3px 12px rgba(0,0,0,0.30);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 6px;
            border: 2.5px solid white;
          ">
            🏁 El Campito
          </div>
          <div style="
            width: 0; height: 0;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            border-top: 8px solid #111827;
            margin: 0 auto;
            margin-top: -1px;
          "></div>
        `,
        iconSize: [null, null],
        iconAnchor: [60, 48],
      });

      startMarkerRef.current = L.marker(START_POINT, { icon: startIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`<b>🏁 El Campito</b><br>Baroni 891, Los Polvorines<br><small>Inicio y llegada de todos los circuitos</small>`);

      // Fit a todos los circuitos
      const allCoords = circuits.flatMap(c => c.route);
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
      }
    });
  }, [circuits, mapReady]);

  // Efecto visual cuando cambia el filtro de circuito activo
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    Object.entries(routeLayersRef.current).forEach(([circuitId, layers]) => {
      const isActive = !activeCircuitFilter || activeCircuitFilter === 'all' || activeCircuitFilter === circuitId;
      layers.forEach((layer, i) => {
        // i=0 glow, i=1 ruta
        layer.setStyle({
          opacity: isActive ? (i === 0 ? 0.18 : 0.95) : 0.12,
          weight: isActive ? (i === 0 ? 14 : 5) : (i === 0 ? 8 : 2.5),
        });
      });
    });
  }, [activeCircuitFilter, mapReady]);

  // Actualizar marcadores de participantes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      const currentIds = new Set(Object.keys(participants));

      // Remover los que ya no están
      Object.keys(participantMarkersRef.current).forEach(id => {
        if (!currentIds.has(id)) {
          participantMarkersRef.current[id].remove();
          delete participantMarkersRef.current[id];
        }
      });

      // Actualizar / crear
      Object.entries(participants).forEach(([id, participant], index) => {
        const color = PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
        const initials = (participant.name || id).substring(0, 2).toUpperCase();
        const now = Date.now();
        const isStale = participant.timestamp && (now - participant.timestamp) > 15000;
        const opacity = isStale ? 0.45 : 1;

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="position: relative; filter: ${isStale ? 'grayscale(0.6)' : 'none'};">
              <div style="
                width: 38px; height: 38px;
                background: ${color};
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.30), 0 0 0 2px ${color};
                opacity: ${opacity};
              "></div>
              <div style="
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -65%);
                color: white;
                font-weight: 900;
                font-size: 11px;
                font-family: 'Inter', sans-serif;
                text-shadow: 0 1px 3px rgba(0,0,0,0.4);
                pointer-events: none;
              ">${initials}</div>
              ${!isStale ? `<div style="
                position: absolute;
                top: -5px; left: -5px;
                width: 48px; height: 48px;
                border-radius: 50%;
                border: 2px solid ${color};
                animation: pulse-ring 2s ease-out infinite;
                opacity: 0.5;
              "></div>` : ''}
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -40],
        });

        const age = participant.timestamp ? Math.round((now - participant.timestamp) / 1000) : null;
        const popupContent = `
          <div style="font-family: Inter, sans-serif; min-width: 150px;">
            <div style="font-weight: 800; color: ${color}; margin-bottom: 4px; font-size: 14px;">${participant.name || id}</div>
            <div style="font-size: 12px; color: #555; margin-bottom: 3px;">
              ${participant.circuitName || participant.circuitId || ''}
            </div>
            ${participant.speed ? `<div style="font-size: 13px; font-weight: 700;">🚴 ${participant.speed.toFixed(1)} km/h</div>` : ''}
            <div style="font-size: 11px; color: #999; margin-top: 4px;">
              ${age !== null ? `Hace ${age}s` : 'Activo'}
            </div>
          </div>
        `;

        if (participantMarkersRef.current[id]) {
          participantMarkersRef.current[id].setLatLng([participant.lat, participant.lng]);
          participantMarkersRef.current[id].setIcon(icon);
          participantMarkersRef.current[id].setPopupContent(popupContent);
        } else {
          const marker = L.marker([participant.lat, participant.lng], { icon, zIndexOffset: 500 })
            .addTo(map)
            .bindPopup(popupContent);
          participantMarkersRef.current[id] = marker;
        }
      });
    });
  }, [participants, mapReady]);

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.7; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.98) !important;
          border: 1px solid rgba(0,0,0,0.10) !important;
          color: #111 !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
        }
        .leaflet-popup-tip {
          background: rgba(255,255,255,0.98) !important;
        }
        .leaflet-control-zoom a {
          background: rgba(255,255,255,0.97) !important;
          color: #333 !important;
          border-color: rgba(0,0,0,0.12) !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08) !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f0f0ee !important;
        }
        .circuit-tooltip {
          background: white;
          border: 1.5px solid rgba(0,0,0,0.12);
          border-radius: 8px;
          font-family: Inter, sans-serif;
          font-weight: 700;
          font-size: 12px;
          color: #111;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          padding: 4px 10px;
        }
        .circuit-tooltip::before { display: none; }
      `}</style>
      <div
        ref={mapRef}
        style={{ width: '100%', height: '100%', background: '#f0ebe3' }}
      />
    </>
  );
}
