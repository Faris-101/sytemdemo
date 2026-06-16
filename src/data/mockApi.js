function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parsePathAndQuery(url, baseURL = "http://localhost") {
  try {
    const parsed = new URL(url, baseURL);
    return {
      path: parsed.pathname,
      query: Object.fromEntries(parsed.searchParams.entries()),
    };
  } catch (err) {
    const [path, queryString] = url.split("?");
    const params = new URLSearchParams(queryString || "");
    return {
      path,
      query: Object.fromEntries(params.entries()),
    };
  }
}

function matchPath(path, pattern) {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, "([^/]+)")}$`);
  const match = path.match(regex);
  if (!match) return null;
  return match.slice(1);
}

const mockState = {
  units: [
    { id: 1, kode: "M-01", blok: "Mahogany", tipe: "120/200", luas_tanah: 200, luas_bangunan: 120, harga: 1850000000, status: "Terjual", fasilitas: "Smart Home, Private Pool, 4 Kamar Tidur", catatan: "Unit sudut premium, hadap taman utama", created_at: "2026-01-05T00:00:00Z" },
    { id: 2, kode: "M-02", blok: "Mahogany", tipe: "120/200", luas_tanah: 200, luas_bangunan: 120, harga: 1850000000, status: "Terjual", fasilitas: "Smart Home, Private Pool, 4 Kamar Tidur", catatan: "Hadap Timur, pencahayaan alami maksimal", created_at: "2026-05-10T00:00:00Z" },
    { id: 3, kode: "M-03", blok: "Mahogany", tipe: "100/180", luas_tanah: 180, luas_bangunan: 100, harga: 1650000000, status: "Dipesan", fasilitas: "Smart Home, 3 Kamar Tidur, Garden", catatan: "Dekat Clubhouse dan fasilitas olahraga", created_at: "2026-06-01T00:00:00Z" },
    { id: 4, kode: "M-04", blok: "Mahogany", tipe: "100/180", luas_tanah: 180, luas_bangunan: 100, harga: 1650000000, status: "Tersedia", fasilitas: "Smart Home, 3 Kamar Tidur, Garden", catatan: "Posisi strategis di blok M", created_at: "2026-06-01T00:00:00Z" },
    { id: 5, kode: "M-05", blok: "Mahogany", tipe: "100/180", luas_tanah: 180, luas_bangunan: 100, harga: 1650000000, status: "Tersedia", fasilitas: "Smart Home, 3 Kamar Tidur, Garden", catatan: "Unit standar cluster Mahogany", created_at: "2026-06-01T00:00:00Z" },
    { id: 11, kode: "P-01", blok: "Pine", tipe: "60/120", luas_tanah: 120, luas_bangunan: 60, harga: 950000000, status: "Terjual", fasilitas: "2 Kamar Tidur, 1 Carport, Taman Depan", catatan: "Akses cepat ke pintu keluar cluster", created_at: "2026-03-01T00:00:00Z" },
    { id: 12, kode: "P-02", blok: "Pine", tipe: "60/120", luas_tanah: 120, luas_bangunan: 60, harga: 950000000, status: "Terjual", fasilitas: "2 Kamar Tidur, 1 Carport, Taman Depan", catatan: "Dekat area bermain anak (Playground)", created_at: "2025-12-01T00:00:00Z" },
    { id: 13, kode: "P-03", blok: "Pine", tipe: "60/120", luas_tanah: 120, luas_bangunan: 60, harga: 950000000, status: "Dipesan", fasilitas: "2 Kamar Tidur, 1 Carport, Taman Belakang", catatan: "Unit dengan sisa tanah lebih luas di belakang", created_at: "2026-06-05T00:00:00Z" },
    { id: 14, kode: "P-04", blok: "Pine", tipe: "45/90", luas_tanah: 90, luas_bangunan: 45, harga: 780000000, status: "Tersedia", fasilitas: "2 Kamar Tidur, 1 Carport", catatan: "Tipe favorit keluarga muda", created_at: "2026-06-10T00:00:00Z" },
    { id: 15, kode: "P-05", blok: "Pine", tipe: "45/90", luas_tanah: 90, luas_bangunan: 45, harga: 780000000, status: "Tersedia", fasilitas: "2 Kamar Tidur, 1 Carport", catatan: "Unit standar cluster Pine", created_at: "2026-06-10T00:00:00Z" },
    { id: 21, kode: "O-01", blok: "Oak", tipe: "36/72", luas_tanah: 72, luas_bangunan: 36, harga: 520000000, status: "Terjual", fasilitas: "2 Kamar Tidur, 1 Carport", catatan: "Dekat fasilitas jogging track cluster", created_at: "2026-02-01T00:00:00Z" },
    { id: 22, kode: "O-02", blok: "Oak", tipe: "36/72", luas_tanah: 72, luas_bangunan: 36, harga: 520000000, status: "Dipesan", fasilitas: "2 Kamar Tidur, 1 Carport", catatan: "Fasad minimalis modern", created_at: "2026-06-12T00:00:00Z" },
    { id: 23, kode: "O-03", blok: "Oak", tipe: "36/72", luas_tanah: 72, luas_bangunan: 36, harga: 520000000, status: "Tersedia", fasilitas: "2 Kamar Tidur, 1 Carport", catatan: "Unit siap bangun (Inden)", created_at: "2026-06-12T00:00:00Z" },
    { id: 24, kode: "O-04", blok: "Oak", tipe: "30/60", luas_tanah: 60, luas_bangunan: 30, harga: 420000000, status: "Tersedia", fasilitas: "1 Kamar Tidur, 1 Carport", catatan: "Cocok untuk investasi sewa", created_at: "2026-06-12T00:00:00Z" },
    { id: 25, kode: "O-05", blok: "Oak", tipe: "30/60", luas_tanah: 60, luas_bangunan: 30, harga: 420000000, status: "Blokir", fasilitas: "1 Kamar Tidur, 1 Carport", catatan: "Unit reserved untuk staff marketing", created_at: "2026-06-12T00:00:00Z" },
  ],

  leads: [
    { id: 101, nama: "Bambang Sugiantoro", hp: "081233445566", email: "bambang.s@gmail.com", sumber: "Instagram", status: "Tertarik", minat: "Mahogany", budget: 2000000000, marketing: "Andi Setiawan", catatan: "Mencari unit hook premium dengan view taman", created_at: "2026-06-10T10:00:00Z" },
    { id: 102, nama: "Maya Sari", hp: "081399887766", email: "mayasari@yahoo.com", sumber: "Website", status: "Survey", minat: "Pine", budget: 1000000000, marketing: "Dewi Rahma", catatan: "Sudah survey lokasi, tertarik tipe 60/120", created_at: "2026-06-08T14:30:00Z" },
    { id: 103, nama: "Dedi Kurniawan", hp: "085611223344", email: "dedikur@outlook.com", sumber: "Referral", status: "KPR", minat: "Oak", budget: 600000000, marketing: "Fajar Nugroho", catatan: "Sedang proses BI Checking di Bank BTN", created_at: "2026-06-05T09:15:00Z" },
    { id: 104, nama: "Rina Wijaya", hp: "081277665544", email: "rina.w@gmail.com", sumber: "Facebook", status: "Baru", minat: "Pine", budget: 850000000, marketing: "Maya Kusuma", catatan: "Tanya simulasi cicilan 15 tahun", created_at: "2026-06-13T11:20:00Z" },
    { id: 105, nama: "Hendra Gunawan", hp: "082133445566", email: "hendra.g@gmail.com", sumber: "TikTok", status: "Tertarik", minat: "Oak", budget: 500000000, marketing: "Andi Setiawan", catatan: "Ingin cicilan ringan atau DP 0%", created_at: "2026-06-14T08:45:00Z" },
  ],

  customers: [
    { id: 201, nama: "Andi Wijaya", hp: "081122334455", email: "andi.wijaya@gmail.com", unit_id: 1, unit_kode: "M-01", tipe: "120/200", total: 1850000000, terbayar: 1850000000, metode_bayar: "Cash Keras", sumber: "Walk-in", marketing: "Andi Setiawan", tgl_akad: "2026-01-15T00:00:00Z", catatan: "Pelunasan lunas 100%, serah terima kunci sudah dilakukan", status: "Lunas", created_at: "2026-01-05T00:00:00Z" },
    { id: 202, nama: "Siti Aminah", hp: "081266778899", email: "siti.aminah@mail.com", unit_id: 11, unit_kode: "P-01", tipe: "60/120", total: 950000000, terbayar: 190000000, metode_bayar: "KPR", sumber: "Instagram", marketing: "Dewi Rahma", tgl_akad: "2026-03-10T00:00:00Z", catatan: "DP 20% lunas, dokumen KPR sudah masuk ke Bank Mandiri", status: "Aktif", created_at: "2026-02-15T00:00:00Z" },
    { id: 203, nama: "Budi Santoso", hp: "081344556677", email: "budi.s@yahoo.com", unit_id: 21, unit_kode: "O-01", tipe: "36/72", total: 520000000, terbayar: 120000000, metode_bayar: "Cash Bertahap", sumber: "Website", marketing: "Fajar Nugroho", tgl_akad: "2026-02-05T00:00:00Z", catatan: "Tenor 12 bulan, cicilan bulan ke-5 belum masuk", status: "Menunggak", created_at: "2026-01-20T00:00:00Z" },
    { id: 204, nama: "Hendra Pratama", hp: "081288776655", email: "hendra.p@gmail.com", unit_id: 2, unit_kode: "M-02", tipe: "120/200", total: 1850000000, terbayar: 370000000, metode_bayar: "KPR", sumber: "Referral", marketing: "Maya Kusuma", tgl_akad: "2026-05-20T00:00:00Z", catatan: "DP lunas, akad KPR dijadwalkan akhir bulan ini", status: "Aktif", created_at: "2026-05-01T00:00:00Z" },
    { id: 205, nama: "Rizky Ramadhan", hp: "085711223344", email: "rizky.r@gmail.com", unit_id: 12, unit_kode: "P-02", tipe: "60/120", total: 950000000, terbayar: 950000000, metode_bayar: "KPR", sumber: "Pameran", marketing: "Andi Setiawan", tgl_akad: "2025-12-15T00:00:00Z", catatan: "KPR Cair penuh, unit sedang masa garansi", status: "Lunas", created_at: "2025-11-20T00:00:00Z" },
  ],

  bookings: [
    { id: 301, nama_calon: "Dewi Lestari", hp: "081255443322", nominal_booking: 20000000, tgl_booking: "2026-06-10", tgl_expired: "2026-06-24", unit_id: 3, unit_kode: "M-03", status: "Aktif", catatan: "Mahogany Cluster, rencana KPR via BNI" },
    { id: 302, nama_calon: "Raka Pradana", hp: "085711223344", nominal_booking: 10000000, tgl_booking: "2026-06-12", tgl_expired: "2026-06-26", unit_id: 13, unit_kode: "P-03", status: "Aktif", catatan: "Pine Cluster, sedang diskusi perubahan layout interior" },
    { id: 303, nama_calon: "Lia Ananta", hp: "081299001122", nominal_booking: 5000000, tgl_booking: "2026-06-13", tgl_expired: "2026-06-27", unit_id: 22, unit_kode: "O-02", status: "Aktif", catatan: "Oak Cluster, rencana Cash Bertahap 6x" },
  ],

  reminders: [
    { id: 401, lead_nama: "Bambang Sugiantoro", catatan: "Kirim brosur unit hook Mahogany", tgl_reminder: "2026-06-15", selesai: false },
    { id: 402, lead_nama: "Maya Sari", catatan: "Follow up hasil survey unit Pine", tgl_reminder: "2026-06-14", selesai: true },
    { id: 403, lead_nama: "Dedi Kurniawan", catatan: "Update status appraisal bank BTN", tgl_reminder: "2026-06-16", selesai: false },
    { id: 404, lead_nama: "Rina Wijaya", catatan: "Kirim simulasi cicilan KPR 15 thn", tgl_reminder: "2026-06-15", selesai: false },
  ],

  approvals: [
    { id: 501, jenis: "Diskon", judul: "Diskon Khusus 50jt - Mahogany M-03", deskripsi: "Customer Dewi Lestari minta diskon tambahan untuk closing unit Mahogany minggu ini.", nominal: 50000000, unit_kode: "M-03", customer_nama: "Dewi Lestari", status: "Pending", created_at: "2026-06-12T09:30:00Z" },
    { id: 502, jenis: "Booking Manual", judul: "Verifikasi Booking M-01 - Andi Wijaya", deskripsi: "Verifikasi transfer dana booking fee via Bank Mandiri.", nominal: 20000000, unit_kode: "M-01", customer_nama: "Andi Wijaya", status: "Disetujui", created_at: "2026-01-05T10:00:00Z" },
    { id: 503, jenis: "Pengeluaran", judul: "Biaya Event Open House Juni", deskripsi: "Pengajuan dana konsumsi dan dekorasi marketing gallery.", nominal: 12000000, unit_kode: "-", customer_nama: "-", status: "Pending", created_at: "2026-06-13T14:00:00Z" },
  ],

  keuangan: [
    { id: 601, jenis: "masuk", kategori: "Booking Fee", keterangan: "Booking M-01 - Andi Wijaya", nominal: 20000000, dicatat_oleh: "Sales", tgl: "2026-01-05" },
    { id: 602, jenis: "masuk", kategori: "DP", keterangan: "DP 20% M-01 - Andi Wijaya", nominal: 350000000, dicatat_oleh: "Finance", tgl: "2026-01-10" },
    { id: 603, jenis: "masuk", kategori: "Penjualan Unit", keterangan: "Pelunasan M-01 - Andi Wijaya", nominal: 1480000000, dicatat_oleh: "Finance", tgl: "2026-01-15" },
    { id: 604, jenis: "keluar", kategori: "Operasional", keterangan: "Gaji Karyawan Lapangan Mei", nominal: 45000000, dicatat_oleh: "Finance", tgl: "2026-06-01" },
    { id: 605, jenis: "keluar", kategori: "Marketing & Iklan", keterangan: "Social Media Ads (FB/IG) Juni", nominal: 10000000, dicatat_oleh: "Marketing", tgl: "2026-06-02" },
    { id: 606, jenis: "masuk", kategori: "Booking Fee", keterangan: "Booking O-01 - Budi Santoso", nominal: 5000000, dicatat_oleh: "Sales", tgl: "2026-02-01" },
  ],

  payments: [
    { id: 701, customer_id: 201, nominal: 20000000, tgl_bayar: "2026-01-05", metode: "Transfer", status: "Diverifikasi", keterangan: "Booking Fee M-01" },
    { id: 702, customer_id: 201, nominal: 350000000, tgl_bayar: "2026-01-10", metode: "Transfer", status: "Diverifikasi", keterangan: "DP Unit M-01" },
    { id: 703, customer_id: 201, nominal: 1480000000, tgl_bayar: "2026-01-15", metode: "Transfer", status: "Diverifikasi", keterangan: "Pelunasan Unit M-01" },
    { id: 704, customer_id: 203, nominal: 5000000, tgl_bayar: "2026-02-01", metode: "Transfer", status: "Diverifikasi", keterangan: "Booking Fee O-01" },
    { id: 705, customer_id: 203, nominal: 45000000, tgl_bayar: "2026-02-05", metode: "Transfer", status: "Diverifikasi", keterangan: "DP Unit O-01" },
    { id: 706, customer_id: 203, nominal: 35000000, tgl_bayar: "2026-03-05", metode: "Transfer", status: "Diverifikasi", keterangan: "Cicilan 1 Cash Bertahap" },
    { id: 707, customer_id: 203, nominal: 35000000, tgl_bayar: "2026-04-05", metode: "Transfer", status: "Diverifikasi", keterangan: "Cicilan 2 Cash Bertahap" },
  ],

  tiket: [
    { id: 801, judul: "AC Kamar Utama Tidak Dingin", deskripsi: "Unit M-01, AC baru dipasang tapi kurang dingin, mohon cek teknisi.", kategori: "Elektronik", prioritas: "Sedang", customer_id: 201, unit_id: 1, status: "Diproses", tgl_dibuat: "2026-06-10" },
    { id: 802, judul: "Kran Wastafel Bocor", deskripsi: "Unit M-01, ada rembesan air di pipa wastafel dapur.", kategori: "Plumbing", prioritas: "Tinggi", customer_id: 201, unit_id: 1, status: "Selesai", tgl_dibuat: "2026-05-15" },
    { id: 803, judul: "Cat Dinding Mengelupas", deskripsi: "Unit P-02, cat di area balkon mulai mengelupas.", kategori: "Finishing", prioritas: "Rendah", customer_id: 205, unit_id: 12, status: "Baru", tgl_dibuat: "2026-06-12" },
  ],

  garansi: [
    { id: 901, customer_id: 201, unit_id: 1, item_garansi: "Struktur Bangunan", tipe_garansi: "10 Tahun", tgl_mulai: "2026-02-01", status: "Aktif" },
    { id: 902, customer_id: 201, unit_id: 1, item_garansi: "Pipa & Sanitasi", tipe_garansi: "1 Tahun", tgl_mulai: "2026-02-01", status: "Aktif" },
    { id: 903, customer_id: 205, unit_id: 12, item_garansi: "Struktur Bangunan", tipe_garansi: "10 Tahun", tgl_mulai: "2026-01-10", status: "Aktif" },
  ],

  survei: [
    { id: 1001, customer_id: 201, tipe: "Pasca BAST", skor_nps: 10, skor_kualitas: 5, skor_pelayanan: 5, komentar: "Kualitas bangunan sangat rapi, layanan sales Bapak Andi sangat membantu." },
    { id: 1002, customer_id: 205, tipe: "Pasca BAST", skor_nps: 9, skor_kualitas: 4, skor_pelayanan: 5, komentar: "Secara keseluruhan bagus, proses serah terima tepat waktu." },
  ],

  referral: [
    { id: 1101, referrer_id: 201, nama_referral: "Hendra Pratama", hp_referral: "081288776655", status: "Selesai", catatan: "Closing unit M-02" },
    { id: 1102, referrer_id: 205, nama_referral: "Siska Dewi", hp_referral: "081122338877", status: "Pending", catatan: "Tertarik unit Oak" },
  ],

  akuntansi: {
    akun: [
      { id: 1, nama: "Kas & Bank", tipe: "Aset", saldo: 3250000000 },
      { id: 2, nama: "Piutang Penjualan", tipe: "Aset", saldo: 5400000000 },
      { id: 3, nama: "Persediaan Tanah & Bangunan", tipe: "Aset", saldo: 12500000000 },
      { id: 4, nama: "Hutang Usaha", tipe: "Kewajiban", saldo: 1200000000 },
      { id: 5, nama: "Hutang Bank", tipe: "Kewajiban", saldo: 4500000000 },
      { id: 6, nama: "Modal Saham", tipe: "Modal", saldo: 10000000000 },
      { id: 7, nama: "Pendapatan Penjualan", tipe: "Pendapatan", saldo: 3700000000 },
      { id: 8, nama: "Beban Gaji & Upah", tipe: "Beban", saldo: 450000000 },
      { id: 9, nama: "Beban Marketing", tipe: "Beban", saldo: 180000000 },
    ],
    labaRugi: [
      { bulan: "Jan", pendapatan: 1850000000, beban: 150000000 },
      { bulan: "Feb", pendapatan: 0, beban: 120000000 },
      { bulan: "Mar", pendapatan: 950000000, beban: 135000000 },
      { bulan: "Apr", pendapatan: 0, beban: 110000000 },
      { bulan: "Mei", pendapatan: 900000000, beban: 140000000 },
      { bulan: "Jun", pendapatan: 0, beban: 95000000 },
    ],
    neraca: { aset: 21150000000, kewajiban: 5700000000, modal: 15450000000 },
    jurnal: [
      { id: 1201, tgl: "2026-01-15", akun: "Kas", deskripsi: "Pelunasan Unit M-01 - Andi Wijaya", debit: 1480000000, kredit: 0 },
      { id: 1202, tgl: "2026-01-15", akun: "Pendapatan Penjualan", deskripsi: "Penjualan Unit M-01", debit: 0, kredit: 1850000000 },
      { id: 1203, tgl: "2026-06-01", akun: "Beban Gaji", deskripsi: "Pembayaran Gaji Staff Mei", debit: 45000000, kredit: 0 },
      { id: 1204, tgl: "2026-06-02", akun: "Beban Iklan", deskripsi: "Biaya Iklan Digital Juni", debit: 10000000, kredit: 0 },
    ],
    hutang: [
      { id: 1301, pemasok: "PT Semen Indonesia", nominal: 250000000, jatuh_tempo: "2026-07-15" },
      { id: 1302, pemasok: "CV Baja Makmur", nominal: 180000000, jatuh_tempo: "2026-07-20" },
    ],
  },

  dokumen: [
    { id: 1401, customer_id: 201, nama: "KTP & NPWP", status: "Ada", updated_at: "2026-01-05" },
    { id: 1402, customer_id: 201, nama: "Perjanjian Pengikatan Jual Beli (PPJB)", status: "Ada", updated_at: "2026-01-15" },
    { id: 1403, customer_id: 202, nama: "Slip Gaji & Rekening Koran", status: "Ada", updated_at: "2026-03-01" },
    { id: 1404, customer_id: 203, nama: "Formulir Aplikasi Unit", status: "Ada", updated_at: "2026-02-01" },
  ],

  bast: [
    { id: 1501, customer_id: 201, customer_nama: "Andi Wijaya", unit_id: 1, unit_kode: "M-01", tgl_serah_terima: "2026-02-01", status: "Selesai", kondisi: "Sangat Baik" },
    { id: 1502, customer_id: 205, customer_nama: "Rizky Ramadhan", unit_id: 12, unit_kode: "P-02", tgl_serah_terima: "2026-01-10", status: "Selesai", kondisi: "Baik" },
  ],

  proyek: [
    { id: 1601, kode: "GSR-01", nama: "Grand Surya Residence", lokasi: "Cibubur, Jawa Barat", tipe: "Residensial & Komersial", total_unit: 150, luas_lahan: 50000, tgl_mulai: "2025-01-01", tgl_target: "2027-12-31", nilai_proyek: 250000000000, deskripsi: "Pengembangan hunian terpadu dengan fasilitas lengkap dan akses strategis.", status: "Berjalan" },
  ],

  kontraktor: [
    { id: 1701, nama: "PT Wijaya Karya (Persero) Tbk", status: "Aktif" },
    { id: 1702, nama: "PT Adhi Karya (Persero) Tbk", status: "Aktif" },
  ],

  milestones: [
    { id: 1801, proyek_id: 1601, nama: "Pembersihan Lahan (Land Clearing)", urutan: 1, tgl_target: "2025-03-01", persen_bobot: 5, catatan: "Selesai tepat waktu" },
    { id: 1802, proyek_id: 1601, nama: "Pembangunan Infrastruktur Jalan", urutan: 2, tgl_target: "2025-08-01", persen_bobot: 15, catatan: "Akses utama sudah diaspal" },
    { id: 1803, proyek_id: 1601, nama: "Pondasi Cluster Mahogany", urutan: 3, tgl_target: "2026-01-01", persen_bobot: 10, catatan: "Selesai, lanjut struktur" },
    { id: 1804, proyek_id: 1601, nama: "Pondasi Cluster Pine", urutan: 4, tgl_target: "2026-04-01", persen_bobot: 10, catatan: "Dalam pengerjaan 80%" },
  ],

  kontrak: [
    { id: 1901, proyek_id: 1601, kontraktor_id: 1701, no_kontrak: "CTR/GSR/2025/001", pekerjaan: "Infrastruktur & Drainase Utama", nilai_kontrak: 45000000000, tgl_mulai: "2025-01-10", tgl_akhir: "2025-12-31", termin_bayar: "Bulanan berdasarkan progress" },
    { id: 1902, proyek_id: 1601, kontraktor_id: 1702, no_kontrak: "CTR/GSR/2026/005", pekerjaan: "Struktur & Arsitektur Cluster Mahogany", nilai_kontrak: 75000000000, tgl_mulai: "2026-01-15", tgl_akhir: "2027-03-31", termin_bayar: "Per 20% progress" },
  ],

  promos: [
    { id: 2001, kode: "DASYAT06", nama: "Promo Juni Dahsyat", deskripsi: "Diskon DP 50% untuk unit Cluster Pine selama bulan Juni.", diskon: "50% DP", kuota: 10, terpakai: 2, tgl_mulai: "2026-06-01", tgl_akhir: "2026-06-30", status: "Aktif" },
    { id: 2002, kode: "FREEAC", nama: "Bonus AC 3 Unit", deskripsi: "Bonus 3 unit AC untuk setiap pembelian Mahogany.", diskon: "Bonus Barang", kuota: 5, terpakai: 1, tgl_mulai: "2026-01-01", tgl_akhir: "2026-12-31", status: "Aktif" },
  ],

  legal: {
    sertifikat: [
      { id: 2701, unit_kode: "M-01", nama: "SHM Unit M-01", status: "Terbit", tgl_terbit: "2026-01-10" },
      { id: 2702, unit_kode: "P-02", nama: "SHGB Unit P-02", status: "Proses BBN", tgl_terbit: "-" },
    ],
    perizinan: [
      { id: 2801, nama: "PBG (Persetujuan Bangunan Gedung) Induk", status: "Selesai", tgl_selesai: "2024-12-20" },
      { id: 2802, nama: "Izin Lingkungan (AMDAL)", status: "Selesai", tgl_selesai: "2024-11-15" },
    ],
    akad: [
      { id: 2901, customer_nama: "Andi Wijaya", unit_kode: "M-01", tgl_akad: "2026-01-15", status: "Selesai" },
      { id: 2902, customer_nama: "Rizky Ramadhan", unit_kode: "P-02", tgl_akad: "2025-12-15", status: "Selesai" },
    ],
    esign: [
      { id: 3001, nama_dokumen: "PPJB M-02 - Hendra Pratama", status: "Menunggu Ttd", tgl_kirim: "2026-06-12" },
    ],
    arsip: [
      { id: 3101, nama_dokumen: "Hardcopy PPJB M-01", lokasi: "Lemari A/Rak 1", status: "Tersimpan" },
    ],
    kpr: [
      { id: 3201, customer_nama: "Siti Aminah", bank: "Bank Mandiri", nominal: 760000000, status: "Approval" },
      { id: 3202, customer_nama: "Hendra Pratama", bank: "Bank BTN", nominal: 1480000000, status: "Analisa" },
    ],
    dokumen: [
      { id: 3301, nama: "Sertifikat Induk HGB", status: "Ada" },
      { id: 3302, nama: "Siteplan Disetujui", status: "Ada" },
    ]
  },

  timsales: [
    { id: 3401, nama: "Andi Setiawan", role: "Sales Manager", status: "Aktif" },
    { id: 3402, nama: "Dewi Rahma", role: "Senior Sales", status: "Aktif" },
    { id: 3403, nama: "Fajar Nugroho", role: "Junior Sales", status: "Aktif" },
    { id: 3404, nama: "Maya Kusuma", role: "Junior Sales", status: "Aktif" },
  ],

  cicilan: [
    { id: 3501, customer_id: 203, nama: "Budi Santoso", unit_kode: "O-01", keterangan: "Cicilan 1", nominal: 35000000, status: "Lunas", tgl_jatuh_tempo: "2026-03-05", tgl_bayar: "2026-03-05", metode: "Transfer Bank" },
    { id: 3502, customer_id: 203, nama: "Budi Santoso", unit_kode: "O-01", keterangan: "Cicilan 2", nominal: 35000000, status: "Lunas", tgl_jatuh_tempo: "2026-04-05", tgl_bayar: "2026-04-05", metode: "Transfer Bank" },
    { id: 3503, customer_id: 203, nama: "Budi Santoso", unit_kode: "O-01", keterangan: "Cicilan 3", nominal: 35000000, status: "Belum", tgl_jatuh_tempo: "2026-05-05" },
    { id: 3504, customer_id: 203, nama: "Budi Santoso", unit_kode: "O-01", keterangan: "Cicilan 4", nominal: 35000000, status: "Telat", tgl_jatuh_tempo: "2026-06-05" },
    { id: 3505, customer_id: 202, nama: "Siti Aminah", unit_kode: "P-01", keterangan: "Pelunasan DP 1", nominal: 95000000, status: "Lunas", tgl_jatuh_tempo: "2026-03-15", tgl_bayar: "2026-03-12", metode: "Transfer Bank" },
    { id: 3506, customer_id: 202, nama: "Siti Aminah", unit_kode: "P-01", keterangan: "Pelunasan DP 2", nominal: 95000000, status: "Lunas", tgl_jatuh_tempo: "2026-04-15", tgl_bayar: "2026-04-14", metode: "Transfer Bank" },
  ],

  progress: [
    { id: 3601, kode: "M-01", blok: "Mahogany", tipe: "120/200", tahap: "Selesai", persen: 100, unit_id: 1 },
    { id: 3602, kode: "M-02", blok: "Mahogany", tipe: "120/200", tahap: "Selesai", persen: 100, unit_id: 2 },
    { id: 3603, kode: "M-03", blok: "Mahogany", tipe: "100/180", tahap: "Finishing", persen: 85, unit_id: 3 },
    { id: 3604, kode: "P-01", blok: "Pine", tipe: "60/120", tahap: "Struktur", persen: 65, unit_id: 11 },
    { id: 3605, kode: "O-01", blok: "Oak", tipe: "36/72", tahap: "Pondasi", persen: 30, unit_id: 21 },
  ],

  material: [
    { id: 4001, proyek_id: 1601, nama: "Semen Portland", satuan: "Sak", harga_satuan: 65000, stok_masuk: 5000, stok_keluar: 3200, stok_sisa: 1800, supplier: "PT Semen Indonesia" },
    { id: 4002, proyek_id: 1601, nama: "Besi Beton 10mm", satuan: "Batang", harga_satuan: 85000, stok_masuk: 2000, stok_keluar: 1450, stok_sisa: 550, supplier: "CV Baja Makmur" },
    { id: 4003, proyek_id: 1601, nama: "Bata Merah", satuan: "Buah", harga_satuan: 800, stok_masuk: 150000, stok_keluar: 98000, stok_sisa: 52000, supplier: "UD Bata Sentosa" },
    { id: 4004, proyek_id: 1601, nama: "Pasir Cor", satuan: "M3", harga_satuan: 320000, stok_masuk: 800, stok_keluar: 720, stok_sisa: 80, supplier: "CV Pasir Jaya" },
    { id: 4005, proyek_id: 1601, nama: "Cat Tembok Exterior", satuan: "Kg", harga_satuan: 45000, stok_masuk: 600, stok_keluar: 600, stok_sisa: 0, supplier: "PT Avian Brands" },
  ],

  foto: [],

  pekerja: [
    { id: 5001, proyek_id: 1601, nama: "Slamet Riyadi", jabatan: "Mandor", hp: "081234567890", upah_harian: 180000, tgl_masuk: "2025-02-01", status: "Aktif" },
    { id: 5002, proyek_id: 1601, nama: "Joko Susilo", jabatan: "Tukang", hp: "081298765432", upah_harian: 130000, tgl_masuk: "2025-02-01", status: "Aktif" },
    { id: 5003, proyek_id: 1601, nama: "Agus Setiawan", jabatan: "Tukang", hp: "082112345678", upah_harian: 130000, tgl_masuk: "2025-03-15", status: "Aktif" },
    { id: 5004, proyek_id: 1601, nama: "Rudi Hartono", jabatan: "Laden", hp: "085711122233", upah_harian: 110000, tgl_masuk: "2025-04-01", status: "Aktif" },
    { id: 5005, proyek_id: 1601, nama: "Bayu Pratama", jabatan: "Spesialis MEP", hp: "081355566677", upah_harian: 220000, tgl_masuk: "2026-01-10", status: "Tidak Aktif" },
  ],

  inspeksi: [
    {
      id: 6001, proyek_id: 1601, unit_id: 1, unit_kode: "M-01", tipe: "Final", inspektor: "Ir. Hendrawan Saputra", tgl_inspeksi: "2026-01-25", status: "Lulus",
      items: [
        { id: 60011, item: "Kualitas Pengecatan", hasil: "OK", catatan: "" },
        { id: 60012, item: "Instalasi Listrik & Lampu", hasil: "OK", catatan: "" },
        { id: 60013, item: "Sanitasi & Plumbing", hasil: "OK", catatan: "" },
        { id: 60014, item: "Kebersihan Unit", hasil: "OK", catatan: "Siap BAST" },
      ],
    },
    {
      id: 6002, proyek_id: 1601, unit_id: 3, unit_kode: "M-03", tipe: "Finishing", inspektor: "Ir. Hendrawan Saputra", tgl_inspeksi: "2026-06-08", status: "Perlu Perbaikan",
      items: [
        { id: 60021, item: "Kerataan Plafon", hasil: "OK", catatan: "" },
        { id: 60022, item: "Pengecatan Dinding", hasil: "Tidak OK", catatan: "Ada retak rambut di ruang tamu, perlu diplamir ulang" },
        { id: 60023, item: "Pemasangan Keramik", hasil: "OK", catatan: "" },
        { id: 60024, item: "Kusen & Pintu", hasil: "Tidak OK", catatan: "Pintu kamar utama belum rapi, perlu penyesuaian" },
      ],
    },
    {
      id: 6003, proyek_id: 1601, unit_id: 11, unit_kode: "P-01", tipe: "Struktur", inspektor: "Dewi Anggraini, ST", tgl_inspeksi: "2026-05-20", status: "Lulus",
      items: [
        { id: 60031, item: "Kualitas Pengecoran Kolom", hasil: "OK", catatan: "" },
        { id: 60032, item: "Kelurusan Dinding Bata", hasil: "OK", catatan: "" },
        { id: 60033, item: "Ketinggian Lantai", hasil: "OK", catatan: "" },
      ],
    },
  ],

  absensi: [
    { id: 7001, pekerja_id: 5001, tgl: "2026-06-09", status: "Hadir", upah_dibayar: 180000 },
    { id: 7002, pekerja_id: 5001, tgl: "2026-06-10", status: "Hadir", upah_dibayar: 180000 },
    { id: 7003, pekerja_id: 5001, tgl: "2026-06-11", status: "Hadir", upah_dibayar: 180000 },
    { id: 7004, pekerja_id: 5001, tgl: "2026-06-12", status: "Tidak Hadir", upah_dibayar: 0 },
    { id: 7005, pekerja_id: 5001, tgl: "2026-06-13", status: "Hadir", upah_dibayar: 180000 },
    { id: 7006, pekerja_id: 5002, tgl: "2026-06-09", status: "Hadir", upah_dibayar: 130000 },
    { id: 7007, pekerja_id: 5002, tgl: "2026-06-10", status: "Hadir", upah_dibayar: 130000 },
    { id: 7008, pekerja_id: 5002, tgl: "2026-06-11", status: "Hadir", upah_dibayar: 130000 },
    { id: 7009, pekerja_id: 5002, tgl: "2026-06-12", status: "Hadir", upah_dibayar: 130000 },
    { id: 7010, pekerja_id: 5002, tgl: "2026-06-13", status: "Hadir", upah_dibayar: 130000 },
  ],
};

function getSummary() {
  const masuk = mockState.keuangan
    .filter((t) => t.jenis === "masuk")
    .reduce((sum, item) => sum + item.nominal, 0);
  const keluar = mockState.keuangan
    .filter((t) => t.jenis === "keluar")
    .reduce((sum, item) => sum + item.nominal, 0);
  return {
    total_masuk: masuk,
    total_keluar: keluar,
    laba_kotor: masuk - keluar,
    total_piutang: mockState.customers.reduce(
      (sum, c) => sum + Math.max(0, c.total - c.terbayar),
      0,
    ),
  };
}

function getChartData() {
  return [
    { label: "Jan", masuk: 1850000000, laba: 1700000000 },
    { label: "Feb", masuk: 5000000, laba: -115000000 },
    { label: "Mar", masuk: 0, laba: -135000000 },
    { label: "Apr", masuk: 0, laba: -110000000 },
    { label: "Mei", masuk: 0, laba: -140000000 },
    { label: "Jun", masuk: 0, laba: -55000000 },
  ];
}

function getSurveiRingkasan() {
  return {
    nps: 9.5,
    total: 2,
    positif: 2,
    netral: 0,
    negatif: 0,
  };
}

function getProgressSummary() {
  const groups = mockState.progress.reduce((acc, item) => {
    acc[item.blok] = acc[item.blok] || {
      blok: item.blok,
      total_unit: 0,
      selesai: 0,
      persen: 0,
    };
    acc[item.blok].total_unit += 1;
    acc[item.blok].persen += item.persen;
    if (item.persen === 100) acc[item.blok].selesai += 1;
    return acc;
  }, {});
  return Object.values(groups).map((group) => ({
    blok: group.blok,
    total_unit: group.total_unit,
    unit_selesai: group.selesai,
    rata_persen: Math.round(group.persen / group.total_unit),
  }));
}

function getMockResponse(config) {
  const method = (config.method || "get").toLowerCase();
  const { path, query } = parsePathAndQuery(config.url, config.baseURL);

  if (method === "get") {
    if (path === "/units") {
      const status = query.status;
      const units = status
        ? mockState.units.filter((u) => u.status === status)
        : mockState.units;
      return clone(units);
    }

    if (path === "/leads") {
      const status = query.status;
      const leads = status
        ? mockState.leads.filter((l) => l.status === status)
        : mockState.leads;
      return clone(leads);
    }

    if (path === "/customers/me") {
      return clone(mockState.customers[0] || null);
    }

    if (path === "/customers") {
      const status = query.status;
      const customers = status
        ? mockState.customers.filter((c) => c.status === status)
        : mockState.customers;
      return clone(customers);
    }

    if (path === "/payments") {
      const customerId = query.customer_id ? Number(query.customer_id) : null;
      return clone(
        customerId
          ? mockState.payments.filter((p) => p.customer_id === customerId)
          : mockState.payments,
      );
    }

    if (path === "/bookings") {
      const status = query.status;
      const bookings = status
        ? mockState.bookings.filter((b) => b.status === status)
        : mockState.bookings;
      return clone(bookings);
    }

    if (path === "/keuangan") {
      const jenis = query.jenis;
      const transaksi = jenis
        ? mockState.keuangan.filter((item) => item.jenis === jenis)
        : mockState.keuangan;
      return clone(transaksi);
    }

    if (path === "/keuangan/summary") {
      return clone(getSummary());
    }

    if (path === "/keuangan/chart") {
      return clone(getChartData());
    }

    if (path === "/approvals") {
      const status = query.status;
      return clone(
        status
          ? mockState.approvals.filter((item) => item.status === status)
          : mockState.approvals,
      );
    }

    if (path === "/approvals/badge") {
      return clone({
        jumlah: mockState.approvals.filter((item) => item.status === "Pending")
          .length,
      });
    }

    if (path === "/reminders") {
      const selesai = query.selesai;
      const reminders =
        typeof selesai !== "undefined"
          ? mockState.reminders.filter(
              (item) => String(item.selesai) === String(selesai),
            )
          : mockState.reminders;
      return clone(reminders);
    }

    if (path === "/tiket") {
      return clone(mockState.tiket);
    }

    if (path === "/garansi") {
      return clone(mockState.garansi);
    }

    if (path === "/survei") {
      return clone(mockState.survei);
    }

    if (path === "/survei/ringkasan") {
      return clone(getSurveiRingkasan());
    }

    if (path === "/referral") {
      return clone(mockState.referral);
    }

    if (path === "/akuntansi/akun") {
      return clone(mockState.akuntansi.akun);
    }

    if (path === "/akuntansi/neraca") {
      return clone(mockState.akuntansi.neraca);
    }

    if (path === "/akuntansi/labarugi") {
      return clone(mockState.akuntansi.labaRugi);
    }

    if (path === "/akuntansi/jurnal") {
      return clone(mockState.akuntansi.jurnal);
    }

    if (path.startsWith("/akuntansi/jurnal/")) {
      const ids = matchPath(path, "/akuntansi/jurnal/:id");
      if (ids) {
        const id = Number(ids[0]);
        return clone(
          mockState.akuntansi.jurnal.find((item) => item.id === id) || null,
        );
      }
    }

    if (path === "/akuntansi/hutang") {
      return clone(mockState.akuntansi.hutang);
    }

    if (path === "/dokumen") {
      const customerId = query.customer_id ? Number(query.customer_id) : null;
      return clone(
        customerId
          ? mockState.dokumen.filter((item) => item.customer_id === customerId)
          : mockState.dokumen,
      );
    }

    if (path.startsWith("/dokumen/")) {
      const ids = matchPath(path, "/dokumen/:id");
      if (ids) {
        const id = Number(ids[0]);
        return clone(mockState.dokumen.find((item) => item.id === id) || null);
      }
    }

    if (path === "/bast") {
      return clone(mockState.bast);
    }

    if (path.startsWith("/bast/")) {
      const ids = matchPath(path, "/bast/:id");
      if (ids) {
        const id = Number(ids[0]);
        return clone(mockState.bast.find((item) => item.id === id) || null);
      }
    }

    if (path === "/proyek") {
      return clone(mockState.proyek);
    }

    if (path === "/proyek/kontraktor/list") {
      return clone(mockState.kontraktor);
    }

    if (path.startsWith("/proyek/") && path.endsWith("/milestones")) {
      const ids = matchPath(path, "/proyek/:id/milestones");
      const proyekId = Number(ids?.[0]);
      return clone(
        mockState.milestones.filter((item) => item.proyek_id === proyekId),
      );
    }

    if (path.startsWith("/proyek/") && path.endsWith("/kontrak")) {
      const ids = matchPath(path, "/proyek/:id/kontrak");
      const proyekId = Number(ids?.[0]);
      return clone(
        mockState.kontrak.filter((item) => item.proyek_id === proyekId),
      );
    }

    if (path.startsWith("/proyek/inspeksi/")) {
      const ids = matchPath(path, "/proyek/inspeksi/:id");
      const id = Number(ids?.[0]);
      return clone(
        mockState.inspeksi.find((item) => item.id === id) || null,
      );
    }

    if (path.startsWith("/proyek/") && path.endsWith("/material")) {
      const ids = matchPath(path, "/proyek/:id/material");
      const proyekId = Number(ids?.[0]);
      return clone(
        mockState.material.filter((item) => item.proyek_id === proyekId),
      );
    }

    if (path.startsWith("/proyek/") && path.endsWith("/foto")) {
      const ids = matchPath(path, "/proyek/:id/foto");
      const proyekId = Number(ids?.[0]);
      return clone(
        mockState.foto.filter((item) => item.proyek_id === proyekId),
      );
    }

    if (path.startsWith("/proyek/") && path.endsWith("/pekerja")) {
      const ids = matchPath(path, "/proyek/:id/pekerja");
      const proyekId = Number(ids?.[0]);
      return clone(
        mockState.pekerja.filter((item) => item.proyek_id === proyekId),
      );
    }

    if (path.startsWith("/proyek/") && path.endsWith("/inspeksi")) {
      const ids = matchPath(path, "/proyek/:id/inspeksi");
      const proyekId = Number(ids?.[0]);
      return clone(
        mockState.inspeksi.filter((item) => item.proyek_id === proyekId),
      );
    }

    if (path.startsWith("/proyek/pekerja/") && path.endsWith("/absensi")) {
      const ids = matchPath(path, "/proyek/pekerja/:id/absensi");
      const pekerjaId = Number(ids?.[0]);
      return clone(
        mockState.absensi.filter((item) => item.pekerja_id === pekerjaId),
      );
    }

    if (path === "/promos") {
      return clone(mockState.promos);
    }

    if (path.startsWith("/promos/") && path.endsWith("/usage")) {
      const ids = matchPath(path, "/promos/:id/usage");
      return clone({
        promo:
          mockState.promos.find((item) => item.id === Number(ids?.[0])) || null,
        usage: [
          { tanggal: "2026-06-10", nama: "Dewi Lestari", diskon: "50% DP" },
          { tanggal: "2026-01-05", nama: "Andi Wijaya", diskon: "Bonus AC" },
        ],
      });
    }

    if (path === "/timsales") {
      return clone(mockState.timsales);
    }

    if (path === "/cicilan/") {
      // Return customer list summary for cicilan panel
      const today = new Date();
      const customersSummary = mockState.customers.map((cust) => {
        const items = mockState.cicilan.filter(
          (ci) => ci.customer_id === cust.id,
        );
        const telat = items.filter((it) => {
          if (!it.tgl_jatuh_tempo) return false;
          const due = new Date(it.tgl_jatuh_tempo);
          return due < today &&
            it.status !== "Lunas"
            ? true
            : false;
        }).length;
        const futureDates = items
          .map((it) =>
            it.tgl_jatuh_tempo ? new Date(it.tgl_jatuh_tempo) : null,
          )
          .filter((d) => d && d >= today)
          .sort((a, b) => a - b);
        const jatuh_tempo_berikutnya = futureDates.length
          ? futureDates[0].toISOString()
          : null;

        return {
          id: cust.id,
          nama: cust.nama,
          unit_kode: cust.unit_kode,
          metode_bayar: cust.metode_bayar,
          total: cust.total || 0,
          terbayar: cust.terbayar || 0,
          cicilan_telat: telat,
          jatuh_tempo_berikutnya,
        };
      });

      return clone(customersSummary);
    }

    if (path.startsWith("/cicilan/")) {
      // Return list of cicilan entries for a given customer id
      const ids = matchPath(path, "/cicilan/:id");
      const id = Number(ids?.[0]);
      const customerCicilan = mockState.cicilan.filter(
        (item) => item.customer_id === id,
      );
      return clone(customerCicilan);
    }

    if (path === "/progress") {
      return clone(mockState.progress);
    }

    if (path === "/progress/summary") {
      return clone(getProgressSummary());
    }

    if (path.startsWith("/progress/") && !path.endsWith("/summary")) {
      const ids = matchPath(path, "/progress/:id");
      const id = Number(ids?.[0]);
      return clone(mockState.progress.find((item) => item.id === id) || null);
    }

    if (path === "/legal/sertifikat") {
      return clone(mockState.legal.sertifikat);
    }

    if (path === "/legal/perizinan") {
      return clone(mockState.legal.perizinan);
    }

    if (path === "/legal/akad") {
      return clone(mockState.legal.akad);
    }

    if (path === "/legal/esign") {
      return clone(mockState.legal.esign);
    }

    if (path === "/legal/arsip") {
      return clone(mockState.legal.arsip);
    }

    if (path === "/legal/kpr") {
      return clone(mockState.legal.kpr);
    }

    if (path === "/legal/dokumen/ringkasan") {
      return clone({
        total: mockState.legal.dokumen.length,
        tersimpan: mockState.legal.dokumen.length,
      });
    }

    if (path === "/auth/login") {
      return clone({
        user: {
          id: 1,
          nama: "Administrator",
          username: "admin",
          role: "admin",
        },
        token: "fake-token-123",
      });
    }
  }

  if (["post", "put", "patch", "delete"].includes(method)) {
    return clone({ success: true });
  }

  return null;
}

export default getMockResponse;
