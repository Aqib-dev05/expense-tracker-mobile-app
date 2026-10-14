import { useState } from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { Lock, Mail, User } from 'lucide-react-native';
import AuthShell from '@/components/AuthShell';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import Select from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { CURRENCIES } from '@/constants';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/store/ToastContext';
import type { ApiError } from '@/types';

type Errors = Partial<Record<'name' | 'email' | 'password' | 'currency', string>>;

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', currency: 'PKR' });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const submit = async () => {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (Object.keys(e).length) return setErrors(e);

    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, currency: form.currency });
      toast.success('Account created. Welcome aboard!');
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.details?.length) setErrors(Object.fromEntries(apiErr.details.map((d) => [d.field, d.message])));
      else if (apiErr.status === 409) setErrors({ email: apiErr.message });
      toast.error(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <View className="gap-5">
        <View>
          <Text className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Create your account</Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">Start tracking income, expenses and budgets in minutes.</Text>
        </View>
        <Input label="Full name" autoComplete="name" leftIcon={User} placeholder="Aqib Ali" value={form.name} onChangeText={(v) => set('name', v)} error={errors.name} />
        <Input label="Email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" leftIcon={Mail}
          placeholder="you@example.com" value={form.email} onChangeText={(v) => set('email', v)} error={errors.email} />
        <Input label="Password" secureTextEntry autoCapitalize="none" autoComplete="new-password" leftIcon={Lock}
          placeholder="At least 8 characters" value={form.password} onChangeText={(v) => set('password', v)} error={errors.password} />
        <Select label="Currency" options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))} value={form.currency} onChange={(v) => set('currency', v)} error={errors.currency} />
        <Button size="lg" className="w-full" loading={loading} onPress={submit}>Create account</Button>
        <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link href="/login"><Text className="text-sm font-semibold text-brand-600 dark:text-brand-300">Log in</Text></Link>
        </Text>
      </View>
    </AuthShell>
  );
}
