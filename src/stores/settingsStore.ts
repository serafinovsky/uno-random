import { createStore } from "solid-js/store";
import { loadFromStorage } from "../utils";

export type ColorScheme = "light" | "dark";

interface SettingsState {
  colorScheme: ColorScheme;
  cardTheme: string;
  canInstall: boolean;
  isInstalled: boolean;
  isInstalling: boolean;
}

const CARD_THEME_KEY = "cardTheme";
const COLOR_SCHEME_KEY = "colorScheme";

function loadInitialCardTheme(): string {
  return loadFromStorage(CARD_THEME_KEY, "default");
}

function loadInitialColorScheme(): ColorScheme {
  const saved = loadFromStorage<string>(COLOR_SCHEME_KEY, "dark");
  return (
    saved === "light" || saved === "dark" ? saved : "dark"
  ) as ColorScheme;
}

const [store, setStore] = createStore<SettingsState>({
  colorScheme: loadInitialColorScheme(),
  cardTheme: loadInitialCardTheme(),
  canInstall: false,
  isInstalled: false,
  isInstalling: false,
});

const theme = () => store.cardTheme;
const scheme = () => store.colorScheme;
const canInstall = () => store.canInstall;
const isInstalled = () => store.isInstalled;
const isInstalling = () => store.isInstalling;

const setCardTheme = (theme: string) => {
  setStore({ cardTheme: theme });
  try {
    localStorage.setItem(CARD_THEME_KEY, theme);
  } catch {}
};

const setColorScheme = (newScheme: ColorScheme) => {
  setStore({ colorScheme: newScheme });
  try {
    localStorage.setItem(COLOR_SCHEME_KEY, newScheme);
  } catch {}
};

const setCanInstall = (canInstall: boolean) => {
  setStore({ canInstall });
};

const setIsInstalled = (isInstalled: boolean) => {
  setStore({ isInstalled });
};

const setIsInstalling = (isInstalling: boolean) => {
  setStore({ isInstalling });
};

export function useSettings() {
  return {
    // Store state
    store,

    // Card theme state
    theme,
    setCardTheme,

    // Color scheme state
    scheme,
    setColorScheme,

    // PWA state
    canInstall,
    isInstalled,
    isInstalling,
    setCanInstall,
    setIsInstalled,
    setIsInstalling,
  };
}
