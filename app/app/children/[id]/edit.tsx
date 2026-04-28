import { useLocalSearchParams, useRouter } from 'expo-router';

import { ChildForm } from '@/components/ChildForm';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useChild } from '@/features/children/queries';

export default function EditChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: child, isLoading } = useChild(id);

  if (isLoading || !child) return <LoadingScreen />;

  return <ChildForm initial={child} onClose={() => router.back()} />;
}
