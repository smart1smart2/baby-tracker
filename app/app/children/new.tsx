import { useRouter } from 'expo-router';

import { ChildForm } from '@/components/ChildForm';

export default function NewChildScreen() {
  const router = useRouter();
  return <ChildForm onClose={() => router.back()} />;
}
