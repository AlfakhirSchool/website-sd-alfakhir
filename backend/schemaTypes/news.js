export default {
  name: 'news',
  title: 'Berita & Artikel',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Judul',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Short Link (Slug)',
      type: 'slug',
      options: { source: 'title' }
    },
    {
      name: 'date',
      title: 'Tanggal Publish',
      type: 'date',
    },
    {
      name: 'mainImage',
      title: 'Gambar Utama (Limit Sanity)',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'externalImage',
      type: 'string',
      title: 'URL Gambar Utama Luar (Unlimited)'
    },
    {
      name: 'body',
      title: 'Isi Berita',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }]
    }
  ]
}
