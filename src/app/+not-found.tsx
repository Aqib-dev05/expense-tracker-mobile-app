import { View } from 'react-native';
import { Link } from 'expo-router';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-6 dark:bg-ink-950">
      <Text className="text-5xl font-extrabold text-brand-600">404</Text>
      <Text className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Page not found</Text>
      <Text className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">The page you’re looking for doesn’t exist or was moved.</Text>
      <Link href="/" asChild className="mt-6"><Button>Back to dashboard</Button></Link>
    </View>
  );
}
