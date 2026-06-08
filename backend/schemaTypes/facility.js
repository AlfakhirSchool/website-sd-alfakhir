export default {
  name: 'facility',
  type: 'document',
  title: 'Fasilitas Sekolah',
  fields: [
    { name: 'name', type: 'string', title: 'Nama Fasilitas' },
    { name: 'image', type: 'image', title: 'Foto Fasilitas (Limit Sanity)', options: { hotspot: true } },
    { name: 'externalImage', type: 'string', title: 'URL Foto Luar (Unlimited)' },
    { name: 'description', type: 'text', title: 'Deskripsi Fasilitas' }
  ]
}
