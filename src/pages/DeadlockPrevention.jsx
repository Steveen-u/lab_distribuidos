import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

/* ─── Configuración Geométrica (Tu Lógica) ─── */
const POS = { P1: { cx: 148, cy: 148 }, P2: { cx: 552, cy: 148 }, R1: { cx: 350, cy: 68 }, R2: { cx: 350, cy: 228 } };
const RING_CX = 350, RING_CY = 148;
const PR = 40, DS = 30;
const W = 700, H = 298;

function arw(fk, tk) {
  const f = POS[fk], t = POS[tk];
  const dx = t.cx - f.cx, dy = t.cy - f.cy;
  const d = Math.hypot(dx, dy);
  const nx = dx / d, ny = dy / d;
  const diam = (a, b) => DS / (Math.abs(a) + Math.abs(b));
  const fo = fk[0] === "P" ? PR + 3 : diam(nx, ny) + 3;
  const to = tk[0] === "P" ? PR + 7 : diam(nx, ny) + 7;
  return { x1: f.cx + nx * fo, y1: f.cy + ny * fo, x2: f.cx + nx * (d - to), y2: f.cy + ny * (d - to) };
}

export default function DeadlockPrevention() {
  const [p1, setP1] = useState({ owns: [], req: null });
  const [p2, setP2] = useState({ owns: [], req: null });
  const [log, setLog] = useState("Sistema listo. El orden jerárquico es R1 < R2.");

  const request = (pIdx, rKey) => {
    const isP1 = pIdx === 1;
    const p = isP1 ? p1 : p2;
    const other = isP1 ? p2 : p1;
    const rNum = parseInt(rKey[1]);

    if (p.owns.includes(rKey) || p.req === rKey) return;

    // Lógica de Prevención: Solo pedir si es mayor que lo que ya posee
    const maxOwned = p.owns.length ? Math.max(...p.owns.map(r => parseInt(r[1]))) : 0;
    if (rNum <= maxOwned) {
      setLog(`Prevención: Proceso ${pIdx} no puede pedir ${rKey} (debe seguir el orden R1 < R2).`);
      return;
    }

    if (other.owns.includes(rKey)) {
      isP1 ? setP1({ ...p1, req: rKey }) : setP2({ ...p2, req: rKey });
      setLog(`Proceso ${pIdx} espera por ${rKey}.`);
    } else {
      isP1 ? setP1({ ...p1, owns: [...p1.owns, rKey], req: null }) : setP2({ ...p2, owns: [...p2.owns, rKey], req: null });
      setLog(`Recurso ${rKey} asignado a Proceso ${pIdx}.`);
    }
  };

  const release = (pIdx, rKey) => {
    if (pIdx === 1) {
      setP1({ ...p1, owns: p1.owns.filter(r => r !== rKey) });
      if (p2.req === rKey) setP2({ ...p2, owns: [...p2.owns, rKey], req: null });
    } else {
      setP2({ ...p2, owns: p2.owns.filter(r => r !== rKey) });
      if (p1.req === rKey) setP1({ ...p1, owns: [...p1.owns, rKey], req: null });
    }
    setLog(`Proceso ${pIdx} liberó ${rKey}.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-rajdhani">
      <Navbar />
      <main className="max-w-6xl mx-auto p-8">
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 uppercase tracking-widest">Protocolo de Prevención</span>
            <h1 className="text-4xl font-exo font-extrabold text-white">Prevención de <span className="text-amber-500">Deadlocks</span></h1>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <p className="text-slate-300 leading-relaxed italic">
              Esta simulación ataca la condición de <strong>Espera Circular</strong>. El sistema impone un orden jerárquico lineal (R1 &lt; R2). Un proceso solo puede solicitar un recurso si su índice es mayor a cualquier recurso que ya posea, eliminando la posibilidad de ciclos.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center">
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mb-8">
              <defs><marker id="head" orient="auto" markerWidth="3" markerHeight="4" refX="0.1" refY="2"><path d="M0,0 V4 L3,2 Z" fill="#fbbf24" /></marker></defs>
              {/* Recursos */}
              {[1, 2].map(i => (
                <g key={i} transform={`translate(${POS['R'+i].cx-DS},${POS['R'+i].cy-DS})`}>
                  <rect width={DS*2} height={DS*2} fill="#1a1a1a" stroke="#fbbf24" strokeWidth="2" rx="4" />
                  <text x={DS} y={DS+5} textAnchor="middle" fill="#fbbf24" className="text-xs font-bold">R{i}</text>
                </g>
              ))}
              {/* Procesos */}
              {[1, 2].map(i => (
                <g key={i}>
                  <circle cx={POS['P'+i].cx} cy={POS['P'+i].cy} r={PR} fill="#1a1a1a" stroke="#f59e0b" strokeWidth="2" />
                  <text x={POS['P'+i].cx} y={POS['P'+i].cy+5} textAnchor="middle" fill="#f59e0b" className="text-lg font-bold font-exo">P{i}</text>
                </g>
              ))}
              {/* Flechas de Asignación y Solicitud */}
              {p1.owns.map(r => <line key={r} {...arw(r, 'P1')} stroke="#4ade80" strokeWidth="2" markerEnd="url(#head)" />)}
              {p1.req && <line {...arw('P1', p1.req)} stroke="#ef4444" strokeWidth="2" markerEnd="url(#head)" strokeDasharray="4" />}
              {p2.owns.map(r => <line key={r} {...arw(r, 'P2')} stroke="#4ade80" strokeWidth="2" markerEnd="url(#head)" />)}
              {p2.req && <line {...arw('P2', p2.req)} stroke="#ef4444" strokeWidth="2" markerEnd="url(#head)" strokeDasharray="4" />}
            </svg>

            <div className="flex gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-center text-xs font-bold text-slate-500 uppercase">Proceso 1</span>
                <div className="flex gap-2">
                  <button onClick={() => request(1, 'R1')} className="px-3 py-1 bg-amber-600 rounded text-xs font-bold">Pedir R1</button>
                  <button onClick={() => request(1, 'R2')} className="px-3 py-1 bg-amber-600 rounded text-xs font-bold">Pedir R2</button>
                </div>
                <div className="flex gap-2 justify-center">
                  {p1.owns.map(r => <button key={r} onClick={() => release(1, r)} className="text-[10px] text-emerald-400 underline">Soltar {r}</button>)}
                </div>
              </div>
              <div className="w-px bg-slate-800 mx-4" />
              <div className="flex flex-col gap-2">
                <span className="text-center text-xs font-bold text-slate-500 uppercase">Proceso 2</span>
                <div className="flex gap-2">
                  <button onClick={() => request(2, 'R1')} className="px-3 py-1 bg-amber-600 rounded text-xs font-bold">Pedir R1</button>
                  <button onClick={() => request(2, 'R2')} className="px-3 py-1 bg-amber-600 rounded text-xs font-bold">Pedir R2</button>
                </div>
                <div className="flex gap-2 justify-center">
                  {p2.owns.map(r => <button key={r} onClick={() => release(2, r)} className="text-[10px] text-emerald-400 underline">Soltar {r}</button>)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-[500px]">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Monitor de Seguridad</h3>
            <div className="flex-1 font-mono text-sm overflow-y-auto space-y-2 text-amber-200/80">
              <div className="p-2 bg-black/20 rounded border-l-2 border-amber-500">{log}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}