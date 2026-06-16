import { useState } from 'react';
import api from '../api/axios';

export default function PromoInput({ harga, onApply }) {
  const [kode, setKode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleValidasi() {
    if (!kode) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/promos/validasi', {
        kode,
        harga: Number(harga),
      });
      setResult(res.data);
      onApply(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Kode tidak valid');
    } finally {
      setLoading(false);
    }
  }

  function handleHapus() {
    setKode('');
    setResult(null);
    setError('');
    onApply(null);
  }

  return (
    <div>
      <label style={labelStyle}>Kode Promo</label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={kode}
          onChange={(e) => setKode(e.target.value.toUpperCase())}
          placeholder="Masukkan kode promo (opsional)"
          disabled={!!result}
          style={inputStyle}
        />
        {!result ? (
          <button
            type="button"
            onClick={handleValidasi}
            disabled={loading || !kode}
            style={btnStyle}
          >
            {loading ? '...' : 'Pakai'}
          </button>
        ) : (
          <button type="button" onClick={handleHapus} style={btnCancelStyle}>
            Hapus
          </button>
        )}
      </div>
      {error && (
        <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '5px' }}>{error}</div>
      )}
      {result && (
        <div style={resultStyle}>
          ✓ <strong>{result.promo.nama}</strong> — hemat{' '}
          <strong style={{ color: 'var(--success)' }}>
            {result.promo.tipe === 'Persen' ? `${result.promo.nilai}%` : formatRp(result.diskon_rp)}
          </strong>{' '}
          ({formatRp(result.diskon_rp)} dari {formatRp(result.harga_asal)})
          <div style={{ marginTop: '4px', fontSize: '12px' }}>
            Harga akhir:{' '}
            <strong style={{ color: 'var(--g1)' }}>{formatRp(result.harga_akhir)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function formatRp(n) {
  if (!n && n !== 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '700',
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '5px',
};
const inputStyle = {
  flex: 1,
  padding: '9px 12px',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: 'var(--sans)',
};
const btnStyle = {
  padding: '9px 16px',
  background: 'var(--g1)',
  color: 'var(--gold2)',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600',
  whiteSpace: 'nowrap',
  fontFamily: 'var(--sans)',
};
const btnCancelStyle = {
  padding: '9px 16px',
  background: 'var(--danger-soft)',
  color: 'var(--danger)',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600',
  whiteSpace: 'nowrap',
  fontFamily: 'var(--sans)',
};
const resultStyle = {
  marginTop: '8px',
  background: 'var(--success-soft)',
  borderRadius: '8px',
  padding: '10px 12px',
  fontSize: '13px',
  color: 'var(--success)',
  lineHeight: 1.6,
};
