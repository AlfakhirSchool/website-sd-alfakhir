export default {
  name: 'teacher',
  title: 'Guru & Staff',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nama Lengkap',
      type: 'string',
    },
    {
      name: 'role',
      title: 'Jabatan / Mata Pelajaran',
      type: 'string',
    },
    { name: 'image', type: 'image', title: 'Foto Guru (Limit Sanity)', options: { hotspot: true } },
    { name: 'externalImage', type: 'string', title: 'URL Foto Luar (Unlimited)' },
    { name: 'order', type: 'number', title: 'Urutan Tampil' }
  ]
}
