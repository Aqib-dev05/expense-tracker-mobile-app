import { Text as RNText, type TextProps } from 'react-native';

// Manrope ships as one font file per weight, and Android needs the exact family name for each.
// The Tailwind `font-*` weight classes used in className are mapped onto those families here,
// so markup stays identical to the web app (`font-bold`, `font-extrabold`, ...).
const FAMILIES = {
  extrabold: 'Manrope_800ExtraBold',
  bold: 'Manrope_700Bold',
  semibold: 'Manrope_600SemiBold',
  medium: 'Manrope_500Medium',
  normal: 'Manrope_400Regular',
} as const;

export function fontFamilyFor(className = '') {
  if (/(^|\s)font-extrabold(\s|$)/.test(className)) return FAMILIES.extrabold;
  if (/(^|\s)font-bold(\s|$)/.test(className)) return FAMILIES.bold;
  if (/(^|\s)font-semibold(\s|$)/.test(className)) return FAMILIES.semibold;
  if (/(^|\s)font-medium(\s|$)/.test(className)) return FAMILIES.medium;
  return FAMILIES.normal;
}

const HAS_COLOR = /(^|\s)text-(slate|white|black|brand|rose|emerald|amber|ink|sky|red|green|gray|zinc|\[#)/;
const DEFAULT_COLOR = 'text-slate-900 dark:text-slate-100';

export interface AppTextProps extends TextProps {
  className?: string;
}

export default function Text({ className = '', style, ...props }: AppTextProps) {
  return (
    <RNText
      {...props}
      className={HAS_COLOR.test(className) ? className : `${DEFAULT_COLOR} ${className}`}
      // fontWeight is reset so Android doesn't fake-bold a font that is already the bold file
      style={[{ fontFamily: fontFamilyFor(className), fontWeight: 'normal', fontVariant: ['tabular-nums'] }, style]}
    />
  );
}
