import type { Card } from "../models/card";
import { REGULAR_COLORS, NUMBER_FACES, ACTION_FACES } from "../models/card";

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.reset();
  }

  private buildStandard(): Card[] {
    const cards: Card[] = [];

    // Number cards: 0×1; 1–9×2 per color
    for (const color of REGULAR_COLORS) {
      // 0 once
      cards.push({ color, face: "0" });
      // 1–9 twice
      for (const face of NUMBER_FACES.slice(1)) {
        cards.push({ color, face });
        cards.push({ color, face });
      }
      // Actions: Skip, Reverse, +2 — two per color
      for (const face of ACTION_FACES) {
        cards.push({ color, face });
        cards.push({ color, face });
      }
    }

    // Wild cards: Wild×4, +4×4
    for (let i = 0; i < 4; i += 1) {
      cards.push({ color: "Black", face: "Wild" });
      cards.push({ color: "Black", face: "+4" });
    }

    return cards;
  }

  private shuffle(): void {
    const { cards } = this;
    for (let i = cards.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  }

  public draw(): Card | null {
    if (this.cards.length === 0) return null;
    return this.cards.pop() ?? null;
  }

  public remaining(): number {
    return this.cards.length;
  }

  public reset(): void {
    this.cards = this.buildStandard();
    this.shuffle();
  }
}
