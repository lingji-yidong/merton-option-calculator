import { Activity, Calendar, Percent, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { dictionary, Language } from "../i18n/dictionary";
import { calculateMerton, MertonInputs, MertonResults } from "../utils/merton";

interface CalculatorProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

export function Calculator({ lang, setLang }: CalculatorProps) {
  const t = dictionary[lang];

  const [assetType, setAssetType] = useState<'stock' | 'index'>('stock');

  const [inputs, setInputs] = useState<MertonInputs>({
    S: 100,
    K: 105,
    T_days: 30,
    r_percent: 3.5,
    v_percent: 25,
    q_percent: 0,
  });

  const [results, setResults] = useState<MertonResults | null>(null);

  useEffect(() => {
    setResults(calculateMerton(inputs));
  }, [inputs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const fmt = (num: number | undefined) => {
    if (num === undefined || isNaN(num)) return "--";
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  };

  return (
    <div className="glass-panel w-full sm:w-[92%] md:w-[90%] max-w-[1000px] sm:rounded-[32px] flex flex-col md:grid md:grid-cols-[350px_1fr] overflow-hidden transition-all duration-300">
      {/* Sidebar (Inputs) */}
      <div className="p-6 md:p-10 bg-white/40 border-b md:border-b-0 md:border-r border-white/60 flex flex-col gap-5 relative z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="text-2xl font-extrabold logo-text tracking-tight">
            Merton.Calc
          </div>
          <div className="flex bg-white/60 rounded-full p-[3px] border border-white/80">
            {(["en", "zh", "de"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`border-none text-xs font-semibold px-2.5 py-1 cursor-pointer rounded-full transition-all duration-200 ${
                  lang === l
                    ? "bg-white text-cyan-600 shadow-sm"
                    : "bg-transparent text-slate-600"
                }`}
              >
                {l === "en" ? "EN" : l === "zh" ? "中" : "DE"}
              </button>
            ))}
          </div>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 ml-1">
              Asset Type
            </label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as any)}
              className="input-field rounded-2xl font-mono text-slate-900 px-3 py-3"
            >
              <option value="stock">Stock</option>
              <option value="index">Index (SPX)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 ml-1">
              {t.spot}
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                name="S"
                value={inputs.S}
                onChange={handleInputChange}
                step="0.01"
                className="input-field w-full rounded-2xl font-mono text-slate-900"
              />
              <Activity className="input-icon absolute left-3.5 w-[18px] h-[18px] text-slate-400 pointer-events-none transition-colors duration-300" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 ml-1">
              {t.strike}
            </label>
            <div className="relative flex items-center">
              <TrendingUp className="input-icon absolute left-3.5 w-[18px] h-[18px] text-slate-400 pointer-events-none transition-colors duration-300" />
              <input
                type="number"
                name="K"
                value={inputs.K}
                onChange={handleInputChange}
                step="0.01"
                className="input-field w-full rounded-2xl font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 ml-1">
              {t.time}
            </label>
            <div className="relative flex items-center">
              <Calendar className="input-icon absolute left-3.5 w-[18px] h-[18px] text-slate-400 pointer-events-none transition-colors duration-300" />
              <input
                type="number"
                name="T_days"
                value={inputs.T_days}
                onChange={handleInputChange}
                step="1"
                className="input-field w-full rounded-2xl font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 ml-1">
              {t.vol}
            </label>
            <div className="relative flex items-center">
              <Percent className="input-icon absolute left-3.5 w-[18px] h-[18px] text-slate-400 pointer-events-none transition-colors duration-300" />
              <input
                type="number"
                name="v_percent"
                value={inputs.v_percent}
                onChange={handleInputChange}
                step="0.1"
                className="input-field w-full rounded-2xl font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 ml-1">
                {t.rate}
              </label>
              <input
                type="number"
                name="r_percent"
                value={inputs.r_percent}
                onChange={handleInputChange}
                step="0.01"
                className="input-field w-full rounded-2xl font-mono text-slate-900 px-3 py-3"
              />
            </div>
            <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 ml-1">
              {assetType === 'index' ? 'Index Yield / Carry (%)' : t.yield}
            </label>
              <input
                type="number"
                name="q_percent"
                value={inputs.q_percent}
                onChange={handleInputChange}
                step="0.01"
                className="input-field w-full rounded-2xl font-mono text-slate-900 px-3 py-3"
              />
            </div>
          </div>

          {assetType === 'index' && (
            <div className="text-xs text-slate-500 mt-1">
              For indices like SPX, use implied dividend yield or carry.
            </div>
          )}

          {assetType === 'index' && (
            <div className="text-xs text-slate-400">
              Assumes European-style options (SPX standard)
            </div>
          )}

          <button
            type="button"
            className="btn-calc mt-2 p-4 text-white border-none rounded-2xl font-sans font-semibold text-base cursor-pointer"
          >
            {t.btn_calc}
          </button>
        </form>
      </div>

      {/* Content (Results) */}
      <div className="p-6 md:p-10 flex flex-col gap-8 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="glass-card call-theme rounded-3xl p-6 flex flex-col relative">
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1 text-emerald-600">
              <TrendingUp size={16} strokeWidth={3} />
              <span>{t.res_call}</span>
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-emerald-600">
              {fmt(results?.call)}
            </div>
          </div>
          <div className="glass-card put-theme rounded-3xl p-6 flex flex-col relative">
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1 text-rose-600">
              <TrendingUp
                size={16}
                strokeWidth={3}
                className="transform rotate-180"
              />
              <span>{t.res_put}</span>
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-rose-600">
              {fmt(results?.put)}
            </div>
          </div>
        </div>

        <div className="greeks-table-container rounded-3xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[400px]">
            <thead>
              <tr>
                <th className="text-xs uppercase tracking-wider text-slate-500 py-4 px-6 font-semibold">
                  {t.header_metric}
                </th>
                <th className="text-xs uppercase tracking-wider text-slate-500 py-4 px-6 text-right font-semibold">
                  {t.header_call}
                </th>
                <th className="text-xs uppercase tracking-wider text-slate-500 py-4 px-6 text-right font-semibold">
                  {t.header_put}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-6">
                  <span className="block font-sans font-semibold text-slate-900">
                    Delta
                  </span>
                  <span className="block text-[0.7rem] text-slate-500 mt-0.5">
                    {t.desc_delta}
                  </span>
                </td>
                <td className="py-3 px-6 text-right font-mono text-sm text-emerald-600">
                  {fmt(results?.callDelta)}
                </td>
                <td className="py-3 px-6 text-right font-mono text-sm text-rose-600">
                  {fmt(results?.putDelta)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6">
                  <span className="block font-sans font-semibold text-slate-900">
                    Gamma
                  </span>
                  <span className="block text-[0.7rem] text-slate-500 mt-0.5">
                    {t.desc_gamma}
                  </span>
                </td>
                <td
                  colSpan={2}
                  className="py-3 px-6 text-center font-mono text-sm text-slate-500 opacity-80"
                >
                  {fmt(results?.gamma)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6">
                  <span className="block font-sans font-semibold text-slate-900">
                    Theta
                  </span>
                  <span className="block text-[0.7rem] text-slate-500 mt-0.5">
                    {t.desc_theta}
                  </span>
                </td>
                <td className="py-3 px-6 text-right font-mono text-sm text-emerald-600">
                  {fmt(results?.callTheta)}
                </td>
                <td className="py-3 px-6 text-right font-mono text-sm text-rose-600">
                  {fmt(results?.putTheta)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6">
                  <span className="block font-sans font-semibold text-slate-900">
                    Vega
                  </span>
                  <span className="block text-[0.7rem] text-slate-500 mt-0.5">
                    {t.desc_vega}
                  </span>
                </td>
                <td
                  colSpan={2}
                  className="py-3 px-6 text-center font-mono text-sm text-slate-500 opacity-80"
                >
                  {fmt(results?.vega)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6">
                  <span className="block font-sans font-semibold text-slate-900">
                    Rho
                  </span>
                  <span className="block text-[0.7rem] text-slate-500 mt-0.5">
                    {t.desc_rho}
                  </span>
                </td>
                <td className="py-3 px-6 text-right font-mono text-sm text-emerald-600">
                  {fmt(results?.callRho)}
                </td>
                <td className="py-3 px-6 text-right font-mono text-sm text-rose-600">
                  {fmt(results?.putRho)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* NFA Disclaimer integrated into the content area */}
        <div className="mt-auto pt-4 border-t border-white/30 text-center">
          <p className="text-[10px] text-slate-500/80 font-medium tracking-wide">
            {t.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
