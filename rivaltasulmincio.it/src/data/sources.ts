import sourcesJson from '../../data/sources/sources.json';
import hierarchyJson from '../../data/sources/hierarchy.json';
import type { Source, SourceHierarchyRule } from '../types';

/** Registro fonti: dataset → tipo. La logica sta in `src/services/sources.ts`. */
export const sources: Source[] = sourcesJson as Source[];
export const sourceHierarchy: SourceHierarchyRule[] = hierarchyJson as SourceHierarchyRule[];
