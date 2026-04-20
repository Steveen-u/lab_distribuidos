import { useState } from "react";
import Navbar from "../components/Navbar";

export default function DeadlockRecovery() {
  const [nodes, setNodes] = useState([
    { id: 'P1', status: 'deadlock' },
    { id: 'P2', status: 'deadlock' },
    { id: 'P3', status: 'deadlock' },
  ]);
  const [log, setLog] = useState("Deadlock detectado entre P1, P2 y P3. Selecciona un proceso para abortar.");

  const abort = (id) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'aborted' } : { ...n, status: 'recovered' }));
    setLog(`Proceso ${id} ha sido abortado. Los recursos se han liberado y el sistema se ha recuperado.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-rajdhani">
      <Navbar />
      <main className="max-w-6xl mx-auto p-8">
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-400/30 uppercase tracking-widest">Protocolo de Salida</span>
            <h1 className="text-4xl font-exo font-extrabold text-white">Recuperación de <span className="text-amber-500">Deadlocks</span></h1>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <p className="text-slate-300 leading-relaxed italic">
              Una vez detectado un ciclo, el sistema debe elegir una <strong>víctima</strong>. Esta simulación permite experimentar con la terminación de procesos para romper el bloqueo y permitir que el resto del sistema continúe su ejecución.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 flex justify-around items-center">
            {nodes.map(n => (
              <div key={n.id} className="flex flex-col items-center gap-4">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center font-black text-2xl transition-all duration-700 ${
                  n.status === 'deadlock' ? 'bg-rose-500/20 border-rose-500 text-rose-500 animate-pulse' :
                  n.status === 'aborted' ? 'bg-slate-800 border-slate-700 text-slate-700' : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                }`}>
                  {n.id}
                </div>
                {n.status === 'deadlock' && (
                  <button onClick={() => abort(n.id)} className="px-4 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-full transition-colors">Abortar</button>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest">{n.status}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Monitor de Recuperación</h3>
            <div className="p-4 bg-black/40 rounded border-l-4 border-amber-500 font-mono text-sm text-amber-200">
              {log}
            </div>
            <button onClick={() => { setNodes([{ id: 'P1', status: 'deadlock' }, { id: 'P2', status: 'deadlock' }, { id: 'P3', status: 'deadlock' }]); setLog("Nuevo deadlock detectado."); }} className="mt-8 w-full py-2 border border-slate-700 hover:bg-slate-800 rounded text-xs transition-colors">Reiniciar Escenario</button>
          </div>
        </div>
      </main>
    </div>
  );
}