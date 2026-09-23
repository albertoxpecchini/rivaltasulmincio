/*
 * Identità del progetto (BRAND.md). Testi fissi, non dati: per questo vivono
 * qui e non in un dataset.
 */
export const site = {
  name: 'Rivalta sul Mincio',
  tagline: 'Il paese, in ogni suo dato.',
  fullName: 'Rivalta sul Mincio — il paese, in ogni suo dato',
  description:
    'Rivalta sul Mincio, in ogni dato: territorio, persone, attività, servizi, natura, storia ed eventi.',
  institutional:
    'Rivalta sul Mincio è una frazione del Comune di Rodigo, in provincia di Mantova, affacciata sulla Riserva Naturale Valli del Mincio. Questo progetto raccoglie e organizza dati territoriali, attività, servizi, luoghi, storia, ambiente ed eventi attraverso fonti ufficiali, OpenStreetMap e documentazione locale.',
  origin: 'https://www.rivaltasulmincio.it',
  /** Chi ha fatto il progetto: firma nel piè di pagina. */
  author: { name: 'Alberto Pecchini', url: 'https://albertopecchini.it' },
  navigation: [
    { href: '/', label: 'Home' },
    { href: '/giornale', label: 'Giornale' },
    { href: '/mappa', label: 'Mappa' },
    { href: '/luoghi', label: 'Luoghi' },
    { href: '/meteo', label: 'Meteo' },
    { href: '/fonti', label: 'Fonti' },
  ],
  /** Interruttori dei sistemi che dipendono da fonti esterne. */
  features: {
    /** Meteo da MeteoMincio in Home e in navigazione (la pagina /meteo resta raggiungibile). */
    weather: true,
  },
} as const;
