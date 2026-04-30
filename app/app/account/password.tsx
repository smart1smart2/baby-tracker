import { useState } from 'react';
import { HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { FormError } from '@/components/FormError';
import { FormScreen } from '@/components/FormScreen';
import { FormSubmitButton } from '@/components/FormSubmitButton';
import { PasswordField } from '@/components/PasswordField';
import { useUpdatePassword } from '@/features/auth/mutations';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { validatePassword } from '@/features/auth/validation';
import { useFormField } from '@/hooks/use-form-field';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const updatePassword = useUpdatePassword();

  const password = useFormField();
  const confirmPassword = useFormField();
  const [error, setError] = useState<FriendlyError | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setInfo(null);

    const passwordIssue = validatePassword(password.value);
    password.setError(passwordIssue);
    if (passwordIssue) return;
    if (password.value !== confirmPassword.value) {
      confirmPassword.setError({ messageKey: 'settings.password.mismatch' });
      return;
    }

    try {
      await updatePassword.mutateAsync(password.value);
      setInfo(t('settings.password.success'));
      password.setValue('');
      confirmPassword.setValue('');
      setTimeout(() => router.back(), 600);
    } catch (err) {
      setError(translateError(err));
    }
  };

  return (
    <FormScreen>
      <PasswordField
        label={t('settings.password.newLabel')}
        value={password.value}
        onChangeText={password.onChangeText}
        error={Boolean(password.error)}
      />
      <FormError inline error={password.error} />

      <PasswordField
        label={t('settings.password.confirmLabel')}
        value={confirmPassword.value}
        onChangeText={confirmPassword.onChangeText}
        error={Boolean(confirmPassword.error)}
      />
      <FormError inline error={confirmPassword.error} />

      <FormError error={error} />
      {info ? <HelperText type="info">{info}</HelperText> : null}

      <FormSubmitButton
        onPress={onSubmit}
        loading={updatePassword.isPending}
        disabled={updatePassword.isPending}
      >
        {t('common.save')}
      </FormSubmitButton>
    </FormScreen>
  );
}
