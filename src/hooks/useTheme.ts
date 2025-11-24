import { useAppSelector } from './useAppSelector';
import { lightTheme, darkTheme, Theme } from '../constants/theme';

export const useTheme = (): Theme => {
  const mode = useAppSelector((state) => state.theme.mode);
  return mode === 'light' ? lightTheme : darkTheme;
};

