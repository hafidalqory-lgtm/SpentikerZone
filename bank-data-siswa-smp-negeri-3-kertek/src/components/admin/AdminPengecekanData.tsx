import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Check,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  Clock,
  CheckCircle,
  Eye,
  FileSpreadsheet,
  X,
  History,
  ShieldCheck
} from 'lucide-react';
import { Student, KelasItem, StatusPengecekan } from '../../types';
import { exportStudentsToExcel } from '../../utils/excel';

interface AdminPengecekanDataProps {
  students: Student[];
  classes: KelasItem[];
  onApproveChanges: (studentId: string) => Promise<void>;
  onRequestRevision: (studentId: string, note: string) => Promise<void>;
  onUpdateStatusOnly: (studentId: string, newStatus: StatusPengecekan, note?: string) => Promise<void>;
}

export const AdminPengecekanData: React.FC<AdminPengecekanDataProps> = ({
  students,
  classes,
  onApproveChanges,
  onRequestRevision,
  onUpdateStatusOnly,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterClass, setFilterClass] = useState<string>('ALL');

  // Comparison modal state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Filter list
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nipd.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.kelas.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'ALL' || s.statusPengecekan === filterStatus;
    const matchClass = filterClass === 'ALL' || s.kelas === filterClass;

    return matchSearch && matchStatus && matchClass;
  });

  // Open Compare Modal
  const handleOpenCompare = (student: Student) => {
    setSelectedStudent(student);
    setIsCompareModalOpen(true);
  };

  // Open Request Revision Modal
  const handleOpenRevision = (student: Student) => {
    setSelectedStudent(student);
    setAdminNote(student.catatanAdmin || '');
    setIsNoteModalOpen(true);
  };

  // Approve Changes
  const handleApprove = async (studentId: string) => {
    setIsSubmitting(true);
    try {
      await onApproveChanges(studentId);
      setIsCompareModalOpen(false);
      setSuccessToast('Perubahan data siswa berhasil disetujui dan status menjadi Terverifikasi Admin!');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      alert(`Gagal menyetujui: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Revision Request
  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!adminNote.trim()) {
      alert('Harap tuliskan catatan perbaikan untuk siswa.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRequestRevision(selectedStudent.id, adminNote.trim());
      setIsNoteModalOpen(false);
      setSuccessToast('Permintaan perbaikan berhasil dikirim ke siswa.');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      alert(`Gagal mengirim permintaan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick verify if already checked by student
  const handleDirectVerify = async (studentId: string) => {
    setIsSubmitting(true);
    try {
      await onUpdateStatusOnly(studentId, 'Terverifikasi Admin', 'Diverifikasi langsung oleh operator sekolah.');
      setSuccessToast('Status berhasil diubah menjadi Terverifikasi Admin!');
      setTimeout(() => setSuccessToast(''), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 flex items-center justify-between animate-scaleUp">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast('')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <CheckSquare className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Pengecekan & Verifikasi Data Siswa
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bandingkan pengajuan perbaikan data dari siswa dengan data Dapodik yang tersimpan
          </p>
        </div>

        <button
          onClick={() => exportStudentsToExcel(filteredStudents, 'Pengecekan_Data_Siswa.xlsx')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Download Excel Hasil Pengecekan</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-sky-100 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 w-full md:w-80 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Nama, NIPD, NISN, Kelas..."
            className="w-full text-xs text-slate-900 bg-transparent focus:outline-none font-medium"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">Semua Status Pengecekan</option>
            <option value="Menunggu Verifikasi Admin">⏳ Menunggu Verifikasi Admin</option>
            <option value="Perlu Perbaikan">⚠️ Perlu Perbaikan</option>
            <option value="Sudah Diperiksa Siswa">👤 Sudah Diperiksa Siswa</option>
            <option value="Terverifikasi Admin">✅ Terverifikasi Admin</option>
            <option value="Belum Diperiksa">⚪ Belum Diperiksa</option>
          </select>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.nama}>
                {c.nama}
              </option>
            ))}
          </select>
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
                <th className="py-3.5 px-4">Status Pengecekan</th>
                <th className="py-3.5 px-3">Terakhir Diperbarui</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ditemukan data siswa dengan filter ini.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const hasPending = !!s.pendingChanges && Object.keys(s.pendingChanges).length > 0;
                  return (
                    <tr key={s.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-slate-500 font-semibold">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{s.nama}</span>
                          {hasPending && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              Ada Perubahan
                            </span>
                          )}
                        </div>
                      </td>
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
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            s.statusPengecekan === 'Terverifikasi Admin'
                              ? 'bg-teal-100 text-teal-800'
                              : s.statusPengecekan === 'Menunggu Verifikasi Admin'
                              ? 'bg-amber-100 text-amber-800'
                              : s.statusPengecekan === 'Sudah Diperiksa Siswa'
                              ? 'bg-sky-100 text-sky-800'
                              : s.statusPengecekan === 'Perlu Perbaikan'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s.statusPengecekan}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[11px] text-slate-500 font-mono">
                        {s.terakhirDiperbarui || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Bandingkan Perubahan button if pending */}
                          {hasPending ? (
                            <button
                              onClick={() => handleOpenCompare(s)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors cursor-pointer shadow-xs"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span>Bandingkan Perubahan</span>
                            </button>
                          ) : (
                            /* Setujui langsung jika siswa sudah periksa */
                            s.statusPengecekan === 'Sudah Diperiksa Siswa' && (
                              <button
                                onClick={() => handleDirectVerify(s.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-800 bg-teal-100 hover:bg-teal-200 border border-teal-300 transition-colors cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Verifikasi</span>
                              </button>
                            )
                          )}

                          {/* Minta Perbaikan button */}
                          <button
                            onClick={() => handleOpenRevision(s)}
                            className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Minta Perbaikan / Tambah Catatan"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: BANDINGKAN PERUBAHAN (DATA LAMA VS DATA BARU) */}
      {isCompareModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden transform transition-all animate-scaleUp">
            <div className="p-6 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 uppercase tracking-wider">
                  Verifikasi Pengajuan Perbaikan
                </span>
                <h3 className="text-xl font-black mt-1">{selectedStudent.nama}</h3>
                <p className="text-xs text-amber-100">
                  Kelas {selectedStudent.kelas} | Waktu Pengajuan: {selectedStudent.terakhirDiperbarui}
                </p>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="text-amber-100 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                Periksa daftar perbedaan data lama vs data baru yang diajukan oleh siswa di bawah ini. Anda dapat menyetujui langsung atau meminta perbaikan jika terdapat data yang meragukan.
              </div>

              {selectedStudent.pendingChanges && Object.keys(selectedStudent.pendingChanges).length > 0 ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3 w-1/4">Nama Kolom</th>
                        <th className="p-3 w-3/8 text-rose-700">Data Lama (Saat Ini)</th>
                        <th className="p-3 w-3/8 text-emerald-700">Data Baru (Diajukan)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(selectedStudent.pendingChanges).map(([key, newVal]) => {
                        const oldVal = (selectedStudent as any)[key];
                        return (
                          <tr key={key} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-800 uppercase tracking-wide">
                              {key}
                            </td>
                            <td className="p-3 text-rose-700 bg-rose-50/50 font-medium">
                              {String(oldVal || '(Kosong)')}
                            </td>
                            <td className="p-3 text-emerald-800 bg-emerald-50/70 font-bold">
                              {String(newVal || '(Kosong)')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Tidak ada rincian perubahan yang tercatat.
                </div>
              )}

              {/* Riwayat Sebelumnya jika ada */}
              {selectedStudent.riwayatPerubahan && selectedStudent.riwayatPerubahan.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Riwayat Perubahan Terdahulu
                  </div>
                  <div className="space-y-2">
                    {selectedStudent.riwayatPerubahan.map((h) => (
                      <div key={h.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                          <span>{h.waktu} - oleh {h.diubahOleh}</span>
                          <span className="font-semibold text-slate-700">{h.statusSesudahnya}</span>
                        </div>
                        <div className="text-slate-800 font-medium">{h.catatan || 'Pengajuan perbaikan data.'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCompareModalOpen(false);
                  handleOpenRevision(selectedStudent);
                }}
                className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                Minta Perbaikan / Tolak
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCompareModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleApprove(selectedStudent.id)}
                  className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Memproses...' : 'Setujui Perubahan Ini'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MINTA PERBAIKAN / TAMBAH CATATAN ADMIN */}
      {isNoteModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden transform transition-all animate-scaleUp">
            <div className="p-6 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Minta Perbaikan Data</h3>
                <p className="text-xs text-rose-100">
                  Untuk siswa: {selectedStudent.nama} ({selectedStudent.kelas})
                </p>
              </div>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="text-rose-100 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catatan untuk Siswa <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Contoh: NIK Siswa kurang 1 digit, mohon periksa kembali Kartu Keluarga terbaru..."
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Catatan ini akan tampil jelas saat siswa login kembali ke portal.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !adminNote.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Kirim Catatan Perbaikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
