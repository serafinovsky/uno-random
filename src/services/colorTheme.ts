import type { Color } from "../models/card";

export type CardColors = Record<Color, string>;

const colorAssets = import.meta.glob("../assets/themes/**/colors.json", {
  query: "?raw",
  import: "default",
});

const colorsByTheme = new Map<string, CardColors>();

export async function loadColorsForTheme(theme: string): Promise<CardColors> {
  if (colorsByTheme.has(theme)) {
    return colorsByTheme.get(theme)!;
  }

  const path = `../assets/themes/${theme}/colors.json`;
  const loader = colorAssets[path];

  if (!loader) {
    throw new Error(`Colors for theme "${theme}" not found`);
  }

  try {
    const colorsJson = await loader();
    if (typeof colorsJson === "string") {
      const colors = JSON.parse(colorsJson) as CardColors;
      colorsByTheme.set(theme, colors);
      return colors;
    }
  } catch (error) {
    console.warn(`Failed to load colors for theme "${theme}":`, error);
  }

  const defaultColors: CardColors = {
    Red: "#E53935",
    Yellow: "#FDD835",
    Green: "#43A047",
    Blue: "#1E88E5",
    Black: "#111111",
  };

  colorsByTheme.set(theme, defaultColors);
  return defaultColors;
}
