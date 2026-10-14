import { useColorScheme } from 'nativewind';

/**
 * Hex values for the few places className can't reach (SVG fills, native props, navigator styles).
 * They mirror the Tailwind tokens used on the web: slate / ink / brand.
 */
export function usePalette() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  return {
    dark,
    bg: dark ? '#0a0f1e' : '#f8fafc',
    surface: dark ? '#101831' : '#ffffff',
    surfaceAlt: dark ? '#1a2444' : '#f1f5f9',
    border: dark ? '#1a2444' : '#e2e8f0',
    text: dark ? '#f1f5f9' : '#0f172a',
    muted: dark ? '#94a3b8' : '#64748b',
    placeholder: dark ? '#64748b' : '#94a3b8',
    brand: dark ? '#94b0ff' : '#2f45dc',
    brandSolid: '#2f45dc',
    spinner: '#2f45dc',
    switchTrackOff: dark ? '#27345c' : '#cbd5e1',
  };
}
