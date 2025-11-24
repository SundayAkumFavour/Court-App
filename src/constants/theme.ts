import { ThemeMode } from '../types';

export interface Colors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  success: string;
  text: string;
  textSecondary: string;
  border: string;
  disabled: string;
  placeholder: string;
}

export interface Typography {
  h1: {
    fontSize: number;
    fontWeight: 'bold' | 'normal' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    lineHeight: number;
  };
  h2: {
    fontSize: number;
    fontWeight: 'bold' | 'normal' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    lineHeight: number;
  };
  h3: {
    fontSize: number;
    fontWeight: 'bold' | 'normal' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    lineHeight: number;
  };
  body: {
    fontSize: number;
    fontWeight: 'bold' | 'normal' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    lineHeight: number;
  };
  caption: {
    fontSize: number;
    fontWeight: 'bold' | 'normal' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    lineHeight: number;
  };
  button: {
    fontSize: number;
    fontWeight: 'bold' | 'normal' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    lineHeight: number;
  };
}

export interface Theme {
  mode: ThemeMode;
  colors: Colors;
  typography: Typography;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

const lightColors: Colors = {
  primary: '#1976d2',
  secondary: '#dc004e',
  background: '#ffffff',
  surface: '#f5f5f5',
  error: '#d32f2f',
  warning: '#ed6c02',
  success: '#2e7d32',
  text: '#212121',
  textSecondary: '#757575',
  border: '#e0e0e0',
  disabled: '#bdbdbd',
  placeholder: '#9e9e9e',
};

const darkColors: Colors = {
  primary: '#90caf9',
  secondary: '#f48fb1',
  background: '#121212',
  surface: '#1e1e1e',
  error: '#ef5350',
  warning: '#ffa726',
  success: '#66bb6a',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  border: '#333333',
  disabled: '#666666',
  placeholder: '#888888',
};

const typography: Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  typography,
  spacing,
  borderRadius,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
};

