import React, { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { calculatePlates } from '../../utils/beginnerFeatures';

const KG_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const LB_PLATES = [45, 35, 25, 10, 5, 2.5];

export const PlateCalculator: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [target, setTarget] = useState(60);
  const [bar, setBar] = useState(20);
  const [available, setAvailable] = useState<number[]>(KG_PLATES);
  const plateOptions = unit === 'kg' ? KG_PLATES : LB_PLATES;
  const result = useMemo(() => calculatePlates(target, bar, available), [target, bar, available]);

  const switchUnit = (nextUnit: 'kg' | 'lbs') => {
    setUnit(nextUnit);
    setBar(nextUnit === 'kg' ? 20 : 45);
    setTarget(nextUnit === 'kg' ? 60 : 135);
    setAvailable(nextUnit === 'kg' ? KG_PLATES : LB_PLATES);
  };

  return (
    <section className={`bg-[#0E1421] border border-[#1E293B] rounded-2xl ${compact ? 'p-3 space-y-3' : 'p-5 space-y-4'}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#00eefc]" /> Plate Calculator
        </h3>
        <div className="flex bg-[#010f1f] border border-[#273647] rounded-lg p-0.5 text-[11px]">
          {(['kg', 'lbs'] as const).map((value) => (
            <button
              key={value}
              onClick={() => switchUnit(value)}
              className={`px-2.5 py-1 rounded-md font-bold uppercase ${unit === value ? 'bg-[#c3f400] text-[#050810]' : 'text-[#8e9379]'}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-[11px] text-[#8e9379] font-bold uppercase">
          Total {unit}
          <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value) || 0)} className="input-dark w-full rounded-xl px-3 py-2 mt-1 text-sm" />
        </label>
        <label className="text-[11px] text-[#8e9379] font-bold uppercase">
          Bar {unit}
          <input type="number" value={bar} onChange={(e) => setBar(Number(e.target.value) || 0)} className="input-dark w-full rounded-xl px-3 py-2 mt-1 text-sm" />
        </label>
      </div>

      <div>
        <p className="text-[11px] text-[#8e9379] font-bold uppercase mb-2">Available plates</p>
        <div className="flex flex-wrap gap-2">
          {plateOptions.map((plate) => {
            const selected = available.includes(plate);
            return (
              <button
                key={plate}
                onClick={() => setAvailable((prev) => selected ? prev.filter((item) => item !== plate) : [...prev, plate])}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold ${selected ? 'bg-[#00eefc] border-[#00eefc] text-[#050810]' : 'bg-[#010f1f] border-[#273647] text-[#94A3B8]'}`}
              >
                {plate}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`rounded-xl border p-3 ${result.possible ? 'bg-[#c3f400]/10 border-[#c3f400]/30' : 'bg-[#ffb4ab]/10 border-[#ffb4ab]/30'}`}>
        <p className={`text-xs font-bold ${result.possible ? 'text-[#c3f400]' : 'text-[#ffb4ab]'}`}>{result.message}</p>
        <p className="text-xl font-black font-display text-white mt-1">
          {result.perSide.length ? result.perSide.join(' + ') : 'No plates'} <span className="text-xs text-[#94A3B8]">per side</span>
        </p>
        <p className="text-[10px] text-[#8e9379] mt-1">Includes the {bar} {unit} bar in the requested total.</p>
      </div>
    </section>
  );
};
