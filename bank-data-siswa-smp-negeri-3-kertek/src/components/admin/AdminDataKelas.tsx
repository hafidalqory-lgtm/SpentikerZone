import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  Upload,
  ClipboardPaste,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { KelasItem, Student } from '../../types';
import { 
  downloadClassTemplateExcel, 
  exportClassesToExcel, 
  parsePastedClassText 
} from '../../utils/excel';
import * as XLSX from 'xlsx';
import { DeleteConfirmModal } from '../DeleteConfirmModal';

interface AdminDataKelasProps {
  classes: KelasItem[];
  students: Student[];
  onAddClass: (cls: Omit<KelasItem, 'id'>) => Promise<KelasItem[]>;
  onUpdateClass: (id: string, partial: Partial<KelasItem>) => Promise<KelasItem[]>;
  onDeleteClass: (id: string) => Promise<KelasItem[]>;
}

export const AdminDataKelas: React.FC<AdminDataKelasProps> = ({
  classes,
  students,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form states
  const [formNama, setFormNama] = useState('');
  const [formWali, setFormWali] = useState('');
  const [formTahun, setFormTahun] = useState('2026/2027');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Paste state
  const [pasteContent, setPasteContent] = useState('');
  const [pastePreview, setPastePreview] = useState<{ nama: string; waliKelas?: string; tahunAjaran?: string }[]>([]);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<KelasItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered classes
  const filteredClasses = classes.filter((c) =>
    c.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.waliKelas && c.waliKelas.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get student count per class
  const getStudentCount = (className: string) => {
    return students.filter((s) => s.kelas.trim().toUpperCase() === className.trim().toUpperCase()).length;
  };

  // ADD CLASS
  const handleOpenAdd = () => {
    setFormNama('');
    setFormWali('');
    setFormTahun('2026/2027');
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanNama = formNama.trim().toUpperCase();
    if (!cleanNama) {
      setErrorMsg('Nama kelas wajib diisi.');
      return;
    }

    // Check duplicate
    if (classes.some((c) => c.nama.toUpperCase() === cleanNama)) {
      setErrorMsg(`Kelas "${cleanNama}" sudah ada dalam daftar.`);
      return;
    }

    try {
      await onAddClass({
        no: classes.length + 1,
        nama: cleanNama,
        waliKelas: formWali.trim() || undefined,
        tahunAjaran: formTahun.trim() || '2026/2027',
      });
      setIsAddModalOpen(false);
      setSuccessMsg(`Kelas ${cleanNama} berhasil ditambahkan!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan kelas.');
    }
  };

  // EDIT CLASS
  const handleOpenEdit = (item: KelasItem) => {
    setEditingId(item.id);
    setFormNama(item.nama);
    setFormWali(item.waliKelas || '');
    setFormTahun(item.tahunAjaran || '2026/2027');
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setErrorMsg('');
    const cleanNama = formNama.trim().toUpperCase();
    if (!cleanNama) {
      setErrorMsg('Nama kelas wajib diisi.');
      return;
    }

    // Check duplicate with others
    if (classes.some((c) => c.id !== editingId && c.nama.toUpperCase() === cleanNama)) {
      setErrorMsg(`Nama kelas "${cleanNama}" sudah digunakan oleh kelas lain.`);
      return;
    }

    try {
      await onUpdateClass(editingId, {
        nama: cleanNama,
        waliKelas: formWali.trim() || undefined,
        tahunAjaran: formTahun.trim() || '2026/2027',
      });
      setIsEditModalOpen(false);
      setSuccessMsg(`Data kelas ${cleanNama} berhasil diperbarui!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui kelas.');
    }
  };

  // DELETE CLASS (Fixed & Tested!)
  const handleOpenDelete = (item: KelasItem) => {
    setDeleteTarget(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const deletedName = deleteTarget.nama;
      await onDeleteClass(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMsg(`Kelas "${deletedName}" berhasil dihapus dari sistem.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(`Gagal menghapus kelas: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // PASTE INPUT
  const handlePasteChange = (text: string) => {
    setPasteContent(text);
    const parsed = parsePastedClassText(text);
    setPastePreview(parsed);
  };

  const handleSavePaste = async () => {
    if (pastePreview.length === 0) return;
    let addedCount = 0;
    for (const item of pastePreview) {
      const exists = classes.some((c) => c.nama.toUpperCase() === item.nama.toUpperCase());
      if (!exists) {
        await onAddClass({
          no: classes.length + 1 + addedCount,
          nama: item.nama,
          waliKelas: item.waliKelas,
          tahunAjaran: item.tahunAjaran || '2026/2027',
        });
        addedCount++;
      }
    }
    setIsPasteModalOpen(false);
    setPasteContent('');
    setPastePreview([]);
    setSuccessMsg(`Berhasil menambahkan ${addedCount} kelas baru dari copy-paste!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // EXCEL IMPORT
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      let added = 0;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        let nama = '';
        let wali = '';
        let thn = '2026/2027';

        if (row.length === 1) {
          nama = String(row[0]).trim();
        } else if (row.length >= 2) {
          if (/^\d+$/.test(String(row[0]).trim())) {
            nama = String(row[1]).trim();
            wali = row[2] ? String(row[2]).trim() : '';
            thn = row[3] ? String(row[3]).trim() : '2026/2027';
          } else {
            nama = String(row[0]).trim();
            wali = row[1] ? String(row[1]).trim() : '';
            thn = row[2] ? String(row[2]).trim() : '2026/2027';
          }
        }

        if (nama) {
          const upper = nama.toUpperCase();
          const exists = classes.some((c) => c.nama.toUpperCase() === upper);
          if (!exists) {
            await onAddClass({
              no: classes.length + 1 + added,
              nama: upper,
              waliKelas: wali || undefined,
              tahunAjaran: thn || '2026/2027',
            });
            added++;
          }
        }
      }

      setIsImportModalOpen(false);
      setSuccessMsg(`Berhasil mengimpor ${added} kelas baru dari file Excel!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(`Gagal membaca file Excel: ${err.message}`);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 flex items-center justify-between animate-scaleUp">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg('')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Pengelolaan Data Kelas</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total {classes.length} rombongan belajar terdaftar di SMP Negeri 3 Kertek
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tambah Kelas */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
          </button>

          {/* Copy-Paste Massal */}
          <button
            onClick={() => {
              setPasteContent('');
              setPastePreview([]);
              setIsPasteModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <ClipboardPaste className="w-4 h-4 text-slate-600" />
            <span>Copy-Paste Excel</span>
          </button>

          {/* Impor Excel */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Impor Excel</span>
          </button>

          {/* Download Template */}
          <button
            onClick={downloadClassTemplateExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span>Template Excel</span>
          </button>

          {/* Download Data Kelas */}
          <button
            onClick={() => exportClassesToExcel(classes)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Download Data</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-sky-100 p-4 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari berdasarkan nama kelas atau wali kelas..."
          className="w-full text-sm text-slate-900 bg-transparent focus:outline-none font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            Reset
          </button>
        )}
      </div>

      {/* Table of Classes */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-14 text-center">No</th>
                <th className="py-3.5 px-4">Nama Kelas</th>
                <th className="py-3.5 px-4">Wali Kelas</th>
                <th className="py-3.5 px-4">Tahun Ajaran</th>
                <th className="py-3.5 px-4 text-center">Jumlah Siswa</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ditemukan data kelas yang sesuai dengan kata kunci pencarian.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls, idx) => {
                  const studentCount = getStudentCount(cls.nama);
                  return (
                    <tr key={cls.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-slate-500 font-semibold">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold inline-block">
                          {cls.nama}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {cls.waliKelas || <span className="text-slate-400 italic">Belum ditentukan</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        {cls.tahunAjaran || '2026/2027'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {studentCount} Siswa
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(cls)}
                            className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Kelas"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button (Working!) */}
                          <button
                            onClick={() => handleOpenDelete(cls)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Kelas"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* MODAL: TAMBAH KELAS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden transform transition-all animate-scaleUp">
            <div className="p-6 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">Tambah Kelas Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-sky-100 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value.toUpperCase())}
                  placeholder="Contoh: VII A, VIII B, IX C"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold uppercase text-slate-900 focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Wali Kelas (Opsional)
                </label>
                <input
                  type="text"
                  value={formWali}
                  onChange={(e) => setFormWali(e.target.value)}
                  placeholder="Nama Lengkap & Gelar Wali Kelas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={formTahun}
                  onChange={(e) => setFormTahun(e.target.value)}
                  placeholder="2026/2027"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-sky-500 text-sm font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT KELAS */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden transform transition-all animate-scaleUp">
            <div className="p-6 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Data Kelas</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-sky-100 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold uppercase text-slate-900 focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Wali Kelas
                </label>
                <input
                  type="text"
                  value={formWali}
                  onChange={(e) => setFormWali(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={formTahun}
                  onChange={(e) => setFormTahun(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-sky-500 text-sm font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md cursor-pointer"
                >
                  Perbarui Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COPY-PASTE INPUT KELAS */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden transform transition-all animate-scaleUp">
            <div className="p-6 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Input Massal Kelas via Copy-Paste</h3>
                <p className="text-xs text-sky-100">
                  Salin kolom dari Microsoft Excel lalu tempelkan di kotak berikut
                </p>
              </div>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="text-sky-100 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <textarea
                rows={6}
                value={pasteContent}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder="Contoh format yang ditempel:&#10;No	Nama Kelas	Wali Kelas&#10;1	VII A	Budi Santoso, S.Pd.&#10;2	VII B	Siti Rahmawati, M.Pd."
                className="w-full p-4 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 bg-slate-50"
              />

              {pastePreview.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-2">
                    Pratinjau Data Terbaca ({pastePreview.length} Kelas):
                  </div>
                  <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 font-bold">
                        <tr>
                          <th className="p-2">Nama Kelas</th>
                          <th className="p-2">Wali Kelas</th>
                          <th className="p-2">Tahun Ajaran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pastePreview.map((item, i) => (
                          <tr key={i}>
                            <td className="p-2 font-bold text-sky-800">{item.nama}</td>
                            <td className="p-2">{item.waliKelas || '-'}</td>
                            <td className="p-2">{item.tahunAjaran}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasteModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSavePaste}
                  disabled={pastePreview.length === 0}
                  className="px-5 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                >
                  Simpan Semua ({pastePreview.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMPOR EXCEL KELAS */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden transform transition-all animate-scaleUp">
            <div className="p-6 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">Unggah File Excel Kelas</h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-sky-100 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="p-8 border-2 border-dashed border-sky-300 rounded-2xl bg-sky-50/50 hover:bg-sky-50 transition-colors">
                <Upload className="w-10 h-10 text-sky-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  Pilih file Excel (.xlsx / .xls)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Format header minimal: No, Nama Kelas
                </p>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelUpload}
                  className="mt-4 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROCK-SOLID DELETE CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title="Konfirmasi Hapus Kelas"
        message={
          deleteTarget
            ? `Apakah Anda yakin ingin menghapus kelas "${deleteTarget.nama}"? ${
                getStudentCount(deleteTarget.nama) > 0
                  ? `PERHATIAN: Terdapat ${getStudentCount(
                      deleteTarget.nama
                    )} siswa yang saat ini terdaftar di kelas ini.`
                  : ''
              }`
            : ''
        }
        itemName={deleteTarget ? `Kelas: ${deleteTarget.nama}` : ''}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
