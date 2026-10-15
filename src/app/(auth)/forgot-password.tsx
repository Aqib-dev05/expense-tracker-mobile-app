import { useState } from 'react';
import { View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';
import AuthShell from '@/components/AuthShell';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { forgotPassword } from '@/services/authService';
import { useToast } from '@/store/ToastContext';
import type { ApiError } from '@/types';

export default function ForgotPassword() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) return setError('Enter a valid email address');

    setLoading(true);
    try {
      await forgotPassword(value);
      toast.success('If this email is registered, a 6-digit code is on its way.');
      router.push({ pathname: '/reset-password', params: { email: value } });
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <View className="gap-5">
        <View>
          <Text className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Forgot password?</Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter your account email and we will send you a 6-digit code to reset your password.
          </Text>
        </View>
        <Input label="Email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" leftIcon={Mail}
          placeholder="you@example.com" value={email} onChangeText={(v) => { setEmail(v); setError(undefined); }}
          error={error} onSubmitEditing={submit} />
        <Button size="lg" className="w-full" loading={loading} onPress={submit}>Send code</Button>
        <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
          Remembered it?{' '}
          <Link href="/login"><Text className="text-sm font-semibold text-brand-600 dark:text-brand-300">Back to log in</Text></Link>
        </Text>
      </View>
    </AuthShell>
  );
}
