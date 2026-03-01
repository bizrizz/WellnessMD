import { useAppStore } from '../../store/appStore';
import { DarkColors, LightColors, ColorPalette } from './colors';

export function useColors(): ColorPalette {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  return isDarkMode ? DarkColors : LightColors;
}
