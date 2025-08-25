import {
  createSignal,
  createResource,
  Show,
  onMount,
  createEffect,
  onCleanup,
} from "solid-js";
import "./App.css";
import CardView from "./components/CardView";
import { preloadAllThemesAssets } from "./services/cardAssets";
import { getCardFaceSvg, getAllCardColors } from "./services/cardAssets";
import SettingsSheet from "./components/SettingsSheet";
import LoadingFallback from "./components/LoadingFallback";
import { useDeck, useSettings } from "./stores";
import SettingsFab from "./components/SettingsFab";
import type { BeforeInstallPromptEvent, Navigator } from "./types";

function App() {
  const { currentCard, drawNextCard } = useDeck();
  const [isSettingsOpen, setIsSettingsOpen] = createSignal(false);
  const { theme, scheme, setCanInstall, setIsInstalled, setIsInstalling } =
    useSettings();

  const [deferredPrompt, setDeferredPrompt] =
    createSignal<BeforeInstallPromptEvent | null>(null);
  const [pwaInitialized, setPwaInitialized] = createSignal(false);

  const handleBeforeInstallPrompt = (event: Event) => {
    event.preventDefault();
    setDeferredPrompt(event as BeforeInstallPromptEvent);
    setCanInstall(true);
  };

  const handleAppInstalled = () => {
    setIsInstalled(true);
    setCanInstall(false);
    setDeferredPrompt(null);
  };

  const install = async () => {
    const prompt = deferredPrompt();
    if (!prompt) return false;

    setIsInstalling(true);
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        setCanInstall(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return outcome === "accepted";
    } catch (error) {
      console.error("Error installing PWA:", error);
      return false;
    } finally {
      setIsInstalling(false);
    }
  };

  const initializePWA = () => {
    if (!pwaInitialized()) {
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator).standalone === true
      ) {
        setIsInstalled(true);
        setCanInstall(false);
        setDeferredPrompt(null);
      }

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);
      setPwaInitialized(true);
    } else {
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator).standalone === true
      ) {
        setIsInstalled(true);
        setCanInstall(false);
        setDeferredPrompt(null);
      }
    }
  };

  createEffect(() => {
    const colorScheme = scheme();
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(colorScheme === "light" ? "theme-light" : "theme-dark");
  });

  onMount(() => {
    initializePWA();

    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");

    if (action === "draw") {
      drawNextCard();
    } else if (action === "settings") {
      setIsSettingsOpen(true);
    }

    if (action) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    onCleanup(() => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    });
  });

  const [assetsReady] = createResource(async () => {
    await preloadAllThemesAssets();
    const t = theme();
    const card = currentCard();
    if (card) {
      await Promise.all([getCardFaceSvg(card, t), getAllCardColors(t)]);
    }
    return true;
  });

  return (
    <div class="app">
      <main class="main-content">
        <div class="container">
          <Show when={assetsReady()} fallback={<LoadingFallback />}>
            <CardView card={currentCard()} onClick={drawNextCard} />
            <SettingsFab
              isOpen={isSettingsOpen()}
              onToggle={() => setIsSettingsOpen((v) => !v)}
            />
            <SettingsSheet
              isOpen={isSettingsOpen()}
              onClose={() => setIsSettingsOpen(false)}
              onInstall={install}
            />
          </Show>
        </div>
      </main>
    </div>
  );
}

export default App;
