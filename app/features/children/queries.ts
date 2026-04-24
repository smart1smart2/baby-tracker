import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Child, ChildInsert } from '@/types/domain';

export const childrenKey = ['children'] as const;

export function useChildren() {
  return useQuery({
    queryKey: childrenKey,
    queryFn: async (): Promise<Child[]> => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('date_of_birth', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useChild(id: string | null | undefined) {
  return useQuery({
    queryKey: ['children', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<Child | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

type CreateChildInput = Pick<ChildInsert, 'full_name' | 'date_of_birth' | 'sex' | 'notes'>;

export function useCreateChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateChildInput): Promise<Child> => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      if (!userId) throw new Error('Not authenticated');

      const { data: child, error: insertError } = await supabase
        .from('children')
        .insert(input)
        .select('*')
        .single();
      if (insertError) throw insertError;

      const { error: caregiverError } = await supabase
        .from('caregivers')
        .insert({ child_id: child.id, profile_id: userId, role: 'owner' });
      if (caregiverError) {
        await supabase.from('children').delete().eq('id', child.id);
        throw caregiverError;
      }

      return child;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: childrenKey });
    },
  });
}
