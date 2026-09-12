import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Scissors, Trash2, Upload } from 'lucide-react';
import { HairGrowthPhoto, HairPoseType, UserProfile } from '../../types';
import { ComparisonSlider } from './ComparisonSlider';
import { compressImage, deleteHairPhotoFromIDB, getHairPhotosFromIDB, saveHairPhotoToIDB } from '../../utils/indexedDB';

const poses: { value: HairPoseType; label: string }[] = [
  { value: 'front', label: 'Front' },
  { value: 'left', label: 'Left Side' },
  { value: 'right', label: 'Right Side' },
  { value: 'back', label: 'Back' },
];

export const HairGrowthTracker: React.FC<{
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}> = ({ profile, onUpdateProfile }) => {
  const [photos, setPhotos] = useState<HairGrowthPhoto[]>([]);
  const [pose, setPose] = useState<HairPoseType>('front');
  const [length, setLength] = useState('');
  const [notes, setNotes] = useState('');
  const [selected, setSelected] = useState<HairGrowthPhoto | null>(null);

  const refresh = async () => setPhotos(await getHairPhotosFromIDB());
  useEffect(() => { refresh(); }, []);

  const posePhotos = photos.filter((photo) => photo.pose === pose);
  const before = posePhotos[0];
  const after = posePhotos.length > 1 ? posePhotos.at(-1) : undefined;

  const grouped = useMemo(() => photos.reduce<Record<string, HairGrowthPhoto[]>>((acc, photo) => {
    acc[photo.date] = [...(acc[photo.date] || []), photo];
    return acc;
  }, {}), [photos]);

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const imageDataUrl = await compressImage(file, 1600, 0.9);
    await saveHairPhotoToIDB({
      id: `hair_${pose}_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      pose,
      imageDataUrl,
      hairLengthCm: length ? Number(length) : undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
    setLength('');
    setNotes('');
    await refresh();
  };

  const remove = async (photo: HairGrowthPhoto) => {
    if (!window.confirm('Delete this hair-growth photo?')) return;
    await deleteHairPhotoFromIDB(photo.id);
    setSelected(null);
    await refresh();
  };

  return (
    <div className="space-y-6">
      <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-[11px] text-[#00eefc] font-bold uppercase tracking-widest">Hair Growth</p>
          <h3 className="text-2xl font-black font-display text-white">Hair Tracker</h3>
          <p className="text-xs text-[#94A3B8]">Separate from fitness progress, weight, and streaks.</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {poses.map((item) => <button key={item.value} onClick={() => setPose(item.value)} className={`py-2 rounded-xl border text-[11px] font-bold ${pose === item.value ? 'bg-[#c3f400] border-[#c3f400] text-[#050810]' : 'bg-[#010f1f] border-[#273647] text-[#94A3B8]'}`}>{item.label}</button>)}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-[11px] text-[#8e9379] font-bold uppercase">Length cm<input type="number" step="0.1" value={length} onChange={(e) => setLength(e.target.value)} className="input-dark w-full rounded-xl px-3 py-2 mt-1 text-sm" /></label>
          <label className="text-[11px] text-[#8e9379] font-bold uppercase">Reminder<select value={profile.hairReminderFrequency} onChange={(e) => onUpdateProfile({ ...profile, hairReminderFrequency: e.target.value as UserProfile['hairReminderFrequency'] })} className="input-dark w-full rounded-xl px-3 py-2 mt-1 text-sm"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input-dark w-full rounded-xl p-3 text-sm resize-none" placeholder="Haircut, styling, product, or care notes" />
        <label className="neon-btn w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
          <Upload className="w-4 h-4" /> Take or Upload Hair Photo
          <input type="file" accept="image/*" capture="environment" onChange={upload} className="hidden" />
        </label>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-bold text-[#8e9379] uppercase tracking-widest flex items-center gap-1.5">
          <Scissors className="w-4 h-4 text-[#c3f400]" /> Hair Comparison
        </h3>
        {before && after ? <ComparisonSlider beforeImage={before.imageDataUrl} afterImage={after.imageDataUrl} beforeLabel={before.date} afterLabel={after.date} /> : <div className="h-56 rounded-2xl bg-[#010f1f] border border-dashed border-[#273647] flex flex-col items-center justify-center text-center p-6"><Camera className="w-8 h-8 text-[#273647] mb-2" /><p className="text-sm font-bold text-white">Add two matching hair angles</p><p className="text-xs text-[#8e9379] mt-1">The before-and-after slider will appear here.</p></div>}
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-bold text-[#8e9379] uppercase tracking-widest">Chronological Photos</h3>
        {Object.entries(grouped).length === 0 ? <p className="text-xs text-[#8e9379]">Hair-growth photos appear here after saving.</p> : (Object.entries(grouped) as [string, HairGrowthPhoto[]][]).sort((a, b) => b[0].localeCompare(a[0])).map(([date, items]) => (
          <div key={date} className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-3">
            <p className="text-xs font-bold text-[#00eefc] mb-2">{date}</p>
            <div className="grid grid-cols-4 gap-2">
              {items.map((photo) => <button key={photo.id} onClick={() => setSelected(photo)} className="aspect-[3/4] rounded-xl overflow-hidden bg-[#010f1f] border border-[#273647]"><img src={photo.imageDataUrl} alt={photo.pose} className="w-full h-full object-contain" /></button>)}
            </div>
          </div>
        ))}
      </section>

      {selected && (
        <div className="fixed inset-0 z-[110] bg-[#050810]/95 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-3">
            <img src={selected.imageDataUrl} alt={selected.pose} className="w-full max-h-[75vh] object-contain rounded-2xl bg-[#010f1f]" />
            <p className="text-sm text-[#d4e4fa]">{selected.date} • {selected.pose}{selected.hairLengthCm ? ` • ${selected.hairLengthCm} cm` : ''}</p>
            {selected.notes && <p className="text-xs text-[#94A3B8]">{selected.notes}</p>}
            <div className="grid grid-cols-2 gap-2"><button onClick={() => remove(selected)} className="py-3 rounded-xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-bold flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button><button onClick={() => setSelected(null)} className="neon-btn py-3 rounded-xl text-xs font-bold">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
