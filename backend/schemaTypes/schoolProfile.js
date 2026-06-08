export default {
  name: 'schoolProfile',
  title: 'Profil Sekolah (Konten Statis)',
  type: 'document',
  fields: [
    {
      name: 'type',
      title: 'Jenis Konten',
      type: 'string',
      options: {
        list: [
          { title: 'Sejarah', value: 'history' },
          { title: 'Sambutan Kepala Sekolah', value: 'welcome' },
          { title: 'Visi Misi', value: 'visimisi' }
        ]
      }
    },
    {
      name: 'content',
      title: 'Isi Konten',
      type: 'array',
      of: [{ type: 'block' }]
    },
    {
      name: 'founderImage',
      title: 'Foto Pendiri / Utama',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'externalImage',
      type: 'string',
      title: 'URL Foto Luar (Unlimited)'
    }
  ]
}
