import { forwardRef, type ComponentProps, type Ref } from 'react';
import type { TextInput as RNTextInput } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

import { radii } from '@/constants';

type IconName = ComponentProps<typeof TextInput.Icon>['icon'];

type PaperProps = ComponentProps<typeof TextInput>;

type Props = Omit<
  PaperProps,
  'mode' | 'left' | 'right' | 'outlineStyle' | 'outlineColor' | 'activeOutlineColor'
> & {
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
};

/**
 * Paper TextInput pre-configured to match the app's chrome:
 *  - rounded outline (radii.lg) instead of Paper's default tight radius
 *  - filled with surface-variant so the field reads as a card
 *  - outline only visible on focus / error, in brand violet
 *  - keeps Paper's built-in floating label, password toggle and a11y
 */
function AppTextInputInner(
  {
    leftIcon,
    rightIcon,
    onRightIconPress,
    style,
    ...rest
  }: Props,
  ref: Ref<RNTextInput>,
) {
  const theme = useTheme();
  return (
    <TextInput
      ref={ref}
      mode="outlined"
      outlineStyle={{ borderRadius: radii.lg, borderWidth: 1.5 }}
      outlineColor="transparent"
      activeOutlineColor={theme.colors.primary}
      style={[{ backgroundColor: theme.colors.surfaceVariant }, style]}
      left={leftIcon ? <TextInput.Icon icon={leftIcon} /> : undefined}
      right={
        rightIcon ? (
          <TextInput.Icon icon={rightIcon} onPress={onRightIconPress} />
        ) : undefined
      }
      {...rest}
    />
  );
}

export const AppTextInput = forwardRef<RNTextInput, Props>(AppTextInputInner);
