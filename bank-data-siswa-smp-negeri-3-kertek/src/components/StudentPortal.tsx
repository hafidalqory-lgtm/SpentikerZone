import React, { useState } from 'react';
import { 
  UserCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RotateCcw, 
  Save, 
  Check, 
  ArrowLeft, 
  ShieldAlert,
  User,
  HeartHandshake,
  CreditCard,
  Building,
  Info
} from 'lucide-react';
import { Student, KelasItem, StatusPIP } from '../types';

interface StudentPortalProps {
  student: Student;
  classes: KelasItem[];
  onConfirmCorrect: (studentId: string) => Promise<void>;
  onSubmitChanges: (studentId: string, changes: Partial<Student>, summaryText: string) => Promise<void>;
  onExit: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  classes,
  onConfirmCorrect,
  onSubmitChanges,
  onExit,
}) => {
  // Form state initialized to current stored student values
  const [formData, setFormData] = useState<Student>({ ...student });
  const [activeTab, setActiveTab] = useState<'identitas' | 'ayah' | 'ibu' | 'pip'>('identitas');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Field change handler
  const handleChange = (field: keyof Student, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Compute modified fields
  const getModifiedFields = () => {
    const diff: { label: string; field: keyof Student; oldVal: string; newVal: string }[] = [];
    const fieldsToCompare: { key: keyof Student; label: string }[] = [
      { key: 'nama', label: 'Nama Lengkap' },
      { key: 'nipd', label: 'NIPD' },
      { key: 'jk', label: 'Jenis Kelamin' },
      { key: 'nisn', label: 'NISN' },
      { key: 'tempatLahir', label: 'Tempat Lahir' },
      { key: 'tanggalLahir', label: 'Tanggal Lahir' },
      { key: 'nik', label: 'NIK Siswa' },
      { key: 'agama', label: 'Agama' },
      { key: 'alamat', label: 'Alamat' },
      { key: 'rt', label: 'RT' },
      { key: 'rw', label: 'RW' },
      { key: 'dusun', label: 'Dusun' },
      { key: 'kelurahan', label: 'Kelurahan/Desa' },
      { key: 'kecamatan', label: 'Kecamatan' },
      { key: 'kelas', label: 'Kelas' },

      // Ayah
      { key: 'namaAyah', label: 'Nama Ayah' },
      { key: 'tahunLahirAyah', label: 'Tahun Lahir Ayah' },
      { key: 'jenjangPendidikanAyah', label: 'Pendidikan Ayah' },
      { key: 'pekerjaanAyah', label: 'Pekerjaan Ayah' },
      { key: 'penghasilanAyah', label: 'Penghasilan Ayah' },
      { key: 'nikAyah', label: 'NIK Ayah' },

      // Ibu
      { key: 'namaIbu', label: 'Nama Ibu' },
      { key: 'tahunLahirIbu', label: 'Tahun Lahir Ibu' },
      { key: 'jenjangPendidikanIbu', label: 'Pendidikan Ibu' },
      { key: 'pekerjaanIbu', label: 'Pekerjaan Ibu' },
      { key: 'penghasilanIbu', label: 'Penghasilan Ibu' },
      { key: 'nikIbu', label: 'NIK Ibu' },

      // PIP
      { key: 'menerimaPip', label: 'Menerima Bantuan PIP' },
    ];

    fieldsToCompare.forEach((item) => {
      const oldV = String(student[item.key] || '').trim();
      const newV = String(formData[item.key] || '').trim();
      if (oldV !== newV) {
        diff.push({
          label: item.label,
          field: item.key,
          oldVal: oldV || '(Kosong)',
          newVal: newV || '(Kosong)',
        });
      }
    });

    return diff;
  };

  const modifiedFields = getModifiedFields();
  const hasChanges = modifiedFields.length > 0;

  // Handle "DATA SUDAH BENAR"
  const handleDataSudahBenar = async () => {
    if (hasChanges) {
      if (
        !window.confirm(
          'Anda telah melakukan perubahan pada formulir. Apakah Anda ingin mengabaikan perubahan dan menyatakan data asli sudah benar?'
        )
      ) {
        return;
      }
    }
    setIsSubmitting(true);
    try {
      await onConfirmCorrect(student.id);
      setFeedbackSuccess('Terima kasih! Status data Anda telah diperbarui menjadi "Sudah Diperiksa Siswa".');
      setFormData({ ...student, statusPengecekan: 'Sudah Diperiksa Siswa' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to initial
  const handleReset = () => {
    setFormData({ ...student });
  };

  // Submit Changes to Admin
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const changesPayload: Partial<Student> = {};
      const summaryList: string[] = [];

      modifiedFields.forEach((item) => {
        (changesPayload as any)[item.field] = formData[item.field];
        summaryList.push(`${item.label}: ${item.oldVal} ➔ ${item.newVal}`);
      });

      await onSubmitChanges(student.id, changesPayload, summaryList.join('; '));
      setShowSummaryModal(false);
      setFeedbackSuccess(
        'Perubahan data berhasil disimpan dan menunggu verifikasi admin sekolah. Terima kasih telah melakukan pengecekan data!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status badge styling
  const renderStatusBadge = () => {
    switch (student.statusPengecekan) {
      case 'Terverifikasi Admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Terverifikasi Admin
          </span>
        );
      case 'Menunggu Verifikasi Admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Menunggu Verifikasi Admin
          </span>
        );
      case 'Sudah Diperiksa Siswa':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-sky-100 text-sky-800 border border-sky-300">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            Sudah Diperiksa Siswa
          </span>
        );
      case 'Perlu Perbaikan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            Perlu Perbaikan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-300">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
            Belum Diperiksa
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-900 bg-white hover:bg-sky-50 px-4 py-2 rounded-xl border border-sky-200 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Utama</span>
        </button>

        <div className="text-right">
          <div className="text-xs text-slate-500 font-medium">Status Pengecekan Saat Ini</div>
          <div className="mt-1">{renderStatusBadge()}</div>
        </div>
      </div>

      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-blue-800 text-white rounded-3xl p-6 md:p-8 shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-72 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-900 mb-2.5">
              PORTAL MANDIRI SISWA
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              PERIKSA DAN VALIDASI DATA DIRI
            </h1>
            <p className="mt-2 text-sm md:text-base text-sky-100 max-w-2xl leading-relaxed">
              Silakan periksa seluruh data diri dan data orang tua Anda. Jika terdapat kesalahan, silakan lakukan perbaikan pada kolom yang sesuai, kemudian simpan perubahan untuk diperiksa oleh admin sekolah.
            </p>
          </div>

          {/* Student Profile Quick Capsule */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shrink-0 min-w-[240px]">
            <div className="text-xs font-bold text-sky-200 uppercase tracking-wider">Identitas Terpilih</div>
            <div className="text-lg font-black text-white mt-0.5">{student.nama}</div>
            <div className="text-xs text-sky-100 mt-1 flex items-center gap-2">
              <span>Kelas: <strong className="text-white">{student.kelas}</strong></span>
              <span>•</span>
              <span>NISN: <strong className="text-white">{student.nisn || '-'}</strong></span>
            </div>
            <div className="text-[11px] text-sky-200/80 mt-1">
              Pembaruan: {student.terakhirDiperbarui || 'Baru saja'}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Notes Alert if Perlu Perbaikan */}
      {student.statusPengecekan === 'Perlu Perbaikan' && student.catatanAdmin && (
        <div className="mb-6 p-4 md:p-5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-950 flex items-start gap-4 shadow-sm animate-pulse">
          <div className="p-2 bg-rose-200 text-rose-800 rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-rose-900">Catatan Perbaikan dari Operator/Admin Sekolah:</h4>
            <p className="text-sm mt-1 text-rose-800 leading-relaxed font-medium">
              "{student.catatanAdmin}"
            </p>
            <p className="text-xs text-rose-600 mt-2">
              Mohon teliti kolom yang disebutkan di atas dan perbaiki data Anda dengan benar sebelum menyimpan kembali.
            </p>
          </div>
        </div>
      )}

      {/* Success Notification Feedback */}
      {feedbackSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 flex items-center justify-between gap-4 animate-scaleUp">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold text-emerald-900">{feedbackSuccess}</p>
          </div>
          <button
            onClick={() => setFeedbackSuccess(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-3 py-1 bg-emerald-100 rounded-lg"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Form Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('identitas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'identitas'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 ring-2 ring-sky-600/20'
              : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>1. Identitas Siswa</span>
        </button>

        <button
          onClick={() => setActiveTab('ayah')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'ayah'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 ring-2 ring-sky-600/20'
              : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>2. Data Ayah</span>
        </button>

        <button
          onClick={() => setActiveTab('ibu')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'ibu'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 ring-2 ring-sky-600/20'
              : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>3. Data Ibu</span>
        </button>

        <button
          onClick={() => setActiveTab('pip')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'pip'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 ring-2 ring-sky-600/20'
              : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>4. Program PIP</span>
        </button>
      </div>

      {/* Main Form Body */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-xl p-6 md:p-8 space-y-6">
        {/* TAB 1: IDENTITAS SISWA */}
        {activeTab === 'identitas' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-sky-600" />
                <span>Bagian 1: Identitas Siswa</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Periksa kesesuaian Nama, NISN, NIK, dan data domisili dengan Kartu Keluarga / Akta Kelahiran.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Nama */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => handleChange('nama', e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-semibold text-slate-900 uppercase"
                />
              </div>

              {/* Kelas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kelas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.kelas}
                  onChange={(e) => handleChange('kelas', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-semibold text-slate-900 bg-white"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.nama}>
                      {cls.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* NIPD */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  NIPD (Nomor Induk)
                </label>
                <input
                  type="text"
                  value={formData.nipd}
                  onChange={(e) => handleChange('nipd', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-mono text-slate-900"
                />
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jenis Kelamin (JK)
                </label>
                <select
                  value={formData.jk}
                  onChange={(e) => handleChange('jk', e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-900 bg-white"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              {/* NISN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  NISN (10 Digit)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.nisn}
                  onChange={(e) => handleChange('nisn', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-mono text-slate-900"
                />
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  value={formData.tempatLahir}
                  onChange={(e) => handleChange('tempatLahir', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-900"
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tanggal Lahir (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={formData.tanggalLahir}
                  onChange={(e) => handleChange('tanggalLahir', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-900"
                />
              </div>

              {/* NIK Siswa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  NIK Siswa (16 Digit KK)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.nik}
                  onChange={(e) => handleChange('nik', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-mono text-slate-900"
                />
              </div>

              {/* Agama */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Agama
                </label>
                <select
                  value={formData.agama}
                  onChange={(e) => handleChange('agama', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-900 bg-white"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Khonghucu">Khonghucu</option>
                </select>
              </div>

              {/* Alamat */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alamat Jalan / Kampung
                </label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => handleChange('alamat', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-900"
                />
              </div>

              {/* RT & RW */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    RT
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={formData.rt}
                    onChange={(e) => handleChange('rt', e.target.value)}
                    placeholder="01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    RW
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={formData.rw}
                    onChange={(e) => handleChange('rw', e.target.value)}
                    placeholder="02"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Dusun */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dusun
                </label>
                <input
                  type="text"
                  value={formData.dusun}
                  onChange={(e) => handleChange('dusun', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-900"
                />
              </div>

              {/* Kelurahan / Desa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kelurahan / Desa
                </label>
                <input
                  type="text"
                  value={formData.kelurahan}
                  onChange={(e) => handleChange('kelurahan', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-900"
                />
              </div>

              {/* Kecamatan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kecamatan
                </label>
                <input
                  type="text"
                  value={formData.kecamatan}
                  onChange={(e) => handleChange('kecamatan', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DATA AYAH */}
        {activeTab === 'ayah' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-sky-600" />
                <span>Bagian 2: Data Ayah Kandung</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Data ayah kandung sesuai yang tercantum pada Kartu Keluarga (KK).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Ayah
                </label>
                <input
                  type="text"
                  value={formData.namaAyah}
                  onChange={(e) => handleChange('namaAyah', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tahun Lahir Ayah (YYYY)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.tahunLahirAyah}
                  onChange={(e) => handleChange('tahunLahirAyah', e.target.value)}
                  placeholder="1980"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jenjang Pendidikan Ayah
                </label>
                <select
                  value={formData.jenjangPendidikanAyah}
                  onChange={(e) => handleChange('jenjangPendidikanAyah', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-900 bg-white"
                >
                  <option value="">- Pilih Pendidikan -</option>
                  <option value="Tidak Sekolah">Tidak Sekolah</option>
                  <option value="SD Sederajat">SD Sederajat</option>
                  <option value="SMP Sederajat">SMP Sederajat</option>
                  <option value="SMA Sederajat">SMA Sederajat</option>
                  <option value="D1/D2/D3">D1/D2/D3</option>
                  <option value="D4/S1">D4/S1</option>
                  <option value="S2/S3">S2/S3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pekerjaan Ayah
                </label>
                <select
                  value={formData.pekerjaanAyah}
                  onChange={(e) => handleChange('pekerjaanAyah', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-900 bg-white"
                >
                  <option value="">- Pilih Pekerjaan -</option>
                  <option value="Tidak Bekerja">Tidak Bekerja</option>
                  <option value="Petani">Petani</option>
                  <option value="Buruh Tani">Buruh Tani</option>
                  <option value="Buruh Bangunan">Buruh Bangunan</option>
                  <option value="Pedagang">Pedagang</option>
                  <option value="Wiraswasta">Wiraswasta</option>
                  <option value="Karyawan Swasta">Karyawan Swasta</option>
                  <option value="PNS/TNI/Polri">PNS/TNI/Polri</option>
                  <option value="Sudah Meninggal">Sudah Meninggal</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Penghasilan Ayah
                </label>
                <select
                  value={formData.penghasilanAyah}
                  onChange={(e) => handleChange('penghasilanAyah', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-900 bg-white"
                >
                  <option value="">- Pilih Rentang Penghasilan -</option>
                  <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                  <option value="Kurang dari Rp 1.000.000">Kurang dari Rp 1.000.000</option>
                  <option value="Rp 1.000.000 - Rp 1.999.999">Rp 1.000.000 - Rp 1.999.999</option>
                  <option value="Rp 2.000.000 - Rp 4.999.999">Rp 2.000.000 - Rp 4.999.999</option>
                  <option value="Rp 5.000.000 - Rp 20.000.000">Rp 5.000.000 - Rp 20.000.000</option>
                  <option value="Lebih dari Rp 20.000.000">Lebih dari Rp 20.000.000</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  NIK Ayah (16 Digit)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.nikAyah}
                  onChange={(e) => handleChange('nikAyah', e.target.value)}
                  placeholder="3307xxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-mono text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATA IBU */}
        {activeTab === 'ibu' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-sky-600" />
                <span>Bagian 3: Data Ibu Kandung</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Data ibu kandung sesuai yang tercantum pada Kartu Keluarga (KK).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Ibu Kandung
                </label>
                <input
                  type="text"
                  value={formData.namaIbu}
                  onChange={(e) => handleChange('namaIbu', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tahun Lahir Ibu (YYYY)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.tahunLahirIbu}
                  onChange={(e) => handleChange('tahunLahirIbu', e.target.value)}
                  placeholder="1983"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jenjang Pendidikan Ibu
                </label>
                <select
                  value={formData.jenjangPendidikanIbu}
                  onChange={(e) => handleChange('jenjangPendidikanIbu', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-900 bg-white"
                >
                  <option value="">- Pilih Pendidikan -</option>
                  <option value="Tidak Sekolah">Tidak Sekolah</option>
                  <option value="SD Sederajat">SD Sederajat</option>
                  <option value="SMP Sederajat">SMP Sederajat</option>
                  <option value="SMA Sederajat">SMA Sederajat</option>
                  <option value="D1/D2/D3">D1/D2/D3</option>
                  <option value="D4/S1">D4/S1</option>
                  <option value="S2/S3">S2/S3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pekerjaan Ibu
                </label>
                <select
                  value={formData.pekerjaanIbu}
                  onChange={(e) => handleChange('pekerjaanIbu', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-900 bg-white"
                >
                  <option value="">- Pilih Pekerjaan -</option>
                  <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                  <option value="Petani">Petani</option>
                  <option value="Buruh Tani">Buruh Tani</option>
                  <option value="Pedagang">Pedagang</option>
                  <option value="Wiraswasta">Wiraswasta</option>
                  <option value="Karyawan Swasta">Karyawan Swasta</option>
                  <option value="PNS/TNI/Polri">PNS/TNI/Polri</option>
                  <option value="Sudah Meninggal">Sudah Meninggal</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Penghasilan Ibu
                </label>
                <select
                  value={formData.penghasilanIbu}
                  onChange={(e) => handleChange('penghasilanIbu', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-900 bg-white"
                >
                  <option value="">- Pilih Rentang Penghasilan -</option>
                  <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                  <option value="Kurang dari Rp 1.000.000">Kurang dari Rp 1.000.000</option>
                  <option value="Rp 1.000.000 - Rp 1.999.999">Rp 1.000.000 - Rp 1.999.999</option>
                  <option value="Rp 2.000.000 - Rp 4.999.999">Rp 2.000.000 - Rp 4.999.999</option>
                  <option value="Rp 5.000.000 - Rp 20.000.000">Rp 5.000.000 - Rp 20.000.000</option>
                  <option value="Lebih dari Rp 20.000.000">Lebih dari Rp 20.000.000</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  NIK Ibu (16 Digit)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.nikIbu}
                  onChange={(e) => handleChange('nikIbu', e.target.value)}
                  placeholder="3307xxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-mono text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROGRAM INDONESIA PINTAR (PIP) */}
        {activeTab === 'pip' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-600" />
                <span>Bagian 4: Program Indonesia Pintar (PIP)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Informasi kepemilikan dan penerimaan bantuan PIP (Program Indonesia Pintar).
              </p>
            </div>

            <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-6">
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Apakah Anda menerima bantuan PIP?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'Ya', label: 'Ya, Menerima PIP', desc: 'Memiliki KIP / Buku Rekening SimPel aktif' },
                  { value: 'Tidak', label: 'Tidak Menerima PIP', desc: 'Bukan penerima bantuan PIP' },
                  { value: 'Belum Diketahui', label: 'Belum Mengetahui', desc: 'Sedang dalam pengajuan / belum pasti' },
                ].map((item) => {
                  const isChecked = formData.menerimaPip === item.value;
                  return (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => handleChange('menerimaPip', item.value)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'border-sky-600 bg-white ring-2 ring-sky-500 shadow-md font-bold'
                          : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-extrabold text-slate-900">{item.label}</span>
                        {isChecked && <Check className="w-4 h-4 text-sky-600 stroke-[3]" />}
                      </div>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Global Action Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                {modifiedFields.length} kolom data telah Anda ubah
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
            {/* Kembalikan ke Data Awal */}
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasChanges || isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Kembalikan ke Data Awal</span>
            </button>

            {/* Data Sudah Benar */}
            <button
              type="button"
              onClick={handleDataSudahBenar}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-sky-800 bg-sky-100 hover:bg-sky-200 active:bg-sky-300 border border-sky-300 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 text-sky-700" />
              <span>DATA SUDAH BENAR</span>
            </button>

            {/* Simpan Perubahan */}
            <button
              type="button"
              onClick={() => setShowSummaryModal(true)}
              disabled={!hasChanges || isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 rounded-xl shadow-md shadow-sky-600/30 transition-all cursor-pointer disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              <span>SIMPAN PERBAIKAN</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUMMARY CONFIRMATION MODAL BEFORE SUBMITTING */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden transform transition-all animate-scaleUp">
            <div className="p-6 bg-gradient-to-r from-sky-600 via-sky-700 to-blue-800 text-white">
              <h3 className="text-xl font-bold tracking-tight">
                Ringkasan Perubahan Data
              </h3>
              <p className="text-xs text-sky-100 mt-1">
                Periksa kembali daftar perubahan sebelum diajukan ke operator/admin SMP Negeri 3 Kertek.
              </p>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Daftar Kolom yang Diperbaiki ({modifiedFields.length})
              </div>

              {modifiedFields.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-slate-800">{item.label}</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200 line-through">
                      Lama: {item.oldVal}
                    </div>
                    <div className="text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200 font-semibold">
                      Baru: {item.newVal}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Kembali Edit
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Perubahan ke Admin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
