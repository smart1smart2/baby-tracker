import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type {
  GrowthMeasurement,
  GrowthMeasurementInsert,
  MeasurementKind,
} from '@/types/domain';

export const measurementsKey = (childId: string) =>
  ['measurements', childId] as const;
export const measurementsByKindKey = (childId: string, kind: MeasurementKind) =>
  ['measurements', childId, kind] as const;

export function useMeasurements(childId: string | null, kind?: MeasurementKind) {
  return useQuery({
    queryKey: childId
      ? kind
        ? measurementsByKindKey(childId, kind)
        : measurementsKey(childId)
      : ['measurements', 'noop'],
    enabled: Boolean(childId),
    queryFn: async (): Promise<GrowthMeasurement[]> => {
      if (!childId) return [];
      let query = supabase
        .from('growth_measurements')
        .select('*')
        .eq('child_id', childId)
        .order('measured_at', { ascending: false });
      if (kind) query = query.eq('kind', kind);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: GrowthMeasurementInsert): Promise<GrowthMeasurement> => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      const { data, error } = await supabase
        .from('growth_measurements')
        .insert({ ...input, created_by: userId })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (m) => {
      qc.invalidateQueries({ queryKey: measurementsKey(m.child_id) });
    },
  });
}
