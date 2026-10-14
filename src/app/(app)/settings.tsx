import { useEffect, useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Bell, BellRing, Camera, Clock, Moon, Sun, Trash2, type LucideIcon } from 'lucide-react-native';
import Screen from '@/components/ui/Screen';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Select from '@/components/ui/Select';
import Text from '@/components/ui/Text';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { CURRENCIES, DATE_FORMATS, type DateFormat } from '@/constants';
import { cancelDailyReminder, hasNotificationPermission, requestNotificationPermission, scheduleDailyReminder } from '@/lib/notifications';
import { useAuth } from '@/store/AuthContext';
import { usePreferences } from '@/store/PreferencesContext';
import { useToast } from '@/store/ToastContext';
import { usePalette } from '@/hooks/useTheme';
import type { ApiError } from '@/types';

const pad = (n: number) => String(n).padStart(2, '0');
const timeLabel = (h: number, m: number) => `${h % 12 === 0 ? 12 : h % 12}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;

/** Centre-crops (via the picker's square editor), downsizes and compresses to a small JPEG data URL for the avatar. */
async function pickAvatarDataUrl(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  // Android's photo picker works without a runtime permission on recent versions, so only bail on an explicit hard denial.
  if (!perm.granted && !perm.canAskAgain && perm.status === 'denied') throw new Error('Allow photo access in system settings to choose a picture.');

  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 });
  if (res.canceled || !res.assets[0]) return null;

  const ctx = ImageManipulator.manipulate(res.assets[0].uri).resize({ width: 128, height: 128 });
  const ref = await ctx.renderAsync();
  const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.82, base64: true });
  if (!out.base64) throw new Error('Could not read that image');
  return `data:image/jpeg;base64,${out.base64}`;
}

function ToggleRow({ icon, title, subtitle, value, onChange, disabled }: {
  icon: LucideIcon; title: string; subtitle: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  const p = usePalette();
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/15">
        <Icon as={icon} size={18} className="text-brand-600 dark:text-brand-300" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold text-slate-900 dark:text-white">{title}</Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        accessibilityLabel={title}
        trackColor={{ false: p.switchTrackOff, true: '#6283fb' }}
        thumbColor={value ? '#2f45dc' : '#f8fafc'}
      />
    </View>
  );
}

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme, dateFormat, setDateFormat, budgetAlerts, dailyReminder, reminderHour, reminderMinute, update } = usePreferences();
  const toast = useToast();

  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '', avatar: user?.avatar || '' });
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'avatar', string>>>({});
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState(user?.currency ?? 'PKR');
  const [savingCurrency, setSavingCurrency] = useState(false);

  useEffect(() => { if (user) setCurrency(user.currency); }, [user]);

  if (!user) return null;
  const dirty = profile.name !== user.name || profile.email !== user.email || profile.avatar !== (user.avatar || '');

  const pickAvatar = async () => {
    try {
      const dataUrl = await pickAvatarDataUrl();
      if (dataUrl) setProfile((p) => ({ ...p, avatar: dataUrl }));
    } catch (e) { toast.error((e as Error).message); }
  };

  const saveProfile = async () => {
    const found: typeof errors = {};
    if (profile.name.trim().length < 2) found.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(profile.email.trim())) found.email = 'Enter a valid email address';
    if (Object.keys(found).length) return setErrors(found);

    setSaving(true);
    try {
      await updateProfile({ name: profile.name.trim(), email: profile.email.trim(), avatar: profile.avatar });
      setErrors({});
      toast.success('Profile updated');
    } catch (e) {
      const err = e as ApiError;
      if (err.details?.length) setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      else if (err.status === 409) setErrors({ email: err.message });
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  const saveCurrency = async (value: string) => {
    setCurrency(value);
    setSavingCurrency(true);
    try {
      await updateProfile({ currency: value });
      toast.success('Currency updated');
    } catch (e) {
      setCurrency(user.currency);
      toast.error((e as Error).message);
    } finally { setSavingCurrency(false); }
  };

  const toggleAlerts = async (on: boolean) => {
    if (on && !(await requestNotificationPermission())) {
      toast.error('Notifications are blocked. Enable them for Ledgerly in system settings.');
      return;
    }
    update({ budgetAlerts: on });
  };

  const toggleReminder = async (on: boolean) => {
    if (on) {
      if (!(await scheduleDailyReminder(reminderHour, reminderMinute))) {
        toast.error('Notifications are blocked. Enable them for Ledgerly in system settings.');
        return;
      }
    } else {
      await cancelDailyReminder();
    }
    update({ dailyReminder: on });
  };

  const pickTime = () =>
    DateTimePickerAndroid.open({
      value: new Date(2000, 0, 1, reminderHour, reminderMinute),
      mode: 'time',
      is24Hour: false,
      onValueChange: async (_e, date) => {
        const h = date.getHours(), m = date.getMinutes();
        update({ reminderHour: h, reminderMinute: m });
        if (dailyReminder && (await hasNotificationPermission())) await scheduleDailyReminder(h, m);
        toast.success(`Reminder set for ${timeLabel(h, m)}`);
      },
    });

  return (
    <Screen>
      <PageHeader title="Settings" subtitle="Manage your profile, preferences and appearance." />

      <View className="w-full max-w-3xl gap-6 self-center">
        <Card>
          <CardHeader title="Profile" subtitle="Your name, email and photo." />
          <View className="gap-5">
            <View className="flex-row items-center gap-4">
              <Avatar user={{ name: profile.name, avatar: profile.avatar }} size="lg" />
              <View className="flex-row flex-wrap gap-2">
                <Button variant="secondary" size="sm" icon={Camera} onPress={pickAvatar}>Upload photo</Button>
                {profile.avatar ? <Button variant="ghost" size="sm" icon={Trash2} onPress={() => setProfile((p) => ({ ...p, avatar: '' }))}>Remove</Button> : null}
              </View>
            </View>
            <Input label="Name" value={profile.name} onChangeText={(v) => setProfile((p) => ({ ...p, name: v }))} error={errors.name} autoComplete="name" />
            <Input label="Email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={profile.email}
              onChangeText={(v) => setProfile((p) => ({ ...p, email: v }))} error={errors.email} autoComplete="email" />
            {errors.avatar ? <Text className="text-xs font-medium text-rose-600">{errors.avatar}</Text> : null}
            <View className="items-end">
              <Button loading={saving} disabled={!dirty} onPress={saveProfile}>Save profile</Button>
            </View>
          </View>
        </Card>

        <Card>
          <CardHeader title="Preferences" subtitle="How amounts and dates are displayed." />
          <View className="gap-4">
            <Select
              label="Currency" options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))}
              value={currency} onChange={saveCurrency} disabled={savingCurrency}
              hint="Only changes how amounts are shown; stored values aren’t converted."
            />
            <Select label="Date format" options={DATE_FORMATS} value={dateFormat}
              onChange={(v) => { setDateFormat(v as DateFormat); toast.success('Date format updated'); }} hint="Saved on this device." />
          </View>
        </Card>

        <Card>
          <CardHeader title="Notifications" subtitle="Local alerts — no account or internet needed." />
          <View className="gap-5">
            <ToggleRow icon={BellRing} title="Budget alerts" subtitle="When a budget reaches 80% or is exceeded." value={budgetAlerts} onChange={toggleAlerts} />
            <ToggleRow icon={Bell} title="Daily reminder" subtitle="A nudge to log your spending." value={dailyReminder} onChange={toggleReminder} />
            {dailyReminder ? (
              <Pressable onPress={pickTime} accessibilityRole="button" className="h-11 flex-row items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-3.5 dark:border-ink-700 dark:bg-ink-800">
                <Icon as={Clock} size={16} className="text-slate-400" />
                <Text className="flex-1 text-sm text-slate-900 dark:text-slate-100">Remind me at {timeLabel(reminderHour, reminderMinute)}</Text>
              </Pressable>
            ) : null}
          </View>
        </Card>

        <Card>
          <CardHeader title="Appearance" subtitle="Your choice is remembered on this device." />
          <View className="flex-row gap-3" accessibilityRole="radiogroup">
            {([{ value: 'light', label: 'Light', icon: Sun }, { value: 'dark', label: 'Dark', icon: Moon }] as const).map(({ value, label, icon }) => {
              const active = theme === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  onPress={() => setTheme(value)}
                  className={`h-14 flex-1 flex-row items-center justify-center gap-2 rounded-xl border-2 ${
                    active ? 'border-brand-600 bg-brand-50 dark:bg-brand-500/15' : 'border-slate-200 active:bg-slate-50 dark:border-ink-700 dark:active:bg-ink-800'
                  }`}
                >
                  <Icon as={icon} size={20} className={active ? 'text-brand-700 dark:text-brand-200' : 'text-slate-600 dark:text-slate-300'} />
                  <Text className={`text-sm font-semibold ${active ? 'text-brand-700 dark:text-brand-200' : 'text-slate-600 dark:text-slate-300'}`}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </View>
    </Screen>
  );
}
