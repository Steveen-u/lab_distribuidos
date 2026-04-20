import { useNavigate } from "react-router-dom";

export default function AlgorithmItem({ id, name, desc, theme }) {
  const navigate = useNavigate();

  const buttonThemes = {
    emerald: "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:border-emerald-400 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]",
    violet: "border-violet-500/40 text-violet-300 hover:bg-violet-600 hover:border-violet-500 hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]",
    rose: "border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:border-rose-500 hover:text-white hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]",
    amber: "border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:border-amber-400 hover:text-white hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]",
    cyan: "border-cyan-500/40 text-cyan-300 hover:bg-cyan-500 hover:border-cyan-400 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
  };

  return (
    <div className="group flex flex-col gap-2 p-4 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/80 transition-all duration-300">
      <button
        onClick={() => navigate(`/simulador/${id}`)}
        className={`w-full bg-slate-900/50 border-2 font-exo font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 ${buttonThemes[theme]}`}
      >
        {name}
      </button>
      <p className="text-sm text-slate-400 text-center font-medium leading-relaxed px-1 group-hover:text-slate-300 transition-colors">
        {desc}
      </p>
    </div>
  );
}