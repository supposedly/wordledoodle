import { GeneralizedSuffixArray } from 'mnemonist/suffix-array';
import Sets from 'mnemonist/set';

import { State } from './types';

function counter(s: string): Record<string, number> {
  let counts: Record<string, number> = {};
  for (let char of s) {
    counts[char] = (counts[char] || 0) + 1;
  }
  return counts;
}

export class Dictionary {
  private dictionary: string[];
  private wordLength: number;
  private gsa: GeneralizedSuffixArray;
  private gsaByPosition: number[][];

  constructor(dictionary: string[], wordLength: number = 5) {
    this.dictionary = dictionary.sort();
    this.wordLength = wordLength;
    this.gsa = new GeneralizedSuffixArray(dictionary);
    const gsaWordLength = 1 + this.wordLength;

    this.gsaByPosition = Array.from({length: gsaWordLength}, () => []);

    for (let i = 0; i < this.gsa.array.length; i++) {
      // normal loops are faster than fancy es6 ones
      // i know, premature optimization etc, but i do wanna keep ginormous dictionaries in mind
      const value = this.gsa.array[i];
      this.gsaByPosition[value % gsaWordLength].push(value);
    }
  }

  has(answer: string): boolean {
    let low = 0;
    let high = this.dictionary.length - 1;
    let mid: number;
  
    do {
      mid = Math.floor((high + low) / 2);
      if (this.dictionary[mid] > answer) {
        high = mid - 1;
      }
      if (this.dictionary[mid] < answer) {
        low = mid + 1;
      }
      if (low >= high) {
        break;
      }
    } while (this.dictionary[mid] !== answer);

    return this.dictionary[mid] === answer;
  }

  // if a letter of the test word is in the source word, make sure it doesn't appear 
  private validate(test: string, source: string, pattern: State[], counts: Record<string, number>): boolean {
    return pattern.every((state, i) => {
      switch (state) {
        default:
        case State.Empty:
        case State.Wrong:
          return 
      }
    });
  }

  private findFirst(letter: string, at: number): number {
    const gsa = this.gsaByPosition[at];
    const text = this.gsa.text;

    let low = 0;
    let high = gsa.length - 1;
    let mid;

    do {
      mid = Math.floor((high + low) / 2);
      if (text[gsa[mid]] >= letter) {
        high = mid;
      } else {
        low = mid + 1;
      }
    } while (low < high);

    return low;
  }

  private findLast(letter: string, at: number): number {
    const gsa = this.gsaByPosition[at];
    const text = this.gsa.text;

    let low = 0;
    let high = gsa.length - 1;
    let mid;

    do {
      mid = Math.ceil((high + low) / 2);
      if (text[gsa[mid]] <= letter) {
        low = mid;
      } else {
        high = mid - 1;
      }
    } while (low < high);

    return high;
  }

  private getRange(letter: string, at: number): Set<string> {
    const first = this.findFirst(letter, at);
    const last = this.findLast(letter, at);
    const dictionary = this.dictionary;
    const gsa = this.gsaByPosition[at];
    let set = new Set<string>();
  
    for (let idx = first; idx < last; idx++) {
      set.add(dictionary[(gsa[idx] / 6) >> 0]);  // dumb hack to round down quicker than calling Math.floor()
    }

    return set;
  }

  match(pattern: State[], word: string): string[] {
    // we want to start with the most-constraining states and then broaden
    // e.g. locking in green cells first lets us narrow yellow cells' constraints down
    // and the same in turn applies to yellow => black
    const [firstStateIdx, ...sortedStates] = pattern
      .map((_, idx) => idx)
      .sort((a, b) => pattern[b] - pattern[a]);
    let counts = counter(word);
    let set: Set<string>;

    switch (pattern[firstStateIdx]) {
      case State.Right: {
        set = this.getRange(word[firstStateIdx], firstStateIdx);
        break;
      }
      case State.Elsewhere: {
        set = new Set();
        break;
      }
      default:
      case State.Empty:
      case State.Wrong: {
        set = new Set();
        break;
      }
    }

    for (let idx of sortedStates) {
      const state = pattern[idx];
      const letter = word[idx];

      switch (state) {
        case State.Right: {
          Sets.intersect(set, this.getRange(letter, idx));
          break;
        }
        case State.Elsewhere: {
          
          break;
        }
        default:
        case State.Empty:
        case State.Wrong: {
          
          break;
        }
      }
    }

    return [...set];
  }
}
