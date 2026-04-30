import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export const profileKey = ['profile', 'me'] as const;

export function useMyProfile() {
  return useQuery({
    queryKey: profileKey,
    queryFn: async (): Promise<Profile | null> => {
      const { data: auth } = await supabase.auth.getUser();
      const id = auth.user?.id;
      if (!id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: { full_name: string }): Promise<Profile> => {
      const { data: auth } = await supabase.auth.getUser();
      const id = auth.user?.id;
      if (!id) throw new Error('Not signed in');

      const { data, error } = await supabase
        .from('profiles')
        .update({ full_name: patch.full_name, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;

      // Keep auth user_metadata in sync so HeroCard's greeting (which reads
      // session.user.user_metadata.full_name) updates without a re-login.
      const { error: metaError } = await supabase.auth.updateUser({
        data: { full_name: patch.full_name },
      });
      if (metaError) throw metaError;

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKey });
    },
  });
}
