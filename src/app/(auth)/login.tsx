import { useState } from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import AuthShell from '@/components/AuthShell';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/store/ToastContext';
import type { ApiError } from '@/types';

type Errors = { email?: string; password?: string; form?: string };

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const set = (k: 'email' | 'password', v: string) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined, form: undefined })); };

  const submit = async () => {
    const e: Errors = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Enter your password';
    if (Object.keys(e).length) return setErrors(e);

    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
    } catch (err) {
      const apiErr = err as ApiError;
      setErrors({ form: apiErr.message });
      if (apiErr.status !== 401) toast.error(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <View className="gap-5">
        <View>
          <Text className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome back</Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">Log in to see where your money is going.</Text>
        </View>
        {errors.form ? (
          <View accessibilityRole="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 dark:border-rose-500/30 dark:bg-rose-500/10">
            <Text className="text-sm font-medium text-rose-700 dark:text-rose-300">{errors.form}</Text>
          </View>
        ) : null}
        <Input label="Email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" leftIcon={Mail}
          placeholder="you@example.com" value={form.email} onChangeText={(v) => set('email', v)} error={errors.email} />
        <Input label="Password" secureTextEntry autoCapitalize="none" autoComplete="current-password" leftIcon={Lock}
          placeholder="Your password" value={form.password} onChangeText={(v) => set('password', v)} error={errors.password} onSubmitEditing={submit} />
        <View className="-mt-2 items-end">
          <Link href="/forgot-password"><Text className="text-sm font-semibold text-brand-600 dark:text-brand-300">Forgot password?</Text></Link>
        </View>
        <Button size="lg" className="w-full" loading={loading} onPress={submit}>Log in</Button>
        <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
          New here?{' '}
          <Link href="/register"><Text className="text-sm font-semibold text-brand-600 dark:text-brand-300">Create an account</Text></Link>
        </Text>
      </View>
    </AuthShell>
  );
}
