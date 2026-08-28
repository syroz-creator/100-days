import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeftRight, Sparkles } from 'lucide-react';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Day 1',
  afterLabel = 'Day 60',
}) => {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clamped = Math.max(0, Math.min(rect.width, x));
    const percentage = (clamped / rect.width) * 100;
    setSliderPos(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handleMove(e.clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={() => (isDraggingRef.current = true)}
      onMouseUp={() => (isDraggingRef.current = false)}
      onMouseLeave={() => (isDraggingRef.current = false)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden border border-[#273647] select-none cursor-ew-resize bg-[#010f1f] shadow-2xl"
    >
      {/* Before Image (Base Layer - Left side) */}
      <img
        src={beforeImage}
        alt="Before transformation"
        className="absolute inset-0 w-full h-full object-cover grayscale brightness-90"
      />

      {/* Before Badge */}
      <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-[#050810]/80 border border-[#273647] text-[11px] font-bold text-[#8e9379] uppercase tracking-wider backdrop-blur-sm">
        {beforeLabel}
      </span>

      {/* After Image (Clipped Overlay Layer - Right side) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
        }}
      >
        <img
          src={afterImage}
          alt="After transformation"
          className="absolute inset-0 w-full h-full object-cover brightness-105 contrast-105"
        />
        {/* After Badge */}
        <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-md bg-[#050810]/80 border border-[#c3f400]/40 text-[11px] font-bold text-[#c3f400] uppercase tracking-wider backdrop-blur-sm shadow-[0_0_8px_rgba(195,244,0,0.3)]">
          {afterLabel}
        </span>
      </div>

      {/* Vertical Slider Line & Glowing Handle */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-[#c3f400] z-20 pointer-events-none shadow-[0_0_10px_#c3f400]"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#c3f400] text-[#050810] flex items-center justify-center shadow-[0_0_15px_rgba(195,244,0,0.8)] border border-[#050810]">
          <ArrowLeftRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
