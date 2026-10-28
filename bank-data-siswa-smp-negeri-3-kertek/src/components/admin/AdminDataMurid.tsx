import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Upload,
  ClipboardPaste,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Check,
  AlertCircle
} from 'lucide-react';
import { Student, KelasItem, StatusPengecekan } from '../../types';
import { 
  downloadStudentTemplateExcel, 
  exportStudentsToExcel, 
  parseExcelStudentFile, 
  parsePastedStudentText,
  ParseResult,
  STUDENT_COLUMNS
} from '../../utils/excel';
import { DeleteConfirmModal } from '../DeleteConfirmModal';

interface AdminDataMuridProps {
  students: Student[];
  classes: KelasItem[];
  onAddStudent: (student: Omit<Student, 'id' | 'terakhirDiperbarui'>) => Promise<Student[]>;
  onUpdateStudent: (id: string, partial: Partial<Student>) => Promise<Student[]>;
  onDeleteStudent: (id: string) => Promise<Student[]>;
  onDeleteMultipleStudents: (ids: string[]) => Promise<Student[]>;
  onBulkAddStudents: (students: Omit<Student, 'id' | 'terakhirDiperbarui'>[]) => Promise<Student[]>;
}

export const AdminDataMurid: React.FC<AdminDataMuridProps> = ({
  students,
  classes,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onDeleteMultipleStudents,
  onBulkAddStudents,
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'nama' | 'no' | 'kelas'>('nama');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Multi-select for batch delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Active student for edit/detail
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Import / Paste preview state
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  // Success / Error alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State for Add / Edit
  const defaultStudentForm: Omit<Student, 'id' | 'terakhirDiperbarui'> = {
    no: 1,
    nama: '',
    nipd: '',
    jk: 'L',
    nisn: '',
    tempatLahir: '',
    tanggalLahir: '',
    nik: '',
    agama: 'Islam',
    alamat: '',
    rt: '',
    rw: '',
    dusun: '',
    kelurahan: '',
    kecamatan: 'Kertek',
    kelas: classes[0]?.nama || 'VII A',
    namaAyah: '',
    tahunLahirAyah: '',
    jenjangPendidikanAyah: '',
    pekerjaanAyah: '',
    penghasilanAyah: '',
    nikAyah: '',
    namaIbu: '',
    tahunLahirIbu: '',
    jenjangPendidikanIbu: '',
    pekerjaanIbu: '',
    penghasilanIbu: '',
    nikIbu: '',
    menerimaPip: 'Tidak',
    statusPengecekan: 'Belum Diperiksa',
  };

  const [studentForm, setStudentForm] = useState<Omit<Student, 'id' | 'terakhirDiperbarui'>>(defaultStudentForm);

  // Filtered & Sorted Student List
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchSearch =
          s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.nipd.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.kelas.toLowerCase().includes(searchTerm.toLowerCase());

        const matchClass = selectedClassFilter === 'ALL' || s.kelas === selectedClassFilter;
        const matchStatus = selectedStatusFilter === 'ALL' || s.statusPengecekan === selectedStatusFilter;

        return matchSearch && matchClass && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'nama') {
          return sortOrder === 'asc' ? a.nama.localeCompare(b.nama) : b.nama.localeCompare(a.nama);
        } else if (sortBy === 'kelas') {
          return sortOrder === 'asc' ? a.kelas.localeCompare(b.kelas) : b.kelas.localeCompare(a.kelas);
        } else {
          return sortOrder === 'asc' ? Number(a.no || 0) - Number(b.no || 0) : Number(b.no || 0) - Number(a.no || 0);
        }
      });
  }, [students, searchTerm, selectedClassFilter, selectedStatusFilter, sortBy, sortOrder]);

  // Handle Multi-select
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredStudents.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ADD
  const handleOpenAdd = () => {
    setStudentForm({
      ...defaultStudentForm,
      no: students.length + 1,
      kelas: classes[0]?.nama || 'VII A',
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!studentForm.nama.trim()) {
      setErrorMsg('Nama siswa wajib diisi.');
      return;
    }

    try {
      await onAddStudent(studentForm);
      setIsAddModalOpen(false);
      setSuccessMsg(`Siswa "${studentForm.nama}" berhasil ditambahkan.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan data siswa.');
    }
  };

  // EDIT
  const handleOpenEdit = (student: Student) => {
    setCurrentStudent(student);
    setStudentForm({ ...student });
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    setErrorMsg('');

    try {
      await onUpdateStudent(currentStudent.id, studentForm);
      setIsEditModalOpen(false);
      setSuccessMsg(`Data siswa "${studentForm.nama}" berhasil diperbarui.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui data siswa.');
    }
  };

  // DELETE SINGLE (Fixed & Working!)
  const handleConfirmSingleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const name = deleteTarget.nama;
      await onDeleteStudent(deleteTarget.id);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
      setDeleteTarget(null);
      setSuccessMsg(`Data siswa "${name}" berhasil dihapus dari database.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(`Gagal menghapus siswa: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // DELETE BATCH (Fixed & Working!)
  const handleConfirmBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const count = selectedIds.length;
      await onDeleteMultipleStudents(selectedIds);
      setSelectedIds([]);
      setIsBatchDeleteModalOpen(false);
      setSuccessMsg(`Berhasil menghapus ${count} siswa secara massal.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(`Gagal menghapus siswa massal: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // EXCEL FILE IMPORT
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    setErrorMsg('');
    try {
      const res = await parseExcelStudentFile(file);
      setParseResult(res);
      setIsImportModalOpen(true);
    } catch (err: any) {
      alert(`Gagal membaca file: ${err.message}`);
    } finally {
      setImportLoading(false);
      e.target.value = '';
    }
  };

  // PASTE PARSE
  const handlePasteParse = () => {
    if (!pasteText.trim()) return;
    try {
      const res = parsePastedStudentText(pasteText);
      setParseResult(res);
      setIsPasteModalOpen(false);
      setIsImportModalOpen(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // COMMIT IMPORTED DATA
  const handleCommitImport = async () => {
    if (!parseResult || parseResult.rows.length === 0) return;
    setImportLoading(true);
    try {
      const newItems: Omit<Student, 'id' | 'terakhirDiperbarui'>[] = parseResult.rows.map((r, i) => ({
        no: r.no || students.length + i + 1,
        nama: r.nama || 'SISWA BARU',
        nipd: r.nipd || '',
        jk: r.jk || 'L',
        nisn: r.nisn || '',
        tempatLahir: r.tempatLahir || '',
        tanggalLahir: r.tanggalLahir || '',
        nik: r.nik || '',
        agama: r.agama || 'Islam',
        alamat: r.alamat || '',
        rt: r.rt || '',
        rw: r.rw || '',
        dusun: r.dusun || '',
        kelurahan: r.kelurahan || '',
        kecamatan: r.kecamatan || 'Kertek',
        kelas: r.kelas || classes[0]?.nama || 'VII A',
        namaAyah: r.namaAyah || '',
        tahunLahirAyah: r.tahunLahirAyah || '',
        jenjangPendidikanAyah: r.jenjangPendidikanAyah || '',
        pekerjaanAyah: r.pekerjaanAyah || '',
        penghasilanAyah: r.penghasilanAyah || '',
        nikAyah: r.nikAyah || '',
        namaIbu: r.namaIbu || '',
        tahunLahirIbu: r.tahunLahirIbu || '',
        jenjangPendidikanIbu: r.jenjangPendidikanIbu || '',
        pekerjaanIbu: r.pekerjaanIbu || '',
        penghasilanIbu: r.penghasilanIbu || '',
        nikIbu: r.nikIbu || '',
        menerimaPip: r.menerimaPip || 'Belum Diketahui',
        statusPengecekan: 'Belum Diperiksa',
      }));

      await onBulkAddStudents(newItems);
      setIsImportModalOpen(false);
      setParseResult(null);
      setSuccessMsg(`Berhasil mengimpor ${newItems.length} data siswa ke database!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(`Gagal menyimpan data: ${err.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Success Notification */}
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

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Database Siswa SMPN 3 Kertek</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total {students.length} siswa tersimpan | {filteredStudents.length} siswa ditampilkan
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tambah Siswa Manual */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>

          {/* Copy-Paste dari Excel */}
          <button
            onClick={() => {
              setPasteText('');
              setIsPasteModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <ClipboardPaste className="w-4 h-4 text-slate-600" />
            <span>Copy-Paste Excel</span>
          </button>

          {/* Upload Excel */}
          <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Impor File Excel</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelUpload}
              className="hidden"
            />
          </label>

          {/* Download Template Excel Lengkap */}
          <button
            onClick={downloadStudentTemplateExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span>Template Excel</span>
          </button>

          {/* Download Data Cepat */}
          <button
            onClick={() => exportStudentsToExcel(filteredStudents, 'Data_Siswa_Filtered.xlsx')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export ({filteredStudents.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-sky-100 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex items-center gap-2 w-full md:w-80 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Nama, NISN, NIK, NIPD..."
            className="w-full text-xs text-slate-900 bg-transparent focus:outline-none font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Class Filter */}
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.nama}>
                Kelas {c.nama}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="Belum Diperiksa">Belum Diperiksa</option>
            <option value="Sudah Diperiksa Siswa">Sudah Diperiksa Siswa</option>
            <option value="Menunggu Verifikasi Admin">Menunggu Verifikasi Admin</option>
            <option value="Terverifikasi Admin">Terverifikasi Admin</option>
            <option value="Perlu Perbaikan">Perlu Perbaikan</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer"
            title="Ubah Urutan"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
          </button>
        </div>
      </div>

      {/* Batch Action Bar if selected */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
            <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-mono">
              {selectedIds.length}
            </span>
            <span>siswa terpilih untuk tindakan massal</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg cursor-pointer"
            >
              Batalkan Pilihan
            </button>
            <button
              onClick={() => setIsBatchDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Siswa Terpilih ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Student Table */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3.5 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredStudents.length > 0 &&
                      selectedIds.length === filteredStudents.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                </th>
                <th className="py-3.5 px-3 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-3">Kelas</th>
                <th className="py-3.5 px-3 font-mono">NISN</th>
                <th className="py-3.5 px-3 font-mono">NIK</th>
                <th className="py-3.5 px-3 text-center">JK</th>
                <th className="py-3.5 px-4">Status Pengecekan</th>
                <th className="py-3.5 px-3 text-center">PIP</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada data siswa yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const isSelected = selectedIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-sky-50/40 transition-colors ${
                        isSelected ? 'bg-sky-50/60' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(s.id)}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-500 font-semibold">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{s.nama}</span>
                          {s.pendingChanges && (
                            <span className="w-2 h-2 rounded-full bg-amber-500" title="Ada pengajuan perbaikan" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          NIPD: {s.nipd || '-'}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold">
                        <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-xs font-bold">
                          {s.kelas}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 text-xs">
                        {s.nisn || '-'}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 text-xs">
                        {s.nik || '-'}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.jk === 'P'
                              ? 'bg-pink-100 text-pink-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {s.jk}
                        </span>
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
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`text-xs font-bold ${
                            s.menerimaPip === 'Ya'
                              ? 'text-emerald-600'
                              : s.menerimaPip === 'Tidak'
                              ? 'text-slate-400'
                              : 'text-amber-500'
                          }`}
                        >
                          {s.menerimaPip || '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Detail */}
                          <button
                            onClick={() => {
                              setCurrentStudent(s);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Siswa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete (Working!) */}
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Siswa"
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

      {/* MODAL: TAMBAH / EDIT SISWA FORM (LENGKAP SEMUA KOLOM) */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden my-8 transform transition-all animate-scaleUp">
            <div className="p-6 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {isAddModalOpen ? 'Tambah Data Siswa Baru' : `Edit Data: ${currentStudent?.nama}`}
                </h3>
                <p className="text-xs text-sky-100">
                  Formulir lengkap identitas siswa, data orang tua, dan bantuan PIP
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-sky-100 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit}
              className="p-6 space-y-6 max-h-[75vh] overflow-y-auto"
            >
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* IDENTITAS SISWA */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-sky-100 pb-1.5">
                  1. Identitas Pribadi Siswa
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={studentForm.nama}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, nama: e.target.value.toUpperCase() })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold uppercase focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kelas <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={studentForm.kelas}
                      onChange={(e) => setStudentForm({ ...studentForm, kelas: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.nama}>
                          {c.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NIPD</label>
                    <input
                      type="text"
                      value={studentForm.nipd}
                      onChange={(e) => setStudentForm({ ...studentForm, nipd: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select
                      value={studentForm.jk}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, jk: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    >
                      <option value="L">L (Laki-laki)</option>
                      <option value="P">P (Perempuan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NISN (10 Digit)</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={studentForm.nisn}
                      onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={studentForm.tempatLahir}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, tempatLahir: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={studentForm.tanggalLahir}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, tanggalLahir: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NIK (16 Digit)</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={studentForm.nik}
                      onChange={(e) => setStudentForm({ ...studentForm, nik: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Agama</label>
                    <select
                      value={studentForm.agama}
                      onChange={(e) => setStudentForm({ ...studentForm, agama: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Khonghucu">Khonghucu</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alamat</label>
                    <input
                      type="text"
                      value={studentForm.alamat}
                      onChange={(e) => setStudentForm({ ...studentForm, alamat: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">RT</label>
                      <input
                        type="text"
                        value={studentForm.rt}
                        onChange={(e) => setStudentForm({ ...studentForm, rt: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">RW</label>
                      <input
                        type="text"
                        value={studentForm.rw}
                        onChange={(e) => setStudentForm({ ...studentForm, rw: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dusun</label>
                    <input
                      type="text"
                      value={studentForm.dusun}
                      onChange={(e) => setStudentForm({ ...studentForm, dusun: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kelurahan</label>
                    <input
                      type="text"
                      value={studentForm.kelurahan}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, kelurahan: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kecamatan</label>
                    <input
                      type="text"
                      value={studentForm.kecamatan}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, kecamatan: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* DATA ORANG TUA */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-sky-100 pb-1.5">
                  2. Data Orang Tua (Ayah & Ibu)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ayah */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="font-bold text-xs text-slate-800">Data Ayah:</div>
                    <input
                      type="text"
                      placeholder="Nama Ayah"
                      value={studentForm.namaAyah}
                      onChange={(e) => setStudentForm({ ...studentForm, namaAyah: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Thn Lahir (YYYY)"
                        maxLength={4}
                        value={studentForm.tahunLahirAyah}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, tahunLahirAyah: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Pekerjaan Ayah"
                        value={studentForm.pekerjaanAyah}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, pekerjaanAyah: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="NIK Ayah (16 Digit)"
                      maxLength={16}
                      value={studentForm.nikAyah}
                      onChange={(e) => setStudentForm({ ...studentForm, nikAyah: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>

                  {/* Ibu */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="font-bold text-xs text-slate-800">Data Ibu:</div>
                    <input
                      type="text"
                      placeholder="Nama Ibu"
                      value={studentForm.namaIbu}
                      onChange={(e) => setStudentForm({ ...studentForm, namaIbu: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Thn Lahir (YYYY)"
                        maxLength={4}
                        value={studentForm.tahunLahirIbu}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, tahunLahirIbu: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Pekerjaan Ibu"
                        value={studentForm.pekerjaanIbu}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, pekerjaanIbu: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="NIK Ibu (16 Digit)"
                      maxLength={16}
                      value={studentForm.nikIbu}
                      onChange={(e) => setStudentForm({ ...studentForm, nikIbu: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* BANTUAN PIP & STATUS */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-sky-100 pb-1.5">
                  3. Program Bantuan & Status Validasi
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Menerima Bantuan PIP
                    </label>
                    <select
                      value={studentForm.menerimaPip}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, menerimaPip: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold"
                    >
                      <option value="Ya">Ya (Penerima PIP)</option>
                      <option value="Tidak">Tidak</option>
                      <option value="Belum Diketahui">Belum Diketahui</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Status Pengecekan
                    </label>
                    <select
                      value={studentForm.statusPengecekan}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          statusPengecekan: e.target.value as StatusPengecekan,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold"
                    >
                      <option value="Belum Diperiksa">Belum Diperiksa</option>
                      <option value="Sudah Diperiksa Siswa">Sudah Diperiksa Siswa</option>
                      <option value="Menunggu Verifikasi Admin">Menunggu Verifikasi Admin</option>
                      <option value="Terverifikasi Admin">Terverifikasi Admin</option>
                      <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md cursor-pointer"
                >
                  {isAddModalOpen ? 'Simpan Siswa' : 'Perbarui Data Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL LENGKAP SISWA */}
      {isDetailModalOpen && currentStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden transform transition-all animate-scaleUp">
            <div className="p-6 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20">
                  DETAIL SISWA
                </span>
                <h3 className="text-xl font-black mt-1">{currentStudent.nama}</h3>
                <p className="text-xs text-sky-100">
                  Kelas {currentStudent.kelas} | NISN: {currentStudent.nisn || '-'}
                </p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-sky-100 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
              {/* Status */}
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-700">Status Pengecekan:</span>
                <span className="font-bold text-sky-700">{currentStudent.statusPengecekan}</span>
              </div>

              {/* Identitas */}
              <div>
                <h4 className="font-bold text-slate-900 border-b pb-1 mb-2">Identitas Siswa</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>NIPD: <strong className="font-mono">{currentStudent.nipd || '-'}</strong></div>
                  <div>NIK: <strong className="font-mono">{currentStudent.nik || '-'}</strong></div>
                  <div>Tempat, Tgl Lahir: <strong>{currentStudent.tempatLahir}, {currentStudent.tanggalLahir}</strong></div>
                  <div>Jenis Kelamin: <strong>{currentStudent.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</strong></div>
                  <div>Agama: <strong>{currentStudent.agama}</strong></div>
                  <div>PIP: <strong className="text-emerald-700">{currentStudent.menerimaPip}</strong></div>
                  <div className="col-span-2">Alamat: <strong>{currentStudent.alamat} RT {currentStudent.rt} RW {currentStudent.rw}, {currentStudent.dusun}, {currentStudent.kelurahan}, {currentStudent.kecamatan}</strong></div>
                </div>
              </div>

              {/* Data Orang Tua */}
              <div>
                <h4 className="font-bold text-slate-900 border-b pb-1 mb-2">Data Orang Tua</h4>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div className="p-2.5 bg-slate-50 rounded-lg space-y-1">
                    <div className="font-bold text-slate-900">Ayah Kandung:</div>
                    <div>Nama: <strong>{currentStudent.namaAyah || '-'}</strong></div>
                    <div>Thn Lahir: {currentStudent.tahunLahirAyah || '-'}</div>
                    <div>Pendidikan: {currentStudent.jenjangPendidikanAyah || '-'}</div>
                    <div>Pekerjaan: {currentStudent.pekerjaanAyah || '-'}</div>
                    <div>Penghasilan: {currentStudent.penghasilanAyah || '-'}</div>
                    <div>NIK Ayah: <span className="font-mono">{currentStudent.nikAyah || '-'}</span></div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg space-y-1">
                    <div className="font-bold text-slate-900">Ibu Kandung:</div>
                    <div>Nama: <strong>{currentStudent.namaIbu || '-'}</strong></div>
                    <div>Thn Lahir: {currentStudent.tahunLahirIbu || '-'}</div>
                    <div>Pendidikan: {currentStudent.jenjangPendidikanIbu || '-'}</div>
                    <div>Pekerjaan: {currentStudent.pekerjaanIbu || '-'}</div>
                    <div>Penghasilan: {currentStudent.penghasilanIbu || '-'}</div>
                    <div>NIK Ibu: <span className="font-mono">{currentStudent.nikIbu || '-'}</span></div>
                  </div>
                </div>
              </div>

              {currentStudent.catatanAdmin && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                  <strong>Catatan Operator/Admin:</strong> {currentStudent.catatanAdmin}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COPY-PASTE INPUT DARI EXCEL */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden transform transition-all animate-scaleUp">
            <div className="p-6 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Input Massal Siswa via Copy-Paste</h3>
                <p className="text-xs text-sky-100">
                  Salin tabel dari Excel lengkap dengan baris header, lalu tempel di kotak bawah.
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
                rows={8}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Tempel data tab-separated dari Excel di sini..."
                className="w-full p-4 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 bg-slate-50"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handlePasteParse}
                  disabled={!pasteText.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                >
                  Proses & Pratinjau Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRATINJAU IMPOR DATA SISWA (EXCEL / PASTE) */}
      {isImportModalOpen && parseResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden transform transition-all animate-scaleUp">
            <div className="p-6 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Pratinjau Impor Data Siswa</h3>
                <p className="text-xs text-sky-100">
                  Periksa kolom yang dipetakan secara otomatis sebelum disimpan ke database
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-sky-100 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              {/* Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl">
                  <div className="text-lg font-bold text-sky-700">{parseResult.totalRows}</div>
                  <div className="text-slate-500 font-medium">Total Baris Terbaca</div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="text-lg font-bold text-emerald-700">{parseResult.validRows}</div>
                  <div className="text-slate-500 font-medium">Baris Siap Diimpor</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-lg font-bold text-amber-700">{parseResult.duplicateRows}</div>
                  <div className="text-slate-500 font-medium">Duplikat Terdeteksi</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-lg font-bold text-slate-700">{Object.keys(parseResult.columnMapping).length}</div>
                  <div className="text-slate-500 font-medium">Kolom Cocok</div>
                </div>
              </div>

              {parseResult.missingRequired.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                  <strong>Kolom wajib belum ada:</strong> {parseResult.missingRequired.join(', ')}
                </div>
              )}

              {/* Table Preview */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">
                  Pratinjau 5 Baris Pertama:
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 font-bold">
                      <tr>
                        <th className="p-2">Nama</th>
                        <th className="p-2">Kelas</th>
                        <th className="p-2">JK</th>
                        <th className="p-2">NISN</th>
                        <th className="p-2">NIK</th>
                        <th className="p-2">Nama Ayah</th>
                        <th className="p-2">Nama Ibu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parseResult.rows.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          <td className="p-2 font-bold">{row.nama}</td>
                          <td className="p-2">{row.kelas}</td>
                          <td className="p-2">{row.jk}</td>
                          <td className="p-2 font-mono">{row.nisn}</td>
                          <td className="p-2 font-mono">{row.nik}</td>
                          <td className="p-2">{row.namaAyah}</td>
                          <td className="p-2">{row.namaIbu}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl"
              >
                Batalkan
              </button>
              <button
                type="button"
                disabled={parseResult.missingRequired.length > 0 || importLoading}
                onClick={handleCommitImport}
                className="px-6 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
              >
                {importLoading ? 'Menyimpan...' : `Simpan Semua Data (${parseResult.validRows} Siswa)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROCK-SOLID DELETE MODAL FOR SINGLE STUDENT (FIXED & WORKING!) */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title="Hapus Data Siswa"
        message={`Apakah Anda yakin ingin menghapus data siswa ini secara permanen dari Bank Data SMP Negeri 3 Kertek? Tindakan ini tidak dapat dibatalkan.`}
        itemName={deleteTarget ? `${deleteTarget.nama} (Kelas ${deleteTarget.kelas})` : ''}
        isLoading={isDeleting}
        onConfirm={handleConfirmSingleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ROCK-SOLID DELETE MODAL FOR BATCH STUDENTS (FIXED & WORKING!) */}
      <DeleteConfirmModal
        isOpen={isBatchDeleteModalOpen}
        title="Hapus Massal Siswa Terpilih"
        message={`Apakah Anda yakin ingin menghapus sebanyak ${selectedIds.length} data siswa yang dipilih sekaligus? Tindakan ini akan menghapus data secara permanen.`}
        itemName={`${selectedIds.length} Siswa Terpilih`}
        isLoading={isDeleting}
        onConfirm={handleConfirmBatchDelete}
        onCancel={() => setIsBatchDeleteModalOpen(false)}
      />
    </div>
  );
};
