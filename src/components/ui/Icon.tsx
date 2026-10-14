import type { StyleProp, ViewStyle } from 'react-native';
import { cssInterop } from 'nativewind';
import type { LucideIcon } from 'lucide-react-native';

interface IconProps {
  as: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

function BaseIcon({ as: Glyph, size = 18, color = '#64748b', strokeWidth = 2, style }: IconProps) {
  return <Glyph size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}

/**
 * Lucide icon (the same icon set as the web app) that understands Tailwind colour classes:
 *   <Icon as={Wallet} size={18} className="text-brand-600 dark:text-brand-300" />
 */
export const Icon = cssInterop(BaseIcon, {
  className: { target: 'style', nativeStyleToProp: { color: true } },
});
