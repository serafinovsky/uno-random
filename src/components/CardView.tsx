import type { Card } from "../models/card";
import {
  getCardFaceSvg,
  getCardDisplayColor,
  getAllCardColors,
} from "../services/cardAssets";
import { createResource, type JSX } from "solid-js";
import { useSettings } from "../stores";
import styles from "./CardView.module.css";

interface CardViewProps {
  card: Card | null;
  onClick: () => void;
}

function CardView(props: CardViewProps) {
  const { theme } = useSettings();
  const [colorsResource] = createResource(theme, getAllCardColors);

  const [cardVisuals] = createResource(
    () => {
      const currentTheme = theme();
      const currentCard = props.card;
      return currentCard ? { card: currentCard, theme: currentTheme } : null;
    },
    async (src) => {
      if (!src) return { svg: null as string | null, color: "#000" };
      const [svg, color] = await Promise.all([
        getCardFaceSvg(src.card, src.theme),
        getCardDisplayColor(src.card, src.theme),
      ]);
      return { svg, color };
    }
  );

  const currentColor = () => cardVisuals()?.color ?? "#000";
  const faceSvg = () => cardVisuals()?.svg ?? null;
  const allColors = () =>
    colorsResource() ??
    ({
      Red: "#F00",
      Yellow: "#FF0",
      Green: "#0F0",
      Blue: "#00F",
      Black: "#000",
    } as Record<string, string>);

  return (
    <div
      class={styles.unoCard}
      onClick={props.onClick}
      style={
        {
          "--card-color": currentColor(),
          "--card-red": allColors().Red,
          "--card-yellow": allColors().Yellow,
          "--card-green": allColors().Green,
          "--card-blue": allColors().Blue,
          "--card-black": allColors().Black,
        } as JSX.CSSProperties
      }
    >
      {props.card ? (
        <div class={styles.cardFront}>
          {faceSvg() ? (
            <div
              class={styles.cardSvgContainer}
              innerHTML={faceSvg()!}
              title={`${props.card.color} ${props.card.face}`}
            />
          ) : (
            <div class="card-face-fallback">{props.card.face}</div>
          )}
        </div>
      ) : (
        <div class={styles.cardEmpty}>
          <span class={styles.cardIcon}>🃏</span>
          <p>Click to draw a card</p>
        </div>
      )}
    </div>
  );
}

export default CardView;
