import type { Card } from "../models/card";
import { Deck } from "./deck";

class DeckService {
  private deck: Deck;

  constructor() {
    this.deck = new Deck();
  }

  draw(): Card | null {
    return this.deck.draw();
  }

  reset(): void {
    this.deck.reset();
  }

  remaining(): number {
    return this.deck.remaining();
  }

  drawNextCard(): Card | null {
    let next = this.deck.draw();

    if (!next) {
      this.deck.reset();
      next = this.deck.draw();
    }

    return next;
  }

  resetDeck(): Card | null {
    this.deck.reset();
    return this.deck.draw();
  }
}

export const deckService = new DeckService();
