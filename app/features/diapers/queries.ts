import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endOfDay, format, startOfDay } from 'date-fns';

import { supabase } from '@/lib/supabase';
import type { Diaper, DiaperInsert } from '@/types/domain';

export const diapersKey = (childId: string) => ['diapers', childId] as const;
export const diapersForDayKey = (childId: string, day: string) =>
  ['diapers', childId, 'day', day] as const;

export function useDiapersForDay(childId: string | null, day: Date) {
  const dayKey = format(day, 'yyyy-MM-dd');
  return useQuery({
    queryKey: childId ? diapersForDayKey(childId, dayKey) : ['diapers', 'noop'],
    enabled: Boolean(childId),
    queryFn: async (): Promise<Diaper[]> => {
      if (!childId) return [];
      const { data, error } = await supabase
        .from('diapers')
        .select('*')
        .eq('child_id', childId)
        .gte('occurred_at', startOfDay(day).toISOString())
        .lte('occurred_at', endOfDay(day).toISOString())
        .order('occurred_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDiaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DiaperInsert): Promise<Diaper> => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      const { data, error } = await supabase
        .from('diapers')
        .insert({ ...input, created_by: userId })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (diaper) => {
      qc.invalidateQueries({ queryKey: diapersKey(diaper.child_id) });
    },
  });
}
