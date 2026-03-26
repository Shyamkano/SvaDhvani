import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore } from '@/hooks/useThemeStore';

export function useThemeColors() {
  const systemTheme = useColorScheme() ?? 'light';
  const { themeMode } = useThemeStore();

  const activeTheme = themeMode === 'system' ? systemTheme : themeMode;
  return Colors[activeTheme];
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const systemTheme = useColorScheme() ?? 'light';
  const { themeMode } = useThemeStore();

  const activeTheme = themeMode === 'system' ? systemTheme : themeMode;
  const colorFromProps = props[activeTheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[activeTheme][colorName];
  }
}
