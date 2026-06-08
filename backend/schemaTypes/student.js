export default {
  name: 'student',
  type: 'document',
  title: 'Daftar Siswa',
  fields: [
    { name: 'id', type: 'string', title: 'No. Peserta' },
    { name: 'name', type: 'string', title: 'Nama Lengkap' },
    { name: 'school', type: 'string', title: 'Asal Sekolah' },
    { name: 'score', type: 'string', title: 'Nilai (B/BB/etc)', initialValue: 'B' },
    { name: 'note', type: 'string', title: 'Catatan Observasi' },
    { name: 'status', type: 'string', title: 'Status', initialValue: 'Diterima' },
    { name: 'year', type: 'string', title: 'Tahun Ajaran', initialValue: '2025/2026' },
    { name: 'wave', type: 'string', title: 'Gelombang', initialValue: '1' }
  ]
}
