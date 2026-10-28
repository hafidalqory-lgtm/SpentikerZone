import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Users,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  MessageSquarePlus,
  FileCheck,
  Check,
  Info
} from 'lucide-react';
import { Student, KelasItem, SpentikerReport } from '../../types';
import {
  exportStudentsToExcel,
  exportClassesToExcel,
  exportReportsToExcel,
} from '../../utils/excel';

interface AdminDownloadExcelProps {
  students: Student[];
  classes: KelasItem[];
  reports: SpentikerReport[];
}

export const AdminDownloadExcel: React.FC<AdminDownloadExcelProps> = ({
  students,
  classes,
  reports,
}) => {
  const [selectedClass, setSelectedClass] = useState(classes[0]?.nama || 'VII A');
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);

  // Counts
  const totalStudents = students.length;
  const countBelum = students.filter((s) => s.statusPengecekan === 'Belum Diperiksa').length;
  const countSudah = students.filter(
    (s) =>
      s.statusPengecekan === 'Sudah Diperiksa Siswa' ||
      s.statusPengecekan === 'Terverifikasi Admin'
  ).length;
  const countMenunggu = students.filter(
    (s) => s.statusPengecekan === 'Menunggu Verifikasi Admin'
  ).length;
  const countPerluPerbaikan = students.filter(
    (s) => s.statusPengecekan === 'Perlu Perbaikan'
  ).length;

  const handleDownload = (fn: () => void, name: string) => {
    fn();
    setLastDownloaded(name);
    setTimeout(() => setLastDownloaded(null), 4000);
  };

  const downloadCards = [
    {
      id: 'all',
      title: 'Seluruh Data Siswa SMPN 3 Kertek',
      desc: 'Mencakup seluruh kolom identitas, data ayah, data ibu, status PIP, status verifikasi, dan catatan admin.',
      count: `${totalStudents} Siswa`,
      fileName: 'Semua_Data_Siswa_SMPN_3_Kertek.xlsx',
      icon: Users,
      badge: 'LENGKAP 32 KOLOM',
      color: 'border-sky-300 bg-gradient-to-br from-white to-sky-50/60',
      btnColor: 'bg-sky-600 hover:bg-sky-700 text-white',
      onDownload: () =>
        exportStudentsToExcel(
          students,
          'Semua_Data_Siswa_SMPN_3_Kertek.xlsx',
          'Seluruh Siswa'
        ),
    },
    {
      id: 'belum',
      title: 'Siswa Belum Diperiksa',
      desc: 'Daftar nama dan kontak siswa yang belum melakukan pengecekan data mandiri.',
      count: `${countBelum} Siswa`,
      fileName: 'Data_Belum_Diperiksa.xlsx',
      icon: Clock,
      badge: 'PRIORITAS WALI KELAS',
      color: 'border-slate-300 bg-gradient-to-br from-white to-slate-50/60',
      btnColor: 'bg-slate-700 hover:bg-slate-800 text-white',
      onDownload: () =>
        exportStudentsToExcel(
          students.filter((s) => s.statusPengecekan === 'Belum Diperiksa'),
          'Data_Belum_Diperiksa.xlsx',
          'Belum Diperiksa'
        ),
    },
    {
      id: 'menunggu',
      title: 'Siswa Menunggu Verifikasi',
      desc: 'Daftar siswa yang telah mengajukan perubahan data dan menunggu persetujuan operator sekolah.',
      count: `${countMenunggu} Siswa`,
      fileName: 'Data_Menunggu_Verifikasi.xlsx',
      icon: AlertTriangle,
      badge: 'PERLU TINJAUAN',
      color: 'border-amber-300 bg-gradient-to-br from-white to-amber-50/60',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
      onDownload: () =>
        exportStudentsToExcel(
          students.filter((s) => s.statusPengecekan === 'Menunggu Verifikasi Admin'),
          'Data_Menunggu_Verifikasi.xlsx',
          'Menunggu Verifikasi'
        ),
    },
    {
      id: 'sudah',
      title: 'Siswa Sudah Diperiksa / Terverifikasi',
      desc: 'Daftar siswa yang datanya telah divalidasi oleh siswa maupun diverifikasi sah oleh admin.',
      count: `${countSudah} Siswa`,
      fileName: 'Data_Sudah_Diperiksa.xlsx',
      icon: CheckCircle2,
      badge: 'DATA TERVALIDASI',
      color: 'border-emerald-300 bg-gradient-to-br from-white to-emerald-50/60',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      onDownload: () =>
        exportStudentsToExcel(
          students.filter(
            (s) =>
              s.statusPengecekan === 'Sudah Diperiksa Siswa' ||
              s.statusPengecekan === 'Terverifikasi Admin'
          ),
          'Data_Sudah_Diperiksa.xlsx',
          'Sudah Diperiksa'
        ),
    },
    {
      id: 'perlu-perbaikan',
      title: 'Siswa Perlu Perbaikan',
      desc: 'Daftar siswa yang perbaikan datanya dikembalikan admin disertai catatan koreksi.',
      count: `${countPerluPerbaikan} Siswa`,
      fileName: 'Data_Perlu_Perbaikan.xlsx',
      icon: ShieldAlert,
      badge: 'CATATAN KOREKSI',
      color: 'border-rose-300 bg-gradient-to-br from-white to-rose-50/60',
      btnColor: 'bg-rose-600 hover:bg-rose-700 text-white',
      onDownload: () =>
        exportStudentsToExcel(
          students.filter((s) => s.statusPengecekan === 'Perlu Perbaikan'),
          'Data_Perlu_Perbaikan.xlsx',
          'Perlu Perbaikan'
        ),
    },
    {
      id: 'kelas',
      title: 'Data Seluruh Kelas',
      desc: 'Daftar rombongan belajar, nama kelas, wali kelas, dan tahun ajaran aktif di SMPN 3 Kertek.',
      count: `${classes.length} Rombel`,
      fileName: 'Data_Kelas_SMPN_3_Kertek.xlsx',
      icon: Layers,
      badge: 'MASTER DATA',
      color: 'border-blue-300 bg-gradient-to-br from-white to-blue-50/60',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      onDownload: () => exportClassesToExcel(classes, 'Data_Kelas_SMPN_3_Kertek.xlsx'),
    },
    {
      id: 'spentiker',
      title: 'Rekapitulasi Lapor Spentiker',
      desc: 'Daftar lengkap aspirasi, aduan PIP, fasilitas sarpras, layanan sekolah, dan tanggapan admin.',
      count: `${reports.length} Laporan`,
      fileName: 'Rekap_Lapor_Spentiker.xlsx',
      icon: MessageSquarePlus,
      badge: 'ASPIRASI & ADUAN',
      color: 'border-indigo-300 bg-gradient-to-br from-white to-indigo-50/60',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      onDownload: () => exportReportsToExcel(reports, 'Rekap_Lapor_Spentiker.xlsx'),
    },
  ];

  // Specific class download
  const handleDownloadByClass = () => {
    const classStudents = students.filter(
      (s) => s.kelas.trim().toUpperCase() === selectedClass.trim().toUpperCase()
    );
    const sanitized = selectedClass.replace(/\s+/g, '_');
    const fileName = `Data_Siswa_Kelas_${sanitized}.xlsx`;
    handleDownload(
      () => exportStudentsToExcel(classStudents, fileName, `Kelas ${selectedClass}`),
      fileName
    );
  };

  const selectedClassCount = students.filter(
    (s) => s.kelas.trim().toUpperCase() === selectedClass.trim().toUpperCase()
  ).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Alert */}
      {lastDownloaded && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 flex items-center justify-between animate-scaleUp">
          <div className="flex items-center gap-2.5">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">
              File <strong>{lastDownloaded}</strong> berhasil diunduh ke perangkat Anda!
            </span>
          </div>
          <button
            onClick={() => setLastDownloaded(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-blue-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-900 mb-2">
            PUSAT EKSPOR EXCEL RESMI
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Download Rekap & Database Excel
          </h1>
          <p className="mt-1 text-sm text-sky-100 max-w-xl">
            Unduh file spreadsheet resmi Microsoft Excel (.xlsx) dengan proteksi tipe data teks agar angka nol pada NIK, NISN, NIPD, RT, dan RW tidak hilang.
          </p>
        </div>

        {/* Format security badge */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs shrink-0 max-w-xs">
          <div className="flex items-center gap-2 font-bold text-amber-300 mb-1">
            <FileCheck className="w-4 h-4" />
            <span>Format Selalu Terjaga</span>
          </div>
          <p className="text-sky-100/90 text-[11px] leading-relaxed">
            Format NIK (16 digit) dan NISN (10 digit) otomatis diformat sebagai String. Dijamin tidak berubah menjadi angka saintifik (contoh: 3.307E+15).
          </p>
        </div>
      </div>

      {/* SPECIAL CARD: DOWNLOAD PER KELAS */}
      <div className="bg-white rounded-3xl border-2 border-sky-300 p-6 shadow-md bg-gradient-to-r from-white via-sky-50/50 to-blue-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-300">
            EKSPOR PER KELAS TERTENTU
          </span>
          <h3 className="text-lg font-bold text-slate-900">
            Download Data Siswa Khusus Rombel Tertentu
          </h3>
          <p className="text-xs text-slate-600 max-w-lg">
            Pilih kelas yang diinginkan untuk mengunduh rekapitulasi data siswa kelas tersebut. Cocok untuk dibagikan kepada masing-masing wali kelas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700">Pilih Kelas:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 shadow-xs"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.nama}>
                  Kelas {cls.nama}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownloadByClass}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Kelas {selectedClass} ({selectedClassCount})</span>
          </button>
        </div>
      </div>

      {/* GRID OF PRESET DOWNLOAD OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {downloadCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`p-6 rounded-3xl border ${card.color} shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-white/80 border border-slate-200 text-slate-700">
                    {card.badge}
                  </span>
                  <div className="p-2.5 bg-white rounded-2xl shadow-xs border border-slate-100 text-slate-700">
                    <Icon className="w-5 h-5 text-sky-600" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Jumlah Data:</span>
                  <span className="font-extrabold text-slate-900 font-mono">{card.count}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono truncate">
                  <span className="truncate">{card.fileName}</span>
                </div>

                <button
                  onClick={() => handleDownload(card.onDownload, card.fileName)}
                  className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer ${card.btnColor}`}
                >
                  <Download className="w-4 h-4" />
                  <span>Download .xlsx</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
