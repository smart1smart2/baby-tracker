import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfDay, endOfDay, format } from 'date-fns';

import { supabase } from '@/lib/supabase';
import type { Feeding, FeedingInsert } from '@/types/domain';

export const feedingsKey = (childId: string) => ['feedings', childId] as const;
export const feedingsForDayKey = (childId: string, day: string) =>
  ['feedings', childId, 'day', day] as const;

export function useFeedingsForDay(childId: string | null, day: Date) {
  const dayKey = format(day, 'yyyy-MM-dd');
  return useQuery({
    queryKey: childId ? feedingsForDayKey(childId, dayKey) : ['feedings', 'noop'],
    enabled: Boolean(childId),
    queryFn: async (): Promise<Feeding[]> => {
      if (!childId) return [];
      const { data, error } = await supabase
        .from('feedings')
        .select('*')
        .eq('child_id', childId)
        .gte('started_at', startOfDay(day).toISOString())
        .lte('started_at', endOfDay(day).toISOString())
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
