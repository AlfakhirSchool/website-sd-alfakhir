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
    }
  ]
}
