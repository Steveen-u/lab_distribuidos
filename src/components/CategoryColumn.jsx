import AlgorithmItem from "./AlgorithmItem";

export default function CategoryColumn({ category, algorithms, theme }) {
  // Mapas de colores dinámicos de Tailwind
  const borderColors = {
    emerald: "border-emerald-500/30",
    violet: "border-violet-500/30",
    rose: "border-rose-500/30",
    amber: "border-amber-500/30",
    cyan: "border-cyan-500/30"
  };

  const bgColors = {
    emerald: "bg-emerald-500/5",
    violet: "bg-violet-500/5",
    rose: "bg-rose-500/5",
    amber: "bg-amber-500/5",
    cyan: "bg-cyan-500/5"
  };

  const textColors = {
    emerald: "text-emerald-400",
    violet: "text-violet-400",
    rose: "text-rose-400",
    amber: "text-amber-400",
    cyan: "text-cyan-400"
  };

  return (
    <div className={`backdrop-blur-sm bg-slate-900/80 border ${borderColors[theme]} ${bgColors[theme]} rounded-2xl p-6 flex flex-col gap-5 shadow-xl transition-transform hover:-translate-y-1 duration-300`}>
      <div className="flex items-center gap-3 mb-2 justify-center">
        <h2 className="font-exo font-bold text-2xl text-white">
          Algoritmos de <span className={textColors[theme]}>{category.toLowerCase()}</span>
        </h2>
      </div>
      
      <div className="flex flex-col gap-4">
        {algorithms.map((algo) => (
          <AlgorithmItem 
            key={algo.id} 
            id={algo.id} 
            name={algo.name} 
            desc={algo.desc} 
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
}