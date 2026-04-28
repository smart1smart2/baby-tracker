import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ChildForm } from '@/components/ChildForm';
import { useChild } from '@/features/children/queries';

export default function EditChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: child, isLoading } = useChild(id);

  if (isLoading || !child) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <ChildForm initial={child} onClose={() => router.back()} />;
}
