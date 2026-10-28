import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  MessageSquarePlus,
  UserCheck,
  Search,
  CheckCircle,
  HelpCircle,
  School,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  Users,
  AlertTriangle,
  Menu,
  ChevronRight
} from 'lucide-react';

import {
  Student,
  KelasItem,
  SpentikerReport,
  AppConfig,
  StatusPengecekan
} from './types';

import { StorageService, DEFAULT_CONFIG } from './services/storage';

// Components
import { SplashScreen } from './components/SplashScreen';
import { Navbar } from './components/Navbar';
import { AdminLoginModal } from './components/AdminLoginModal';
import { StudentPortal } from './components/StudentPortal';
import { LaporSpentikerSection } from './components/LaporSpentikerSection';

// Admin Views
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminDataKelas } from './components/admin/AdminDataKelas';
import { AdminDataMurid } from './components/admin/AdminDataMurid';
import { AdminPengecekanData } from './components/admin/AdminPengecekanData';
import { AdminFilterView } from './components/admin/AdminFilterView';
import { AdminLaporSpentiker } from './components/admin/AdminLaporSpentiker';
import { AdminRekapitulasi } from './components/admin/AdminRekapitulasi';
import { AdminDownloadExcel } from './components/admin/AdminDownloadExcel';
import { AdminPengaturan } from './components/admin/AdminPengaturan';

export default function App() {
  // Application State
  const [showSplash, setShowSplash] = useState(true);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [classes, setClasses] = useState<KelasItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<SpentikerReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation State
  // 'home' | 'student-portal' | 'admin'
  const [currentView, setCurrentView] = useState<'home' | 'student-portal' | 'admin'>('home');
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Student Login Selection State
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [verificationInput, setVerificationInput] = useState('');
  const [studentLoginError, setStudentLoginError] = useState('');
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  // Load database on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [loadedConfig, loadedClasses, loadedStudents, loadedReports] = await Promise.all([
          StorageService.getConfig(),
          StorageService.getClasses(),
          StorageService.getStudents(),
          StorageService.getReports(),
        ]);
        setConfig(loadedConfig);
        setClasses(loadedClasses);
        setStudents(loadedStudents);
        setReports(loadedReports);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter students based on currently selected class in Home
  const availableStudentsForClass = students.filter(
    (s) => s.kelas.trim().toUpperCase() === selectedKelas.trim().toUpperCase()
  );

  // Reset student dropdown when class changes
  const handleClassSelectionChange = (newClass: string) => {
    setSelectedKelas(newClass);
    setSelectedStudentId('');
    setStudentLoginError('');
  };

  // Student Portal Login
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentLoginError('');

    if (!selectedKelas) {
      setStudentLoginError('Silakan pilih kelas Anda terlebih dahulu.');
      return;
    }
    if (!selectedStudentId) {
      setStudentLoginError('Silakan pilih nama Anda dari daftar.');
      return;
    }

    const matched = students.find((s) => s.id === selectedStudentId && s.kelas === selectedKelas);
    if (!matched) {
      setStudentLoginError('Data siswa tidak ditemukan. Silakan hubungi admin sekolah.');
      return;
    }

    // Optional verification check (NISN or Tanggal Lahir) if student has NISN
    if (matched.nisn && matched.nisn.length >= 4) {
      const cleanVerify = verificationInput.trim();
      const last4Nisn = matched.nisn.slice(-4);
      if (cleanVerify && cleanVerify !== last4Nisn && cleanVerify !== matched.nisn) {
        setStudentLoginError('Verifikasi 4 digit terakhir NISN salah. Mohon periksa kembali.');
        return;
      }
    }

    setActiveStudent(matched);
    setCurrentView('student-portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Student Actions in Portal
  const handleStudentConfirmCorrect = async (studentId: string) => {
    const updated = await StorageService.updateStudent(studentId, {
      statusPengecekan: 'Sudah Diperiksa Siswa',
      pendingChanges: undefined,
    });
    setStudents(updated);
    const updatedStudent = updated.find((s) => s.id === studentId);
    if (updatedStudent) setActiveStudent(updatedStudent);
  };

  const handleStudentSubmitChanges = async (
    studentId: string,
    changes: Partial<Student>,
    summaryText: string
  ) => {
    const current = students.find((s) => s.id === studentId);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newHistoryItem = {
      id: `hist-${Date.now()}`,
      waktu: now,
      diubahOleh: 'Siswa',
      perubahan: {} as any,
      statusSebelumnya: current?.statusPengecekan || 'Belum Diperiksa',
      statusSesudahnya: 'Menunggu Verifikasi Admin' as StatusPengecekan,
      catatan: summaryText,
    };

    const updated = await StorageService.updateStudent(studentId, {
      statusPengecekan: 'Menunggu Verifikasi Admin',
      pendingChanges: changes,
      riwayatPerubahan: current?.riwayatPerubahan
        ? [newHistoryItem, ...current.riwayatPerubahan]
        : [newHistoryItem],
    });

    setStudents(updated);
    const updatedStudent = updated.find((s) => s.id === studentId);
    if (updatedStudent) setActiveStudent(updatedStudent);
  };

  // ADMIN CRUD HANDLERS (Rock-solid with persistent storage!)
  // 1. Classes
  const handleAddClass = async (cls: Omit<KelasItem, 'id'>) => {
    const updated = await StorageService.addClass(cls);
    setClasses(updated);
    return updated;
  };

  const handleUpdateClass = async (id: string, partial: Partial<KelasItem>) => {
    const updated = await StorageService.updateClass(id, partial);
    setClasses(updated);
    return updated;
  };

  const handleDeleteClass = async (id: string) => {
    const updated = await StorageService.deleteClass(id);
    setClasses(updated);
    return updated;
  };

  // 2. Students
  const handleAddStudent = async (studentData: Omit<Student, 'id' | 'terakhirDiperbarui'>) => {
    const updated = await StorageService.addStudent(studentData);
    setStudents(updated);
    return updated;
  };

  const handleUpdateStudent = async (id: string, partial: Partial<Student>) => {
    const updated = await StorageService.updateStudent(id, partial);
    setStudents(updated);
    return updated;
  };

  const handleDeleteStudent = async (id: string) => {
    const updated = await StorageService.deleteStudent(id);
    setStudents(updated);
    return updated;
  };

  const handleDeleteMultipleStudents = async (ids: string[]) => {
    const updated = await StorageService.deleteMultipleStudents(ids);
    setStudents(updated);
    return updated;
  };

  const handleBulkAddStudents = async (newItems: Omit<Student, 'id' | 'terakhirDiperbarui'>[]) => {
    let currentList = students;
    for (const item of newItems) {
      currentList = await StorageService.addStudent(item);
    }
    setStudents(currentList);
    return currentList;
  };

  // 3. Verification in Admin
  const handleApproveChanges = async (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    if (!target || !target.pendingChanges) return;

    const updated = await StorageService.updateStudent(studentId, {
      ...target.pendingChanges,
      statusPengecekan: 'Terverifikasi Admin',
      pendingChanges: undefined,
      catatanAdmin: undefined,
    });
    setStudents(updated);
  };

  const handleRequestRevision = async (studentId: string, note: string) => {
    const updated = await StorageService.updateStudent(studentId, {
      statusPengecekan: 'Perlu Perbaikan',
      catatanAdmin: note,
    });
    setStudents(updated);
  };

  const handleUpdateStatusOnly = async (
    studentId: string,
    newStatus: StatusPengecekan,
    note?: string
  ) => {
    const updated = await StorageService.updateStudent(studentId, {
      statusPengecekan: newStatus,
      catatanAdmin: note,
    });
    setStudents(updated);
  };

  // 4. Lapor Spentiker Reports
  const handleSubmitReport = async (
    reportData: Omit<SpentikerReport, 'id' | 'kodeAduan' | 'tanggal' | 'status'>
  ) => {
    const newReport = await StorageService.addReport(reportData);
    const updated = await StorageService.getReports();
    setReports(updated);
    return newReport;
  };

  const handleUpdateReport = async (id: string, partial: Partial<SpentikerReport>) => {
    const updated = await StorageService.updateReport(id, partial);
    setReports(updated);
    return updated;
  };

  const handleDeleteReport = async (id: string) => {
    const updated = await StorageService.deleteReport(id);
    setReports(updated);
    return updated;
  };

  // 5. Config & Database Maintenance
  const handleUpdateConfig = async (newConfig: AppConfig) => {
    await StorageService.saveConfig(newConfig);
    setConfig(newConfig);
  };

  const handleResetDatabase = async () => {
    await StorageService.resetDatabase();
    const [c, cl, s, r] = await Promise.all([
      StorageService.getConfig(),
      StorageService.getClasses(),
      StorageService.getStudents(),
      StorageService.getReports(),
    ]);
    setConfig(c);
    setClasses(cl);
    setStudents(s);
    setReports(r);
  };

  // Calculations for Badges
  const pendingChecksCount = students.filter(
    (s) => s.statusPengecekan === 'Menunggu Verifikasi Admin'
  ).length;
  const uninspectedCount = students.filter(
    (s) => s.statusPengecekan === 'Belum Diperiksa'
  ).length;
  const reportsCount = reports.filter((r) => r.status === 'Masuk' || r.status === 'Diproses').length;

  // Scroll to Spentiker section on home
  const handleScrollToSpentiker = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById('lapor-spentiker');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('lapor-spentiker');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-200">
      {/* 1. SPLASH SCREEN (Shows for exactly 3 seconds on initial app load) */}
      {showSplash && (
        <SplashScreen
          logoUrl={config.logoUrl}
          onFinish={() => setShowSplash(false)}
        />
      )}

      {/* 2. TOP NAVBAR */}
      <Navbar
        config={config}
        currentView={currentView}
        isAdminLoggedIn={isAdminLoggedIn}
        onNavigate={(view) => {
          if (view === 'admin') {
            if (isAdminLoggedIn) {
              setCurrentView('admin');
            } else {
              setIsAdminLoginModalOpen(true);
            }
          } else {
            setCurrentView('home');
          }
        }}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onOpenSpentiker={handleScrollToSpentiker}
      />

      {/* 3. VIEW ROUTER */}

      {/* VIEW: STUDENT PORTAL */}
      {currentView === 'student-portal' && activeStudent && (
        <main className="flex-1">
          <StudentPortal
            student={activeStudent}
            classes={classes}
            onConfirmCorrect={handleStudentConfirmCorrect}
            onSubmitChanges={handleStudentSubmitChanges}
            onExit={() => {
              setActiveStudent(null);
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      )}

      {/* VIEW: ADMIN DASHBOARD */}
      {currentView === 'admin' && isAdminLoggedIn && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <AdminSidebar
            currentTab={adminTab}
            config={config}
            pendingChecksCount={pendingChecksCount}
            uninspectedCount={uninspectedCount}
            reportsCount={reportsCount}
            isOpenMobile={isMobileSidebarOpen}
            onSelectTab={(tab) => setAdminTab(tab)}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onLogout={() => {
              setIsAdminLoggedIn(false);
              setCurrentView('home');
            }}
          />

          {/* Admin Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
            {/* Mobile Sidebar Toggle Button */}
            <div className="md:hidden flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 shadow-xs"
              >
                <Menu className="w-4 h-4 text-sky-600" />
                <span>Menu Admin</span>
              </button>
              <div className="text-xs font-bold text-sky-800 uppercase">
                {adminTab.replace('-', ' ')}
              </div>
            </div>

            {/* TAB: DASHBOARD */}
            {adminTab === 'dashboard' && (
              <AdminDashboard
                students={students}
                classes={classes}
                reports={reports}
                onNavigateTab={(tab) => setAdminTab(tab)}
              />
            )}

            {/* TAB: DATA KELAS */}
            {adminTab === 'kelas' && (
              <AdminDataKelas
                classes={classes}
                students={students}
                onAddClass={handleAddClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
              />
            )}

            {/* TAB: DATA MURID */}
            {adminTab === 'murid' && (
              <AdminDataMurid
                students={students}
                classes={classes}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onDeleteMultipleStudents={handleDeleteMultipleStudents}
                onBulkAddStudents={handleBulkAddStudents}
              />
            )}

            {/* TAB: PENGECEKAN DATA */}
            {adminTab === 'pengecekan' && (
              <AdminPengecekanData
                students={students}
                classes={classes}
                onApproveChanges={handleApproveChanges}
                onRequestRevision={handleRequestRevision}
                onUpdateStatusOnly={handleUpdateStatusOnly}
              />
            )}

            {/* TAB: DATA BELUM DIPERIKSA */}
            {adminTab === 'belum-diperiksa' && (
              <AdminFilterView
                mode="belum-diperiksa"
                students={students}
                classes={classes}
              />
            )}

            {/* TAB: DATA SUDAH DIPERIKSA */}
            {adminTab === 'sudah-diperiksa' && (
              <AdminFilterView
                mode="sudah-diperiksa"
                students={students}
                classes={classes}
              />
            )}

            {/* TAB: LAPOR SPENTIKER (REKAP & DIAGRAM) */}
            {adminTab === 'lapor-spentiker' && (
              <AdminLaporSpentiker
                reports={reports}
                onUpdateReport={handleUpdateReport}
                onDeleteReport={handleDeleteReport}
              />
            )}

            {/* TAB: REKAPITULASI */}
            {adminTab === 'rekapitulasi' && (
              <AdminRekapitulasi
                students={students}
                classes={classes}
              />
            )}

            {/* TAB: DOWNLOAD EXCEL (DIPERCANTIK) */}
            {adminTab === 'download-excel' && (
              <AdminDownloadExcel
                students={students}
                classes={classes}
                reports={reports}
              />
            )}

            {/* TAB: PENGATURAN (UPLOAD LOGO, GANTI PASSWORD, PANDUAN APPS SCRIPT) */}
            {adminTab === 'pengaturan' && (
              <AdminPengaturan
                config={config}
                onUpdateConfig={handleUpdateConfig}
                onResetDatabase={handleResetDatabase}
              />
            )}
          </main>
        </div>
      )}

      {/* VIEW: HOME PAGE */}
      {currentView === 'home' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full space-y-12 animate-fadeIn">
          {/* HERO CARD: PENGECEKAN DATA SISWA */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-sky-200 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/90 p-6 sm:p-10 lg:p-12">
            {/* Soft decorative background circles */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-blue-300/30 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Heading & Description */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold text-sky-800 bg-sky-100 border border-sky-300/80 uppercase tracking-widest shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  PORTAL RESMI SMP NEGERI 3 KERTEK
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  PENGECEKAN DATA SISWA
                </h1>

                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                  “Silakan masuk menggunakan kelas dan nama untuk memeriksa serta memastikan kebenaran data pribadi Anda.”
                </p>

                {/* Educational badges */}
                <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white/90 rounded-2xl border border-sky-100 shadow-xs">
                    <div className="text-lg font-black text-sky-700 font-mono">{classes.length}</div>
                    <div className="text-xs text-slate-500 font-medium">Kelas / Rombel</div>
                  </div>
                  <div className="p-3 bg-white/90 rounded-2xl border border-sky-100 shadow-xs">
                    <div className="text-lg font-black text-sky-700 font-mono">{students.length}</div>
                    <div className="text-xs text-slate-500 font-medium">Siswa Terdata</div>
                  </div>
                  <div className="p-3 bg-white/90 rounded-2xl border border-sky-100 shadow-xs col-span-2 sm:col-span-1">
                    <div className="text-lg font-black text-emerald-600 font-mono">100% Sah</div>
                    <div className="text-xs text-slate-500 font-medium">Data Dapodik</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Student Login Box */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-100 relative">
                  <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Masuk Menu Siswa
                      </h3>
                      <p className="text-xs text-slate-400">
                        Pilih kelas lalu cari nama Anda
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    {studentLoginError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-shake">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{studentLoginError}</span>
                      </div>
                    )}

                    {/* Step 1: Pilih Kelas */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        1. Pilih Kelas <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedKelas}
                        onChange={(e) => handleClassSelectionChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-xs"
                      >
                        <option value="">-- Pilih Kelas Anda --</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.nama}>
                            Kelas {c.nama} {c.waliKelas ? `(${c.waliKelas})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Step 2: Pilih Nama Siswa */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        2. Pilih Nama Siswa <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        disabled={!selectedKelas}
                        value={selectedStudentId}
                        onChange={(e) => {
                          setSelectedStudentId(e.target.value);
                          setStudentLoginError('');
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-xs ${
                          selectedKelas
                            ? 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-sky-500'
                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <option value="">
                          {selectedKelas
                            ? `-- Pilih Nama Siswa (${availableStudentsForClass.length} Terdaftar) --`
                            : '-- Pilih Kelas Terlebih Dahulu --'}
                        </option>
                        {availableStudentsForClass.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nama} {s.nisn ? `(NISN: ...${s.nisn.slice(-4)})` : ''}
                          </option>
                        ))}
                      </select>
                      {selectedKelas && availableStudentsForClass.length === 0 && (
                        <p className="text-[11px] text-amber-600 mt-1 font-medium">
                          Belum ada data siswa terdaftar di kelas ini. Silakan hubungi admin sekolah.
                        </p>
                      )}
                    </div>

                    {/* Step 3: Verifikasi 4 Digit Terakhir NISN (Keamanan Ringan) */}
                    {selectedStudentId && (
                      <div className="animate-fadeIn">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          3. Kode Verifikasi (Opsional / 4 Digit NISN)
                        </label>
                        <input
                          type="text"
                          maxLength={10}
                          value={verificationInput}
                          onChange={(e) => setVerificationInput(e.target.value)}
                          placeholder="Masukkan 4 digit terakhir NISN"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-sky-500 bg-white"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Untuk memastikan privasi data Anda. Jika lupa, Anda tetap bisa langsung masuk.
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={!selectedKelas || !selectedStudentId}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-black text-white bg-gradient-to-r from-sky-600 via-sky-700 to-blue-800 hover:from-sky-700 hover:to-blue-900 active:scale-98 rounded-xl shadow-lg shadow-sky-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span>MASUK MENU SISWA</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* INFORMATION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Validasi Mandiri</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Siswa memeriksa kebenaran NIK, NISN, nama orang tua, dan alamat tempat tinggal langsung dari perangkat masing-masing.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Bantuan PIP Tepat Sasaran</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pastikan status penerima Program Indonesia Pintar (PIP) terdata akurat untuk kelancaran aktivasi rekening SimPel.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Verifikasi Operator Resmi</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Setiap pengajuan perbaikan data diperiksa dan disahkan langsung oleh operator Dapodik SMP Negeri 3 Kertek.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION: LAPOR SPENTIKER (EMBEDDED ON FRONT PAGE DIRECTLY) */}
          <LaporSpentikerSection
            classes={classes}
            onSubmitReport={handleSubmitReport}
          />
        </main>
      )}

      {/* 4. ADMIN LOGIN MODAL */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        expectedPassword={config.adminPassword}
        onSuccess={() => {
          setIsAdminLoggedIn(true);
          setIsAdminLoginModalOpen(false);
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onClose={() => setIsAdminLoginModalOpen(false)}
      />

      {/* 5. FOOTER */}
      <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600/30 p-1 flex items-center justify-center">
              <img
                src={config.logoUrl}
                alt="Logo Sekolah"
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>
            <div>
              <div className="font-bold text-white uppercase">{config.namaSekolah}</div>
              <div className="text-slate-400 text-[11px]">{config.alamatSekolah}</div>
            </div>
          </div>

          <div className="text-slate-500 text-center md:text-right text-[11px]">
            &copy; 2026 Bank Data Siswa SMP Negeri 3 Kertek. Sistem Validasi Mandiri & Dapodik.
          </div>
        </div>
      </footer>
    </div>
  );
}
