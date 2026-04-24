import { useState } from 'react';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { Link } from 'expo-router';

import { AuthScaffold } from '@/components/AuthScaffold';
import { radii, spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);

  const onSubmit = async () => {
    setMessage(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setSubmitting(false);
    if (error) {
      setMessage({ kind: 'error', text: error.message });
      return;
    }
    setMessage({
      kind: 'info',
      text: 'Перевір пошту — ми надіслали лист для підтвердження.',
    });
  };

  return (
    <AuthScaffold title="Реєстрація" subtitle="Створи акаунт, щоб почати вести щоденник">
      <TextInput
        label="Ім'я"
        value={fullName}
        onChangeText={setFullName}
        mode="outlined"
        left={<TextInput.Icon icon="account-outline" />}
      />
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

      {message ? (
        <HelperText type={message.kind === 'error' ? 'error' : 'info'}>
          {message.text}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={submitting}
        disabled={submitting || !email || !password}
        contentStyle={{ paddingVertical: spacing.sm }}
        style={{ marginTop: spacing.sm, borderRadius: radii.lg }}
      >
        Створити акаунт
      </Button>

      <Link href="/(auth)/login" asChild>
        <Button mode="text" icon="login">
          Вже маю акаунт
        </Button>
      </Link>
    </AuthScaffold>
  );
}
