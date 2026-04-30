import { useState } from 'react';
import { Button } from 'react-native-paper';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppTextInput } from '@/components/AppTextInput';
import { AuthScaffold } from '@/components/AuthScaffold';
import { FormError } from '@/components/FormError';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { LabeledDivider } from '@/components/LabeledDivider';
import { PasswordField } from '@/components/PasswordField';
import { radii, spacing } from '@/constants';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { validateEmail, validatePassword } from '@/features/auth/validation';
import { useFormField } from '@/hooks/use-form-field';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const { t } = useTranslation();
  const email = useFormField();
  const password = useFormField();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);

  const onSubmit = async () => {
    setError(null);
    const emailIssue = validateEmail(email.value);
    const passwordIssue = validatePassword(password.value);
    email.setError(emailIssue);
    password.setError(passwordIssue);
    if (emailIssue || passwordIssue) return;

    setSubmitting(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    });
    setSubmitting(false);
    if (err) setError(translateError(err));
  };

  return (
    <AuthScaffold title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
      <AppTextInput
        label={t('auth.fields.email')}
        value={email.value}
        onChangeText={email.onChangeText}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        error={Boolean(email.error)}
        leftIcon="email-outline"
      />
      <FormError inline error={email.error} />

      <PasswordField
        label={t('auth.fields.password')}
        value={password.value}
        onChangeText={password.onChangeText}
        error={Boolean(password.error)}
      />
      <FormError inline error={password.error} />

      <FormError error={error} />

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={submitting}
        disabled={submitting}
        contentStyle={{ paddingVertical: spacing.sm }}
        style={{ marginTop: spacing.sm, borderRadius: radii.lg }}
      >
        {t('auth.login.submit')}
      </Button>

      <LabeledDivider>{t('auth.orContinueWith')}</LabeledDivider>
      <GoogleSignInButton onError={setError} />

      <Link href="/(auth)/signup" asChild>
        <Button mode="text" icon="account-plus-outline">
          {t('auth.login.noAccount')}
        </Button>
      </Link>
    </AuthScaffold>
  );
}
