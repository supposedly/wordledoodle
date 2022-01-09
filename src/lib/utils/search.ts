import { GeneralizedSuffixArray } from 'mnemonist/suffix-array';

export enum Match {
  Sike,
  Partial,
  Exact
}

export class Dictionary {
  private dictionary: string[];
  private gsa: GeneralizedSuffixArray;

  constructor(dictionary: string[]) {
    this.dictionary = dictionary;
    this.gsa = new GeneralizedSuffixArray(dictionary);
  }

  has(answer: string): boolean {
    let low = 0;
    let high = this.dictionary.length - 1;
    let mid: number;
  
    do {
      mid = Math.floor((high + low) / 2);
      if (this.dictionary[mid] > answer) {
        high = mid;
      }
      if (this.dictionary[mid] < answer) {
        low = mid;
      }
      if (high - low <= 1) {
        break;
      }
    } while (this.dictionary[mid] !== answer);

    return this.dictionary[mid] === answer;
  }
}
