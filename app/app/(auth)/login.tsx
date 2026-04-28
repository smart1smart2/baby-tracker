import { useState } from 'react';
import { Button } from 'react-native-paper';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppTextInput } from '@/components/AppTextInput';
import { AuthScaffold } from '@/components/AuthScaffold';
import { FormError } from '@/components/FormError';
import { PasswordField } from '@/components/PasswordField';
import { radii, spacing } from '@/constants';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { validateEmail, validatePassword } from '@/features/auth/validation';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);
  const [emailError, setEmailError] = useState<FriendlyError | null>(null);
  const [passwordError, setPasswordError] = useState<FriendlyError | null>(null);

  const onSubmit = async () => {
    setError(null);
    const emailIssue = validateEmail(email);
    const passwordIssue = validatePassword(password);
    setEmailError(emailIssue);
    setPasswordError(passwordIssue);
    if (emailIssue || passwordIssue) return;

    setSubmitting(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (err) setError(translateError(err));
  };

  return (
    <AuthScaffold title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
      <AppTextInput
        label={t('auth.fields.email')}
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (emailError) setEmailError(null);
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        error={Boolean(emailError)}
        leftIcon="email-outline"
      />
      <FormError inline error={emailError} />

      <PasswordField
        label={t('auth.fields.password')}
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          if (passwordError) setPasswordError(null);
        }}
        error={Boolean(passwordError)}
      />
      <FormError inline error={passwordError} />

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

      <Link href="/(auth)/signup" asChild>
        <Button mode="text" icon="account-plus-outline">
          {t('auth.login.noAccount')}
        </Button>
      </Link>
    </AuthScaffold>
  );
}
