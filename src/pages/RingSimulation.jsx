import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

export default function RingSimulation() {
  const [nodeCountInput, setNodeCountInput] = useState(6);
  const logEndRef = useRef(null);

  function generateNodes(count) {
    const n = parseInt(count);
    return Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      active: true,
      isCoordinator: (i + 1) === n
    }));
  }

  const [nodes, setNodes] = useState(() => generateNodes(6));
  const [logs, setLogs] = useState(["Topología circular activa. Nodo 6 coordinando."]);
  const [animating, setAnimating] = useState(false);
  const [activeToken, setActiveToken] = useState(null); // { fromIdx, toIdx }

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg) => setLogs((prev) => [...prev, `> ${msg}`]);

  const applyConfiguration = () => {
    if (animating) return;
    const count = parseInt(nodeCountInput);
    setNodes(generateNodes(count));
    setLogs([`Anillo reconstruido con ${count} nodos.`]);
    setActiveToken(null);
  };

  const toggleNode = (id) => {
    if (animating) return;
    setNodes((prev) => prev.map(n => {
      if (n.id === id) {
        const newStatus = !n.active;
        addLog(`Nodo ${id} está ${newStatus ? 'ACTIVO' : 'CAÍDO'}.`);
        return { ...n, active: newStatus, isCoordinator: n.isCoordinator && newStatus };
      }
      return n;
    }));
  };

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const runRing = async (startId) => {
    if (animating) return;
    setAnimating(true);
    
    const currentCoord = nodes.find(n => n.isCoordinator && n.active);
    if (currentCoord) {
      addLog(`Nodo ${startId} verifica líder... está OK.`);
      setAnimating(false);
      return;
    }

    addLog(`Nodo ${startId} detecta falla e inicia mensaje de elección.`);
    let electionList = [startId];
    let currentNodeIndex = nodes.findIndex(n => n.id === startId);
    let startNodeIndex = currentNodeIndex;

    do {
      let nextIndex = (currentNodeIndex + 1) % nodes.length;
      while (!nodes[nextIndex].active && nextIndex !== startNodeIndex) {
        addLog(`Nodo ${nodes[nextIndex].id} está caído. El mensaje salta al siguiente.`);
        nextIndex = (nextIndex + 1) % nodes.length;
        await delay(500);
      }

      if (nextIndex === startNodeIndex) break;

      // Animación del Token
      setActiveToken({ fromIdx: currentNodeIndex, toIdx: nextIndex });
      await delay(800);
      
      currentNodeIndex = nextIndex;
      electionList.push(nodes[currentNodeIndex].id);
      addLog(`Mensaje recibido por Nodo ${nodes[currentNodeIndex].id}. Lista actual: [${electionList.join(',')}]`);
      
    } while (currentNodeIndex !== startNodeIndex);

    const newLeaderId = Math.max(...electionList);
    addLog(`El mensaje volvió al inicio. Líder elegido: Nodo ${newLeaderId}.`);
    
    setNodes(prev => prev.map(n => ({
      ...n,
      isCoordinator: n.id === newLeaderId
    })));

    addLog(`Nodo ${newLeaderId} asume el control del anillo.`);
    await delay(1000);
    setActiveToken(null);
    setAnimating(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-rajdhani overflow-hidden">
      <Navbar />
      <main className="max-w-6xl mx-auto p-8">
        
        {/* EXPLICACIÓN DETALLADA */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold border border-violet-500/30 uppercase tracking-widest">Topología Lógica</span>
            <h1 className="text-4xl font-exo font-extrabold text-white">Algoritmo de Anillo</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-violet-400 font-exo">¿Cómo se elige por consenso?</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                A diferencia del Bully, aquí no hay un "matón". Los nodos están conectados en un ciclo lógico. Cuando un nodo nota que no hay líder, envía un <strong>Token de Elección</strong> a su vecino. Este token viaja por el anillo recolectando los IDs de todos los nodos activos. Al dar la vuelta completa, el nodo iniciador mira la lista y proclama líder al mayor.
              </p>
            </div>
            <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800">
              <h4 className="text-white font-bold text-xs uppercase tracking-tighter mb-4 text-center">Ventajas de esta Estructura</h4>
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="p-2 bg-slate-900 rounded border border-slate-800"><span className="text-violet-400 block font-bold">Ordenado</span> No hay colisión de mensajes.</div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800"><span className="text-violet-400 block font-bold">Predecible</span> El tiempo de elección es $O(n)$.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col min-h-[600px] relative shadow-inner">
            
            <div className="flex items-end gap-4 mb-4">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <input type="number" min="3" max="12" value={nodeCountInput} onChange={(e) => setNodeCountInput(e.target.value)} disabled={animating} className="bg-transparent text-white font-bold outline-none w-12 text-center" />
              </div>
              <button onClick={applyConfiguration} disabled={animating} className="bg-violet-600 hover:bg-violet-500 text-white font-exo font-bold px-4 py-2 rounded-lg transition-all text-sm">Reiniciar Anillo</button>
            </div>

            {/* REPRESENTACIÓN DEL ANILLO */}
            <div className="relative flex-1 flex items-center justify-center">
              <div className="absolute w-[320px] h-[320px] border border-dashed border-violet-500/20 rounded-full"></div>
              
              {nodes.map((node, index) => {
                const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
                const x = Math.cos(angle) * 160;
                const y = Math.sin(angle) * 160;

                return (
                  <div key={node.id} className="absolute transition-all duration-700" style={{ transform: `translate(${x}px, ${y}px)` }}>
                    <div className="flex flex-col items-center">
                      {node.isCoordinator && (
                        <div className="absolute -top-10 bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded shadow-lg">LÍDER</div>
                      )}
                      <button
                        onClick={() => toggleNode(node.id)}
                        disabled={animating}
                        className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-exo font-black text-xl transition-all duration-500 ${
                          node.active ? (node.isCoordinator ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-slate-800 border-violet-500/40 text-violet-400') : 'bg-slate-950 border-slate-800 text-slate-800 scale-90 grayscale opacity-30'
                        }`}
                      >
                        {node.id}
                      </button>
                      {node.active && !node.isCoordinator && (
                        <button onClick={() => runRing(node.id)} disabled={animating} className="mt-2 text-[8px] font-black text-violet-500 hover:text-white uppercase transition-colors">Votar</button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* EL TOKEN MENSAJERO */}
              {activeToken && (
                <div 
                  className="absolute w-6 h-6 bg-white rounded-full shadow-[0_0_25px_white] flex items-center justify-center transition-all duration-700 ease-linear z-50"
                  style={{
                    transform: `translate(${Math.cos((activeToken.toIdx / nodes.length) * 2 * Math.PI - Math.PI / 2) * 160}px, ${Math.sin((activeToken.toIdx / nodes.length) * 2 * Math.PI - Math.PI / 2) * 160}px)`,
                  }}
                >
                  <span className="animate-ping absolute inset-0 rounded-full bg-white opacity-50"></span>
                  <span className="text-[10px]">📩</span>
                </div>
              )}
            </div>
          </div>

          {/* MONITOR */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl flex flex-col h-[600px] shadow-2xl">
            <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Monitor de Red</span>
            </div>
            <div className="p-5 overflow-y-auto flex-1 font-mono text-[11px] space-y-3 custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className={`pb-2 border-b border-slate-900 ${log.includes('LÍDER') ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                  {log}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2e1065; border-radius: 10px; }
      `}</style>
    </div>
  );
}