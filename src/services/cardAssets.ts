import type { Card, Face } from "../models/card";
import { loadColorsForTheme } from "./colorTheme";

const cardAssets = import.meta.glob("../assets/themes/**/cards/*.svg", {
  query: "?raw",
  import: "default",
});

const cardsByTheme = new Map<string, Map<string, string>>();

async function loadCardsForTheme(theme: string): Promise<Map<string, string>> {
  if (cardsByTheme.has(theme)) {
    return cardsByTheme.get(theme)!;
  }

  const cardMap = new Map<string, string>();

  for (const [path, loader] of Object.entries(cardAssets)) {
    const match = path.match(/assets\/themes\/([^/]+)\/cards\/([^/]+)\.svg$/i);
    if (!match || match[1] !== theme) continue;

    const cardName = match[2].toLowerCase();
    try {
      const svg = await loader();
      if (typeof svg === "string") {
        cardMap.set(cardName, svg);
      }
    } catch (error) {
      console.warn(`Failed to load ${path}:`, error);
    }
  }

  cardsByTheme.set(theme, cardMap);
  return cardMap;
}

function faceToName(face: Face): string {
  switch (face) {
    case "+2":
      return "plus2";
    case "Skip":
      return "skip";
    case "Reverse":
      return "reverse";
    case "Wild":
      return "wild";
    case "+4":
      return "plus4";
    default:
      return String(face);
  }
}

export async function getCardFaceSvg(
  card: Card,
  theme: string
): Promise<string | null> {
  const faceName = faceToName(card.face);

  let cardMap = await loadCardsForTheme(theme);
  let svg = cardMap.get(faceName);

  if (!svg && theme !== "default") {
    cardMap = await loadCardsForTheme("default");
    svg = cardMap.get(faceName);
  }

  return svg ?? null;
}

export async function getCardDisplayColor(
  card: Card,
  theme: string
): Promise<string> {
  const colors = await loadColorsForTheme(theme);
  return colors[card.color] ?? colors.Black;
}

export async function getAllCardColors(
  theme: string
): Promise<Record<string, string>> {
  const colors = await loadColorsForTheme(theme);
  return { ...colors };
}

export function getAvailableThemes(): string[] {
  const themes = new Set<string>();

  for (const path of Object.keys(cardAssets)) {
    const match = path.match(/assets\/themes\/([^/]+)\/cards\//);
    if (match) {
      themes.add(match[1]);
    }
  }

  return Array.from(themes).sort();
}

export async function getPreviewSvgForTheme(
  theme: string
): Promise<string | null> {
  let cardMap = await loadCardsForTheme(theme);
  let svg = cardMap.get("wild");
  if (!svg && theme !== "default") {
    cardMap = await loadCardsForTheme("default");
    svg = cardMap.get("wild");
  }
  return svg ?? null;
}

export async function preloadAllThemesAssets(): Promise<void> {
  const themes = getAvailableThemes();
  try {
    await Promise.allSettled(
      themes.map((t) =>
        Promise.all([loadCardsForTheme(t), loadColorsForTheme(t)])
      )
    );
  } catch (error) {
    console.warn("Asset preload failed:", error);
  }
}
