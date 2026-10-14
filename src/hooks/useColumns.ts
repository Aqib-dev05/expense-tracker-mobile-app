import { useWindowDimensions } from 'react-native';

/** Mirrors the web breakpoints (sm = 640, xl = 1280) so tablets get the same multi-column grids. */
export default function useColumns(map: { base: number; sm?: number; xl?: number }) {
  const { width } = useWindowDimensions();
  if (width >= 1280 && map.xl) return map.xl;
  if (width >= 640 && map.sm) return map.sm;
  return map.base;
}
