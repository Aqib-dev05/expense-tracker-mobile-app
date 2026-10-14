import api, { tokenStore } from './api';
import type { User } from '@/types';

type Credentials = { email: string; password: string };

export const register = async (payload: Credentials & { name: string; currency: string }): Promise<User> => {
  const { data } = await api.post('/auth/register', payload);
  await tokenStore.set(data.token);
  return data.user;
};
export const login = async (payload: Credentials): Promise<User> => {
  const { data } = await api.post('/auth/login', payload);
  await tokenStore.set(data.token);
  return data.user;
};
export const logout = async () => {
  try { await api.post('/auth/logout'); } finally { await tokenStore.clear(); }
};
export const getMe = async (): Promise<User> => (await api.get('/auth/me')).data.user;
export const updateProfile = async (payload: Partial<Pick<User, 'name' | 'email' | 'avatar' | 'currency'>>): Promise<User> =>
  (await api.patch('/auth/me', payload)).data.user;
