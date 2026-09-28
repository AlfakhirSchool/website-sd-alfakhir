export default {
  name: 'settings',
  title: 'Pengaturan Website',
  type: 'document',
  fields: [
    {
      name: 'brochureUrl',
      title: 'Link Iframe Heyzine (Flipbook)',
      type: 'string',
    },
    {
        name: 'registrationEnabled',
        title: 'Buka Pendaftaran Online',
        type: 'boolean'
    },
    {
        name: 'structureUrl',
        title: 'URL Bagan Struktur (Unlimited)',
        type: 'string'
    },
    {
        name: 'activeWave',
        title: 'Gelombang Pendaftaran Aktif',
        description: 'Pendaftar baru otomatis masuk ke gelombang ini. Naikkan setelah hasil gelombang sebelumnya dipublikasikan.',
        type: 'string',
        options: { list: ['1', '2', '3'] },
        initialValue: '1'
    }
  ]
}
