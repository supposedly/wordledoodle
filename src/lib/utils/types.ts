export enum State {
  Empty,
  Wrong,
  Elsewhere,
  Right
};

export enum CSSState {
  Empty,
  Absent,
  Present,
  Correct
};

export type WordleWord = {word: string, hidden: boolean} | {word: null, hidden: null};
