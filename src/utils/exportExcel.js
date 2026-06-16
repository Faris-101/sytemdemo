import { saveAs } from 'file-saver';

// Fungsi utama export dengan dynamic import untuk library XLSX yang berat
export async function exportToExcel(sheets, namaFile) {
  // Load library XLSX hanya saat dibutuhkan saja
  const XLSX = await import('xlsx');
  
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ nama, data, kolom }) => {
    // Kalau ada definisi kolom, pakai header custom
    const wsData = kolom
      ? [
          kolom.map((k) => k.label), // baris header
          ...data.map((row) => kolom.map((k) => row[k.key] ?? '')),
        ]
      : data;

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Lebar kolom otomatis
    if (kolom) {
      ws['!cols'] = kolom.map((k) => ({ wch: k.width || 20 }));
    }

    XLSX.utils.book_append_sheet(wb, ws, nama);
  });

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(
    new Blob([buf], { type: 'application/octet-stream' }),
    `${namaFile}_${formatTanggal(new Date())}.xlsx`
  );
}

// Format angka ke Rupiah untuk Excel
export function formatRpExcel(angka) {
  if (!angka && angka !== 0) return 0;
  return Number(angka);
}

// Format tanggal
export function formatTanggal(tgl) {
  if (!tgl) return '-';
  return new Date(tgl).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
