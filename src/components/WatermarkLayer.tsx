import React from 'react';
import mandalaWatermark from '../assets/mandala-watermark.png';

export const WatermarkLayer: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Ambient radial gold warmth in center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(245, 158, 11, 0.04) 0%, rgba(180, 83, 9, 0.015) 35%, transparent 70%)',
        }}
      />

      {/* Ambient radial amber accent in top-right */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.035) 0%, transparent 65%)',
        }}
      />

      {/* Main Central Rotating Mandala Watermark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={mandalaWatermark}
          alt=""
          className="w-[780px] h-[780px] sm:w-[1000px] sm:h-[1000px] max-w-none opacity-[0.06] animate-spin-very-slow transform-gpu drop-shadow-[0_0_25px_rgba(245,158,11,0.25)]"
        />
      </div>

      {/* Subtle Secondary Corner Mandala for Depth */}
      <div className="absolute -bottom-48 -left-48 hidden lg:block">
        <img
          src={mandalaWatermark}
          alt=""
          className="w-[520px] h-[520px] max-w-none opacity-[0.035] animate-spin-reverse-slow transform-gpu"
        />
      </div>
    </div>
  );
};
