import { useState } from 'react';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { Link } from 'expo-router';

import { AuthScaffold } from '@/components/AuthScaffold';
import { radii, spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (err) setError(err.message);
  };

  return (
    <AuthScaffold title="Вхід" subtitle="Раді тебе бачити знов!">
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        mode="outlined"
        left={<TextInput.Icon icon="email-outline" />}
      />
      <TextInput
        label="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        mode="outlined"
        left={<TextInput.Icon icon="lock-outline" />}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onPress={() => setShowPassword((v) => !v)}
          />
        }
      />

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={submitting}
        disabled={submitting || !email || !password}
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
