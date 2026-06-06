'use client';

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0ebe3',
      flexDirection: 'column',
      gap: '14px',
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        border: '3px solid rgba(0,0,0,0.10)',
        borderTop: '3px solid #1971c2',
        borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{
        color: 'rgba(0,0,0,0.4)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        fontWeight: 600,
      }}>
        Cargando mapa...
      </p>
    </div>
  ),
});

// Pasa todas las props al componente real
export default function MapWrapper({ circuits, participants, activeCircuitFilter, showInstitutions, showCheckpoints }) {
  return (
    <MapComponent
      circuits={circuits}
      participants={participants}
      activeCircuitFilter={activeCircuitFilter}
      showInstitutions={showInstitutions}
      showCheckpoints={showCheckpoints}
    />
  );
}
