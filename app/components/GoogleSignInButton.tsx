import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { radii, spacing } from '@/constants';
import { signInWithGoogle } from '@/features/auth/oauth';
import { translateError, type FriendlyError } from '@/features/errors/translate';

type Props = {
  onError: (error: FriendlyError | null) => void;
};

export function GoogleSignInButton({ onError }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    onError(null);
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);
    if (!result.ok && !result.cancelled) onError(translateError(result.error));
  };

  return (
    <Button
      mode="outlined"
      icon="google"
      onPress={onPress}
      loading={loading}
      disabled={loading}
      contentStyle={styles.content}
      style={styles.button}
    >
      {t('auth.continueWithGoogle')}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: radii.lg },
  content: { paddingVertical: spacing.sm },
});
