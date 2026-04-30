import { useState } from 'react';
import { Button, HelperText } from 'react-native-paper';
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
import { validateEmail, validateFullName, validatePassword } from '@/features/auth/validation';
import { useFormField } from '@/hooks/use-form-field';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const { t } = useTranslation();
  const fullName = useFormField();
  const email = useFormField();
  const password = useFormField();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setInfo(null);

    const nameIssue = validateFullName(fullName.value);
    const emailIssue = validateEmail(email.value);
    const passwordIssue = validatePassword(password.value);
    fullName.setError(nameIssue);
    email.setError(emailIssue);
    password.setError(passwordIssue);
    if (nameIssue || emailIssue || passwordIssue) return;

    setSubmitting(true);
    const { error: err, data } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: password.value,
      options: { data: { full_name: fullName.value.trim() } },
    });
    setSubmitting(false);

    if (err) {
      setError(translateError(err));
      return;
    }

    if (data.session) return;
    setInfo(t('auth.signup.emailConfirmInfo'));
  };

  return (
    <AuthScaffold title={t('auth.signup.title')} subtitle={t('auth.signup.subtitle')}>
      <AppTextInput
        label={t('auth.fields.name')}
        value={fullName.value}
        onChangeText={fullName.onChangeText}
        error={Boolean(fullName.error)}
        leftIcon="account-outline"
      />
      <FormError inline error={fullName.error} />

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
      {info ? <HelperText type="info">{info}</HelperText> : null}

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={submitting}
        disabled={submitting}
        contentStyle={{ paddingVertical: spacing.sm }}
        style={{ marginTop: spacing.sm, borderRadius: radii.lg }}
      >
        {t('auth.signup.submit')}
      </Button>

      <LabeledDivider>{t('auth.orContinueWith')}</LabeledDivider>
      <GoogleSignInButton onError={setError} />

      <Link href="/(auth)/login" asChild>
        <Button mode="text" icon="account-check-outline">
          {t('auth.signup.haveAccount')}
        </Button>
      </Link>
    </AuthScaffold>
  );
}
