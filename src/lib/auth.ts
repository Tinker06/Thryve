import { supabase } from './supabase';

export async function memberLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getCurrentProfile() {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();

  return profile;
}