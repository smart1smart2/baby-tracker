import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { ActivityIndicator, IconButton, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { differenceInMonths } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/ScreenContainer';
import { heroGradient, iconSizes, palette, radii, shadows, spacing } from '@/constants';
import { useChild } from '@/features/children/queries';
import { askAssistant } from '@/features/assistant/queries';
import { useActiveChild } from '@/stores/activeChild';

const SUGGESTIONS_KEYS = ['sleep', 'feeding', 'milestone', 'teeth'] as const;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
};

export default function AssistantScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const activeChildId = useActiveChild((s) => s.activeChildId);
  const { data: child } = useChild(activeChildId);
  const scrollRef = useRef<ScrollView>(null);

  const childAgeMonths = useMemo(() => {
    if (!child?.date_of_birth) return null;
    return differenceInMonths(new Date(), new Date(child.date_of_birth));
  }, [child?.date_of_birth]);

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages.length, loading]);

  const handleSend = async (text?: string) => {
    const q = (text ?? prompt).trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: q }]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await askAssistant(q, childAgeMonths);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: res.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: 'assistant', content: t('assistant.error'), isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <LinearGradient
          colors={[...heroGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, shadows.lg]}
        >
          <View pointerEvents="none" style={styles.decorOuter} />
          <View pointerEvents="none" style={styles.decorInner} />
          <View style={styles.heroRow}>
            <View style={styles.heroIconWrap}>
              <MaterialCommunityIcons name="robot-outline" size={iconSizes.xl} color={palette.white} />
            </View>
            <View style={styles.heroText}>
              <Text variant="titleMedium" style={styles.heroTitle}>
                {t('assistant.screenTitle')}
              </Text>
              <Text variant="bodySmall" style={styles.heroSub}>
                {child
                  ? t('assistant.childContext', { name: child.full_name.split(' ')[0], months: childAgeMonths })
                  : t('assistant.noChildContext')}
              </Text>
            </View>
            {messages.length > 0 ? (
              <IconButton
                icon="delete-sweep-outline"
                size={26}
                iconColor={palette.whiteMuted}
                onPress={() => setMessages([])}
                style={styles.clearBtn}
              />
            ) : null}
          </View>
        </LinearGradient>

        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && !loading ? (
            <View style={styles.suggestions}>
              {SUGGESTIONS_KEYS.map((key) => (
                <SuggestionChip
                  key={key}
                  label={t(`assistant.suggestions.${key}`)}
                  onPress={() => handleSend(t(`assistant.suggestions.${key}`))}
                />
              ))}
            </View>
          ) : null}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {loading ? (
            <View style={[styles.bubbleRow, styles.bubbleRowAssistant]}>
              <View style={[styles.avatar, { backgroundColor: palette.primary[100] }]}>
                <MaterialCommunityIcons name="robot-outline" size={14} color={palette.primary[600]} />
              </View>
              <View style={[styles.bubble, styles.assistantBubble, shadows.sm, { backgroundColor: theme.colors.surface }]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.inputRow, shadows.sm, { backgroundColor: theme.colors.surface }]}>
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
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const theme = useTheme();
  const isUser = msg.role === 'user';

  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant]}>
      {!isUser ? (
        <View style={[styles.avatar, { backgroundColor: palette.primary[100] }]}>
          <MaterialCommunityIcons name="robot-outline" size={14} color={palette.primary[600]} />
        </View>
      ) : null}
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          !isUser && shadows.sm,
          { backgroundColor: isUser ? theme.colors.primary : theme.colors.surface },
          msg.isError && { backgroundColor: theme.colors.errorContainer },
        ]}
      >
        <Text
          variant="bodyMedium"
          style={{
            color: isUser
              ? theme.colors.onPrimary
              : msg.isError
              ? theme.colors.onErrorContainer
              : theme.colors.onSurface,
            lineHeight: 22,
          }}
        >
          {msg.content}
        </Text>
      </View>
    </View>
  );
}

function SuggestionChip({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: theme.colors.secondaryContainer, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <Text variant="labelMedium" style={{ color: theme.colors.onSecondaryContainer }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, gap: spacing.md },

  hero: {
    borderRadius: radii.xxl,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: palette.brandDecor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, gap: 2 },
  heroTitle: { color: palette.white, fontWeight: '700' },
  heroSub: { color: palette.whiteMuted },
  clearBtn: { margin: 0 },
  decorOuter: {
    position: 'absolute',
    right: -60,
    top: -30,
    width: 180,
    height: 180,
    borderRadius: radii.pill,
    backgroundColor: palette.brandDecor,
  },
  decorInner: {
    position: 'absolute',
    right: -10,
    bottom: -40,
    width: 110,
    height: 110,
    borderRadius: radii.pill,
    backgroundColor: palette.brandDecor,
  },

  messageList: { flex: 1 },
  messageContent: { gap: spacing.sm, paddingVertical: spacing.xs },

  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowAssistant: { justifyContent: 'flex-start' },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: radii.xl,
  },
  userBubble: { borderBottomRightRadius: radii.sm },
  assistantBubble: { borderBottomLeftRadius: radii.sm },

  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: radii.xl,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
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
