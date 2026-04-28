import { useState } from 'react';

import { AppTextInput } from './AppTextInput';

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: boolean;
  autoFocus?: boolean;
};

/**
 * Password input with built-in show/hide eye toggle. Wraps AppTextInput so
 * the visibility state stays local to the field rather than the form.
 */
export function PasswordField({ label, value, onChangeText, error, autoFocus }: Props) {
  const [show, setShow] = useState(false);
  return (
    <AppTextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={!show}
      autoCapitalize="none"
      autoComplete="password"
      autoFocus={autoFocus}
      error={error}
      leftIcon="lock-outline"
      rightIcon={show ? 'eye-off-outline' : 'eye-outline'}
      onRightIconPress={() => setShow((v) => !v)}
    />
  );
}
