/*
 * Fotografie (IMAGES.md «Metadati», «Alt text», «Responsive images»).
 *
 * Le fotografie del progetto sono un dato curato in casa: non vengono da
 * OpenStreetMap e non seguono la sincronizzazione. Ogni voce è legata a un
 * luogo tramite `placeSlug`, così la scheda del luogo resta la sola pagina
 * che decide come mostrarla.
 */

export type PlaceImage = {
  /** ID stabile (`img-001`): non cambia mai. */
  id: string;
  /** Luogo a cui la fotografia appartiene (`Place.slug`). */
  placeSlug: string;
  /** Variante più grande: è il `src` di fallback. */
  src: string;
  /** Larghezze disponibili sul disco, per costruire `srcset`. */
  widths: number[];
  /** Dimensioni reali della variante più grande: servono a `width`/`height`. */
  width: number;
  height: number;
  /** Descrizione del contenuto reale (IMAGES.md «Alt text»). */
  alt: string;
  caption?: string;
  credit?: string;
  license?: string;
  dateTaken?: string;
};
