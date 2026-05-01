import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { supabase } from '@/lib/supabase';
import type { Milestone, MilestoneTemplate } from '@/types/domain';

export const milestoneTemplatesKey = ['milestone_templates'] as const;
export const childMilestonesKey = (childId: string | null) =>
  ['milestones', childId] as const;
export const milestonesForDayKey = (childId: string, dayKey: string) =>
  ['milestones', childId, 'day', dayKey] as const;

export function useMilestoneTemplates() {
  return useQuery({
    queryKey: milestoneTemplatesKey,
    queryFn: async (): Promise<MilestoneTemplate[]> => {
      const { data, error } = await supabase
        .from('milestone_templates')
        .select('*')
        .order('expected_age_min_months', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useChildMilestones(childId: string | null) {
  return useQuery({
    queryKey: childMilestonesKey(childId),
    enabled: Boolean(childId),
    queryFn: async (): Promise<Milestone[]> => {
      if (!childId) return [];
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('child_id', childId);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMilestonesForDay(childId: string | null, day: Date) {
  const dayKey = format(day, 'yyyy-MM-dd');
  return useQuery({
    queryKey: childId ? milestonesForDayKey(childId, dayKey) : ['milestones', 'noop'],
    enabled: Boolean(childId),
    queryFn: async (): Promise<Milestone[]> => {
      if (!childId) return [];
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('child_id', childId)
        .eq('achieved_at', dayKey);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMarkMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      childId: string;
      templateId: string;
      achievedAt?: string | null;
      notes?: string | null;
    }): Promise<Milestone> => {
      const { data, error } = await supabase
        .from('milestones')
        .insert({
          child_id: input.childId,
          template_id: input.templateId,
          achieved_at: input.achievedAt ?? new Date().toISOString().slice(0, 10),
          notes: input.notes ?? null,
        })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: childMilestonesKey(vars.childId) });
    },
  });
}

export function useUnmarkMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; childId: string }) => {
      const { error } = await supabase.from('milestones').delete().eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: childMilestonesKey(vars.childId) });
    },
  });
}

export function useUpdateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      childId: string;
      patch: { achieved_at?: string | null; notes?: string | null };
    }) => {
      const { error } = await supabase
        .from('milestones')
        .update(input.patch)
        .eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: childMilestonesKey(vars.childId) });
    },
  });
}
