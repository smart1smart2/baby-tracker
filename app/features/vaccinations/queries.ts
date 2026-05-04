import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Vaccination, VaccinationTemplate } from '@/types/domain';

export const vaccinationTemplatesKey = ['vaccination_templates'] as const;
export const childVaccinationsKey = (childId: string | null) =>
  ['vaccinations', childId] as const;

export function useVaccinationTemplates() {
  return useQuery({
    queryKey: vaccinationTemplatesKey,
    queryFn: async (): Promise<VaccinationTemplate[]> => {
      const { data, error } = await supabase
        .from('vaccination_templates')
        .select('*')
        .order('expected_age_min_months', { ascending: true })
        .order('group_code', { ascending: true })
        .order('dose_number', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useChildVaccinations(childId: string | null) {
  return useQuery({
    queryKey: childVaccinationsKey(childId),
    enabled: Boolean(childId),
    queryFn: async (): Promise<Vaccination[]> => {
      if (!childId) return [];
      const { data, error } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('child_id', childId);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMarkVaccination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      childId: string;
      template: VaccinationTemplate;
      administeredAt?: string | null;
      notes?: string | null;
    }): Promise<Vaccination> => {
      const { data, error } = await supabase
        .from('vaccinations')
        .insert({
          child_id: input.childId,
          vaccine_code: input.template.code,
          vaccine_name: input.template.name,
          dose_number: input.template.dose_number,
          administered_at:
            input.administeredAt ?? new Date().toISOString().slice(0, 10),
          notes: input.notes ?? null,
        })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: childVaccinationsKey(vars.childId) });
    },
  });
}

export function useUnmarkVaccination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; childId: string }) => {
      const { error } = await supabase.from('vaccinations').delete().eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: childVaccinationsKey(vars.childId) });
    },
  });
}

export function useUpdateVaccination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      childId: string;
      patch: { administered_at?: string | null; notes?: string | null };
    }) => {
      const { error } = await supabase
        .from('vaccinations')
        .update(input.patch)
        .eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: childVaccinationsKey(vars.childId) });
    },
  });
}
