import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { differenceInMonths } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/ScreenContainer';
import { palette, radii, shadows, spacing } from '@/constants';
import { useChild } from '@/features/children/queries';
import { askAssistant, type AssistantSource } from '@/features/assistant/queries';
import { useActiveChild } from '@/stores/activeChild';

const SUGGESTIONS_KEYS = ['sleep', 'feeding', 'milestone', 'teeth'] as const;

export default function AssistantScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const activeChildId = useActiveChild((s) => s.activeChildId);
  const { data: child } = useChild(activeChildId);

  const childAgeMonths = useMemo(() => {
    if (!child?.date_of_birth) return null;
    return differenceInMonths(new Date(), new Date(child.date_of_birth));
  }, [child?.date_of_birth]);

  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<AssistantSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (text?: string) => {
    const q = (text ?? prompt).trim();
    if (!q || loading) return;
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    setAnswer(null);
    setSources([]);
    try {
      const res = await askAssistant(q, childAgeMonths);
      setAnswer(res.answer);
      setSources(res.sources);
      if (!text) setPrompt('');
    } catch {
      setError(t('assistant.error'));
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = [styles.card, shadows.sm, { backgroundColor: theme.colors.surface }];

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.heroCard, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons
          name="robot-outline"
          size={32}
          color={theme.colors.onPrimaryContainer}
        />
        <View style={styles.heroText}>
          <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer, fontWeight: '700' }}>
            {t('assistant.screenTitle')}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.8 }}>
            {child
              ? t('assistant.childContext', { name: child.full_name.split(' ')[0], months: childAgeMonths })
              : t('assistant.noChildContext')}
          </Text>
        </View>
      </View>

      {/* Suggested questions */}
      {!answer && !loading && (
        <View style={styles.suggestions}>
          {SUGGESTIONS_KEYS.map((key) => (
            <SuggestionChip
              key={key}
              label={t(`assistant.suggestions.${key}`)}
              onPress={() => handleSend(t(`assistant.suggestions.${key}`))}
            />
          ))}
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View style={[cardStyle, styles.loadingCard]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('assistant.loading')}
          </Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={[cardStyle, styles.errorCard, { borderColor: theme.colors.error }]}>
          <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
            {error}
          </Text>
        </View>
      )}

      {/* Answer */}
      {answer && (
        <View style={cardStyle}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, lineHeight: 22 }}>
            {answer}
          </Text>
        </View>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <View style={styles.sourcesSection}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('assistant.sources')}
          </Text>
          {sources.map((s) => (
            <View key={s.id} style={[styles.sourceChip, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {s.title}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputRow, { backgroundColor: theme.colors.surface }, shadows.sm]}>
        <TextInput
          style={[styles.input, { color: theme.colors.onSurface }]}
          placeholder={t('assistant.placeholder')}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          maxLength={400}
          returnKeyType="send"
          onSubmitEditing={() => handleSend()}
        />
        <IconButton
          icon="send"
          size={22}
          iconColor={prompt.trim() ? theme.colors.primary : theme.colors.onSurfaceVariant}
          onPress={() => handleSend()}
          disabled={!prompt.trim() || loading}
          style={styles.sendBtn}
        />
      </View>
    </ScreenContainer>
  );
}

function SuggestionChip({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <View
      style={[styles.chip, { backgroundColor: theme.colors.secondaryContainer }]}
      onTouchEnd={onPress}
    >
      <Text variant="labelMedium" style={{ color: theme.colors.onSecondaryContainer }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    marginBottom: spacing.xs,
  },
  heroText: { flex: 1, gap: 2 },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radii.xl,
    marginBottom: spacing.sm,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorCard: {
    borderWidth: 1,
  },
  sourcesSection: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sourceChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    alignSelf: 'flex-start',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: radii.xl,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendBtn: { margin: 0 },
});
