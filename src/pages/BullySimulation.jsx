import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

export default function BullySimulation() {
  const [nodeCountInput, setNodeCountInput] = useState(5);
  const [nodes, setNodes] = useState(() => generateNodes(5));
  const [logs, setLogs] = useState(["Sistema iniciado. El nodo con ID más alto es el líder."]);
  const [animating, setAnimating] = useState(false);
  const [activeMessages, setActiveMessages] = useState([]); 
  const logEndRef = useRef(null);

  function generateNodes(count) {
    const n = parseInt(count);
    return Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      active: true,
      isCoordinator: (i + 1) === n
    }));
  }

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg) => setLogs((prev) => [...prev, `> ${msg}`]);

  const applyConfiguration = () => {
    if (animating) return;
    const count = parseInt(nodeCountInput);
    setNodes(generateNodes(count));
    setLogs([`Red reiniciada con ${count} nodos. Nodo ${count} es el líder inicial.`]);
    setActiveMessages([]);
  };

  const toggleNode = (id) => {
    if (animating) return;
    setNodes((prev) => prev.map(n => {
      if (n.id === id) {
        const newStatus = !n.active;
        addLog(`Nodo ${id} ahora está ${newStatus ? 'ACTIVO' : 'CAÍDO'}.`);
        return { ...n, active: newStatus, isCoordinator: n.isCoordinator && newStatus };
      }
      return n;
    }));
  };

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  // Función para disparar un mensaje visual
  const sendVisualMessage = async (fromId, toId, type) => {
    const id = Math.random();
    setActiveMessages(prev => [...prev, { id, fromId, toId, type }]);
    setTimeout(() => {
      setActiveMessages(prev => prev.filter(m => m.id !== id));
    }, 800); // Duración de la animación CSS
  };

  const runBully = async (startId) => {
    if (animating) return;
    const starter = nodes.find(n => n.id === startId);
    if (!starter.active) return;

    setAnimating(true);
    
    const currentCoord = nodes.find(n => n.isCoordinator && n.active);
    if (currentCoord) {
      addLog(`Nodo ${startId} pregunta al líder ${currentCoord.id} si está OK...`);
      await sendVisualMessage(startId, currentCoord.id, 'ELECTION');
      await delay(800);
      addLog(`Líder ${currentCoord.id} responde: "Estoy bien".`);
      await sendVisualMessage(currentCoord.id, startId, 'OK');
      setAnimating(false);
      return;
    }

    addLog(`Nodo ${startId} no recibe respuesta del líder. ¡Iniciando elección!`);

    let currentElectionNode = startId;
    let finalWinner = startId;

    while (currentElectionNode !== null) {
      const higherNodes = nodes.filter(n => n.id > currentElectionNode);
      if (higherNodes.length === 0) {
        finalWinner = currentElectionNode;
        break;
      }

      addLog(`Nodo ${currentElectionNode} pregunta a superiores si están activos.`);
      higherNodes.forEach(h => sendVisualMessage(currentElectionNode, h.id, 'ELECTION'));
      await delay(900);

      const responders = higherNodes.filter(h => h.active);
      if (responders.length > 0) {
        addLog(`Nodos [${responders.map(r => r.id).join(',')}] responden OK.`);
        responders.forEach(r => sendVisualMessage(r.id, currentElectionNode, 'OK'));
        await delay(800);
        currentElectionNode = responders[0].id;
      } else {
        addLog(`Nadie superior responde.`);
        finalWinner = currentElectionNode;
        currentElectionNode = null;
      }
    }

    addLog(`Nodo ${finalWinner} es el nuevo matón (LÍDER). Notificando a todos...`);
    nodes.filter(n => n.id !== finalWinner && n.active).forEach(n => sendVisualMessage(finalWinner, n.id, 'COORD'));
    
    setNodes(prev => prev.map(n => ({ ...n, isCoordinator: n.id === finalWinner })));
    await delay(1000);
    setAnimating(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-rajdhani overflow-x-hidden">
      <Navbar />
      <main className="max-w-6xl mx-auto p-8">
        
        {/* INTRODUCCIÓN TÉCNICA */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 uppercase">Teoría Distribuida</span>
            <h1 className="text-4xl font-exo font-extrabold text-white">Algoritmo de Bully</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-rose-400 font-exo italic">"El más fuerte sobrevive"</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Este algoritmo es una solución clásica para el problema de la elección de coordinador. Se basa en que cada nodo tiene un ID jerárquico. Cuando el líder falla, cualquier nodo puede iniciar una elección, pero el resultado final está predeterminado: <strong>el nodo con el ID más alto siempre ganará.</strong>
              </p>
            </div>
            <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-white font-bold text-sm underline decoration-rose-500">Protocolo de Mensajería:</h4>
              <ul className="text-xs space-y-2 text-slate-400">
                <li><span className="text-rose-500 font-bold">ELECTION:</span> "¿Hay alguien mayor que yo vivo?"</li>
                <li><span className="text-emerald-500 font-bold">OK:</span> "Sí, yo estoy aquí. Cállate y déjamelo a mí."</li>
                <li><span className="text-amber-500 font-bold">COORDINATOR:</span> "Atención a todos, yo soy el nuevo líder."</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 relative min-h-[500px] flex flex-col">
            
            {/* CONFIGURACIÓN */}
            <div className="flex items-end gap-4 mb-16">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nodos en red</label>
                <input type="number" min="3" max="12" value={nodeCountInput} onChange={(e) => setNodeCountInput(e.target.value)} disabled={animating} className="bg-transparent text-white font-bold outline-none w-16" />
              </div>
              <button onClick={applyConfiguration} disabled={animating} className="bg-rose-600 hover:bg-rose-500 text-white font-exo font-bold px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95">Reiniciar Simulación</button>
            </div>

            {/* ÁREA DE NODOS Y MENSAJES */}
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-16 items-end relative flex-1">
              {nodes.map((node, idx) => (
                <div key={node.id} className="flex flex-col items-center gap-3 relative w-20">
                  {node.isCoordinator && (
                    <div className="absolute -top-12 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce shadow-xl">COORDINADOR</div>
                  )}
                  <button
                    onClick={() => toggleNode(node.id)}
                    disabled={animating}
                    className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-exo font-black text-2xl transition-all duration-500 ${
                      node.active ? (node.isCoordinator ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-slate-800 border-rose-500/40 text-rose-400') : 'bg-slate-950 border-slate-800 text-slate-800 grayscale scale-90 opacity-40'
                    }`}
                  >
                    {node.id}
                  </button>
                  <span className={`text-[10px] font-bold tracking-widest ${node.active ? 'text-slate-500' : 'text-rose-900'}`}>{node.active ? 'ONLINE' : 'OFFLINE'}</span>
                  {node.active && !node.isCoordinator && (
                    <button onClick={() => runBully(node.id)} disabled={animating} className="text-[9px] bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 px-2 py-1 rounded-md transition-all">Iniciar Elección</button>
                  )}
                </div>
              ))}

              {/* CAPA DE MENSAJES VISUALES */}
              {activeMessages.map(msg => {
                const fromIdx = nodes.findIndex(n => n.id === msg.fromId);
                const toIdx = nodes.findIndex(n => n.id === msg.toId);
                return (
                  <div 
                    key={msg.id}
                    className={`absolute bottom-24 w-4 h-4 rounded-full z-50 shadow-2xl flex items-center justify-center transition-all duration-700 ease-in-out
                      ${msg.type === 'ELECTION' ? 'bg-rose-500' : msg.type === 'OK' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{
                      left: `${(fromIdx / (nodes.length - 1)) * 100}%`,
                      '--target-x': `${(toIdx / (nodes.length - 1)) * 100}%`,
                      animation: 'moveMessage 0.8s forwards linear'
                    }}
                  >
                    <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONSOLA DE EVENTOS */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
            <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Terminal / logs</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500/20"></div>
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              </div>
            </div>
            <div className="p-5 overflow-y-auto flex-1 font-mono text-[11px] leading-relaxed custom-scrollbar bg-black/20">
              {logs.map((l, i) => (
                <div key={i} className={`mb-2 border-l-2 pl-3 ${l.includes('LÍDER') || l.includes('ganador') ? 'border-amber-500 text-amber-400 font-bold bg-amber-500/5 py-1' : 'border-slate-800 text-slate-400'}`}>
                  {l}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes moveMessage {
          from { opacity: 0; transform: scale(0.5); }
          20% { opacity: 1; transform: scale(1.2); }
          100% { left: var(--target-x); opacity: 0; transform: scale(0.8); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}