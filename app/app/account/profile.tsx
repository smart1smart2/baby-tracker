import { useEffect, useState } from 'react';
import { HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppTextInput } from '@/components/AppTextInput';
import { FormError } from '@/components/FormError';
import { FormScreen } from '@/components/FormScreen';
import { FormSubmitButton } from '@/components/FormSubmitButton';
import { useUpdateEmail } from '@/features/auth/mutations';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { useMyProfile, useUpdateMyProfile } from '@/features/profile/queries';
import { validateEmail, validateFullName } from '@/features/auth/validation';
import { useAuth } from '@/providers/AuthProvider';
import { useFormField } from '@/hooks/use-form-field';

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { session } = useAuth();
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const updateEmail = useUpdateEmail();

  const fullName = useFormField();
  const email = useFormField();
  const [error, setError] = useState<FriendlyError | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const initialName =
      profile?.full_name ??
      (session?.user.user_metadata as { full_name?: string } | undefined)?.full_name ??
      '';
    fullName.setValue(initialName);
    email.setValue(session?.user.email ?? '');
    // Only seed once when data arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.full_name, session?.user.email]);

  const submitting = updateProfile.isPending || updateEmail.isPending;

  const onSubmit = async () => {
    setError(null);
    setInfo(null);
    const nameIssue = validateFullName(fullName.value);
    const emailIssue = validateEmail(email.value);
    fullName.setError(nameIssue);
    email.setError(emailIssue);
    if (nameIssue || emailIssue) return;

    const trimmedName = fullName.value.trim();
    const trimmedEmail = email.value.trim();
    const nameChanged = trimmedName !== (profile?.full_name ?? '').trim();
    const emailChanged = trimmedEmail !== (session?.user.email ?? '').trim();

    try {
      if (nameChanged) {
        await updateProfile.mutateAsync({ full_name: trimmedName });
      }
      if (emailChanged) {
        await updateEmail.mutateAsync(trimmedEmail);
        setInfo(t('settings.profileEdit.emailConfirmInfo'));
        return;
      }
      router.back();
    } catch (err) {
      setError(translateError(err));
    }
  };

  return (
    <FormScreen>
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

      <FormError error={error} />
      {info ? <HelperText type="info">{info}</HelperText> : null}

      <FormSubmitButton onPress={onSubmit} loading={submitting} disabled={submitting}>
        {t('common.save')}
      </FormSubmitButton>
    </FormScreen>
  );
}
