import React, { useEffect, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { ProofEntry } from '../../types';
import { deleteProofEntryFromIDB, getProofEntriesFromIDB } from '../../utils/indexedDB';

export const ProofFeed: React.FC = () => {
  const [entries, setEntries] = useState<ProofEntry[]>([]);
  const [selected, setSelected] = useState<ProofEntry | null>(null);

  const refresh = async () => {
    const loaded = await getProofEntriesFromIDB();
    setEntries(loaded.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  };

  useEffect(() => {
    refresh();
  }, []);

  const remove = async (entry: ProofEntry) => {
    if (!window.confirm(`Delete proof for ${entry.taskName}?`)) return;
    await deleteProofEntryFromIDB(entry.id);
    setSelected(null);
    await refresh();
  };

  return (
    <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-5 space-y-4">
      <div>
        <p className="text-[11px] text-[#00eefc] font-bold uppercase tracking-widest">Private proof feed</p>
        <h3 className="text-xl font-black font-display text-white">Proof Feed</h3>
      </div>

      <div className="space-y-2">
        {entries.length === 0 ? (
          <p className="text-xs text-[#8e9379]">Completed task proof appears here. It stays on this device.</p>
        ) : entries.map((entry) => (
          <button key={entry.id} onClick={() => setSelected(entry)} className="w-full bg-[#010f1f] border border-[#273647] rounded-xl p-3 text-left flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#122131] border border-[#273647] flex items-center justify-center text-[#c3f400] shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{entry.taskName}</p>
              <p className="text-[11px] text-[#94A3B8]">{new Date(entry.createdAt).toLocaleString()} • {entry.proofType.replace('_', ' ')}</p>
            </div>
            <span className={`text-[10px] font-bold ${entry.completedWithoutProof ? 'text-[#ffb4ab]' : 'text-[#c3f400]'}`}>
              {entry.completedWithoutProof ? 'NO PROOF' : 'SAVED'}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[110] bg-[#050810]/90 backdrop-blur-md flex items-start justify-center p-4 pt-safe overflow-y-auto">
          <div className="w-full max-w-md bg-[#122131] border border-[#273647] rounded-2xl p-5 my-3 space-y-4">
            <div>
              <p className="text-[11px] text-[#00eefc] font-bold uppercase tracking-widest">{selected.taskType}</p>
              <h3 className="text-2xl font-black font-display text-white">{selected.taskName}</h3>
              <p className="text-xs text-[#94A3B8]">{new Date(selected.createdAt).toLocaleString()}</p>
            </div>
            {selected.imageDataUrl && <img src={selected.imageDataUrl} alt={selected.taskName} className="w-full max-h-[70vh] object-contain rounded-xl bg-[#010f1f] border border-[#273647]" />}
            {selected.note && <p className="bg-[#010f1f] border border-[#273647] rounded-xl p-3 text-sm text-[#d4e4fa]">{selected.note}</p>}
            {selected.checklist && <ul className="bg-[#010f1f] border border-[#273647] rounded-xl p-3 list-disc pl-7 text-sm text-[#d4e4fa]">{selected.checklist.map((item) => <li key={item}>{item}</li>)}</ul>}
            {selected.location && <p className="text-xs text-[#94A3B8]">Location saved with {Math.round(selected.location.accuracy)}m accuracy.</p>}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => remove(selected)} className="py-3 rounded-xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-bold flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>
              <button onClick={() => setSelected(null)} className="neon-btn py-3 rounded-xl text-xs font-bold">Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
