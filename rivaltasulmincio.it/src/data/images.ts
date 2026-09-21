import imagesJson from '../../data/images/place-images.json';
import type { PlaceImage } from '../types';

/** Fotografie dei luoghi: dataset → tipo. La logica sta in `src/places/images.ts`. */
export const placeImages: PlaceImage[] = imagesJson as PlaceImage[];
