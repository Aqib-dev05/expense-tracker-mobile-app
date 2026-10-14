import { Children, useState, type ReactNode } from 'react';
import { View } from 'react-native';

/**
 * Equal-width responsive grid (the web `grid grid-cols-N gap-X`). Column count is chosen by the caller
 * (see useColumns); item widths are computed from the measured container so `gap` is exact.
 */
export default function Grid({ cols, gap = 16, children, className = '' }: {
  cols: number; gap?: number; children: ReactNode; className?: string;
}) {
  const [width, setWidth] = useState(0);
  const items = Children.toArray(children);

  if (cols <= 1) {
    return <View className={className} style={{ gap }}>{items}</View>;
  }

  const itemWidth = width > 0 ? (width - gap * (cols - 1)) / cols : undefined;
  return (
    <View
      className={className}
      onLayout={(e) => setWidth(Math.floor(e.nativeEvent.layout.width))}
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}
    >
      {items.map((child, i) => (
        <View key={i} style={itemWidth ? { width: itemWidth } : { flexBasis: `${Math.floor(100 / cols) - 2}%`, flexGrow: 1 }}>
          {child}
        </View>
      ))}
    </View>
  );
}
