import { useState } from 'react';
import { Button, HelperText } from 'react-native-paper';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppTextInput } from '@/components/AppTextInput';
import { AuthScaffold } from '@/components/AuthScaffold';
import { FormError } from '@/components/FormError';
import { PasswordField } from '@/components/PasswordField';
import { radii, spacing } from '@/constants';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { validateEmail, validateFullName, validatePassword } from '@/features/auth/validation';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [nameError, setNameError] = useState<FriendlyError | null>(null);
  const [emailError, setEmailError] = useState<FriendlyError | null>(null);
  const [passwordError, setPasswordError] = useState<FriendlyError | null>(null);

  const onSubmit = async () => {
    setError(null);
    setInfo(null);

    const nameIssue = validateFullName(fullName);
    const emailIssue = validateEmail(email);
    const passwordIssue = validatePassword(password);
    setNameError(nameIssue);
    setEmailError(emailIssue);
    setPasswordError(passwordIssue);
    if (nameIssue || emailIssue || passwordIssue) return;

    setSubmitting(true);
    const { error: err, data } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
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
        value={fullName}
        onChangeText={(v) => {
          setFullName(v);
          if (nameError) setNameError(null);
        }}
        error={Boolean(nameError)}
        leftIcon="account-outline"
      />
      <FormError inline error={nameError} />

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

      <Link href="/(auth)/login" asChild>
        <Button mode="text" icon="account-check-outline">
          {t('auth.signup.haveAccount')}
        </Button>
      </Link>
    </AuthScaffold>
  );
}
