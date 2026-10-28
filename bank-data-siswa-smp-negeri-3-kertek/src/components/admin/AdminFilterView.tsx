import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Search,
  Filter,
  FileSpreadsheet,
  Users,
  Eye
} from 'lucide-react';
import { Student, KelasItem } from '../../types';
import { exportStudentsToExcel } from '../../utils/excel';

interface AdminFilterViewProps {
  mode: 'belum-diperiksa' | 'sudah-diperiksa';
  students: Student[];
  classes: KelasItem[];
}

export const AdminFilterView: React.FC<AdminFilterViewProps> = ({
  mode,
  students,
  classes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSubStatus, setSelectedSubStatus] = useState('ALL');

  // Filter students based on mode
  const modeStudents = students.filter((s) => {
    if (mode === 'belum-diperiksa') {
      return s.statusPengecekan === 'Belum Diperiksa';
    } else {
      return (
        s.statusPengecekan === 'Sudah Diperiksa Siswa' ||
        s.statusPengecekan === 'Terverifikasi Admin' ||
        s.statusPengecekan === 'Menunggu Verifikasi Admin'
      );
    }
  });

  const finalFiltered = modeStudents.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nipd.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchTerm.toLowerCase());

    const matchClass = selectedClass === 'ALL' || s.kelas === selectedClass;
    const matchSubStatus =
      mode === 'belum-diperiksa' ||
      selectedSubStatus === 'ALL' ||
      s.statusPengecekan === selectedSubStatus;

    return matchSearch && matchClass && matchSubStatus;
  });

  const title =
    mode === 'belum-diperiksa' ? 'Data Siswa Belum Diperiksa' : 'Data Siswa Sudah Diperiksa';
  const desc =
    mode === 'belum-diperiksa'
      ? 'Daftar siswa yang belum membuka atau memvalidasi data mandiri Dapodik'
      : 'Daftar siswa yang telah memeriksa atau telah diverifikasi oleh admin';

  const handleExport = () => {
    const fileName =
      mode === 'belum-diperiksa'
        ? 'Data_Siswa_Belum_Diperiksa.xlsx'
        : 'Data_Siswa_Sudah_Diperiksa.xlsx';
    exportStudentsToExcel(finalFiltered, fileName, title);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`p-2 rounded-xl ${
                mode === 'belum-diperiksa'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {mode === 'belum-diperiksa' ? (
                <Clock className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </span>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">{desc}</p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Download Excel ({finalFiltered.length})</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-sky-100 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-80 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Nama, NIPD, NISN..."
            className="w-full text-xs text-slate-900 bg-transparent focus:outline-none font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl"
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.nama}>
                {c.nama}
              </option>
            ))}
          </select>

          {/* Sub-status if sudah-diperiksa */}
          {mode === 'sudah-diperiksa' && (
            <select
              value={selectedSubStatus}
              onChange={(e) => setSelectedSubStatus(e.target.value)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="ALL">Semua Status Pemeriksaan</option>
              <option value="Terverifikasi Admin">Terverifikasi Admin</option>
              <option value="Sudah Diperiksa Siswa">Sudah Diperiksa Siswa</option>
              <option value="Menunggu Verifikasi Admin">Menunggu Verifikasi</option>
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-3">Kelas</th>
                <th className="py-3.5 px-3 font-mono">NIPD</th>
                <th className="py-3.5 px-3 font-mono">NISN</th>
                <th className="py-3.5 px-3 font-mono">NIK</th>
                <th className="py-3.5 px-4">Status Pengecekan</th>
                <th className="py-3.5 px-3">Terakhir Diperbarui</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finalFiltered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada data siswa dalam kategori ini.
                  </td>
                </tr>
              ) : (
                finalFiltered.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-500 font-semibold">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{s.nama}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-xs font-bold">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 text-xs">
                      {s.nipd || '-'}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 text-xs">
                      {s.nisn || '-'}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 text-xs">
                      {s.nik || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          s.statusPengecekan === 'Terverifikasi Admin'
                            ? 'bg-teal-100 text-teal-800'
                            : s.statusPengecekan === 'Menunggu Verifikasi Admin'
                            ? 'bg-amber-100 text-amber-800'
                            : s.statusPengecekan === 'Sudah Diperiksa Siswa'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.statusPengecekan}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[11px] text-slate-500 font-mono">
                      {s.terakhirDiperbarui || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
