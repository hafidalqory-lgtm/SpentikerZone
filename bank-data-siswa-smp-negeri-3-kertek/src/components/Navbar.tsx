import React from 'react';
import { ShieldCheck, MessageSquarePlus, Home, UserCheck, Lock } from 'lucide-react';
import { AppConfig } from '../types';

interface NavbarProps {
  config: AppConfig;
  currentView: string;
  isAdminLoggedIn: boolean;
  onNavigate: (view: string) => void;
  onOpenAdminLogin: () => void;
  onOpenSpentiker: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  currentView,
  isAdminLoggedIn,
  onNavigate,
  onOpenAdminLogin,
  onOpenSpentiker,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & School Title */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 p-1.5 shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <img
                src={config.logoUrl}
                alt="Logo Sekolah"
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors uppercase">
                  BANK DATA SISWA
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-800 rounded-full border border-sky-200">
                  DAPODIK
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-sky-700 tracking-wide">
                {config.namaSekolah}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Home */}
            <button
              onClick={() => onNavigate('home')}
              className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                currentView === 'home'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4 text-sky-600" />
              <span>Beranda</span>
            </button>

            {/* Lapor Spentiker Button */}
            <button
              onClick={onOpenSpentiker}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-amber-900 bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-300 hover:from-amber-300 hover:to-yellow-400 border border-amber-400/80 rounded-xl shadow-xs transition-all hover:shadow-md cursor-pointer active:scale-95"
            >
              <MessageSquarePlus className="w-4 h-4 text-amber-900 shrink-0" />
              <span>Lapor Spentiker</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-700"></span>
              </span>
            </button>

            {/* Admin Button */}
            {isAdminLoggedIn ? (
              <button
                onClick={() => onNavigate('admin')}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 rounded-xl shadow-md shadow-sky-700/25 transition-all cursor-pointer active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-sky-200" />
                <span className="hidden sm:inline">Panel Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer active:scale-95"
                title="Masuk sebagai Administrator"
              >
                <Lock className="w-4 h-4 text-slate-600" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
