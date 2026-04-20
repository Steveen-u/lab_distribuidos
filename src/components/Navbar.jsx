import { Link } from 'react-router-dom';
import { algorithmsData } from '../data/algorithmsData';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo / Inicio */}
        <Link to="/" className="font-exo font-bold text-xl text-white hover:text-emerald-400 transition-colors">
          DS <span className="text-emerald-500 text-sm font-medium">Lab</span>
        </Link>

        {/* Opciones de Navegación */}
        <div className="flex gap-8">
          <Link to="/" className="text-slate-300 hover:text-white font-medium transition-colors">
            Inicio
          </Link>

          {/* Mapeo de categorías para los Dropdowns */}
          {algorithmsData.map((category) => (
            <div key={category.category} className="group relative">
              <button className="text-slate-300 group-hover:text-white font-medium flex items-center gap-1 transition-colors">
                {category.category}
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Menú Desplegable */}
              <div className="absolute left-0 top-full mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden p-1">
                  {category.algorithms.map((algo) => (
                    <Link
                      key={algo.id}
                      to={`/simulador/${algo.id}`}
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-emerald-400 rounded-lg transition-colors"
                    >
                      {algo.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}