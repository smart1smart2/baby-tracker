import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfDay, endOfDay, format } from 'date-fns';

import { getCurrentUserId, supabase } from '@/lib/supabase';
import type { Feeding, FeedingInsert, FeedingKind } from '@/types/domain';

export const feedingsKey = (childId: string) => ['feedings', childId] as const;
export const feedingsForDayKey = (childId: string, day: string) =>
  ['feedings', childId, 'day', day] as const;
export const feedingsInRangeKey = (childId: string, from: string, to: string) =>
  ['feedings', childId, 'range', from, to] as const;
export const activeFeedingKey = (childId: string) =>
  ['feedings', childId, 'active'] as const;

export function useFeedingsInRange(childId: string | null, from: Date, to: Date) {
  const fromKey = format(from, 'yyyy-MM-dd');
  const toKey = format(to, 'yyyy-MM-dd');
  return useQuery({
    queryKey: childId
      ? feedingsInRangeKey(childId, fromKey, toKey)
      : ['feedings', 'noop-range'],
    enabled: Boolean(childId),
    queryFn: async (): Promise<Feeding[]> => {
      if (!childId) return [];
      const { data, error } = await supabase
        .from('feedings')
        .select('*')
        .eq('child_id', childId)
        .gte('started_at', startOfDay(from).toISOString())
        .lte('started_at', endOfDay(to).toISOString())
        .order('started_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

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

/** Latest open-ended breast feeding (kind in breast_*, ended_at null). */
export function useActiveFeeding(childId: string | null) {
  return useQuery({
    queryKey: childId ? activeFeedingKey(childId) : ['feedings', 'noop-active'],
    enabled: Boolean(childId),
    queryFn: async (): Promise<Feeding | null> => {
      if (!childId) return null;
      const { data, error } = await supabase
        .from('feedings')
        .select('*')
        .eq('child_id', childId)
        .in('kind', ['breast_left', 'breast_right'])
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useStartFeeding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      childId,
      kind,
    }: {
      childId: string;
      kind: FeedingKind;
    }): Promise<Feeding> => {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase
        .from('feedings')
        .insert({
          child_id: childId,
          kind,
          started_at: new Date().toISOString(),
          ended_at: null,
          created_by: userId,
        })
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

export function useStopFeeding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (feedingId: string): Promise<Feeding> => {
      const { data, error } = await supabase
        .from('feedings')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', feedingId)
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

export function useCreateFeeding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: FeedingInsert): Promise<Feeding> => {
      const userId = await getCurrentUserId();
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
