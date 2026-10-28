export type JenisKelamin = 'L' | 'P';

export type StatusPengecekan = 
  | 'Belum Diperiksa' 
  | 'Sudah Diperiksa Siswa' 
  | 'Menunggu Verifikasi Admin' 
  | 'Terverifikasi Admin' 
  | 'Perlu Perbaikan';

export type StatusPIP = 'Ya' | 'Tidak' | 'Belum Diketahui';

export interface ChangeHistoryItem {
  id: string;
  waktu: string;
  diubahOleh: string; // 'Siswa' | 'Admin'
  perubahan: Record<string, { dari: string; menjadi: string }>;
  statusSebelumnya: StatusPengecekan;
  statusSesudahnya: StatusPengecekan;
  catatan?: string;
}

export interface Student {
  id: string;
  no: number | string;
  nama: string;
  nipd: string;
  jk: JenisKelamin | string;
  nisn: string;
  tempatLahir: string;
  tanggalLahir: string;
  nik: string;
  agama: string;
  alamat: string;
  rt: string;
  rw: string;
  dusun: string;
  kelurahan: string;
  kecamatan: string;
  kelas: string;

  // Data Ayah
  namaAyah: string;
  tahunLahirAyah: string;
  jenjangPendidikanAyah: string;
  pekerjaanAyah: string;
  penghasilanAyah: string;
  nikAyah: string;

  // Data Ibu
  namaIbu: string;
  tahunLahirIbu: string;
  jenjangPendidikanIbu: string;
  pekerjaanIbu: string;
  penghasilanIbu: string;
  nikIbu: string;

  // Bantuan
  menerimaPip: StatusPIP | string;

  // Status & Audit
  statusPengecekan: StatusPengecekan;
  terakhirDiperbarui: string;
  catatanAdmin?: string;

  // Pending changes submitted by student for admin verification
  pendingChanges?: Partial<Omit<Student, 'id' | 'pendingChanges' | 'riwayatPerubahan'>>;
  riwayatPerubahan?: ChangeHistoryItem[];
}

export interface KelasItem {
  id: string;
  no: number | string;
  nama: string;
  waliKelas?: string;
  tahunAjaran?: string;
}

export type JenisAduanSpentiker = 
  | 'PIP' 
  | 'SARPRAS' 
  | 'SEKOLAH' 
  | 'AKADEMIK' 
  | 'KESISWAAN' 
  | 'BULLYING' 
  | 'LAINNYA';

export type StatusAduan = 'Masuk' | 'Diproses' | 'Selesai' | 'Diarsipkan';

export interface SpentikerReport {
  id: string;
  kodeAduan: string;
  tanggal: string;
  namaPelapor: string;
  statusPelapor: string; // 'Siswa' | 'Orang Tua / Wali' | 'Warga Sekolah' | 'Anonim'
  kelas?: string;
  kontak?: string;
  jenisAduan: JenisAduanSpentiker;
  detailAduan: string;
  masukanSekolah: string;
  status: StatusAduan;
  tanggapanAdmin?: string;
  tanggalTanggapan?: string;
}

export interface AppConfig {
  logoUrl: string;
  namaSekolah: string;
  subjudul: string;
  npsn: string;
  alamatSekolah: string;
  kabupaten: string;
  adminPassword: string;
  lastUpdated: string;
}
