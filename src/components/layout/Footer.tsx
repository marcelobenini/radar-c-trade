/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="main-footer" className="bg-white border-t border-slate-100 py-4 px-6 text-center text-xs text-slate-400 font-sans mt-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-2">
        <div>
          <span className="font-semibold text-slate-600">Radar Comercial</span>
          <span className="mx-1.5">•</span>
          <span>C-Trade Inteligência de Mercado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            Versão MVP
          </span>
          <span>© {currentYear}</span>
        </div>
      </div>
    </footer>
  );
}
