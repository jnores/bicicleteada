'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { CIRCUITS, CIRCUIT_LIST, PARTICIPANT_COLORS } from '@/lib/circuits';

const MapWrapper = dynamic(() => import('@/components/MapWrapper'), { ssr: false });

// === FIREBASE CONFIG MODAL ===
function FirebaseConfigModal({ onSave, onDemo }) {
  const [config, setConfig] = useState({
    apiKey: '', authDomain: '', databaseURL: '',
    projectId: '', storageBucket: '', messagingSenderId: '', appId: '',
  });

  const handleSave = () => {
    if (!config.databaseURL || !config.projectId || !config.apiKey) {
      alert('Completá al menos: API Key, Database URL y Project ID');
      return;
    }
    onSave(config);
  };

  return (
    <div className="config-overlay">
      <div className="config-modal">
        <h2>🔥 Configurar Firebase</h2>
        <p>
          Necesitás un proyecto Firebase con <strong>Realtime Database</strong> habilitado
          (plan gratuito Spark es suficiente). O probá el <strong>Modo Demo</strong> para
          ver la simulación sin configurar nada.
        </p>
        {['apiKey', 'authDomain', 'databaseURL', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'].map(key => (
          <div className="config-input-group" key={key}>
            <label>{key}</label>
            <input
              type="text"
              placeholder={key === 'databaseURL' ? 'https://mi-proyecto-default-rtdb.firebaseio.com' : `tu-${key}`}
              value={config[key]}
              onChange={e => setConfig(prev => ({ ...prev, [key]: e.target.value }))}
            />
          </div>
        ))}
        <button className="btn-primary" onClick={handleSave}>Conectar Firebase →</button>
        <button className="btn-demo" onClick={onDemo}>🎮 Modo Demo (sin Firebase)</button>
      </div>
    </div>
  );
}

// === PARTICIPANT ITEM ===
function ParticipantItem({ participant, index, now }) {
  const initials = (participant.name || participant.id).substring(0, 2).toUpperCase();
  const age = participant.timestamp ? Math.round((now - participant.timestamp) / 1000) : null;
  const isStale = age !== null && age > 15;
  const circuit = CIRCUITS[participant.circuitId];
  const color = circuit ? circuit.color : PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];

  return (
    <div className="participant-item">
      <div
        className="participant-avatar"
        style={{ background: color }}
      >
        {initials}
      </div>
      <div className="participant-info">
        <div className="participant-name">{participant.name || participant.id}</div>
        <div className="participant-status">
          {circuit && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: circuit.color, display: 'inline-block',
              }} />
              {circuit.name} ·{' '}
            </span>
          )}
          {isStale ? `⚠️ Sin señal (${age}s)` : age !== null ? `Hace ${age}s` : 'Activo'}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
        {participant.speed > 0 && (
          <div className="participant-speed">{participant.speed.toFixed(0)}<span style={{ fontSize: '9px', fontWeight: 600, opacity: 0.6 }}> km/h</span></div>
        )}
        {!isStale && (
          <div className="live-badge"><div className="live-dot" />LIVE</div>
        )}
      </div>
    </div>
  );
}

// === DEMO SIMULATOR ===
// Simula participantes para cada uno de los 3 circuitos
function useDemoSimulator(isRunning) {
  const [demoParticipants, setDemoParticipants] = useState({});
  const intervalRef = useRef(null);
  const stateRef = useRef({});

  const initState = useCallback(() => {
    const state = {};
    // Algunos participantes por circuito (variar cantidad)
    const setup = [
      { circuitId: 'circuito_1', names: ['Marcos', 'Laura'] },
      { circuitId: 'circuito_2', names: ['Diego', 'Valentina', 'Rodrigo'] },
      { circuitId: 'circuito_3', names: ['Sofía'] },
    ];

    setup.forEach(({ circuitId, names }) => {
      const circuit = CIRCUITS[circuitId];
      names.forEach((name, i) => {
        const id = `${circuitId}_${i}`;
        state[id] = {
          circuitId,
          name,
          index: Math.floor(Math.random() * (circuit.route.length - 2)),
          fraction: Math.random(),
          speed: 14 + Math.random() * 18,
        };
      });
    });
    stateRef.current = state;
  }, []);

  const start = useCallback(() => {
    initState();
    intervalRef.current = setInterval(() => {
      const updated = {};
      Object.entries(stateRef.current).forEach(([id, s]) => {
        const circuit = CIRCUITS[s.circuitId];
        if (!circuit) return;

        s.fraction += (s.speed / 3600) * 1 / 0.4;
        if (s.fraction >= 1) {
          s.fraction -= 1;
          s.index = (s.index + 1) % (circuit.route.length - 1);
        }

        const from = circuit.route[s.index];
        const to = circuit.route[(s.index + 1) % circuit.route.length];
        const lat = from[0] + (to[0] - from[0]) * s.fraction + (Math.random() - 0.5) * 0.00008;
        const lng = from[1] + (to[1] - from[1]) * s.fraction + (Math.random() - 0.5) * 0.00008;
        const speed = Math.max(0, s.speed + (Math.random() - 0.5) * 3);

        updated[id] = {
          id,
          name: s.name,
          circuitId: s.circuitId,
          lat, lng, speed,
          timestamp: Date.now(),
        };
      });
      setDemoParticipants(updated);
    }, 1000);
  }, [initState]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDemoParticipants({});
  }, []);

  useEffect(() => {
    if (isRunning) start();
    else stop();
    return stop;
  }, [isRunning]);

  return { demoParticipants, stop };
}

// === FIREBASE PARTICIPANTS ===
function useFirebaseParticipants(firebaseReady) {
  const [participants, setParticipants] = useState({});

  useEffect(() => {
    if (!firebaseReady) return;
    let cleanups = [];

    const load = async () => {
      try {
        const { database } = await import('@/lib/firebase');
        const { ref, onValue, off } = await import('firebase/database');

        // Escuchar todos los circuitos
        Object.keys(CIRCUITS).forEach(circuitId => {
          const r = ref(database, `circuits/${circuitId}/participants`);
          const unsub = onValue(r, (snapshot) => {
            const data = snapshot.val();
            const now = Date.now();
            setParticipants(prev => {
              const next = { ...prev };
              // Borrar los de este circuito
              Object.keys(next).forEach(k => {
                if (next[k].circuitId === circuitId) delete next[k];
              });
              if (data) {
                Object.entries(data).forEach(([id, p]) => {
                  if (p.timestamp && (now - p.timestamp) < 30000) {
                    next[`${circuitId}_${id}`] = { ...p, circuitId };
                  }
                });
              }
              return next;
            });
          });
          cleanups.push(() => off(r));
        });
      } catch (e) {
        console.error('Firebase:', e);
      }
    };

    load();
    return () => cleanups.forEach(fn => fn());
  }, [firebaseReady]);

  return participants;
}

// === PÁGINA PRINCIPAL ===
export default function HomePage() {
  const [isDemo, setIsDemo] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'circuito_1' | etc
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Tick para timestamps
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Check Firebase config
  useEffect(() => {
    const envUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    if (envUrl && envUrl.length > 10) {
      setFirebaseReady(true);
    } else {
      const saved = localStorage.getItem('bicicleteada_firebase_config');
      if (saved) {
        try { applyFirebaseConfig(JSON.parse(saved)); }
        catch { setShowConfig(true); }
      } else {
        setShowConfig(true);
      }
    }
  }, []);

  const applyFirebaseConfig = useCallback(async (config) => {
    try {
      const { initializeApp, getApps } = await import('firebase/app');
      if (getApps().length === 0) initializeApp(config);
      setFirebaseReady(true);
      setShowConfig(false);
      localStorage.setItem('bicicleteada_firebase_config', JSON.stringify(config));
    } catch (e) {
      alert('Error Firebase: ' + e.message);
    }
  }, []);

  const handleDemoMode = useCallback(() => {
    setIsDemo(true);
    setShowConfig(false);
    setSimRunning(true);
  }, []);

  // Participants
  const { demoParticipants } = useDemoSimulator(isDemo && simRunning);
  const fbParticipants = useFirebaseParticipants(firebaseReady && !isDemo);
  const allParticipants = isDemo ? demoParticipants : fbParticipants;

  // Filtrar participantes según el circuito seleccionado
  const displayParticipants = activeFilter === 'all'
    ? allParticipants
    : Object.fromEntries(
      Object.entries(allParticipants).filter(([, p]) => p.circuitId === activeFilter)
    );

  const totalCount = Object.keys(allParticipants).length;
  const filteredCount = Object.keys(displayParticipants).length;

  return (
    <>
      {showConfig && <FirebaseConfigModal onSave={applyFirebaseConfig} onDemo={handleDemoMode} />}

      <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Toggle flotante */}
        <button
          className={`floating-toggle ${sidebarCollapsed ? 'show-on-desktop' : ''}`}
          onClick={() => {
            setSidebarOpen(v => !v);
            setSidebarCollapsed(false);
          }}
          aria-label="Menú"
        >
          ☰
        </button>

        {/* ============ SIDEBAR ============ */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Header */}
          <div className="sidebar-header">
            <div className="logo-area">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="logo-icon">🚴</div>
                <div className="logo-text">
                  <h1>Bicicleteada</h1>
                  <p>Los Polvorines · Seguimiento GPS</p>
                </div>
              </div>
              <button
                className="collapse-btn hide-on-mobile"
                onClick={() => setSidebarCollapsed(true)}
                title="Ocultar panel"
              >
                ◀
              </button>
            </div>
            <div className="status-pill">
              <div className={`status-dot ${isDemo ? 'demo' : firebaseReady ? '' : 'offline'}`} />
              {isDemo ? 'Simulación activa' : firebaseReady ? 'En vivo' : 'Sin conexión'}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="sidebar-content">

            {/* Leyenda de circuitos */}
            {/* Leyenda de circuitos */}
            <div
              className="section-label"
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
              onClick={() => setLegendOpen(!legendOpen)}
            >
              <span>Circuitos (todos en el mapa)</span>
              <span>{legendOpen ? '▲' : '▼'}</span>
            </div>
            {legendOpen && (
              <div className="circuit-legend">
                {CIRCUIT_LIST.map(circuit => {
                  const count = Object.values(allParticipants).filter(p => p.circuitId === circuit.id).length;
                  return (
                    <div key={circuit.id} className="circuit-legend-item">
                      <div
                        className="circuit-color-swatch"
                        style={{ background: circuit.color }}
                      />
                      <div className="circuit-legend-info">
                        <div className="circuit-legend-name">{circuit.name}</div>
                        {/* <div className="circuit-legend-desc">{circuit.description}</div> */}
                      </div>
                      <div className="circuit-legend-badges">
                        {/* <span className="badge">{circuit.distance}</span> */}
                        {count > 0 && (
                          <span className="badge" style={{
                            background: `${circuit.color}18`,
                            color: circuit.color,
                            fontWeight: 800,
                          }}>
                            {count}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Filtro de participantes */}
            <div className="section-label">Ver participantes de</div>
            <div className="circuit-tabs">
              <button
                className={`circuit-tab circuit-tab-all ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                Todos ({totalCount})
              </button>
              {CIRCUIT_LIST.map(c => (
                <button
                  key={c.id}
                  className={`circuit-tab ${activeFilter === c.id ? 'active' : ''}`}
                  style={{ '--circuit-color': c.color }}
                  onClick={() => setActiveFilter(activeFilter === c.id ? 'all' : c.id)}
                >
                  <span style={{
                    display: 'inline-block',
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    background: c.color,
                    marginRight: '4px',
                    verticalAlign: 'middle',
                  }} />
                  {c.name.replace('Circuito ', '')}
                </button>
              ))}
            </div>

            {/* Lista de participantes */}
            <div className="section-label">
              En ruta {filteredCount > 0 ? `(${filteredCount})` : ''}
            </div>
            <div className="participants-list">
              {Object.keys(displayParticipants).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🚴</div>
                  <p>{isDemo ? 'Iniciá la simulación abajo' : 'Esperando señal GPS...'}</p>
                </div>
              ) : (
                Object.entries(displayParticipants).map(([id, p], i) => (
                  <ParticipantItem key={id} participant={p} index={i} now={now} />
                ))
              )}
            </div>

            {/* Simulador (modo demo) */}
            {isDemo && (
              <div className="simulator-section">
                <div className="section-label">Simulador</div>
                <div className="simulator-controls">
                  <button
                    className={`btn-sm ${simRunning ? 'active' : ''}`}
                    onClick={() => setSimRunning(v => !v)}
                  >
                    {simRunning ? '⏸ Pausar' : '▶ Iniciar'}
                  </button>
                  <button className="btn-sm" onClick={() => { setSimRunning(false); setTimeout(() => setSimRunning(true), 80); }}>
                    🔄 Resetear
                  </button>
                </div>
              </div>
            )}

            {/* API info */}
            {/* <div className="section-label" style={{ marginTop: '18px' }}>API Mobile (POST)</div>
            <div className="api-info">
              POST /api/position<br />
              {'{'}<br />
              &nbsp;"circuitId": "circuito_1",<br />
              &nbsp;"participantId": "p1",<br />
              &nbsp;"name": "Marcos",<br />
              &nbsp;"lat": -34.5057,<br />
              &nbsp;"lng": -58.7061,<br />
              &nbsp;"speed": 22.5<br />
              {'}'}
            </div>

            {!isDemo && (
              <button className="secondary-btn" onClick={() => setShowConfig(true)}>
                ⚙️ Reconfigurar Firebase
              </button>
            )} */}
          </div>
        </aside>

        {/* ============ MAPA ============ */}
        <main className="map-container">
          {/* Header flotante */}
          <div className="map-header">
            <div className="map-start-badge">
              <span className="map-start-icon">🏁</span>
              <div>
                <div className="map-start-name">El Campito — Baroni 891</div>
                <div className="map-start-sub">Los Polvorines · Inicio y llegada compartido</div>
              </div>
            </div>
            <div className="map-stats">
              <div className="map-stat-card">
                <div className="map-stat-value" style={{ color: '#e03131' }}>{totalCount}</div>
                <div className="map-stat-label">En ruta</div>
              </div>
              <div className="map-stat-card">
                <div className="map-stat-value">{CIRCUIT_LIST.filter(c => !c.hidden).length}</div>
                <div className="map-stat-label">Circuitos</div>
              </div>
              {isDemo && (
                <div className="map-stat-card" style={{ borderColor: '#e67700', background: '#fff8f0' }}>
                  <div className="map-stat-value" style={{ color: '#e67700', fontSize: '11px' }}>DEMO</div>
                  <div className="map-stat-label">Modo</div>
                </div>
              )}
            </div>
          </div>

          {/* Mapa */}
          <MapWrapper
            circuits={CIRCUIT_LIST}
            participants={displayParticipants}
            activeCircuitFilter={activeFilter}
          />
        </main>
      </div>
    </>
  );
}
