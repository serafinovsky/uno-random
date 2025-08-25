import { createStore } from "solid-js/store";
import type { Card } from "../models/card";
import { deckService } from "../services/deckService";

interface DeckState {
  currentCard: Card | null;
  remainingCards: number;
}

const initialState: DeckState = {
  currentCard: deckService.draw(),
  remainingCards: deckService.remaining(),
};

const [store, setStore] = createStore<DeckState>(initialState);

// Actions
const drawNextCard = (): void => {
  const next = deckService.drawNextCard();
  setStore({
    currentCard: next,
    remainingCards: deckService.remaining(),
  });
};

// Accessors
const currentCard = () => store.currentCard;
const remainingCards = () => store.remainingCards;

export const useDeck = () => ({
  // State
  currentCard,
  remainingCards,

  // Actions
  drawNextCard,
});
