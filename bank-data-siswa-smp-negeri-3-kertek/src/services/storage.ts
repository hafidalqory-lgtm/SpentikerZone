import { Student, KelasItem, SpentikerReport, AppConfig, StatusPengecekan } from '../types';

const DB_NAME = 'BankDataSiswaSMPN3KertekDB';
const DB_VERSION = 1;
const STORE_STUDENTS = 'students';
const STORE_CLASSES = 'classes';
const STORE_REPORTS = 'reports';
const STORE_CONFIG = 'config';

const LOCAL_STORAGE_KEY_STUDENTS = 'spentiker_students_v1';
const LOCAL_STORAGE_KEY_CLASSES = 'spentiker_classes_v1';
const LOCAL_STORAGE_KEY_REPORTS = 'spentiker_reports_v1';
const LOCAL_STORAGE_KEY_CONFIG = 'spentiker_config_v1';

// Default School Logo (SVG data URI - elegant SMPN 3 Kertek seal with torch, book, star & blue crest)
export const DEFAULT_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%230284c7" />
      <stop offset="50%" stop-color="%230369a1" />
      <stop offset="100%" stop-color="%23075985" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23facc15" />
      <stop offset="100%" stop-color="%23ca8a04" />
    </linearGradient>
  </defs>
  <!-- Outer Shield Crest -->
  <path d="M100 12 L170 42 C170 120 100 178 100 188 C100 178 30 120 30 42 Z" fill="url(%23blueGrad)" stroke="%23ffffff" stroke-width="4"/>
  <path d="M100 22 L160 48 C160 115 100 166 100 174 C100 166 40 115 40 48 Z" fill="none" stroke="url(%23goldGrad)" stroke-width="2.5" stroke-dasharray="3 2"/>
  
  <!-- Star at top -->
  <polygon points="100,32 104,42 115,42 106,49 109,59 100,53 91,59 94,49 85,42 96,42" fill="url(%23goldGrad)" />
  
  <!-- Open Book -->
  <path d="M72 108 C82 100 95 100 100 105 C105 100 118 100 128 108 L128 132 C118 124 105 124 100 129 C95 124 82 124 72 132 Z" fill="%23ffffff" />
  <path d="M100 106 L100 129" stroke="%230369a1" stroke-width="2"/>
  
  <!-- Torch flame & handle -->
  <path d="M100 64 C96 72 94 77 97 84 C100 89 104 88 104 84 C106 78 101 70 100 64 Z" fill="%23f97316"/>
  <path d="M99 71 C97 76 97 79 98 83 C101 86 103 85 102 82 C103 78 100 74 99 71 Z" fill="%23fde047"/>
  <path d="M96 85 L104 85 L102 102 L98 102 Z" fill="url(%23goldGrad)" stroke="%2378350f" stroke-width="0.8"/>

  <!-- Wings / Rice & Cotton curves -->
  <path d="M56 82 Q48 105 58 130" stroke="url(%23goldGrad)" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M144 82 Q152 105 142 130" stroke="url(%23goldGrad)" stroke-width="3" fill="none" stroke-linecap="round"/>

  <!-- Banner at bottom -->
  <rect x="52" y="142" width="96" height="18" rx="4" fill="%23ffffff" stroke="%230284c7" stroke-width="1.5"/>
  <text x="100" y="154" font-family="Arial, sans-serif" font-size="8.5" font-weight="900" text-anchor="middle" fill="%230369a1">SMPN 3 KERTEK</text>
</svg>`;

export const DEFAULT_CONFIG: AppConfig = {
  logoUrl: DEFAULT_LOGO_SVG,
  namaSekolah: 'SMP NEGERI 3 KERTEK',
  subjudul: 'Bank Data Siswa & Validasi Dapodik',
  npsn: '20306899',
  alamatSekolah: 'Jl. Purworejo Km. 11, Kertek, Wonosobo, Jawa Tengah',
  kabupaten: 'Kabupaten Wonosobo',
  adminPassword: 'admin123',
  lastUpdated: new Date().toISOString(),
};

export const INITIAL_CLASSES: KelasItem[] = [
  { id: 'cls-1', no: 1, nama: 'VII A', waliKelas: 'Budi Santoso, S.Pd.', tahunAjaran: '2026/2027' },
  { id: 'cls-2', no: 2, nama: 'VII B', waliKelas: 'Siti Rahmawati, M.Pd.', tahunAjaran: '2026/2027' },
  { id: 'cls-3', no: 3, nama: 'VII C', waliKelas: 'Agus Setiawan, S.Pd.', tahunAjaran: '2026/2027' },
  { id: 'cls-4', no: 4, nama: 'VIII A', waliKelas: 'Tri Wahyuni, S.Pd.', tahunAjaran: '2026/2027' },
  { id: 'cls-5', no: 5, nama: 'VIII B', waliKelas: 'Eko Prasetyo, S.Kom.', tahunAjaran: '2026/2027' },
  { id: 'cls-6', no: 6, nama: 'VIII C', waliKelas: 'Dewi Lestari, S.Pd.', tahunAjaran: '2026/2027' },
  { id: 'cls-7', no: 7, nama: 'IX A', waliKelas: 'Haryanto, M.Si.', tahunAjaran: '2026/2027' },
  { id: 'cls-8', no: 8, nama: 'IX B', waliKelas: 'Nurul Hidayah, S.Pd.', tahunAjaran: '2026/2027' },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-001',
    no: 1,
    nama: 'ADITYA PRATAMA',
    nipd: '242507001',
    jk: 'L',
    nisn: '0105432190',
    tempatLahir: 'Wonosobo',
    tanggalLahir: '2012-05-14',
    nik: '3307081405120001',
    agama: 'Islam',
    alamat: 'Jl. Dieng No. 12',
    rt: '02',
    rw: '04',
    dusun: 'Dusun Sudagaran',
    kelurahan: 'Kertek',
    kecamatan: 'Kertek',
    kelas: 'VII A',
    namaAyah: 'Bambang Supriyanto',
    tahunLahirAyah: '1982',
    jenjangPendidikanAyah: 'SMA Sederajat',
    pekerjaanAyah: 'Wiraswasta',
    penghasilanAyah: 'Rp 2.000.000 - Rp 4.999.999',
    nikAyah: '3307081203820002',
    namaIbu: 'Sri Mulyani',
    tahunLahirIbu: '1985',
    jenjangPendidikanIbu: 'D3/D4',
    pekerjaanIbu: 'Pedagang',
    penghasilanIbu: 'Rp 1.000.000 - Rp 1.999.999',
    nikIbu: '3307085507850003',
    menerimaPip: 'Tidak',
    statusPengecekan: 'Terverifikasi Admin',
    terakhirDiperbarui: '2026-10-25 14:30',
  },
  {
    id: 'std-002',
    no: 2,
    nama: 'ANISA RAHMAWATI',
    nipd: '242507002',
    jk: 'P',
    nisn: '0106789123',
    tempatLahir: 'Wonosobo',
    tanggalLahir: '2012-09-20',
    nik: '3307086009120004',
    agama: 'Islam',
    alamat: 'Kp. Rejosari RT 01 RW 03',
    rt: '01',
    rw: '03',
    dusun: 'Dusun Rejosari',
    kelurahan: 'Kapencar',
    kecamatan: 'Kertek',
    kelas: 'VII A',
    namaAyah: 'Suparman',
    tahunLahirAyah: '1979',
    jenjangPendidikanAyah: 'SMP Sederajat',
    pekerjaanAyah: 'Petani',
    penghasilanAyah: 'Kurang dari Rp 1.000.000',
    nikAyah: '3307081005790001',
    namaIbu: 'Waginah',
    tahunLahirIbu: '1983',
    jenjangPendidikanIbu: 'SD Sederajat',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    penghasilanIbu: 'Tidak Berpenghasilan',
    nikIbu: '3307085112830005',
    menerimaPip: 'Ya',
    statusPengecekan: 'Menunggu Verifikasi Admin',
    terakhirDiperbarui: '2026-10-26 10:15',
    pendingChanges: {
      alamat: 'Kp. Rejosari RT 01 RW 03 Gang Melati No. 5',
      rt: '01',
      rw: '03',
      pekerjaanAyah: 'Buruh Tani',
      menerimaPip: 'Ya',
    },
    riwayatPerubahan: [
      {
        id: 'hist-001',
        waktu: '2026-10-26 10:15',
        diubahOleh: 'Siswa',
        perubahan: {
          alamat: { dari: 'Kp. Rejosari RT 01 RW 03', menjadi: 'Kp. Rejosari RT 01 RW 03 Gang Melati No. 5' },
          pekerjaanAyah: { dari: 'Petani', menjadi: 'Buruh Tani' },
        },
        statusSebelumnya: 'Belum Diperiksa',
        statusSesudahnya: 'Menunggu Verifikasi Admin',
        catatan: 'Pengajuan perbaikan alamat dan rincian pekerjaan ayah.',
      },
    ],
  },
  {
    id: 'std-003',
    no: 3,
    nama: 'BAGAS KURNIAWAN',
    nipd: '242507003',
    jk: 'L',
    nisn: '0112345678',
    tempatLahir: 'Magelang',
    tanggalLahir: '2011-12-05',
    nik: '3308050512110002',
    agama: 'Islam',
    alamat: 'Dusun Kalikajar RT 03 RW 02',
    rt: '03',
    rw: '02',
    dusun: 'Dusun Kalikajar',
    kelurahan: 'Purwojiwo',
    kecamatan: 'Kertek',
    kelas: 'VII A',
    namaAyah: 'Danu Kusuma',
    tahunLahirAyah: '1980',
    jenjangPendidikanAyah: 'SMA Sederajat',
    pekerjaanAyah: 'Karyawan Swasta',
    penghasilanAyah: 'Rp 2.000.000 - Rp 4.999.999',
    nikAyah: '3308051201800003',
    namaIbu: 'Rina Astuti',
    tahunLahirIbu: '1984',
    jenjangPendidikanIbu: 'SMA Sederajat',
    pekerjaanIbu: 'Karyawan Swasta',
    penghasilanIbu: 'Rp 1.000.000 - Rp 1.999.999',
    nikIbu: '3308054406840004',
    menerimaPip: 'Belum Diketahui',
    statusPengecekan: 'Belum Diperiksa',
    terakhirDiperbarui: '2026-10-20 09:00',
  },
  {
    id: 'std-004',
    no: 4,
    nama: 'CANTIKA AULIA PUTRI',
    nipd: '242507004',
    jk: 'P',
    nisn: '0118765432',
    tempatLahir: 'Wonosobo',
    tanggalLahir: '2012-03-18',
    nik: '3307085803120006',
    agama: 'Islam',
    alamat: 'Dusun Candirejo RT 04 RW 01',
    rt: '04',
    rw: '01',
    dusun: 'Candirejo',
    kelurahan: 'Candimulyo',
    kecamatan: 'Kertek',
    kelas: 'VII B',
    namaAyah: 'Ahmad Fauzi',
    tahunLahirAyah: '1978',
    jenjangPendidikanAyah: 'S1',
    pekerjaanAyah: 'PNS/TNI/Polri',
    penghasilanAyah: 'Rp 5.000.000 - Rp 20.000.000',
    nikAyah: '3307081504780001',
    namaIbu: 'Nur Hasanah',
    tahunLahirIbu: '1981',
    jenjangPendidikanIbu: 'S1',
    pekerjaanIbu: 'Guru Swasta',
    penghasilanIbu: 'Rp 2.000.000 - Rp 4.999.999',
    nikIbu: '3307085208810002',
    menerimaPip: 'Tidak',
    statusPengecekan: 'Sudah Diperiksa Siswa',
    terakhirDiperbarui: '2026-10-24 16:20',
  },
  {
    id: 'std-005',
    no: 5,
    nama: 'DIMAS ARYA WICAKSONO',
    nipd: '242507005',
    jk: 'L',
    nisn: '0114567890',
    tempatLahir: 'Wonosobo',
    tanggalLahir: '2012-07-22',
    nik: '3307082207120005',
    agama: 'Islam',
    alamat: 'Dusun Beji RT 02 RW 05',
    rt: '02',
    rw: '05',
    dusun: 'Beji',
    kelurahan: 'Surenggede',
    kecamatan: 'Kertek',
    kelas: 'VII B',
    namaAyah: 'Gunawan',
    tahunLahirAyah: '1976',
    jenjangPendidikanAyah: 'SMP Sederajat',
    pekerjaanAyah: 'Buruh Bangunan',
    penghasilanAyah: 'Rp 1.000.000 - Rp 1.999.999',
    nikAyah: '3307081702760003',
    namaIbu: 'Siti Aminah',
    tahunLahirIbu: '1980',
    jenjangPendidikanIbu: 'SMP Sederajat',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    penghasilanIbu: 'Tidak Berpenghasilan',
    nikIbu: '3307084504800004',
    menerimaPip: 'Ya',
    statusPengecekan: 'Perlu Perbaikan',
    terakhirDiperbarui: '2026-10-25 11:00',
    catatanAdmin: 'NIK Siswa kurang 1 digit (hanya 15 digit) atau belum sesuai Kartu Keluarga. Mohon periksa kembali KK terbaru.',
  },
  {
    id: 'std-006',
    no: 1,
    nama: 'FAHRI RAMADHAN',
    nipd: '232408001',
    jk: 'L',
    nisn: '0101122334',
    tempatLahir: 'Wonosobo',
    tanggalLahir: '2011-08-11',
    nik: '3307081108110007',
    agama: 'Islam',
    alamat: 'Dusun Pagetan RT 01 RW 02',
    rt: '01',
    rw: '02',
    dusun: 'Pagetan',
    kelurahan: 'Kertek',
    kecamatan: 'Kertek',
    kelas: 'VIII A',
    namaAyah: 'Kurniawan',
    tahunLahirAyah: '1975',
    jenjangPendidikanAyah: 'SMA Sederajat',
    pekerjaanAyah: 'Pedagang',
    penghasilanAyah: 'Rp 2.000.000 - Rp 4.999.999',
    nikAyah: '3307080903750002',
    namaIbu: 'Tri Astuti',
    tahunLahirIbu: '1978',
    jenjangPendidikanIbu: 'SMA Sederajat',
    pekerjaanIbu: 'Pedagang',
    penghasilanIbu: 'Rp 1.000.000 - Rp 1.999.999',
    nikIbu: '3307084909780003',
    menerimaPip: 'Tidak',
    statusPengecekan: 'Terverifikasi Admin',
    terakhirDiperbarui: '2026-10-23 13:40',
  },
  {
    id: 'std-007',
    no: 2,
    nama: 'GITA ANGGRAENI',
    nipd: '232408002',
    jk: 'P',
    nisn: '0109988776',
    tempatLahir: 'Wonosobo',
    tanggalLahir: '2011-04-03',
    nik: '3307084304110008',
    agama: 'Islam',
    alamat: 'Dusun Keseneng RT 05 RW 02',
    rt: '05',
    rw: '02',
    dusun: 'Keseneng',
    kelurahan: 'Purbosono',
    kecamatan: 'Kertek',
    kelas: 'VIII A',
    namaAyah: 'Sumardi',
    tahunLahirAyah: '1974',
    jenjangPendidikanAyah: 'SD Sederajat',
    pekerjaanAyah: 'Petani',
    penghasilanAyah: 'Kurang dari Rp 1.000.000',
    nikAyah: '3307080406740001',
    namaIbu: 'Sulastri',
    tahunLahirIbu: '1977',
    jenjangPendidikanIbu: 'SD Sederajat',
    pekerjaanIbu: 'Buruh Tani',
    penghasilanIbu: 'Kurang dari Rp 1.000.000',
    nikIbu: '3307084807770002',
    menerimaPip: 'Ya',
    statusPengecekan: 'Belum Diperiksa',
    terakhirDiperbarui: '2026-10-18 08:30',
  },
  {
    id: 'std-008',
    no: 1,
    nama: 'MUHAMMAD RIZKY PRATAMA',
    nipd: '222309001',
    jk: 'L',
    nisn: '0098765432',
    tempatLahir: 'Semarang',
    tanggalLahir: '2010-02-15',
    nik: '3374011502100001',
    agama: 'Islam',
    alamat: 'Jl. Raya Kertek No. 45',
    rt: '03',
    rw: '01',
    dusun: 'Dusun Kertek Krajan',
    kelurahan: 'Kertek',
    kecamatan: 'Kertek',
    kelas: 'IX A',
    namaAyah: 'Hadi Prasetyo',
    tahunLahirAyah: '1972',
    jenjangPendidikanAyah: 'S1',
    pekerjaanAyah: 'Wiraswasta',
    penghasilanAyah: 'Rp 5.000.000 - Rp 20.000.000',
    nikAyah: '3374010803720001',
    namaIbu: 'Endang Lestari',
    tahunLahirIbu: '1975',
    jenjangPendidikanIbu: 'SMA Sederajat',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    penghasilanIbu: 'Tidak Berpenghasilan',
    nikIbu: '3374014905750002',
    menerimaPip: 'Tidak',
    statusPengecekan: 'Terverifikasi Admin',
    terakhirDiperbarui: '2026-10-22 09:15',
  },
];

export const INITIAL_REPORTS: SpentikerReport[] = [
  {
    id: 'rep-001',
    kodeAduan: 'SPK-2026-001',
    tanggal: '2026-10-25 08:30',
    namaPelapor: 'Wali Murid Anisa Rahmawati',
    statusPelapor: 'Orang Tua / Wali',
    kelas: 'VII A',
    kontak: '081234567890',
    jenisAduan: 'PIP',
    detailAduan: 'Buku tabungan SimPel PIP anak kami belum aktif di bank penyalur, mohon info surat keterangan aktivasi rekening dari sekolah.',
    masukanSekolah: 'Mohon jadwal layanan tata usaha untuk pengurusan surat pengantar PIP diinformasikan melalui grup WhatsApp kelas agar orang tua yang bekerja bisa menyesuaikan.',
    status: 'Diproses',
    tanggapanAdmin: 'Surat keterangan aktivasi rekening PIP sedang kami siapkan, silakan datang ke ruang Tata Usaha pada hari kerja pukul 08.00 - 13.00 WIB.',
    tanggalTanggapan: '2026-10-25 10:45',
  },
  {
    id: 'rep-002',
    kodeAduan: 'SPK-2026-002',
    tanggal: '2026-10-24 13:10',
    namaPelapor: 'Siswa Kelas VIII B',
    statusPelapor: 'Siswa',
    kelas: 'VIII B',
    kontak: '085712344321',
    jenisAduan: 'SARPRAS',
    detailAduan: 'Kipas angin di pojok kanan belakang ruang kelas VIII B mati/berdengung keras sehingga saat siang hari ruang kelas sangat panas.',
    masukanSekolah: 'Harap segera diperbaiki atau diganti demi kenyamanan belajar teman-teman kelas VIII B.',
    status: 'Selesai',
    tanggapanAdmin: 'Kipas angin sudah diganti baru oleh tim sarpras sekolah pada 24 Oktober 2026 sore. Terima kasih laporannya.',
    tanggalTanggapan: '2026-10-24 16:00',
  },
  {
    id: 'rep-003',
    kodeAduan: 'SPK-2026-003',
    tanggal: '2026-10-26 09:40',
    namaPelapor: 'Anonim',
    statusPelapor: 'Warga Sekolah',
    jenisAduan: 'SEKOLAH',
    detailAduan: 'Pintu gerbang samping saat pagi hari jam 06.45 sering padat penyeberang jalan. Mohon bantuan petugas satpam atau PKS untuk membantu menyeberangkan siswa.',
    masukanSekolah: 'Penambahan rambu hati-hati di depan sekolah agar kendaraan dari arah Wonosobo-Purworejo mengurangi kecepatan.',
    status: 'Masuk',
  },
];

// IndexedDB Helper
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_STUDENTS)) {
        db.createObjectStore(STORE_STUDENTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CLASSES)) {
        db.createObjectStore(STORE_CLASSES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_REPORTS)) {
        db.createObjectStore(STORE_REPORTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CONFIG)) {
        db.createObjectStore(STORE_CONFIG, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Storage Manager with automatic LocalStorage synchronization for maximum stability
export class StorageService {
  // CONFIG
  static async getConfig(): Promise<AppConfig> {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
      if (local) {
        return JSON.parse(local);
      }
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_CONFIG, 'readonly');
        const req = tx.objectStore(STORE_CONFIG).get('main');
        req.onsuccess = () => {
          if (req.result && req.result.data) {
            localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(req.result.data));
            resolve(req.result.data);
          } else {
            this.saveConfig(DEFAULT_CONFIG);
            resolve(DEFAULT_CONFIG);
          }
        };
        req.onerror = () => resolve(DEFAULT_CONFIG);
      });
    } catch {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
      if (local) return JSON.parse(local);
      return DEFAULT_CONFIG;
    }
  }

  static async saveConfig(config: AppConfig): Promise<void> {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(config));
      const db = await openDB();
      const tx = db.transaction(STORE_CONFIG, 'readwrite');
      tx.objectStore(STORE_CONFIG).put({ id: 'main', data: config });
    } catch (err) {
      console.warn('Config saved to localStorage fallback', err);
    }
  }

  // CLASSES
  static async getClasses(): Promise<KelasItem[]> {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY_CLASSES);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_CLASSES, 'readonly');
        const req = tx.objectStore(STORE_CLASSES).getAll();
        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY_CLASSES, JSON.stringify(req.result));
            resolve(req.result);
          } else {
            this.saveClasses(INITIAL_CLASSES);
            resolve(INITIAL_CLASSES);
          }
        };
        req.onerror = () => resolve(INITIAL_CLASSES);
      });
    } catch {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY_CLASSES);
      if (local) return JSON.parse(local);
      return INITIAL_CLASSES;
    }
  }

  static async saveClasses(classes: KelasItem[]): Promise<void> {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CLASSES, JSON.stringify(classes));
      const db = await openDB();
      const tx = db.transaction(STORE_CLASSES, 'readwrite');
      const store = tx.objectStore(STORE_CLASSES);
      store.clear();
      classes.forEach((c) => store.put(c));
    } catch (err) {
      console.warn('Classes saved to localStorage fallback', err);
    }
  }

  static async addClass(cls: Omit<KelasItem, 'id'>): Promise<KelasItem[]> {
    const list = await this.getClasses();
    const newClass: KelasItem = {
      ...cls,
      id: `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      no: list.length + 1,
    };
    const updated = [...list, newClass];
    await this.saveClasses(updated);
    return updated;
  }

  static async updateClass(id: string, partial: Partial<KelasItem>): Promise<KelasItem[]> {
    const list = await this.getClasses();
    const updated = list.map((c) => (c.id === id ? { ...c, ...partial } : c));
    await this.saveClasses(updated);
    return updated;
  }

  static async deleteClass(id: string): Promise<KelasItem[]> {
    const list = await this.getClasses();
    const filtered = list.filter((c) => c.id !== id);
    // renumber
    const renumbered = filtered.map((c, idx) => ({ ...c, no: idx + 1 }));
    await this.saveClasses(renumbered);
    return renumbered;
  }

  // STUDENTS
  static async getStudents(): Promise<Student[]> {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY_STUDENTS);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_STUDENTS, 'readonly');
        const req = tx.objectStore(STORE_STUDENTS).getAll();
        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY_STUDENTS, JSON.stringify(req.result));
            resolve(req.result);
          } else {
            this.saveStudents(INITIAL_STUDENTS);
            resolve(INITIAL_STUDENTS);
          }
        };
        req.onerror = () => resolve(INITIAL_STUDENTS);
      });
    } catch {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY_STUDENTS);
      if (local) return JSON.parse(local);
      return INITIAL_STUDENTS;
    }
  }

  static async saveStudents(students: Student[]): Promise<void> {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_STUDENTS, JSON.stringify(students));
      const db = await openDB();
      const tx = db.transaction(STORE_STUDENTS, 'readwrite');
      const store = tx.objectStore(STORE_STUDENTS);
      store.clear();
      students.forEach((s) => store.put(s));
    } catch (err) {
      console.warn('Students saved to localStorage fallback', err);
    }
  }

  static async addStudent(studentData: Omit<Student, 'id' | 'terakhirDiperbarui'>): Promise<Student[]> {
    const list = await this.getStudents();
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      terakhirDiperbarui: now,
    };
    const updated = [newStudent, ...list];
    await this.saveStudents(updated);
    return updated;
  }

  static async updateStudent(id: string, partial: Partial<Student>): Promise<Student[]> {
    const list = await this.getStudents();
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updated = list.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          ...partial,
          terakhirDiperbarui: now,
        };
      }
      return s;
    });
    await this.saveStudents(updated);
    return updated;
  }

  static async deleteStudent(id: string): Promise<Student[]> {
    const list = await this.getStudents();
    const filtered = list.filter((s) => s.id !== id);
    await this.saveStudents(filtered);
    return filtered;
  }

  static async deleteMultipleStudents(ids: string[]): Promise<Student[]> {
    const list = await this.getStudents();
    const idSet = new Set(ids);
    const filtered = list.filter((s) => !idSet.has(s.id));
    await this.saveStudents(filtered);
    return filtered;
  }

  // SPENTIKER REPORTS
  static async getReports(): Promise<SpentikerReport[]> {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY_REPORTS);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_REPORTS, 'readonly');
        const req = tx.objectStore(STORE_REPORTS).getAll();
        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY_REPORTS, JSON.stringify(req.result));
            resolve(req.result);
          } else {
            this.saveReports(INITIAL_REPORTS);
            resolve(INITIAL_REPORTS);
          }
        };
        req.onerror = () => resolve(INITIAL_REPORTS);
      });
    } catch {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY_REPORTS);
      if (local) return JSON.parse(local);
      return INITIAL_REPORTS;
    }
  }

  static async saveReports(reports: SpentikerReport[]): Promise<void> {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_REPORTS, JSON.stringify(reports));
      const db = await openDB();
      const tx = db.transaction(STORE_REPORTS, 'readwrite');
      const store = tx.objectStore(STORE_REPORTS);
      store.clear();
      reports.forEach((r) => store.put(r));
    } catch (err) {
      console.warn('Reports saved to localStorage fallback', err);
    }
  }

  static async addReport(reportData: Omit<SpentikerReport, 'id' | 'kodeAduan' | 'tanggal' | 'status'>): Promise<SpentikerReport> {
    const list = await this.getReports();
    const count = list.length + 1;
    const year = new Date().getFullYear();
    const pad = String(count).padStart(3, '0');
    const kodeAduan = `SPK-${year}-${pad}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newReport: SpentikerReport = {
      ...reportData,
      id: `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      kodeAduan,
      tanggal: now,
      status: 'Masuk',
    };

    const updated = [newReport, ...list];
    await this.saveReports(updated);
    return newReport;
  }

  static async updateReport(id: string, partial: Partial<SpentikerReport>): Promise<SpentikerReport[]> {
    const list = await this.getReports();
    const updated = list.map((r) => (r.id === id ? { ...r, ...partial } : r));
    await this.saveReports(updated);
    return updated;
  }

  static async deleteReport(id: string): Promise<SpentikerReport[]> {
    const list = await this.getReports();
    const filtered = list.filter((r) => r.id !== id);
    await this.saveReports(filtered);
    return filtered;
  }

  // BACKUP & RESTORE
  static async exportBackupJson(): Promise<string> {
    const [config, classes, students, reports] = await Promise.all([
      this.getConfig(),
      this.getClasses(),
      this.getStudents(),
      this.getReports(),
    ]);

    const backup = {
      app: 'Bank Data Siswa SMP Negeri 3 Kertek',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      config,
      classes,
      students,
      reports,
    };

    return JSON.stringify(backup, null, 2);
  }

  static async restoreDataFromJson(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (data.config) await this.saveConfig(data.config);
      if (Array.isArray(data.classes)) await this.saveClasses(data.classes);
      if (Array.isArray(data.students)) await this.saveStudents(data.students);
      if (Array.isArray(data.reports)) await this.saveReports(data.reports);
      return true;
    } catch (err) {
      console.error('Failed to restore backup', err);
      return false;
    }
  }

  static async resetDatabase(): Promise<void> {
    localStorage.removeItem(LOCAL_STORAGE_KEY_CONFIG);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CLASSES);
    localStorage.removeItem(LOCAL_STORAGE_KEY_STUDENTS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_REPORTS);
    await this.saveConfig(DEFAULT_CONFIG);
    await this.saveClasses(INITIAL_CLASSES);
    await this.saveStudents(INITIAL_STUDENTS);
    await this.saveReports(INITIAL_REPORTS);
  }
}
