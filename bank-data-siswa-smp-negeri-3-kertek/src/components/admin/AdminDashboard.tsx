import React from 'react';
import {
  Users,
  Layers,
  CheckCircle,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  MessageSquarePlus,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  CheckSquare
} from 'lucide-react';
import { Student, KelasItem, SpentikerReport } from '../../types';

interface AdminDashboardProps {
  students: Student[];
  classes: KelasItem[];
  reports: SpentikerReport[];
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  classes,
  reports,
  onNavigateTab,
}) => {
  // Live calculations
  const totalStudents = students.length;
  const totalClasses = classes.length;

  const countBelum = students.filter((s) => s.statusPengecekan === 'Belum Diperiksa').length;
  const countSudahSiswa = students.filter((s) => s.statusPengecekan === 'Sudah Diperiksa Siswa').length;
  const countMenunggu = students.filter((s) => s.statusPengecekan === 'Menunggu Verifikasi Admin').length;
  const countTerverifikasi = students.filter((s) => s.statusPengecekan === 'Terverifikasi Admin').length;
  const countPerluPerbaikan = students.filter((s) => s.statusPengecekan === 'Perlu Perbaikan').length;

  // Percentage of inspected students (Sudah Siswa + Menunggu + Terverifikasi)
  const inspectedTotal = countSudahSiswa + countMenunggu + countTerverifikasi;
  const percentageInspected = totalStudents > 0 ? Math.round((inspectedTotal / totalStudents) * 100) : 0;
  const percentageVerified = totalStudents > 0 ? Math.round((countTerverifikasi / totalStudents) * 100) : 0;

  // Reports
  const pendingReports = reports.filter((r) => r.status === 'Masuk' || r.status === 'Diproses').length;

  const cards = [
    {
      title: 'Total Siswa',
      value: totalStudents,
      subtitle: `${totalClasses} rombongan belajar aktif`,
      icon: Users,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      iconBg: 'bg-sky-600 text-white',
      tab: 'murid',
    },
    {
      title: 'Total Kelas',
      value: totalClasses,
      subtitle: 'Kelas VII, VIII, IX',
      icon: Layers,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-600 text-white',
      tab: 'kelas',
    },
    {
      title: 'Sudah Memeriksa Data',
      value: countSudahSiswa + countTerverifikasi,
      subtitle: `${percentageInspected}% dari seluruh siswa`,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
      tab: 'sudah-diperiksa',
    },
    {
      title: 'Belum Memeriksa Data',
      value: countBelum,
      subtitle: 'Perlu diingatkan wali kelas',
      icon: Clock,
      color: 'bg-slate-50 text-slate-700 border-slate-200',
      iconBg: 'bg-slate-600 text-white',
      tab: 'belum-diperiksa',
    },
    {
      title: 'Pengajuan Perbaikan',
      value: countMenunggu,
      subtitle: 'Menunggu verifikasi admin',
      icon: CheckSquare,
      color: 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-400/30',
      iconBg: 'bg-amber-600 text-white',
      tab: 'pengecekan',
    },
    {
      title: 'Terverifikasi Admin',
      value: countTerverifikasi,
      subtitle: `${percentageVerified}% data tervalidasi sah`,
      icon: ShieldCheck,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      iconBg: 'bg-teal-600 text-white',
      tab: 'sudah-diperiksa',
    },
    {
      title: 'Perlu Perbaikan',
      value: countPerluPerbaikan,
      subtitle: 'Catatan dikembalikan ke siswa',
      icon: ShieldAlert,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'bg-rose-600 text-white',
      tab: 'pengecekan',
    },
    {
      title: 'Lapor Spentiker',
      value: reports.length,
      subtitle: `${pendingReports} aduan belum selesai`,
      icon: MessageSquarePlus,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-600 text-white',
      tab: 'lapor-spentiker',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-blue-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-900 mb-2">
            PUSAT KENDALI OPERATOR
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Dashboard Bank Data Siswa
          </h1>
          <p className="mt-1 text-sm text-sky-100 max-w-xl">
            Pantau progres validasi data Dapodik seluruh siswa SMP Negeri 3 Kertek secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('pengecekan')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-md cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Verifikasi Perubahan ({countMenunggu})</span>
          </button>
          <button
            onClick={() => onNavigateTab('download-excel')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              onClick={() => onNavigateTab(c.tab)}
              className={`p-5 rounded-2xl border ${c.color} shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">{c.title}</span>
                <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black tracking-tight">{c.value}</div>
                <div className="text-xs opacity-80 mt-1 font-medium">{c.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress & Quick Links Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-sky-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Progres Pemeriksaan & Validasi Data Siswa
              </h3>
              <p className="text-xs text-slate-500">
                Ketercapaian siswa dalam memeriksa data diri dan data orang tua
              </p>
            </div>
            <span className="text-2xl font-black text-sky-700">{percentageInspected}%</span>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${totalStudents ? (countTerverifikasi / totalStudents) * 100 : 0}%` }}
              className="bg-teal-500 h-full"
              title={`Terverifikasi: ${countTerverifikasi}`}
            />
            <div
              style={{ width: `${totalStudents ? (countSudahSiswa / totalStudents) * 100 : 0}%` }}
              className="bg-emerald-400 h-full"
              title={`Sudah Diperiksa Siswa: ${countSudahSiswa}`}
            />
            <div
              style={{ width: `${totalStudents ? (countMenunggu / totalStudents) * 100 : 0}%` }}
              className="bg-amber-400 h-full"
              title={`Menunggu Verifikasi: ${countMenunggu}`}
            />
            <div
              style={{ width: `${totalStudents ? (countPerluPerbaikan / totalStudents) * 100 : 0}%` }}
              className="bg-rose-400 h-full"
              title={`Perlu Perbaikan: ${countPerluPerbaikan}`}
            />
          </div>

          {/* Progress Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-500 shrink-0" />
              <span className="text-slate-600">Terverifikasi: <strong>{countTerverifikasi}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-slate-600">Sudah Siswa: <strong>{countSudahSiswa}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
              <span className="text-slate-600">Menunggu: <strong>{countMenunggu}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400 shrink-0" />
              <span className="text-slate-600">Perlu Perbaikan: <strong>{countPerluPerbaikan}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl border border-sky-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Aksi Cepat Operator</h3>
            <p className="text-xs text-slate-600 mb-4">
              Pintasan fitur pengelolaan database sekolah
            </p>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('murid')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-xs"
              >
                <span>Impor Data Siswa dari Excel</span>
                <ArrowRight className="w-4 h-4 text-sky-600" />
              </button>
              <button
                onClick={() => onNavigateTab('kelas')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-xs"
              >
                <span>Kelola / Tambah Data Kelas</span>
                <ArrowRight className="w-4 h-4 text-sky-600" />
              </button>
              <button
                onClick={() => onNavigateTab('lapor-spentiker')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-xs"
              >
                <span>Lihat Rekap Aduan & Diagram</span>
                <ArrowRight className="w-4 h-4 text-sky-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
