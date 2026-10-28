import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Users,
  CheckSquare,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  BarChart3,
  Settings,
  LogOut,
  MessageSquarePlus,
  X,
  School
} from 'lucide-react';
import { AppConfig } from '../../types';

interface AdminSidebarProps {
  currentTab: string;
  config: AppConfig;
  pendingChecksCount: number;
  uninspectedCount: number;
  reportsCount: number;
  isOpenMobile: boolean;
  onSelectTab: (tab: string) => void;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  config,
  pendingChecksCount,
  uninspectedCount,
  reportsCount,
  isOpenMobile,
  onSelectTab,
  onCloseMobile,
  onLogout,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kelas', label: 'Data Kelas', icon: Layers },
    { id: 'murid', label: 'Data Murid', icon: Users },
    {
      id: 'pengecekan',
      label: 'Pengecekan Data',
      icon: CheckSquare,
      badge: pendingChecksCount > 0 ? pendingChecksCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'belum-diperiksa',
      label: 'Data Belum Diperiksa',
      icon: Clock,
      badge: uninspectedCount > 0 ? uninspectedCount : undefined,
      badgeColor: 'bg-slate-500 text-white',
    },
    { id: 'sudah-diperiksa', label: 'Data Sudah Diperiksa', icon: CheckCircle2 },
    {
      id: 'lapor-spentiker',
      label: 'Lapor Spentiker',
      icon: MessageSquarePlus,
      badge: reportsCount > 0 ? reportsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'rekapitulasi', label: 'Rekapitulasi', icon: BarChart3 },
    { id: 'download-excel', label: 'Download Excel', icon: FileSpreadsheet },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 w-64 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600/30 border border-sky-400/40 p-1 flex items-center justify-center shrink-0">
            <img
              src={config.logoUrl}
              alt="Logo"
              className="w-full h-full object-contain filter drop-shadow-xs"
            />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-sky-400">
              OPERATOR ADMIN
            </h2>
            <div className="text-sm font-bold text-white truncate max-w-[140px]">
              {config.namaSekolah}
            </div>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="md:hidden text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-none">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Pengelolaan
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.badgeColor || 'bg-sky-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex shrink-0">{content}</aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-slideRight">{content}</div>
        </div>
      )}
    </>
  );
};
