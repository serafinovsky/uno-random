export type Color = "Red" | "Yellow" | "Green" | "Blue" | "Black";

export type NumberFace =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";
export type ActionFace = "Skip" | "Reverse" | "+2";
export type WildFace = "Wild" | "+4";

export type Face = NumberFace | ActionFace | WildFace;

export interface Card {
  color: Color;
  face: Face;
}

export const COLORS: Color[] = ["Red", "Yellow", "Green", "Blue", "Black"];
export const REGULAR_COLORS: Color[] = ["Red", "Yellow", "Green", "Blue"];
export const NUMBER_FACES: NumberFace[] = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];
export const ACTION_FACES: ActionFace[] = ["Skip", "Reverse", "+2"];
export const WILD_FACES: WildFace[] = ["Wild", "+4"];
