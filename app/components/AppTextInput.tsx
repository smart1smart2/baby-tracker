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
 *  - white fill so the field reads as a card on the tinted page background
 *  - faint outline at rest, brand violet on focus / red on error
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
      outlineColor={theme.colors.outlineVariant}
      activeOutlineColor={theme.colors.primary}
      style={[{ backgroundColor: theme.colors.surface }, style]}
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
