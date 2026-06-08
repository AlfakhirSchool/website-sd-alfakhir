export default {
  name: 'gallery',
  type: 'document',
  title: 'Galeri & Agenda',
  fields: [
    { name: 'title', type: 'string', title: 'Judul Acara / Foto' },
    { 
      name: 'category', 
      type: 'string', 
      title: 'Kategori',
      options: {
        list: [
          { title: 'Acara', value: 'acara' },
          { title: 'Berita', value: 'berita' },
          { title: 'Penghargaan', value: 'penghargaan' },
          { title: 'Lain-lain', value: 'lain-lain' }
        ]
      }
    },
    { name: 'image', type: 'image', title: 'Upload Foto (Limit Sanity)', options: { hotspot: true } },
    { name: 'externalImage', type: 'string', title: 'URL Foto Luar (Unlimited)', description: 'Otomatis terisi jika menggunakan ImgBB/Proxmox' },
    { name: 'date', type: 'string', title: 'Tanggal Acara', description: 'Contoh: 12 Mei 2026' },
    { name: 'agenda', type: 'text', title: 'Penjelasan Agenda' }
  ]
}
