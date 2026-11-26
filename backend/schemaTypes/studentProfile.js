export default {
  name: 'studentProfile',
  type: 'document',
  title: 'Pengumuman Profil Siswa',
  description: 'Dikelola dari dashboard /gaming. NIS, nama, sekolah, dan link PDF disimpan terenkripsi (blob), jadi tidak bisa diedit di Studio.',
  readOnly: true,
  fields: [
    { name: 'nisHash', type: 'string', title: 'NIS (hash)' },
    { name: 'blob', type: 'text', title: 'Data terenkripsi' },
    { name: 'period', type: 'string', title: 'Periode (YYYY-MM)' },
    { name: 'publishedAt', type: 'datetime', title: 'Tanggal Terbit' }
  ]
}
