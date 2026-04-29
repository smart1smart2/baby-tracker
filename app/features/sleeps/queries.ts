import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfDay, endOfDay } from 'date-fns';

import { supabase } from '@/lib/supabase';
import type { Sleep, SleepInsert } from '@/types/domain';

export const sleepsKey = (childId: string) => ['sleeps', childId] as const;
export const sleepsTodayKey = (childId: string) => ['sleeps', childId, 'today'] as const;
export const activeSleepKey = (childId: string) => ['sleeps', childId, 'active'] as const;

export function useSleepsToday(childId: string | null) {
  return useQuery({
    queryKey: childId ? sleepsTodayKey(childId) : ['sleeps', 'noop'],
    enabled: Boolean(childId),
    queryFn: async (): Promise<Sleep[]> => {
      if (!childId) return [];
      const now = new Date();
      const { data, error } = await supabase
        .from('sleeps')
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

/** The current open-ended sleep (started_at set, ended_at null) if any. */
export function useActiveSleep(childId: string | null) {
  return useQuery({
    queryKey: childId ? activeSleepKey(childId) : ['sleeps', 'noop-active'],
    enabled: Boolean(childId),
    queryFn: async (): Promise<Sleep | null> => {
      if (!childId) return null;
      const { data, error } = await supabase
        .from('sleeps')
        .select('*')
        .eq('child_id', childId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useStartSleep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (childId: string): Promise<Sleep> => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      const { data, error } = await supabase
        .from('sleeps')
        .insert({
          child_id: childId,
          started_at: new Date().toISOString(),
          ended_at: null,
          created_by: userId,
        })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (sleep) => {
      qc.invalidateQueries({ queryKey: sleepsKey(sleep.child_id) });
    },
  });
}

export function useStopSleep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sleepId: string): Promise<Sleep> => {
      const { data, error } = await supabase
        .from('sleeps')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', sleepId)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (sleep) => {
      qc.invalidateQueries({ queryKey: sleepsKey(sleep.child_id) });
    },
  });
}

/** Manual entry of an already-completed sleep period. */
export function useCreateSleep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SleepInsert): Promise<Sleep> => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      const { data, error } = await supabase
        .from('sleeps')
        .insert({ ...input, created_by: userId })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (sleep) => {
      qc.invalidateQueries({ queryKey: sleepsKey(sleep.child_id) });
    },
  });
}
