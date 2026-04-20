import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";

/* ─── Configuración Geométrica ─── */
const POS = {
  P1: { cx: 168, cy: 115 },
  P2: { cx: 532, cy: 115 },
  P3: { cx: 350, cy: 252 },
  R1: { cx: 350, cy: 56  },
  R2: { cx: 185, cy: 238 },
  R3: { cx: 515, cy: 240 },
};
const PR = 38, DS = 27, W = 700, H = 310;

// Función para calcular puntos de flecha (evita que la flecha entre al círculo)
function arw(fk, tk) {
  const f = POS[fk], t = POS[tk];
  const dx = t.cx - f.cx, dy = t.cy - f.cy;
  const d = Math.hypot(dx, dy);
  const nx = dx / d, ny = dy / d;
  const dOff = DS / (Math.abs(nx) + Math.abs(ny));
  const fo = fk[0] === "P" ? PR + 3 : dOff + 3;
  const to = tk[0] === "P" ? PR + 6 : dOff + 6;
  return { x1: f.cx + nx * fo, y1: f.cy + ny * fo, x2: f.cx + nx * (d - to), y2: f.cy + ny * (d - to) };
}

export default function DeadlockDetection() {
  const [state, setState] = useState({
    P1: { req: null, owns: [] },
    P2: { req: null, owns: [] },
    P3: { req: null, owns: [] },
    R1: { owner: null },
    R2: { owner: null },
    R3: { owner: null }
  });
  const [logs, setLogs] = useState(["Monitor de interbloqueos iniciado. Grafo de espera vacío."]);
  const [deadlockNodes, setDeadlockNodes] = useState([]);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg) => setLogs(prev => [...prev, `> ${msg}`]);

  const handleRequest = (p, r) => {
    if (state[p].owns.includes(r) || state[p].req === r) return;

    if (state[r].owner) {
      addLog(`Proceso ${p} solicita ${r}. Recurso ocupado por ${state[r].owner}. ${p} entra en espera.`);
      setState(prev => ({
        ...prev,
        [p]: { ...prev[p], req: r }
      }));
    } else {
      addLog(`Recurso ${r} disponible. Asignando a Proceso ${p}.`);
      setState(prev => ({
        ...prev,
        [p]: { ...prev[p], owns: [...prev[p].owns, r] },
        [r]: { owner: p }
      }));
    }
  };

  const handleRelease = (p, r) => {
    addLog(`Proceso ${p} libera el recurso ${r}.`);
    setState(prev => {
      const newState = { 
        ...prev, 
        [p]: { ...prev[p], owns: prev[p].owns.filter(res => res !== r) },
        [r]: { owner: null }
      };

      // Transferencia automática al siguiente en espera
      const waitingProcess = Object.keys(newState).find(k => k.startsWith('P') && newState[k].req === r);
      if (waitingProcess) {
        addLog(`Recurso ${r} transferido a ${waitingProcess} (estaba en cola).`);
        newState[waitingProcess] = { ...newState[waitingProcess], req: null, owns: [...newState[waitingProcess].owns, r] };
        newState[r] = { owner: waitingProcess };
      }
      return newState;
    });
  };

  // Algoritmo de Detección de Ciclos
  useEffect(() => {
    const adj = {};
    ["P1", "P2", "P3"].forEach(p => {
      if (state[p].req) {
        const owner = state[state[p].req].owner;
        if (owner) adj[p] = owner;
      }
    });

    let detected = [];
    const findCycle = (curr, visited = new Set(), path = []) => {
      if (path.includes(curr)) return path.slice(path.indexOf(curr));
      if (visited.has(curr) || !adj[curr]) return null;
      visited.add(curr);
      return findCycle(adj[curr], visited, [...path, curr]);
    };

    Object.keys(adj).forEach(p => {
      const cycle = findCycle(p);
      if (cycle) detected = [...new Set([...detected, ...cycle])];
    });

    if (detected.length > 0 && JSON.stringify(detected) !== JSON.stringify(deadlockNodes)) {
      addLog(`¡DEADLOCK DETECTADO! Ciclo crítico: ${detected.join(' ↔ ')}`);
    }
    setDeadlockNodes(detected);
  }, [state]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-rajdhani">
      <Navbar />
      <main className="max-w-6xl mx-auto p-8">
        
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-400/30 uppercase tracking-widest italic">Monitor RAG</span>
            <h1 className="text-4xl font-exo font-extrabold text-white">Detección de <span className="text-amber-500">Deadlocks</span></h1>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <p className="text-slate-300 text-sm italic">
              Este simulador utiliza un <strong>Grafo de Asignación de Recursos (RAG)</strong>. Si se forma un ciclo de dependencia cerrada entre procesos y recursos, el monitor activará una alerta visual.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SIMULACIÓN SVG */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[450px] shadow-inner relative">
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="drop-shadow-2xl">
              <defs>
                <marker id="arr-amber" orient="auto" markerWidth="3" markerHeight="4" refX="0.1" refY="2">
                  <path d="M0,0 V4 L3,2 Z" fill="#fbbf24" />
                </marker>
                <marker id="arr-red" orient="auto" markerWidth="3" markerHeight="4" refX="0.1" refY="2">
                  <path d="M0,0 V4 L3,2 Z" fill="#ef4444" />
                </marker>
              </defs>

              {/* FLECHAS */}
              {["P1", "P2", "P3"].map(p => (
                <g key={`links-${p}`}>
                  {state[p].owns.map(r => (
                    <line key={`${r}-${p}`} {...arw(r, p)} stroke="#4ade80" strokeWidth="2" markerEnd="url(#arr-amber)" />
                  ))}
                  {state[p].req && (
                    <line {...arw(p, state[p].req)} stroke={deadlockNodes.includes(p) ? "#ef4444" : "#fbbf24"} strokeWidth="2" strokeDasharray="5,3" markerEnd={deadlockNodes.includes(p) ? "url(#arr-red)" : "url(#arr-amber)"} />
                  )}
                </g>
              ))}

              {/* RECURSOS (Rombos) */}
              {["R1", "R2", "R3"].map(r => (
                <g key={r} transform={`translate(${POS[r].cx},${POS[r].cy}) rotate(45)`}>
                  <rect x={-DS} y={-DS} width={DS*2} height={DS*2} fill="#0d1117" stroke="#fbbf24" strokeWidth="2" rx="4" />
                  <text transform="rotate(-45)" x="0" y="5" textAnchor="middle" fill="#fbbf24" className="text-[11px] font-bold font-exo">{r}</text>
                </g>
              ))}

              {/* PROCESOS (Círculos) */}
              {["P1", "P2", "P3"].map(p => (
                <g key={p}>
                  <circle cx={POS[p].cx} cy={POS[p].cy} r={PR} fill="#0d1117" stroke={deadlockNodes.includes(p) ? "#ef4444" : "#f59e0b"} strokeWidth={deadlockNodes.includes(p) ? "4" : "2"} className={deadlockNodes.includes(p) ? "animate-pulse" : ""} />
                  <text x={POS[p].cx} y={POS[p].cy + 6} textAnchor="middle" fill={deadlockNodes.includes(p) ? "#ef4444" : "#f59e0b"} className="text-sm font-black font-exo">{p}</text>
                </g>
              ))}
            </svg>

            {/* BOTONES DE CONTROL */}
            <div className="grid grid-cols-3 gap-6 w-full mt-10">
              {["P1", "P2", "P3"].map(p => (
                <div key={p} className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-2xl">
                  <p className="text-center text-[10px] font-black text-slate-500 uppercase mb-3">Controles {p}</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1 justify-center">
                      {["R1", "R2", "R3"].map(r => (
                        <button key={r} onClick={() => handleRequest(p, r)} className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-1 rounded hover:bg-amber-500 hover:text-black transition-all">Pedir {r}</button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center min-h-[22px]">
                      {state[p].owns.map(r => (
                        <button key={r} onClick={() => handleRelease(p, r)} className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Soltar {r}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TERMINAL DE LOGS */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl flex flex-col h-[600px] shadow-2xl">
            <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Wait-For Graph Monitor</span>
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            </div>
            <div className="p-5 overflow-y-auto flex-1 font-mono text-[11px] leading-relaxed space-y-2 custom-scrollbar bg-black/20">
              {logs.map((log, i) => (
                <div key={i} className={`pb-1 border-b border-slate-900/50 ${log.includes('ALERTA') || log.includes('DEADLOCK') ? 'text-rose-500 font-bold bg-rose-500/5 p-2 rounded' : 'text-emerald-500/80'}`}>
                  {log}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}