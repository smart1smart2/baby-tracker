import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

export default function HomeScreen() {
  const { session } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text variant="headlineMedium">Сьогодні</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Вітаю, {session?.user.email ?? 'користувач'} 👋
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Поки що тут порожньо</Text>
            <Text variant="bodySmall" style={styles.cardBody}>
              Додай дитину, щоб почати вести щоденник годування, сну, підгузків та ваги.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => {}}>
              Додати дитину
            </Button>
          </Card.Actions>
        </Card>

        <Button
          mode="outlined"
          onPress={() => supabase.auth.signOut()}
          style={styles.signOut}
        >
          Вийти
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16, gap: 12 },
  subtitle: { opacity: 0.7 },
  card: { marginTop: 12 },
  cardBody: { marginTop: 8, opacity: 0.8 },
  signOut: { marginTop: 'auto' },
});
