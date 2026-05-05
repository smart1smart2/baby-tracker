import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { supabase } from './supabase';

const TABLE_TO_KEY: Record<string, string> = {
  feedings: 'feedings',
  sleeps: 'sleeps',
  diapers: 'diapers',
  growth_measurements: 'measurements',
  milestones: 'milestones',
  vaccinations: 'vaccinations',
};

/**
 * Subscribes to Supabase Realtime postgres_changes for every per-child
 * table on the active child and invalidates the matching React Query
 * caches whenever a row is inserted, updated or deleted. The result is
 * cross-device sync: a feeding logged on phone B refreshes phone A
 * within a second or two.
 *
 * Templates (vaccination_templates, milestone_templates) are deliberately
 * excluded — they're seeded once and never change at runtime.
 */
export function useChildRealtime(childId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!childId) return;

    const channel = supabase.channel(`child:${childId}`);

    for (const table of Object.keys(TABLE_TO_KEY)) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `child_id=eq.${childId}` },
        () => {
          qc.invalidateQueries({ queryKey: [TABLE_TO_KEY[table], childId] });
        },
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [childId, qc]);
}
