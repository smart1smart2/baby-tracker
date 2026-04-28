import { useCallback, useState } from 'react';

import type { FriendlyError } from '@/features/errors/translate';

/**
 * Field state pair (value + validation error) with auto-clear on edit.
 * Use in forms where each field has its own validator and inline error
 * should disappear as soon as the user starts editing.
 *
 * Returns:
 *  - `value`, `error` — current state
 *  - `setError` — set after running validation
 *  - `onChangeText` — pass to input; updates value and clears error if any
 */
export function useFormField(initial = '') {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<FriendlyError | null>(null);

  const onChangeText = useCallback((next: string) => {
    setValue(next);
    setError((prev) => (prev ? null : prev));
  }, []);

  return { value, setValue, error, setError, onChangeText };
}
