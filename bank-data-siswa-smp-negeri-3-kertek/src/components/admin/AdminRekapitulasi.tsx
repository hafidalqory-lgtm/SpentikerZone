import React from 'react';
import { BarChart3, FileSpreadsheet, Layers, CheckCircle2 } from 'lucide-react';
import { Student, KelasItem } from '../../types';
import * as XLSX from 'xlsx';

interface AdminRekapitulasiProps {
  students: Student[];
  classes: KelasItem[];
}

export const AdminRekapitulasi: React.FC<AdminRekapitulasiProps> = ({
  students,
  classes,
}) => {
  // Aggregate data per class
  const classRows = classes.map((cls, idx) => {
    const classStudents = students.filter(
      (s) => s.kelas.trim().toUpperCase() === cls.nama.trim().toUpperCase()
    );
    const total = classStudents.length;
    const l = classStudents.filter((s) => s.jk === 'L').length;
    const p = classStudents.filter((s) => s.jk === 'P').length;

    const belum = classStudents.filter((s) => s.statusPengecekan === 'Belum Diperiksa').length;
    const sudahSiswa = classStudents.filter(
      (s) => s.statusPengecekan === 'Sudah Diperiksa Siswa'
    ).length;
    const menunggu = classStudents.filter(
      (s) => s.statusPengecekan === 'Menunggu Verifikasi Admin'
    ).length;
    const terverifikasi = classStudents.filter(
      (s) => s.statusPengecekan === 'Terverifikasi Admin'
    ).length;
    const perluPerbaikan = classStudents.filter(
      (s) => s.statusPengecekan === 'Perlu Perbaikan'
    ).length;

    const pip = classStudents.filter((s) => s.menerimaPip === 'Ya').length;
    const selesai = sudahSiswa + terverifikasi;
    const persentase = total > 0 ? Math.round((selesai / total) * 100) : 0;

    return {
      no: idx + 1,
      namaKelas: cls.nama,
      waliKelas: cls.waliKelas || '-',
      total,
      l,
      p,
      belum,
      sudahSiswa,
      menunggu,
      terverifikasi,
      perluPerbaikan,
      pip,
      persentase,
    };
  });

  // Grand totals
  const grandTotal = {
    total: students.length,
    l: students.filter((s) => s.jk === 'L').length,
    p: students.filter((s) => s.jk === 'P').length,
    belum: students.filter((s) => s.statusPengecekan === 'Belum Diperiksa').length,
    sudahSiswa: students.filter((s) => s.statusPengecekan === 'Sudah Diperiksa Siswa').length,
    menunggu: students.filter((s) => s.statusPengecekan === 'Menunggu Verifikasi Admin').length,
    terverifikasi: students.filter((s) => s.statusPengecekan === 'Terverifikasi Admin').length,
    perluPerbaikan: students.filter((s) => s.statusPengecekan === 'Perlu Perbaikan').length,
    pip: students.filter((s) => s.menerimaPip === 'Ya').length,
    persentase:
      students.length > 0
        ? Math.round(
            ((students.filter(
              (s) =>
                s.statusPengecekan === 'Sudah Diperiksa Siswa' ||
                s.statusPengecekan === 'Terverifikasi Admin'
            ).length) /
              students.length) *
              100
          )
        : 0,
  };

  const handleExportRekap = () => {
    const wb = XLSX.utils.book_new();
    const headers = [
      'No',
      'Nama Kelas',
      'Wali Kelas',
      'Total Siswa',
      'Laki-laki (L)',
      'Perempuan (P)',
      'Belum Diperiksa',
      'Sudah Diperiksa Siswa',
      'Menunggu Verifikasi',
      'Terverifikasi Admin',
      'Perlu Perbaikan',
      'Penerima PIP',
      'Persentase Selesai (%)',
    ];

    const rows = classRows.map((r) => [
      r.no,
      r.namaKelas,
      r.waliKelas,
      r.total,
      r.l,
      r.p,
      r.belum,
      r.sudahSiswa,
      r.menunggu,
      r.terverifikasi,
      r.perluPerbaikan,
      r.pip,
      `${r.persentase}%`,
    ]);

    // Append grand total row
    rows.push([
      'TOTAL',
      'SEMUA KELAS',
      '-',
      grandTotal.total,
      grandTotal.l,
      grandTotal.p,
      grandTotal.belum,
      grandTotal.sudahSiswa,
      grandTotal.menunggu,
      grandTotal.terverifikasi,
      grandTotal.perluPerbaikan,
      grandTotal.pip,
      `${grandTotal.persentase}%`,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 25 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 16 },
      { wch: 20 },
      { wch: 18 },
      { wch: 18 },
      { wch: 15 },
      { wch: 14 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Rekapitulasi Kelas');
    XLSX.writeFile(wb, 'Rekapitulasi_Validasi_Data_Siswa.xlsx');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Rekapitulasi Validasi per Rombongan Belajar
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Matriks ketercapaian pemeriksaan data siswa dan penerima PIP antar rombel
          </p>
        </div>

        <button
          onClick={handleExportRekap}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export Rekapitulasi ke Excel</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/90 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-3 text-center">No</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-3">Wali Kelas</th>
                <th className="py-3 px-2 text-center">Total</th>
                <th className="py-3 px-2 text-center">L</th>
                <th className="py-3 px-2 text-center">P</th>
                <th className="py-3 px-2 text-center text-slate-500">Belum</th>
                <th className="py-3 px-2 text-center text-sky-700">Sudah Siswa</th>
                <th className="py-3 px-2 text-center text-amber-600">Menunggu</th>
                <th className="py-3 px-2 text-center text-teal-700">Terverifikasi</th>
                <th className="py-3 px-2 text-center text-rose-600">Perbaikan</th>
                <th className="py-3 px-2 text-center text-emerald-600">PIP</th>
                <th className="py-3 px-3 text-right">Ketercapaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classRows.map((r) => (
                <tr key={r.namaKelas} className="hover:bg-sky-50/30 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-slate-400">{r.no}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-xs">
                      {r.namaKelas}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-xs">{r.waliKelas}</td>
                  <td className="py-3 px-2 text-center font-bold text-slate-900">{r.total}</td>
                  <td className="py-3 px-2 text-center font-mono text-blue-600">{r.l}</td>
                  <td className="py-3 px-2 text-center font-mono text-pink-600">{r.p}</td>
                  <td className="py-3 px-2 text-center font-mono text-slate-500 font-bold">
                    {r.belum}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-sky-700 font-bold">
                    {r.sudahSiswa}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-amber-600 font-bold">
                    {r.menunggu}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-teal-700 font-bold">
                    {r.terverifikasi}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-rose-600 font-bold">
                    {r.perluPerbaikan}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-emerald-700 font-bold">
                    {r.pip}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${r.persentase}%` }}
                          className="bg-sky-600 h-full rounded-full"
                        />
                      </div>
                      <span className="font-bold text-xs text-sky-800 font-mono w-9 text-right">
                        {r.persentase}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* FOOTER TOTAL */}
            <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 text-xs">
              <tr>
                <td colSpan={3} className="py-3.5 px-4 uppercase tracking-wider">
                  GRAND TOTAL SEKOLAH
                </td>
                <td className="py-3.5 px-2 text-center font-mono text-sm">{grandTotal.total}</td>
                <td className="py-3.5 px-2 text-center font-mono text-blue-700">{grandTotal.l}</td>
                <td className="py-3.5 px-2 text-center font-mono text-pink-700">{grandTotal.p}</td>
                <td className="py-3.5 px-2 text-center font-mono text-slate-600">{grandTotal.belum}</td>
                <td className="py-3.5 px-2 text-center font-mono text-sky-800">
                  {grandTotal.sudahSiswa}
                </td>
                <td className="py-3.5 px-2 text-center font-mono text-amber-700">
                  {grandTotal.menunggu}
                </td>
                <td className="py-3.5 px-2 text-center font-mono text-teal-800">
                  {grandTotal.terverifikasi}
                </td>
                <td className="py-3.5 px-2 text-center font-mono text-rose-700">
                  {grandTotal.perluPerbaikan}
                </td>
                <td className="py-3.5 px-2 text-center font-mono text-emerald-800">
                  {grandTotal.pip}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-sky-900 text-sm">
                  {grandTotal.persentase}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
