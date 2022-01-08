import { GeneralizedSuffixArray } from 'mnemonist/suffix-array';
import dictionary from '../../assets/wordle.dictionary';

// console.log(new GeneralizedSuffixArray(['rink', 'think']));
// console.log(new GeneralizedSuffixArray([dictionary]));

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
