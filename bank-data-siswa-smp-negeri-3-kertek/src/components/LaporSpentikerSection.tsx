import React, { useState } from 'react';
import { 
  MessageSquarePlus, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  Building2, 
  GraduationCap, 
  Users, 
  ShieldAlert, 
  MoreHorizontal,
  CreditCard,
  Check
} from 'lucide-react';
import { JenisAduanSpentiker, KelasItem, SpentikerReport } from '../types';

interface LaporSpentikerSectionProps {
  classes: KelasItem[];
  onSubmitReport: (report: Omit<SpentikerReport, 'id' | 'kodeAduan' | 'tanggal' | 'status'>) => Promise<SpentikerReport>;
}

export const LaporSpentikerSection: React.FC<LaporSpentikerSectionProps> = ({
  classes,
  onSubmitReport,
}) => {
  const [isAnon, setIsAnon] = useState(false);
  const [namaPelapor, setNamaPelapor] = useState('');
  const [statusPelapor, setStatusPelapor] = useState('Siswa');
  const [kelas, setKelas] = useState('');
  const [kontak, setKontak] = useState('');
  const [jenisAduan, setJenisAduan] = useState<JenisAduanSpentiker>('PIP');
  const [detailAduan, setDetailAduan] = useState('');
  const [masukanSekolah, setMasukanSekolah] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReport, setSuccessReport] = useState<SpentikerReport | null>(null);

  const categories: { key: JenisAduanSpentiker; label: string; icon: any; desc: string; color: string }[] = [
    { key: 'PIP', label: 'Bantuan PIP', icon: CreditCard, desc: 'Aktivasi rekening SimPel, pencairan dana PIP', color: 'border-amber-400 bg-amber-50/50 text-amber-800' },
    { key: 'SARPRAS', label: 'Sarana & Prasarana', icon: Building2, desc: 'Fasilitas kelas, meja, kursi, kipas, toilet, lab', color: 'border-emerald-400 bg-emerald-50/50 text-emerald-800' },
    { key: 'SEKOLAH', label: 'Layanan Sekolah', icon: HelpCircle, desc: 'Tata usaha, gerbang, lingkungan sekolah, keamanan', color: 'border-sky-400 bg-sky-50/50 text-sky-800' },
    { key: 'AKADEMIK', label: 'Akademik & Pembelajaran', icon: GraduationCap, desc: 'Jadwal, buku pelajaran, ulangan/tugas', color: 'border-indigo-400 bg-indigo-50/50 text-indigo-800' },
    { key: 'KESISWAAN', label: 'Kesiswaan & Ekstra', icon: Users, desc: 'Kegiatan OSIS, Pramuka, kedisiplinan', color: 'border-purple-400 bg-purple-50/50 text-purple-800' },
    { key: 'BULLYING', label: 'Anti Perundungan / Bullying', icon: ShieldAlert, desc: 'Laporan perundungan atau ancaman rasa aman', color: 'border-rose-400 bg-rose-50/50 text-rose-800' },
    { key: 'LAINNYA', label: 'Lainnya', icon: MoreHorizontal, desc: 'Aduan umum atau hal lainnya', color: 'border-slate-400 bg-slate-50/50 text-slate-800' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailAduan.trim()) return;

    setIsSubmitting(true);
    try {
      const finalName = isAnon ? 'Anonim' : (namaPelapor.trim() || 'Warga Sekolah');
      const res = await onSubmitReport({
        namaPelapor: finalName,
        statusPelapor: isAnon ? 'Anonim' : statusPelapor,
        kelas: kelas || undefined,
        kontak: kontak.trim() || undefined,
        jenisAduan,
        detailAduan: detailAduan.trim(),
        masukanSekolah: masukanSekolah.trim(),
      });
      setSuccessReport(res);
      // Reset form
      setNamaPelapor('');
      setKontak('');
      setDetailAduan('');
      setMasukanSekolah('');
      setIsAnon(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="lapor-spentiker" className="scroll-mt-24 my-12">
      <div className="bg-gradient-to-br from-white via-sky-50/40 to-blue-50/60 rounded-3xl border border-sky-200/80 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-sky-700 via-sky-600 to-blue-800 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/5 skew-x-12 pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-900 mb-3 shadow-xs">
              <MessageSquarePlus className="w-3.5 h-3.5" />
              PORTAL ASPIRASI & PENGADUAN
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Lapor Spentiker
            </h2>
            <p className="mt-1 text-sm md:text-base text-sky-100 leading-relaxed font-medium">
              Sampaikan pengaduan terkait PIP, sarana sekolah, layanan, maupun masukan saran perbaikan untuk SMP Negeri 3 Kertek secara terbuka atau anonim.
            </p>
          </div>
        </div>

        {/* Success Modal / State */}
        {successReport ? (
          <div className="p-8 md:p-12 text-center max-w-xl mx-auto animate-scaleUp">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              Laporan Berhasil Terkirim
            </span>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              Terima Kasih atas Aspirasi Anda!
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Laporan Anda telah tercatat di sistem Bank Data SMP Negeri 3 Kertek dan akan segera ditindaklanjuti oleh tim sekolah.
            </p>

            <div className="bg-slate-100/90 rounded-2xl p-4 mb-6 border border-slate-200 text-left">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                Kode Pelacakan Aduan
              </div>
              <div className="text-xl font-mono font-bold text-sky-700">
                {successReport.kodeAduan}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Kategori: <strong className="text-slate-700">{successReport.jenisAduan}</strong> | Status: <strong className="text-amber-600">Menunggu Verifikasi Sekolah</strong>
              </div>
            </div>

            <button
              onClick={() => setSuccessReport(null)}
              className="px-6 py-2.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Kirim Laporan Lainnya
            </button>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Identity & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Nama */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Nama Pelapor
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-sky-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnon}
                      onChange={(e) => setIsAnon(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>Rahasiakan / Anonim</span>
                  </label>
                </div>
                <input
                  type="text"
                  disabled={isAnon}
                  value={isAnon ? 'Anonim' : namaPelapor}
                  onChange={(e) => setNamaPelapor(e.target.value)}
                  placeholder={isAnon ? 'Identitas dirahasiakan' : 'Masukkan nama Anda'}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                    isAnon
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500'
                  }`}
                />
              </div>

              {/* Status Pelapor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status Pelapor
                </label>
                <select
                  disabled={isAnon}
                  value={statusPelapor}
                  onChange={(e) => setStatusPelapor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="Siswa">Siswa SMPN 3 Kertek</option>
                  <option value="Orang Tua / Wali">Orang Tua / Wali Murid</option>
                  <option value="Warga Sekolah">Warga / Guru / Staf</option>
                  <option value="Alumni">Alumni / Masyarakat</option>
                </select>
              </div>

              {/* Kelas & Kontak */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kelas (Opsional)
                  </label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">- Pilih -</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.nama}>
                        {c.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    No. WA / HP
                  </label>
                  <input
                    type="tel"
                    value={kontak}
                    onChange={(e) => setKontak(e.target.value)}
                    placeholder="08xxxxxxxx"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Jenis Aduan - Categories Card Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pilih Jenis Aduan <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = jenisAduan === cat.key;
                  return (
                    <button
                      type="button"
                      key={cat.key}
                      onClick={() => setJenisAduan(cat.key)}
                      className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? `border-sky-600 bg-sky-50/90 shadow-md ring-2 ring-sky-500 text-sky-950 font-bold`
                          : `border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-extrabold">{cat.label}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {cat.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail Aduan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detail Pengaduan <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={detailAduan}
                onChange={(e) => setDetailAduan(e.target.value)}
                placeholder="Tuliskan secara lengkap apa yang dialami, kendala buku rekening PIP, fasilitas yang rusak, atau hal yang perlu diperhatikan..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-inner"
              />
            </div>

            {/* Masukan untuk Sekolah */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Masukan / Saran untuk Sekolah
              </label>
              <textarea
                rows={3}
                value={masukanSekolah}
                onChange={(e) => setMasukanSekolah(e.target.value)}
                placeholder="Tuliskan solusi atau usulan saran perbaikan demi kemajuan SMP Negeri 3 Kertek..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-inner"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Laporan Anda dijamin kerahasiaannya dan ditindaklanjuti secara bertanggung jawab.
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !detailAduan.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-extrabold text-white bg-gradient-to-r from-sky-600 via-sky-700 to-blue-800 hover:from-sky-700 hover:to-blue-900 rounded-xl shadow-lg shadow-sky-600/30 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim Laporan...' : 'KIRIM LAPORAN SPENTIKER'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
