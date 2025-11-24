import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';
  color?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  style,
  children,
  ...props
}) => {
  const theme = useTheme();
  const textColor = color || theme.colors.text;

  return (
    <Text
      style={[
        styles.base,
        theme.typography[variant],
        { color: textColor },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});

