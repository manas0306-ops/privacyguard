import React from 'react';
import mandalaWatermark from '../assets/mandala-watermark.png';
import { usePrivacy } from '../context/PrivacyContext';

export const WatermarkLayer: React.FC = () => {
  const { currentTheme } = usePrivacy();
  const isBurgundy = currentTheme === 'burgundy';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-all duration-700"
    >
      {/* Ambient radial glow in center */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: isBurgundy
            ? 'radial-gradient(circle at 50% 35%, rgba(220, 38, 38, 0.22) 0%, rgba(155, 28, 48, 0.12) 42%, rgba(70, 10, 20, 0.05) 70%, transparent 85%)'
            : 'radial-gradient(circle at 50% 45%, rgba(6, 182, 212, 0.07) 0%, rgba(37, 99, 235, 0.02) 35%, transparent 70%)',
        }}
      />

      {/* Ambient radial accent in top-right */}
      <div
        className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full transition-all duration-700"
        style={{
          background: isBurgundy
            ? 'radial-gradient(circle, rgba(255, 248, 231, 0.08) 0%, rgba(220, 38, 38, 0.05) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(56, 189, 248, 0.04) 0%, transparent 65%)',
        }}
      />

      {/* Main Central Rotating Mandala Watermark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={mandalaWatermark}
          alt=""
          className={`w-[780px] h-[780px] sm:w-[1000px] sm:h-[1000px] max-w-none animate-spin-very-slow transform-gpu transition-opacity duration-700 ${
            isBurgundy
              ? 'opacity-[0.07] drop-shadow-[0_0_35px_rgba(255,248,231,0.35)]'
              : 'opacity-[0.045] drop-shadow-[0_0_25px_rgba(6,182,212,0.2)]'
          }`}
        />
      </div>

      {/* Subtle Secondary Corner Mandala for Depth */}
      <div className="absolute -bottom-48 -left-48 hidden lg:block">
        <img
          src={mandalaWatermark}
          alt=""
          className={`w-[520px] h-[520px] max-w-none animate-spin-reverse-slow transform-gpu transition-opacity duration-700 ${
            isBurgundy ? 'opacity-[0.04]' : 'opacity-[0.03]'
          }`}
        />
      </div>
    </div>
  );
};
