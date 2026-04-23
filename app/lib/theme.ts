import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const brand = {
  primary: '#5B8DEF',
  secondary: '#F2A2A8',
};

export const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.primary,
    secondary: brand.secondary,
  },
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brand.primary,
    secondary: brand.secondary,
  },
};
