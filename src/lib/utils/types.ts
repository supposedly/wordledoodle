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

export type CellValue = {state: State, value: string | null};
