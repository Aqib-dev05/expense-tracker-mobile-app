import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Text from './ui/Text';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <View className={`flex-row items-center gap-2.5 ${className}`} accessibilityLabel="Ledgerly">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M4 17l5-6 4 4 7-9" />
        </Svg>
      </View>
      <Text className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Ledgerly</Text>
    </View>
  );
}
