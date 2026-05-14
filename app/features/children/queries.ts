import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Child, ChildInsert, ChildUpdate } from '@/types/domain';

export const childrenKey = ['children'] as const;

export function useChildren() {
  return useQuery({
    queryKey: childrenKey,
    queryFn: async (): Promise<Child[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('caregivers')
        .select('children(*)')
        .eq('profile_id', user.id)
        .order('date_of_birth', { ascending: false, referencedTable: 'children' });
      if (error) throw error;
      return (data ?? []).map((row) => row.children as Child).filter(Boolean);
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

export function useUpdateChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: ChildUpdate }): Promise<Child> => {
      const { data, error } = await supabase
        .from('children')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: childrenKey });
    },
  });
}

export function useCreateChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateChildInput): Promise<Child> => {
      // The on_child_created trigger inserts the caregiver(owner) row,
      // so a single round-trip is enough.
      const { data, error } = await supabase
        .from('children')
        .insert(input)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: childrenKey });
    },
  });
}
