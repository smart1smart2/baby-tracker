import { useMutation } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export function useSignIn() {
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: input.email.trim(),
        password: input.password,
      });
      if (error) throw error;
    },
  });
}

/**
 * Returns `{ needsConfirmation: true }` when the project requires email
 * verification before issuing a session — the signup screen reads this to
 * decide whether to show a "check your inbox" hint.
 */
export function useSignUp() {
  return useMutation({
    mutationFn: async (input: {
      email: string;
      password: string;
      fullName: string;
    }): Promise<{ needsConfirmation: boolean }> => {
      const { error, data } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: { data: { full_name: input.fullName.trim() } },
      });
      if (error) throw error;
      return { needsConfirmation: !data.session };
    },
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  });
}

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
