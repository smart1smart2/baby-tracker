import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endOfDay, format, startOfDay } from 'date-fns';

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
export const measurementsForDayKey = (childId: string, day: string) =>
  ['measurements', childId, 'day', day] as const;

export function useMeasurementsForDay(childId: string | null, day: Date) {
  const dayKey = format(day, 'yyyy-MM-dd');
  return useQuery({
    queryKey: childId ? measurementsForDayKey(childId, dayKey) : ['measurements', 'noop'],
    enabled: Boolean(childId),
    queryFn: async (): Promise<GrowthMeasurement[]> => {
      if (!childId) return [];
      const { data, error } = await supabase
        .from('growth_measurements')
        .select('*')
        .eq('child_id', childId)
        .gte('measured_at', startOfDay(day).toISOString())
        .lte('measured_at', endOfDay(day).toISOString())
        .order('measured_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

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
