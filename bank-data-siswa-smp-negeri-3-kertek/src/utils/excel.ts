import * as XLSX from 'xlsx';
import { Student, KelasItem, SpentikerReport } from '../types';

// Canonical Student Column Definitions
export const STUDENT_COLUMNS = [
  { key: 'no', label: 'No', required: false, isText: true },
  { key: 'nama', label: 'Nama', required: true, isText: true },
  { key: 'nipd', label: 'NIPD', required: false, isText: true },
  { key: 'jk', label: 'JK', required: true, isText: true },
  { key: 'nisn', label: 'NISN', required: false, isText: true },
  { key: 'tempatLahir', label: 'Tempat Lahir', required: false, isText: true },
  { key: 'tanggalLahir', label: 'Tanggal Lahir', required: false, isText: true },
  { key: 'nik', label: 'NIK', required: false, isText: true },
  { key: 'agama', label: 'Agama', required: false, isText: true },
  { key: 'alamat', label: 'Alamat', required: false, isText: true },
  { key: 'rt', label: 'RT', required: false, isText: true },
  { key: 'rw', label: 'RW', required: false, isText: true },
  { key: 'dusun', label: 'Dusun', required: false, isText: true },
  { key: 'kelurahan', label: 'Kelurahan', required: false, isText: true },
  { key: 'kecamatan', label: 'Kecamatan', required: false, isText: true },
  { key: 'kelas', label: 'Kelas', required: true, isText: true },

  // Data Ayah
  { key: 'namaAyah', label: 'Nama Ayah', required: false, isText: true },
  { key: 'tahunLahirAyah', label: 'Tahun Lahir Ayah', required: false, isText: true },
  { key: 'jenjangPendidikanAyah', label: 'Jenjang Pendidikan Ayah', required: false, isText: true },
  { key: 'pekerjaanAyah', label: 'Pekerjaan Ayah', required: false, isText: true },
  { key: 'penghasilanAyah', label: 'Penghasilan Ayah', required: false, isText: true },
  { key: 'nikAyah', label: 'NIK Ayah', required: false, isText: true },

  // Data Ibu
  { key: 'namaIbu', label: 'Nama Ibu', required: false, isText: true },
  { key: 'tahunLahirIbu', label: 'Tahun Lahir Ibu', required: false, isText: true },
  { key: 'jenjangPendidikanIbu', label: 'Jenjang Pendidikan Ibu', required: false, isText: true },
  { key: 'pekerjaanIbu', label: 'Pekerjaan Ibu', required: false, isText: true },
  { key: 'penghasilanIbu', label: 'Penghasilan Ibu', required: false, isText: true },
  { key: 'nikIbu', label: 'NIK Ibu', required: false, isText: true },

  // Program Bantuan
  { key: 'menerimaPip', label: 'Menerima PIP', required: false, isText: true },
] as const;

// Synonym map for flexible header mapping
const SYNONYMS: Record<string, string> = {
  no: 'no',
  nomor: 'no',
  'no.': 'no',
  nama: 'nama',
  'nama siswa': 'nama',
  'nama lengkap': 'nama',
  'nama peserta didik': 'nama',
  nipd: 'nipd',
  'no induk': 'nipd',
  'nomor induk': 'nipd',
  'nomor induk peserta didik': 'nipd',
  jk: 'jk',
  'jenis kelamin': 'jk',
  gender: 'jk',
  'l/p': 'jk',
  nisn: 'nisn',
  'nomor induk siswa nasional': 'nisn',
  'tempat lahir': 'tempatLahir',
  tempat_lahir: 'tempatLahir',
  tmplahir: 'tempatLahir',
  'tanggal lahir': 'tanggalLahir',
  tanggal_lahir: 'tanggalLahir',
  tgllahir: 'tanggalLahir',
  tgl_lahir: 'tanggalLahir',
  nik: 'nik',
  'no ktp': 'nik',
  'nik siswa': 'nik',
  agama: 'agama',
  alamat: 'alamat',
  'alamat rumah': 'alamat',
  'alamat tinggal': 'alamat',
  rt: 'rt',
  rw: 'rw',
  dusun: 'dusun',
  'nama dusun': 'dusun',
  desa: 'kelurahan',
  kelurahan: 'kelurahan',
  'desa/kelurahan': 'kelurahan',
  kecamatan: 'kecamatan',
  kelas: 'kelas',
  'nama kelas': 'kelas',
  rombel: 'kelas',
  'rombongan belajar': 'kelas',

  // Ayah
  'nama ayah': 'namaAyah',
  ayah: 'namaAyah',
  'tahun lahir ayah': 'tahunLahirAyah',
  'thn lahir ayah': 'tahunLahirAyah',
  'jenjang pendidikan ayah': 'jenjangPendidikanAyah',
  'pendidikan ayah': 'jenjangPendidikanAyah',
  'pekerjaan ayah': 'pekerjaanAyah',
  'penghasilan ayah': 'penghasilanAyah',
  'nik ayah': 'nikAyah',

  // Ibu
  'nama ibu': 'namaIbu',
  ibu: 'namaIbu',
  'tahun lahir ibu': 'tahunLahirIbu',
  'thn lahir ibu': 'tahunLahirIbu',
  'jenjang pendidikan ibu': 'jenjangPendidikanIbu',
  'pendidikan ibu': 'jenjangPendidikanIbu',
  'pekerjaan ibu': 'pekerjaanIbu',
  'penghasilan ibu': 'penghasilanIbu',
  'nik ibu': 'nikIbu',

  // PIP
  'menerima pip': 'menerimaPip',
  'penerima pip': 'menerimaPip',
  pip: 'menerimaPip',
  'bantuan pip': 'menerimaPip',
};

// Normalize header text for comparison
export function normalizeHeader(header: string): string {
  if (!header) return '';
  return header
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[_\-\/\\]+/g, ' ')
    .replace(/\s+/g, ' ');
}

// Download Excel Template for Students
export function downloadStudentTemplateExcel() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Template Data Siswa with example row
  const headers = STUDENT_COLUMNS.map((c) => c.label);
  const sampleRow = [
    '1',
    '[CONTOH] AHMAD FAUZI',
    '242507001',
    'L',
    '0105432190',
    'Wonosobo',
    '2012-05-14',
    '3307081405120001',
    'Islam',
    'Jl. Dieng No. 12',
    '02',
    '04',
    'Dusun Sudagaran',
    'Kertek',
    'Kertek',
    'VII A',
    'Bambang Supriyanto',
    '1982',
    'SMA Sederajat',
    'Wiraswasta',
    'Rp 2.000.000 - Rp 4.999.999',
    '3307081203820002',
    'Sri Mulyani',
    '1985',
    'D3/D4',
    'Pedagang',
    'Rp 1.000.000 - Rp 1.999.999',
    '3307085507850003',
    'Ya',
  ];

  const wsData = [headers, sampleRow];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set explicit column widths
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 25 }, // Nama
    { wch: 15 }, // NIPD
    { wch: 6 },  // JK
    { wch: 16 }, // NISN
    { wch: 16 }, // Tempat Lahir
    { wch: 14 }, // Tanggal Lahir
    { wch: 20 }, // NIK
    { wch: 12 }, // Agama
    { wch: 30 }, // Alamat
    { wch: 6 },  // RT
    { wch: 6 },  // RW
    { wch: 18 }, // Dusun
    { wch: 18 }, // Kelurahan
    { wch: 16 }, // Kecamatan
    { wch: 10 }, // Kelas
    { wch: 24 }, // Nama Ayah
    { wch: 18 }, // Thn Lahir Ayah
    { wch: 22 }, // Pend Ayah
    { wch: 20 }, // Pek Ayah
    { wch: 24 }, // Peng Ayah
    { wch: 20 }, // NIK Ayah
    { wch: 24 }, // Nama Ibu
    { wch: 18 }, // Thn Lahir Ibu
    { wch: 22 }, // Pend Ibu
    { wch: 20 }, // Pek Ibu
    { wch: 24 }, // Peng Ibu
    { wch: 20 }, // NIK Ibu
    { wch: 15 }, // Menerima PIP
  ];

  // Force text format on sample row for numbers to preserve leading zero
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:AC2');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 1, c: C });
    if (ws[cellAddress]) {
      ws[cellAddress].t = 's'; // format as string
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');

  // Sheet 2: Petunjuk Pengisian
  const petunjukData = [
    ['PETUNJUK PENGISIAN TEMPLATE BANK DATA SISWA SMP NEGERI 3 KERTEK'],
    [''],
    ['No', 'Kolom', 'Keterangan & Format', 'Contoh Nilai'],
    ['1', 'No', 'Nomor urut siswa', '1, 2, 3'],
    ['2', 'Nama', 'Wajib diisi. Nama lengkap siswa sesuai Akta/KK', 'AHMAD FAUZI'],
    ['3', 'NIPD', 'Nomor Induk Peserta Didik dari buku induk sekolah', '242507001'],
    ['4', 'JK', 'Wajib diisi. Jenis kelamin: L (Laki-laki) atau P (Perempuan)', 'L / P'],
    ['5', 'NISN', '10 digit NISN resmi Kemdikbud', '0105432190'],
    ['6', 'Tempat Lahir', 'Kota atau kabupaten kelahiran siswa', 'Wonosobo'],
    ['7', 'Tanggal Lahir', 'Format tanggal: YYYY-MM-DD atau DD/MM/YYYY', '2012-05-14'],
    ['8', 'NIK', '16 digit NIK Siswa dari KK (Angka 0 depan tidak boleh hilang)', '3307081405120001'],
    ['9', 'Agama', 'Islam, Kristen, Katolik, Hindu, Buddha, Khonghucu', 'Islam'],
    ['10', 'Alamat', 'Jalan / Kampung tempat tinggal siswa', 'Jl. Dieng No. 12'],
    ['11', 'RT & RW', '2 digit RT dan RW (format teks, contoh: 01, 02)', '02 / 04'],
    ['12', 'Dusun & Kelurahan', 'Nama Dusun dan Desa/Kelurahan', 'Sudagaran, Kertek'],
    ['13', 'Kecamatan', 'Kecamatan tempat tinggal', 'Kertek'],
    ['14', 'Kelas', 'Wajib diisi. Sesuai daftar kelas di sistem', 'VII A, VII B, VIII A, dll.'],
    ['15', 'Data Orang Tua', 'Nama, Tahun Lahir (YYYY), Pendidikan, Pekerjaan, NIK', 'Isi sesuai KK'],
    ['16', 'Menerima PIP', 'Pilihan: Ya, Tidak, atau Belum Diketahui', 'Ya / Tidak'],
    [''],
    ['CATATAN PENTING:'],
    ['- Jangan mengubah nama header di baris 1 Sheet Data Siswa.'],
    ['- Hapus baris [CONTOH] sebelum mengunggah jika tidak ingin contoh ikut tersimpan.'],
    ['- Kolom NIK, NISN, NIPD, RT, RW harus diformat sebagai Text di Excel agar 0 di depan tetap utuh.'],
  ];
  const wsPetunjuk = XLSX.utils.aoa_to_sheet(petunjukData);
  wsPetunjuk['!cols'] = [{ wch: 6 }, { wch: 22 }, { wch: 55 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'Petunjuk Pengisian');

  XLSX.writeFile(wb, 'Template_Data_Siswa_SMP_Negeri_3_Kertek.xlsx');
}

// Download Excel Template for Classes
export function downloadClassTemplateExcel() {
  const wb = XLSX.utils.book_new();
  const headers = ['No', 'Nama Kelas', 'Wali Kelas', 'Tahun Ajaran'];
  const samples = [
    ['1', 'VII A', 'Budi Santoso, S.Pd.', '2026/2027'],
    ['2', 'VII B', 'Siti Rahmawati, M.Pd.', '2026/2027'],
    ['3', 'VIII A', 'Tri Wahyuni, S.Pd.', '2026/2027'],
    ['4', 'IX A', 'Haryanto, M.Si.', '2026/2027'],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...samples]);
  ws['!cols'] = [{ wch: 6 }, { wch: 15 }, { wch: 28 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Template Kelas');
  XLSX.writeFile(wb, 'Template_Data_Kelas_SMP_Negeri_3_Kertek.xlsx');
}

// Export Any Student List to Excel with String Type Preservation
export function exportStudentsToExcel(
  students: Student[],
  fileName: string = 'Data_Siswa_SMPN_3_Kertek.xlsx',
  sheetTitle: string = 'Data Siswa'
) {
  const wb = XLSX.utils.book_new();

  const headers = [
    'No',
    'Nama',
    'NIPD',
    'JK',
    'NISN',
    'Tempat Lahir',
    'Tanggal Lahir',
    'NIK',
    'Agama',
    'Alamat',
    'RT',
    'RW',
    'Dusun',
    'Kelurahan',
    'Kecamatan',
    'Kelas',
    'Nama Ayah',
    'Tahun Lahir Ayah',
    'Jenjang Pendidikan Ayah',
    'Pekerjaan Ayah',
    'Penghasilan Ayah',
    'NIK Ayah',
    'Nama Ibu',
    'Tahun Lahir Ibu',
    'Jenjang Pendidikan Ibu',
    'Pekerjaan Ibu',
    'Penghasilan Ibu',
    'NIK Ibu',
    'Menerima PIP',
    'Status Pengecekan',
    'Terakhir Diperbarui',
    'Catatan Admin',
  ];

  const rows = students.map((s, idx) => [
    String(idx + 1),
    s.nama || '',
    String(s.nipd || ''),
    s.jk || '',
    String(s.nisn || ''),
    s.tempatLahir || '',
    s.tanggalLahir || '',
    String(s.nik || ''),
    s.agama || '',
    s.alamat || '',
    String(s.rt || ''),
    String(s.rw || ''),
    s.dusun || '',
    s.kelurahan || '',
    s.kecamatan || '',
    s.kelas || '',
    s.namaAyah || '',
    String(s.tahunLahirAyah || ''),
    s.jenjangPendidikanAyah || '',
    s.pekerjaanAyah || '',
    s.penghasilanAyah || '',
    String(s.nikAyah || ''),
    s.namaIbu || '',
    String(s.tahunLahirIbu || ''),
    s.jenjangPendidikanIbu || '',
    s.pekerjaanIbu || '',
    s.penghasilanIbu || '',
    String(s.nikIbu || ''),
    s.menerimaPip || 'Belum Diketahui',
    s.statusPengecekan || 'Belum Diperiksa',
    s.terakhirDiperbarui || '',
    s.catatanAdmin || '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set explicit string type for all data cells to prevent Excel from dropping leading zeros
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:AF1');
  for (let R = 1; R <= range.e.r; ++R) {
    for (let C = 0; C <= range.e.c; ++C) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (ws[addr] && ws[addr].v !== undefined) {
        ws[addr].t = 's';
        ws[addr].v = String(ws[addr].v);
      }
    }
  }

  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 26 }, // Nama
    { wch: 16 }, // NIPD
    { wch: 6 },  // JK
    { wch: 16 }, // NISN
    { wch: 16 }, // Tempat Lahir
    { wch: 14 }, // Tanggal Lahir
    { wch: 20 }, // NIK
    { wch: 12 }, // Agama
    { wch: 28 }, // Alamat
    { wch: 6 },  // RT
    { wch: 6 },  // RW
    { wch: 16 }, // Dusun
    { wch: 16 }, // Kelurahan
    { wch: 16 }, // Kecamatan
    { wch: 10 }, // Kelas
    { wch: 22 }, // Nama Ayah
    { wch: 16 }, // Thn Ayah
    { wch: 20 }, // Pend Ayah
    { wch: 18 }, // Pek Ayah
    { wch: 22 }, // Peng Ayah
    { wch: 20 }, // NIK Ayah
    { wch: 22 }, // Nama Ibu
    { wch: 16 }, // Thn Ibu
    { wch: 20 }, // Pend Ibu
    { wch: 18 }, // Pek Ibu
    { wch: 22 }, // Peng Ibu
    { wch: 20 }, // NIK Ibu
    { wch: 16 }, // PIP
    { wch: 24 }, // Status Pengecekan
    { wch: 18 }, // Terakhir Diperbarui
    { wch: 30 }, // Catatan Admin
  ];

  XLSX.utils.book_append_sheet(wb, ws, sheetTitle.slice(0, 31));
  XLSX.writeFile(wb, fileName);
}

// Export Classes to Excel
export function exportClassesToExcel(classes: KelasItem[], fileName = 'Data_Kelas_SMPN_3_Kertek.xlsx') {
  const wb = XLSX.utils.book_new();
  const headers = ['No', 'Nama Kelas', 'Wali Kelas', 'Tahun Ajaran'];
  const rows = classes.map((c, idx) => [
    idx + 1,
    c.nama,
    c.waliKelas || '-',
    c.tahunAjaran || '2026/2027',
  ]);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 28 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Kelas');
  XLSX.writeFile(wb, fileName);
}

// Export Lapor Spentiker to Excel
export function exportReportsToExcel(reports: SpentikerReport[], fileName = 'Rekap_Lapor_Spentiker.xlsx') {
  const wb = XLSX.utils.book_new();
  const headers = [
    'No',
    'Kode Aduan',
    'Tanggal Masuk',
    'Nama Pelapor',
    'Status Pelapor',
    'Kelas',
    'Kontak',
    'Jenis Aduan',
    'Detail Aduan',
    'Masukan untuk Sekolah',
    'Status Penanganan',
    'Tanggapan Admin',
    'Tanggal Tanggapan',
  ];

  const rows = reports.map((r, idx) => [
    idx + 1,
    r.kodeAduan,
    r.tanggal,
    r.namaPelapor,
    r.statusPelapor,
    r.kelas || '-',
    r.kontak || '-',
    r.jenisAduan,
    r.detailAduan,
    r.masukanSekolah,
    r.status,
    r.tanggapanAdmin || '-',
    r.tanggalTanggapan || '-',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 18 },
    { wch: 24 },
    { wch: 18 },
    { wch: 10 },
    { wch: 16 },
    { wch: 14 },
    { wch: 35 },
    { wch: 35 },
    { wch: 16 },
    { wch: 35 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Aduan Spentiker');
  XLSX.writeFile(wb, fileName);
}

export interface ParseResult {
  headers: string[];
  columnMapping: Record<string, string>; // originalHeader -> studentFieldKey
  unmappedHeaders: string[];
  missingRequired: string[];
  rows: Partial<Student>[];
  totalRows: number;
  validRows: number;
  duplicateRows: number;
  errors: string[];
}

// Parse Excel file buffer or array
export async function parseExcelStudentFile(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  // Convert to 2D array of strings
  const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });

  if (!rawData || rawData.length === 0) {
    throw new Error('File Excel kosong atau tidak terbaca.');
  }

  // Find header row (first non-empty row)
  let headerRowIndex = 0;
  for (let i = 0; i < rawData.length; i++) {
    if (rawData[i].some((cell) => cell && cell.toString().trim() !== '')) {
      headerRowIndex = i;
      break;
    }
  }

  const rawHeaders: string[] = rawData[headerRowIndex].map((h) => (h ? h.toString().trim() : ''));
  const dataRows = rawData.slice(headerRowIndex + 1);

  return processTabularStudentData(rawHeaders, dataRows);
}

// Parse Copy-Pasted Tab-Separated Data from Excel
export function parsePastedStudentText(text: string): ParseResult {
  if (!text || !text.trim()) {
    throw new Error('Kotak teks copy-paste kosong. Silakan salin tabel dari Excel.');
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error('Data harus memiliki minimal 1 baris header dan 1 baris data.');
  }

  const rawHeaders = lines[0].split('\t').map((h) => h.trim());
  const dataRows = lines.slice(1).map((line) => line.split('\t').map((c) => c.trim()));

  return processTabularStudentData(rawHeaders, dataRows);
}

// Parse Copy-Pasted Class Data
export function parsePastedClassText(text: string): { nama: string; waliKelas?: string; tahunAjaran?: string }[] {
  if (!text || !text.trim()) return [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  // Check if first line is header
  let startIdx = 0;
  const firstCols = lines[0].split('\t').map((c) => c.trim().toLowerCase());
  if (firstCols.some((c) => c.includes('nama') || c.includes('kelas') || c.includes('no'))) {
    startIdx = 1;
  }

  const results: { nama: string; waliKelas?: string; tahunAjaran?: string }[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split('\t').map((c) => c.trim());
    if (cols.length === 0 || !cols.some((c) => c)) continue;
    let namaKelas = '';
    let waliKelas = '';
    let tahunAjaran = '';

    if (cols.length === 1) {
      namaKelas = cols[0];
    } else if (cols.length === 2) {
      // Could be [No, Kelas] or [Kelas, Wali]
      if (/^\d+$/.test(cols[0])) {
        namaKelas = cols[1];
      } else {
        namaKelas = cols[0];
        waliKelas = cols[1];
      }
    } else {
      // >= 3 cols: [No, Kelas, Wali, Thn]
      if (/^\d+$/.test(cols[0])) {
        namaKelas = cols[1];
        waliKelas = cols[2];
        tahunAjaran = cols[3] || '';
      } else {
        namaKelas = cols[0];
        waliKelas = cols[1];
        tahunAjaran = cols[2] || '';
      }
    }

    if (namaKelas) {
      results.push({
        nama: namaKelas.toUpperCase(),
        waliKelas: waliKelas || undefined,
        tahunAjaran: tahunAjaran || '2026/2027',
      });
    }
  }
  return results;
}

// Shared processing for Excel and Paste
function processTabularStudentData(rawHeaders: string[], dataRows: any[][]): ParseResult {
  const columnMapping: Record<string, string> = {};
  const unmappedHeaders: string[] = [];

  rawHeaders.forEach((header) => {
    if (!header) return;
    const norm = normalizeHeader(header);
    if (SYNONYMS[norm]) {
      columnMapping[header] = SYNONYMS[norm];
    } else {
      // Search partial match in student columns
      const matchedCol = STUDENT_COLUMNS.find((col) => {
        const colNorm = normalizeHeader(col.label);
        return colNorm === norm || norm.includes(colNorm) || colNorm.includes(norm);
      });
      if (matchedCol) {
        columnMapping[header] = matchedCol.key;
      } else {
        unmappedHeaders.push(header);
      }
    }
  });

  // Check required fields
  const mappedKeys = new Set(Object.values(columnMapping));
  const missingRequired: string[] = [];
  if (!mappedKeys.has('nama')) missingRequired.push('Nama Siswa (Kolom Nama)');
  if (!mappedKeys.has('kelas')) missingRequired.push('Kelas Siswa (Kolom Kelas)');

  const rows: Partial<Student>[] = [];
  const errors: string[] = [];
  const seenNipd = new Set<string>();
  const seenNisn = new Set<string>();
  const seenNik = new Set<string>();
  let duplicateCount = 0;

  dataRows.forEach((row, rowIdx) => {
    // Check if entire row is empty
    if (!row.some((cell) => cell && cell.toString().trim() !== '')) return;

    // Check if this is an obvious sample row
    const rowStr = row.join(' ').toLowerCase();
    if (rowStr.includes('[contoh]') || rowStr.includes('contoh ')) return;

    const studentObj: any = {};
    rawHeaders.forEach((header, colIdx) => {
      const fieldKey = columnMapping[header];
      if (fieldKey) {
        let val = row[colIdx];
        if (val === undefined || val === null) val = '';
        val = val.toString().trim();

        // Specific cleanups
        if (fieldKey === 'jk') {
          val = val.toUpperCase().startsWith('P') ? 'P' : 'L';
        }
        if (fieldKey === 'nama' || fieldKey === 'kelas') {
          val = val.toUpperCase();
        }
        if (fieldKey === 'menerimaPip') {
          const vUpper = val.toUpperCase();
          if (vUpper === 'YA' || vUpper === 'Y' || vUpper === '1' || vUpper === 'BENAR') {
            val = 'Ya';
          } else if (vUpper === 'TIDAK' || vUpper === 'T' || vUpper === '0') {
            val = 'Tidak';
          } else {
            val = 'Belum Diketahui';
          }
        }
        studentObj[fieldKey] = val;
      }
    });

    if (!studentObj.nama) {
      errors.push(`Baris ${rowIdx + 2}: Nama siswa kosong.`);
      return;
    }

    // Duplicate detection within the file
    let isDup = false;
    if (studentObj.nipd && seenNipd.has(studentObj.nipd)) isDup = true;
    if (studentObj.nisn && seenNisn.has(studentObj.nisn)) isDup = true;
    if (studentObj.nik && seenNik.has(studentObj.nik)) isDup = true;

    if (studentObj.nipd) seenNipd.add(studentObj.nipd);
    if (studentObj.nisn) seenNisn.add(studentObj.nisn);
    if (studentObj.nik) seenNik.add(studentObj.nik);

    if (isDup) {
      duplicateCount++;
    }

    studentObj.statusPengecekan = 'Belum Diperiksa';
    rows.push(studentObj);
  });

  return {
    headers: rawHeaders.filter(Boolean),
    columnMapping,
    unmappedHeaders,
    missingRequired,
    rows,
    totalRows: rows.length,
    validRows: rows.length - duplicateCount,
    duplicateRows: duplicateCount,
    errors,
  };
}
