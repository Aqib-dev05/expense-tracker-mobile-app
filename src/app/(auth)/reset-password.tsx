import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Link, Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { KeyRound, Lock } from 'lucide-react-native';
import AuthShell from '@/components/AuthShell';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { forgotPassword, resetPassword } from '@/services/authService';
import { useToast } from '@/store/ToastContext';
import type { ApiError } from '@/types';

const RESEND_SECONDS = 60;

type Errors = Partial<Record<'otp' | 'password' | 'confirm' | 'form', string>>;

export default function ResetPassword() {
  const router = useRouter();
  const toast = useToast();
  const { email: emailParam } = useLocalSearchParams<{ email?: string | string[] }>();
  const email = (Array.isArray(emailParam) ? emailParam[0] : emailParam) ?? '';

  const [form, setForm] = useState({ otp: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS); // a code was just sent on the previous screen

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Opened without an email (e.g. app restarted on this screen): start again from the first step.
  if (!email) return <Redirect href="/forgot-password" />;

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: k === 'otp' ? v.replace(/\D/g, '').slice(0, 6) : v }));
    setErrors((e) => ({ ...e, [k]: undefined, form: undefined }));
  };

  const submit = async () => {
    const e: Errors = {};
    if (!/^\d{6}$/.test(form.otp)) e.otp = 'Enter the 6-digit code from your email';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    if (Object.keys(e).length) return setErrors(e);

    setLoading(true);
    try {
      await resetPassword({ email, otp: form.otp, password: form.password });
      toast.success('Password updated. Log in with your new password.');
      router.replace('/login');
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.details?.length) setErrors(Object.fromEntries(apiErr.details.map((d) => [d.field, d.message])));
      else setErrors({ form: apiErr.message });
      if (apiErr.status !== 400) toast.error(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await forgotPassword(email);
      setCooldown(RESEND_SECONDS);
      toast.success('If this email is registered, a new code is on its way.');
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell>
      <View className="gap-5">
        <View>
          <Text className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Reset password</Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            We sent a 6-digit code to <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">{email}</Text>. It expires in 10 minutes.
          </Text>
        </View>
        {errors.form ? (
          <View accessibilityRole="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 dark:border-rose-500/30 dark:bg-rose-500/10">
            <Text className="text-sm font-medium text-rose-700 dark:text-rose-300">{errors.form}</Text>
          </View>
        ) : null}
        <Input label="Verification code" keyboardType="number-pad" autoComplete="sms-otp" maxLength={6} leftIcon={KeyRound}
          placeholder="123456" value={form.otp} onChangeText={(v) => set('otp', v)} error={errors.otp} />
        <Input label="New password" secureTextEntry autoCapitalize="none" autoComplete="new-password" leftIcon={Lock}
          placeholder="At least 8 characters" value={form.password} onChangeText={(v) => set('password', v)} error={errors.password} />
        <Input label="Confirm new password" secureTextEntry autoCapitalize="none" autoComplete="new-password" leftIcon={Lock}
          placeholder="Re-enter new password" value={form.confirm} onChangeText={(v) => set('confirm', v)} error={errors.confirm} onSubmitEditing={submit} />
        <Button size="lg" className="w-full" loading={loading} onPress={submit}>Reset password</Button>
        <Button variant="ghost" size="sm" className="self-center" loading={resending} disabled={cooldown > 0} onPress={resend}>
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </Button>
        <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
          Wrong email?{' '}
          <Link href="/forgot-password"><Text className="text-sm font-semibold text-brand-600 dark:text-brand-300">Start over</Text></Link>
        </Text>
      </View>
    </AuthShell>
  );
}
