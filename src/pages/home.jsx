import { algorithmsData } from "../data/algorithmsData";
import CategoryColumn from "../components/CategoryColumn";

// Mapeo de colores "nonstandard" para cada categoría
const themeColors = {
  "Sincronización": "emerald",
  "Exclusión mútua": "violet",
  "Elección": "rose",
  "Bloqueos": "amber"
};

export default function Home() {
  return (
    <div className="min-h-screen font-rajdhani p-8 md:p-12 relative overflow-hidden bg-slate-950">
      
      {/* Background Decorativo: Nodos / Redes y brillos */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-[120px]"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-rose-500/10 blur-[120px]"></div>
        {/* Patrón de puntos (estilo malla de red) */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10">
        <h1 className="font-exo font-extrabold text-4xl md:text-6xl text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-violet-400 to-rose-400 tracking-wide mb-8 drop-shadow-sm">
          Laboratorio de Sistemas Distribuidos
        </h1>

        <div className="max-w-4xl mx-auto bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 mb-16 text-center shadow-2xl">
          <p className="text-slate-300 text-lg md:text-xl leading-relaxed font-medium">
            Explora el comportamiento interno de una red descentralizada. 
            Descubre cómo los nodos logran <span className="text-emerald-400 font-semibold">sincronizarse</span>, 
            garantizan <span className="text-violet-400 font-semibold">exclusión mutua</span> y 
            llevan a cabo <span className="text-rose-400 font-semibold">elecciones</span> sin depender de un núcleo central.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {algorithmsData.map((col) => (
            <CategoryColumn 
              key={col.category} 
              category={col.category} 
              algorithms={col.algorithms}
              theme={themeColors[col.category] || "cyan"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}