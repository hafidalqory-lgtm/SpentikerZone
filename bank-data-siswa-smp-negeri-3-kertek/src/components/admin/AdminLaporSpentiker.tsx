import React, { useState, useMemo } from 'react';
import {
  MessageSquarePlus,
  Search,
  Filter,
  BarChart2,
  PieChart,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageCircle,
  FileSpreadsheet,
  X,
  CreditCard,
  Building2,
  HelpCircle,
  GraduationCap,
  Users,
  ShieldAlert,
  MoreHorizontal
} from 'lucide-react';
import { SpentikerReport, JenisAduanSpentiker, StatusAduan } from '../../types';
import { exportReportsToExcel } from '../../utils/excel';
import { DeleteConfirmModal } from '../DeleteConfirmModal';

interface AdminLaporSpentikerProps {
  reports: SpentikerReport[];
  onUpdateReport: (id: string, partial: Partial<SpentikerReport>) => Promise<SpentikerReport[]>;
  onDeleteReport: (id: string) => Promise<SpentikerReport[]>;
}

export const AdminLaporSpentiker: React.FC<AdminLaporSpentikerProps> = ({
  reports,
  onUpdateReport,
  onDeleteReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'rekap' | 'diagram'>('rekap');

  // Response modal
  const [selectedReport, setSelectedReport] = useState<SpentikerReport | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [newStatus, setNewStatus] = useState<StatusAduan>('Diproses');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal (Fixed & working!)
  const [deleteTarget, setDeleteTarget] = useState<SpentikerReport | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.kodeAduan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.namaPelapor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.detailAduan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.masukanSekolah.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = selectedCategory === 'ALL' || r.jenisAduan === selectedCategory;
      const matchStat = selectedStatus === 'ALL' || r.status === selectedStatus;

      return matchSearch && matchCat && matchStat;
    });
  }, [reports, searchTerm, selectedCategory, selectedStatus]);

  // CATEGORY STATS FOR CHARTS
  const categoryStats = useMemo(() => {
    const cats: JenisAduanSpentiker[] = ['PIP', 'SARPRAS', 'SEKOLAH', 'AKADEMIK', 'KESISWAAN', 'BULLYING', 'LAINNYA'];
    const total = reports.length;
    return cats.map((cat) => {
      const count = reports.filter((r) => r.jenisAduan === cat).length;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { category: cat, count, percentage };
    });
  }, [reports]);

  const maxCategoryCount = Math.max(...categoryStats.map((c) => c.count), 1);

  // STATUS STATS
  const statusStats = useMemo(() => {
    const statuses: StatusAduan[] = ['Masuk', 'Diproses', 'Selesai', 'Diarsipkan'];
    const total = reports.length;
    return statuses.map((stat) => {
      const count = reports.filter((r) => r.status === stat).length;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { status: stat, count, percentage };
    });
  }, [reports]);

  // Open Response Modal
  const handleOpenResponse = (rep: SpentikerReport) => {
    setSelectedReport(rep);
    setAdminResponseText(rep.tanggapanAdmin || '');
    setNewStatus(rep.status === 'Masuk' ? 'Diproses' : rep.status);
    setIsResponseModalOpen(true);
  };

  const handleSaveResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
      await onUpdateReport(selectedReport.id, {
        status: newStatus,
        tanggapanAdmin: adminResponseText.trim(),
        tanggalTanggapan: now,
      });
      setIsResponseModalOpen(false);
      setSuccessToast(`Tanggapan untuk ${selectedReport.kodeAduan} berhasil disimpan!`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE CONFIRMATION (Fixed & working!)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const code = deleteTarget.kodeAduan;
      await onDeleteReport(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessToast(`Aduan "${code}" berhasil dihapus.`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 flex items-center justify-between animate-scaleUp">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
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
            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <MessageSquarePlus className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Lapor Spentiker (Aduan & Masukan)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi aspirasi warga sekolah, status penanganan, dan visualisasi diagram aduan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Tab */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('rekap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'rekap'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap Tabel
            </button>
            <button
              onClick={() => setActiveTab('diagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'diagram'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Diagram Aduan</span>
            </button>
          </div>

          <button
            onClick={() => exportReportsToExcel(reports)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* DIAGRAM VIEW */}
      {activeTab === 'diagram' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Category Bar Chart */}
          <div className="bg-white rounded-3xl border border-sky-100 p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-sky-600" />
                  <span>Diagram Batang: Distribusi Jenis Aduan & Aspirasi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbandingan jumlah laporan masuk berdasarkan kelompok permasalahan
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Total: <strong>{reports.length} Aduan</strong>
              </span>
            </div>

            <div className="space-y-4">
              {categoryStats.map((item) => {
                const barWidth = Math.max(Math.round((item.count / maxCategoryCount) * 100), 2);
                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{item.category}</span>
                      <span className="text-slate-500 font-mono">
                        {item.count} laporan ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-6 rounded-xl overflow-hidden p-0.5">
                      <div
                        style={{ width: `${barWidth}%` }}
                        className={`h-full rounded-lg transition-all duration-700 flex items-center justify-end px-2 ${
                          item.category === 'PIP'
                            ? 'bg-amber-500'
                            : item.category === 'SARPRAS'
                            ? 'bg-emerald-500'
                            : item.category === 'SEKOLAH'
                            ? 'bg-sky-500'
                            : item.category === 'BULLYING'
                            ? 'bg-rose-500'
                            : 'bg-indigo-500'
                        }`}
                      >
                        {item.count > 0 && (
                          <span className="text-[10px] font-black text-white">{item.count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Distribution Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusStats.map((stat) => (
              <div
                key={stat.status}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase">
                    Status: {stat.status}
                  </span>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      stat.status === 'Selesai'
                        ? 'bg-emerald-500'
                        : stat.status === 'Diproses'
                        ? 'bg-sky-500'
                        : stat.status === 'Masuk'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900">{stat.count}</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">
                    {stat.percentage}% dari total aduan
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REKAP TABLE VIEW */}
      {activeTab === 'rekap' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-sky-100 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-80 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari kode, nama pelapor, isi aduan..."
                className="w-full text-xs text-slate-900 bg-transparent focus:outline-none font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Category */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="ALL">Semua Jenis Aduan</option>
                <option value="PIP">PIP</option>
                <option value="SARPRAS">SARPRAS</option>
                <option value="SEKOLAH">SEKOLAH</option>
                <option value="AKADEMIK">AKADEMIK</option>
                <option value="KESISWAAN">KESISWAAN</option>
                <option value="BULLYING">BULLYING</option>
                <option value="LAINNYA">LAINNYA</option>
              </select>

              {/* Status */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="ALL">Semua Status</option>
                <option value="Masuk">Masuk</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Diarsipkan">Diarsipkan</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3.5 px-3 w-10 text-center">No</th>
                    <th className="py-3.5 px-3 font-mono">Kode</th>
                    <th className="py-3.5 px-4">Pelapor</th>
                    <th className="py-3.5 px-3">Jenis</th>
                    <th className="py-3.5 px-4 w-1/3">Detail Aduan & Masukan</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                        Tidak ada aduan yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-sky-50/40 transition-colors">
                        <td className="py-3.5 px-3 text-center font-mono text-slate-500 font-semibold">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-sky-800 text-xs">
                          {r.kodeAduan}
                          <div className="text-[10px] text-slate-400 font-normal">{r.tanggal}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{r.namaPelapor}</div>
                          <div className="text-[11px] text-slate-500">
                            {r.statusPelapor} {r.kelas ? `• Kelas ${r.kelas}` : ''}
                          </div>
                          {r.kontak && (
                            <div className="text-[10px] font-mono text-slate-400">WA: {r.kontak}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-200">
                            {r.jenisAduan}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs space-y-1">
                          <div className="text-slate-800 font-medium line-clamp-2">
                            "{r.detailAduan}"
                          </div>
                          {r.masukanSekolah && (
                            <div className="text-sky-800 bg-sky-50 p-1.5 rounded-lg text-[11px] line-clamp-2">
                              💡 <strong>Masukan:</strong> {r.masukanSekolah}
                            </div>
                          )}
                          {r.tanggapanAdmin && (
                            <div className="text-emerald-800 bg-emerald-50 p-1.5 rounded-lg text-[11px] line-clamp-2">
                              ✓ <strong>Tanggapan Sekolah:</strong> {r.tanggapanAdmin}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              r.status === 'Selesai'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'Diproses'
                                ? 'bg-sky-100 text-sky-800'
                                : r.status === 'Masuk'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {/* Respon Button */}
                            <button
                              onClick={() => handleOpenResponse(r)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg cursor-pointer"
                              title="Tanggapi Aduan"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Respon</span>
                            </button>

                            {/* Hapus Button (Fixed & working!) */}
                            <button
                              onClick={() => setDeleteTarget(r)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Aduan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TANGGAPAN ADMIN */}
      {isResponseModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden transform transition-all animate-scaleUp">
            <div className="p-6 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20">
                  {selectedReport.kodeAduan}
                </span>
                <h3 className="text-lg font-bold mt-1">Tanggapan & Status Aduan</h3>
              </div>
              <button
                onClick={() => setIsResponseModalOpen(false)}
                className="text-sky-100 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResponse} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div>Pelapor: <strong>{selectedReport.namaPelapor}</strong> ({selectedReport.statusPelapor})</div>
                <div>Jenis: <strong className="text-sky-700">{selectedReport.jenisAduan}</strong></div>
                <div className="text-slate-600 pt-1">"{selectedReport.detailAduan}"</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ubah Status Penanganan
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as StatusAduan)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Masuk">Masuk (Belum Ditindaklanjuti)</option>
                  <option value="Diproses">Diproses (Sedang Ditangani)</option>
                  <option value="Selesai">Selesai (Sudah Tuntas Ditangani)</option>
                  <option value="Diarsipkan">Diarsipkan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tuliskan Tanggapan / Tindakan Sekolah
                </label>
                <textarea
                  rows={4}
                  value={adminResponseText}
                  onChange={(e) => setAdminResponseText(e.target.value)}
                  placeholder="Tuliskan tindak lanjut yang telah dilakukan oleh pihak sekolah..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsResponseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Tanggapan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROCK-SOLID DELETE CONFIRM MODAL (FIXED & WORKING!) */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title="Hapus Laporan Spentiker"
        message={`Apakah Anda yakin ingin menghapus laporan aduan "${deleteTarget?.kodeAduan}" dari ${deleteTarget?.namaPelapor}? Tindakan ini bersifat permanen.`}
        itemName={deleteTarget ? `${deleteTarget.kodeAduan}: ${deleteTarget.detailAduan.slice(0, 60)}...` : ''}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
