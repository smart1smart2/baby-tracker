import { supabase } from '@/lib/supabase';

export type AssistantSource = {
  id: string;
  title: string;
  category: string;
};

export type AssistantResponse = {
  answer: string;
  sources: AssistantSource[];
};

export async function askAssistant(
  prompt: string,
  childAgeMonths: number | null,
): Promise<AssistantResponse> {
  const { data, error } = await supabase.functions.invoke<AssistantResponse>('ask-assistant', {
    body: { prompt, child_age_months: childAgeMonths },
  });
  if (error) throw error;
  if (!data) throw new Error('empty_response');
  return data;
}
