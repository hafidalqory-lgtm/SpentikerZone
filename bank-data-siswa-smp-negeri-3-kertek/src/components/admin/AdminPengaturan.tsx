import React, { useState } from 'react';
import {
  Settings,
  Upload,
  Image as ImageIcon,
  Key,
  School,
  Database,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Code,
  Copy,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { AppConfig } from '../../types';
import { DEFAULT_LOGO_SVG, StorageService } from '../../services/storage';

interface AdminPengaturanProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => Promise<void>;
  onResetDatabase: () => Promise<void>;
}

export const AdminPengaturan: React.FC<AdminPengaturanProps> = ({
  config,
  onUpdateConfig,
  onResetDatabase,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'logo' | 'keamanan' | 'sekolah' | 'appscript' | 'backup'>('logo');

  // Logo upload state
  const [logoPreview, setLogoPreview] = useState(config.logoUrl);
  const [logoLoading, setLogoLoading] = useState(false);

  // Password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  // School info state
  const [namaSekolah, setNamaSekolah] = useState(config.namaSekolah);
  const [subjudul, setSubjudul] = useState(config.subjudul);
  const [npsn, setNpsn] = useState(config.npsn);
  const [alamatSekolah, setAlamatSekolah] = useState(config.alamatSekolah);
  const [kabupaten, setKabupaten] = useState(config.kabupaten);

  // Feedback states
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // 1. HANDLE UPLOAD LOGO (File Reader -> Base64)
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Harap pilih file gambar (PNG, JPG, SVG, atau WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Ukuran file gambar maksimal 2 MB.');
      return;
    }

    setLogoLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      setLogoPreview(base64Url);
      try {
        await onUpdateConfig({
          ...config,
          logoUrl: base64Url,
          lastUpdated: new Date().toISOString(),
        });
        showToast('success', 'Logo sekolah berhasil diperbarui dan tersimpan di database!');
      } catch (err: any) {
        showToast('error', `Gagal menyimpan logo: ${err.message}`);
      } finally {
        setLogoLoading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Reset to default logo
  const handleResetLogo = async () => {
    setLogoPreview(DEFAULT_LOGO_SVG);
    await onUpdateConfig({
      ...config,
      logoUrl: DEFAULT_LOGO_SVG,
      lastUpdated: new Date().toISOString(),
    });
    showToast('success', 'Logo sekolah dikembalikan ke lambang resmi SMPN 3 Kertek.');
  };

  // 2. HANDLE GANTI PASSWORD
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPass !== config.adminPassword) {
      showToast('error', 'Password saat ini salah.');
      return;
    }
    if (newPass.length < 5) {
      showToast('error', 'Password baru minimal 5 karakter.');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('error', 'Konfirmasi password baru tidak cocok.');
      return;
    }

    await onUpdateConfig({
      ...config,
      adminPassword: newPass,
      lastUpdated: new Date().toISOString(),
    });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    showToast('success', 'Password administrator berhasil diperbarui!');
  };

  // 3. HANDLE SIMPAN IDENTITAS SEKOLAH
  const handleSaveSchoolInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateConfig({
      ...config,
      namaSekolah: namaSekolah.trim(),
      subjudul: subjudul.trim(),
      npsn: npsn.trim(),
      alamatSekolah: alamatSekolah.trim(),
      kabupaten: kabupaten.trim(),
      lastUpdated: new Date().toISOString(),
    });
    showToast('success', 'Informasi identitas sekolah berhasil diperbarui!');
  };

  // 4. BACKUP & RESTORE
  const handleDownloadBackup = async () => {
    const jsonStr = await StorageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_BankData_SMPN3Kertek_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'File backup database (.json) berhasil diunduh.');
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const ok = await StorageService.restoreDataFromJson(content);
      if (ok) {
        showToast('success', 'Database berhasil dipulihkan dari file backup!');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast('error', 'Format file backup tidak valid.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetAllData = async () => {
    if (
      window.confirm(
        'PERINGATAN: Seluruh data siswa, kelas, aduan, dan pengaturan akan dikembalikan ke data awal bawaan. Lanjutkan?'
      )
    ) {
      await onResetDatabase();
      showToast('success', 'Database telah direset ke data awal.');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Google Apps Script template code
  const appScriptCode = `// Code.gs - Google Apps Script Backend / Web App Host
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Bank Data Siswa SMP Negeri 3 Kertek')
    .setFaviconUrl('https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_Tut_Wuri_Handayani.png/600px-Logo_Tut_Wuri_Handayani.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Optional helper for Google Sheets integration
function getSheetData(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  return sheet.getDataRange().getValues();
}
`;

  const copyAppScript = () => {
    navigator.clipboard.writeText(appScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between animate-scaleUp ${
            toastMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-semibold">{toastMsg.text}</span>
          </div>
          <button
            onClick={() => setToastMsg(null)}
            className="text-xs font-bold text-slate-700 hover:text-slate-900"
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
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Pengaturan Sistem & Database</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kustomisasi logo sekolah, password admin, panduan Google Apps Script, dan pemeliharaan database
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'logo', label: 'Ubah Logo Sekolah', icon: ImageIcon },
          { id: 'keamanan', label: 'Password & Keamanan', icon: Key },
          { id: 'sekolah', label: 'Identitas Sekolah', icon: School },
          { id: 'appscript', label: 'Panduan Apps Script', icon: Code },
          { id: 'backup', label: 'Backup & Restore', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 ring-2 ring-sky-600/20'
                  : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. UBAH LOGO DENGAN DIUPLOAD */}
      {activeSubTab === 'logo' && (
        <div className="bg-white rounded-3xl border border-sky-100 p-6 md:p-8 shadow-sm space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Kustomisasi Logo Sekolah</h3>
            <p className="text-xs text-slate-500 mt-1">
              Unggah file logo baru sekolah (PNG, JPG, SVG, WEBP). Logo akan langsung tampil di seluruh halaman dan tersimpan permanen di database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Live Preview Box */}
            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-dashed border-sky-300 rounded-3xl text-center">
              <div className="w-36 h-36 rounded-2xl bg-white p-3 shadow-xl border border-slate-200 flex items-center justify-center mb-4">
                <img
                  src={logoPreview}
                  alt="Pratinjau Logo"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>
              <span className="text-xs font-bold text-slate-700">Pratinjau Logo Aktif</span>
              <span className="text-[11px] text-slate-500 mt-0.5">{config.namaSekolah}</span>
            </div>

            {/* Upload Controls */}
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Unggah Gambar Baru dari Komputer / HP
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  onChange={handleLogoFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-2">
                  Format disarankan: PNG transparan atau SVG. Ukuran ideal 200x200 pixel.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>Kembalikan ke Logo Default</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. GANTI PASSWORD */}
      {activeSubTab === 'keamanan' && (
        <div className="bg-white rounded-3xl border border-sky-100 p-6 md:p-8 shadow-sm space-y-6 max-w-xl animate-fadeIn">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Keamanan & Password Administrator</h3>
            <p className="text-xs text-slate-500 mt-1">
              Perbarui kata sandi masuk untuk mengamankan akses data pribadi seluruh siswa.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password Baru
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Minimal 5 karakter"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Konfirmasi Password Baru
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md cursor-pointer"
              >
                Simpan Password Baru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. IDENTITAS SEKOLAH */}
      {activeSubTab === 'sekolah' && (
        <div className="bg-white rounded-3xl border border-sky-100 p-6 md:p-8 shadow-sm space-y-6 max-w-2xl animate-fadeIn">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Identitas Sekolah & Aplikasi</h3>
            <p className="text-xs text-slate-500 mt-1">
              Data instansi yang tampil pada header aplikasi dan laporan hasil ekspor
            </p>
          </div>

          <form onSubmit={handleSaveSchoolInfo} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Resmi Sekolah
                </label>
                <input
                  type="text"
                  required
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  NPSN
                </label>
                <input
                  type="text"
                  value={npsn}
                  onChange={(e) => setNpsn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subjudul / Slogan Aplikasi
                </label>
                <input
                  type="text"
                  value={subjudul}
                  onChange={(e) => setSubjudul(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alamat Lengkap Sekolah
                </label>
                <input
                  type="text"
                  value={alamatSekolah}
                  onChange={(e) => setAlamatSekolah(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kabupaten / Kota
                </label>
                <input
                  type="text"
                  value={kabupaten}
                  onChange={(e) => setKabupaten(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md cursor-pointer"
              >
                Simpan Identitas Sekolah
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. PANDUAN GOOGLE APPS SCRIPT (APPSCRIPTS) */}
      {activeSubTab === 'appscript' && (
        <div className="bg-white rounded-3xl border border-sky-100 p-6 md:p-8 shadow-sm space-y-6 animate-fadeIn">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 mb-2">
              <Code className="w-3.5 h-3.5" />
              <span>DEPLOYMENT KE GOOGLE APPS SCRIPT</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Petunjuk Hosting di Google Apps Script (HTMLService)
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Aplikasi ini adalah Single Page Application (SPA) mandiri yang 100% kompatibel dan siap di-hosting secara gratis di Google Apps Script / Google Drive sekolah tanpa membutuhkan server luar atau API key tambahan.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
              <h4 className="font-bold text-sky-950 text-sm">Langkah-langkah Mudah:</h4>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed font-medium">
                <li>Buka Google Drive Anda, klik <strong>Baru (New) &gt; Lainnya (More) &gt; Google Apps Script</strong>.</li>
                <li>Beri nama proyek: <strong>Bank Data Siswa SMP Negeri 3 Kertek</strong>.</li>
                <li>Pada file <code>Code.gs</code>, salin kode di bawah ini.</li>
                <li>Build atau salin file bundle HTML dari proyek ini ke dalam file <code>index.html</code> di Apps Script.</li>
                <li>Klik tombol <strong>Deploy (Terapkan) &gt; New deployment (Penerapan baru)</strong>.</li>
                <li>Pilih jenis <strong>Web app (Aplikasi Web)</strong>.</li>
                <li>Atur: <em>Execute as: Me</em> dan <em>Who has access: Anyone (Siapa saja)</em>.</li>
                <li>Klik <strong>Deploy</strong> dan bagikan URL Web App yang dihasilkan kepada siswa dan staf!</li>
              </ol>
            </div>

            {/* Code snippet block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-slate-700">Code.gs (Apps Script):</span>
                <button
                  onClick={copyAppScript}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Kode Code.gs'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs overflow-x-auto">
                {appScriptCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 5. BACKUP & RESTORE DATABASE */}
      {activeSubTab === 'backup' && (
        <div className="bg-white rounded-3xl border border-sky-100 p-6 md:p-8 shadow-sm space-y-6 max-w-2xl animate-fadeIn">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Cadangan & Pemulihan Database (Backup & Restore)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Simpan seluruh database siswa, kelas, dan aduan ke komputer Anda dalam format file JSON, atau pulihkan dari file cadangan sebelumnya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Download Backup */}
            <div className="p-5 border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between bg-slate-50">
              <div>
                <h4 className="font-bold text-xs text-slate-900 uppercase">1. Unduh Cadangan (Backup)</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Menghasilkan file .json berisi seluruh data siswa, kelas, dan aduan Spentiker.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Backup JSON</span>
              </button>
            </div>

            {/* Restore Backup */}
            <div className="p-5 border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between bg-slate-50">
              <div>
                <h4 className="font-bold text-xs text-slate-900 uppercase">2. Pulihkan (Restore)</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Unggah file backup .json yang telah diunduh sebelumnya untuk mengembalikan data.
                </p>
              </div>
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl shadow-xs cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Pilih File Backup JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Danger zone */}
          <div className="pt-4 border-t border-rose-100">
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-rose-900 uppercase tracking-wide">
                  Reset Database ke Bawaan
                </h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  Kembalikan seluruh data siswa, kelas, dan aduan ke data awal SMP Negeri 3 Kertek.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetAllData}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shrink-0 cursor-pointer"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
