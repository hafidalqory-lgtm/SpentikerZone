import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  logoUrl: string;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ logoUrl, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-sky-600 via-sky-700 to-blue-950 text-white overflow-hidden select-none">
      {/* Background Ornaments */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-300 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-400 blur-3xl animate-pulse" />
        <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl"
      >
        {/* Glow behind Logo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-sky-300/40 blur-xl scale-125 animate-ping opacity-30" />
          <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-white/10 backdrop-blur-md p-3 border border-white/30 shadow-2xl flex items-center justify-center">
            <img
              src={logoUrl}
              alt="Logo SMP Negeri 3 Kertek"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
        </div>

        {/* Text 1 */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-semibold tracking-widest text-sky-200 bg-sky-800/60 border border-sky-400/30 uppercase mb-3 shadow-inner"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          SELAMAT DATANG
        </motion.span>

        {/* Text 2 */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight drop-shadow-sm"
        >
          DI BANK DATA SMP NEGERI 3 KERTEK
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-sm md:text-base text-sky-100/90 font-medium max-w-md mb-8"
        >
          Sistem Pengelolaan, Pemeriksaan, Perbaikan, dan Validasi Terpadu Data Siswa
        </motion.p>

        {/* Progress bar & Skip button */}
        <div className="w-full max-w-xs flex flex-col items-center gap-3">
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-sky-300 via-amber-300 to-white"
            />
          </div>

          <button
            onClick={onFinish}
            className="flex items-center gap-1.5 text-xs text-sky-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full border border-white/20 cursor-pointer shadow-sm"
          >
            <span>Masuk Langsung ({timeLeft}s)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
