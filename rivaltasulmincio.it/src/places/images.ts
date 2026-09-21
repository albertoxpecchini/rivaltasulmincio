import { placeImages } from '../data/images';
import type { PlaceImage } from '../types';

/** La fotografia di un luogo, quando il progetto ne ha una. */
export function placeImage(slug: string): PlaceImage | undefined {
  return placeImages.find((image) => image.placeSlug === slug);
}

export function hasPlaceImage(slug: string): boolean {
  return placeImages.some((image) => image.placeSlug === slug);
}

/** Numero di luoghi fotografati: serve alle pagine d'elenco. */
export function photographedCount(): number {
  return new Set(placeImages.map((image) => image.placeSlug)).size;
}
