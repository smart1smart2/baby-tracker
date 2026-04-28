import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { startOfDay, endOfDay } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { Feeding, FeedingInsert } from '@/types/domain';

export const feedingsKey = (childId: string) => ['feedings', childId] as const;
export const feedingsTodayKey = (childId: string) => ['feedings', childId, 'today'] as const;

export function useFeedingsToday(childId: string | null) {
  return useQuery({
    queryKey: childId ? feedingsTodayKey(childId) : ['feedings', 'noop'],
    enabled: Boolean(childId),
    queryFn: async (): Promise<Feeding[]> => {
      if (!childId) return [];
      const now = new Date();
      const { data, error } = await supabase
        .from('feedings')
        .select('*')
        .eq('child_id', childId)
        .gte('started_at', startOfDay(now).toISOString())
        .lte('started_at', endOfDay(now).toISOString())
        .order('started_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateFeeding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: FeedingInsert): Promise<Feeding> => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      const { data, error } = await supabase
        .from('feedings')
        .insert({ ...input, created_by: userId })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (feeding) => {
      qc.invalidateQueries({ queryKey: feedingsKey(feeding.child_id) });
    },
  });
}
