import { For, Show, createResource, type JSX } from "solid-js";
import { useSettings, type ColorScheme } from "../stores";
import {
  getAvailableThemes,
  getPreviewSvgForTheme,
} from "../services/cardAssets";
import { loadColorsForTheme } from "../services/colorTheme";
import styles from "./SettingsSheet.module.css";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall?: () => Promise<boolean>;
}

function SettingsSheet(props: SettingsSheetProps) {
  const {
    theme,
    setCardTheme,
    scheme,
    setColorScheme,
    canInstall,
    isInstalled,
    isInstalling,
  } = useSettings();

  const [availableThemes] = createResource(async () => getAvailableThemes());

  const [previews] = createResource(
    () => availableThemes(),
    async (themes) => {
      if (!themes) return {} as Record<string, string>;
      const entries = await Promise.all(
        themes.map(async (themeName) => {
          const svg = await getPreviewSvgForTheme(themeName);
          return [themeName, svg ?? ""] as const;
        })
      );
      return Object.fromEntries(entries) as Record<string, string>;
    }
  );

  const [previewColors] = createResource(
    () => availableThemes(),
    async (themes) => {
      if (!themes) return {} as Record<string, any>;
      const entries = await Promise.all(
        themes.map(async (themeName) => {
          const colors = await loadColorsForTheme(themeName);
          return [themeName, colors] as const;
        })
      );
      return Object.fromEntries(entries) as Record<string, any>;
    }
  );

  return (
    <div class={styles.sheetRoot}>
      <div
        classList={{
          [styles.sheetBackdrop]: true,
          [styles.visible]: props.isOpen,
        }}
        aria-hidden={!props.isOpen}
      />
      <div
        classList={{ [styles.bottomSheet]: true, [styles.open]: props.isOpen }}
        role="dialog"
        aria-label="Settings"
        aria-hidden={!props.isOpen}
      >
        <div class={styles.sheetContent}>
          <div class={styles.sheetHeader}>
            <h3 class={styles.sheetTitle}>Settings</h3>
            <button
              type="button"
              class={styles.sheetCloseBtn}
              aria-label="Close settings"
              onClick={props.onClose}
            >
              ×
            </button>
          </div>

          <div class={styles.settingsSection}>
            <h4 class={styles.settingsTitle}>Appearance</h4>
            <div class={styles.schemeRow}>
              {(["light", "dark"] as ColorScheme[]).map((schemeOption) => (
                <button
                  classList={{
                    [styles.schemeChip]: true,
                    [styles.active]: scheme() === schemeOption,
                  }}
                  onClick={() => setColorScheme(schemeOption)}
                >
                  {schemeOption === "light" ? "Light" : "Dark"}
                </button>
              ))}
            </div>
          </div>

          <div class={styles.settingsSection}>
            <h4 class={styles.settingsTitle}>Card Theme</h4>
            <div class={styles.themesGrid}>
              <For each={availableThemes() || []}>
                {(themeOption) => (
                  <button
                    classList={{
                      [styles.themeChip]: true,
                      [styles.active]: theme() === themeOption,
                    }}
                    onClick={() => {
                      if (theme() !== themeOption) setCardTheme(themeOption);
                    }}
                  >
                    <div
                      class={styles.themeCardPreview}
                      style={
                        {
                          "--card-red": previewColors()?.[themeOption]?.Red,
                          "--card-yellow":
                            previewColors()?.[themeOption]?.Yellow,
                          "--card-green": previewColors()?.[themeOption]?.Green,
                          "--card-blue": previewColors()?.[themeOption]?.Blue,
                          "--card-black": previewColors()?.[themeOption]?.Black,
                        } as JSX.CSSProperties
                      }
                    >
                      <Show
                        when={previews()?.[themeOption]}
                        fallback={
                          <div class={styles.previewFallback}>WILD</div>
                        }
                      >
                        <div
                          class={styles.previewSvg}
                          innerHTML={previews()?.[themeOption]}
                        />
                      </Show>
                    </div>
                  </button>
                )}
              </For>
            </div>
          </div>

          <Show when={!isInstalled() && canInstall()}>
            <div class={styles.settingsSection}>
              <h4 class={styles.settingsTitle}>Application</h4>
              <button
                class={styles.installAppBtn}
                onClick={props.onInstall}
                disabled={isInstalling()}
              >
                <div class={styles.installAppIcon}>📱</div>
                <div class={styles.installAppText}>
                  <div class={styles.installAppTitle}>
                    <Show when={isInstalling()} fallback="Install App">
                      Installing...
                    </Show>
                  </div>
                  <div class={styles.installAppDesc}>
                    Fast access and offline support
                  </div>
                </div>
                <Show when={isInstalling()}>
                  <div class={styles.installSpinner} />
                </Show>
              </button>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}

export default SettingsSheet;
