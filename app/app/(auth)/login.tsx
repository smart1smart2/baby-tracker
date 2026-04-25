import { useState } from 'react';
import { Button, TextInput } from 'react-native-paper';
import { Link } from 'expo-router';

import { AuthScaffold } from '@/components/AuthScaffold';
import { FormError } from '@/components/FormError';
import { radii, spacing } from '@/constants';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { validateEmail, validatePassword } from '@/features/auth/validation';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <AuthScaffold title="Вхід" subtitle="Раді тебе бачити знов!">
      <TextInput
        label="Email"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (emailError) setEmailError(null);
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        mode="outlined"
        error={Boolean(emailError)}
        left={<TextInput.Icon icon="email-outline" />}
      />
      <FormError inline error={emailError} />

      <TextInput
        label="Пароль"
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          if (passwordError) setPasswordError(null);
        }}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        mode="outlined"
        error={Boolean(passwordError)}
        left={<TextInput.Icon icon="lock-outline" />}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onPress={() => setShowPassword((v) => !v)}
          />
        }
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
        Увійти
      </Button>

      <Link href="/(auth)/signup" asChild>
        <Button mode="text" icon="account-plus-outline">
          Немає акаунту? Зареєструватись
        </Button>
      </Link>
    </AuthScaffold>
  );
}
