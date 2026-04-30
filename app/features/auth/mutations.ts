import { useMutation } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export function useUpdateEmail() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
  });
}

export function useDeleteMyAccount() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('delete_my_account');
      if (error) throw error;
      // Server-side delete invalidates the JWT; sign out locally to
      // clear the persisted session and let AuthGate redirect to login.
      await supabase.auth.signOut();
    },
  });
}
