import { GeneralizedSuffixArray } from 'mnemonist/suffix-array';
import Sets from 'mnemonist/set';

import { State } from './types';

const EMPTY_SET = Object.freeze(new Set<string>());
class Node {
  constructor(
    public readonly letter: string | null,
    public readonly set: Set<string>,
    public readonly counts: Record<string, number>
  ) {
    this.counts = {...this.counts};
    if (letter !== null) {
      this.counts[letter] -= 1;
    }
    this.counts = Object.freeze(this.counts);
  }
}

function counter(s: string): Record<string, number> {
  let counts: Record<string, number> = {};
  for (let char of s) {
    counts[char] = (counts[char] || 0) + 1;
  }
  return counts;
}

export class Dictionary {
  private gsa: GeneralizedSuffixArray;
  private gsaByPosition: number[][];

  constructor(
    public readonly dictionary: string[],
    public readonly wordLength: number = 5
  ) {
    const gsaWordLength = 1 + wordLength;

    this.dictionary = dictionary.sort();
    this.wordLength = wordLength;
    this.gsa = new GeneralizedSuffixArray(dictionary);
  
    this.gsaByPosition = Array.from({length: gsaWordLength}, () => []);
    for (let value of this.gsa.array) {
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
    const gsa = this.gsaByPosition[at];
    const first = this.findFirst(letter, at);
    const last = this.findLast(letter, at);
    const dictionary = this.dictionary;

    let set = new Set<string>();
    for (let idx = first; idx < last; idx++) {
      set.add(dictionary[Math.floor(gsa[idx] / 6)]);
    }

    return set;
  }

  private getGroupedRangeWithout(letters: string[], at: number): [string, Set<string>][] {
    const gsa = this.gsaByPosition[at];
    let ranges = [
      -1,
      ...letters
        .map(l => [this.findFirst(l, at), this.findLast(l, at)])
        .sort((a, b) => a[0] - b[0])
        .flat(),
      gsa.length
    ];
    const dictionary = this.dictionary;

    let sets: Record<string, Set<string>> = {};
    for (let i = 0; i < ranges.length; i += 2) {
      // 'first' is the first character after one of the excluded ones,
      // 'last' is the last character before one of the excluded ones
      const first = ranges[i] + 1, last = ranges[i + 1];

      for (let idx = first; idx < last; idx++) {
        const word = dictionary[Math.floor(gsa[idx] / 6)];
        const letter = word[at];
        if (!Object.hasOwnProperty.call(sets, letter)) {
          sets[letter] = new Set();
        }
        sets[letter].add(word);
      }
    }

    return Object.entries(sets);
  }
  
  private getUngroupedRangeWithout(letters: string[], at: number): Set<string> {
    const gsa = this.gsaByPosition[at];
    let ranges = [
      -1,
      ...letters
        .map(l => [this.findFirst(l, at), this.findLast(l, at)])
        .sort((a, b) => a[0] - b[0])
        .flat(),
      gsa.length
    ];
    const dictionary = this.dictionary;

    let set = new Set<string>();
    for (let i = 0; i < ranges.length; i += 2) {
      // 'first' is the first character after one of the excluded ones,
      // 'last' is the last character before one of the excluded ones
      const first = ranges[i] + 1, last = ranges[i + 1];
      for (let idx = first; idx < last; idx++) {
        set.add(dictionary[Math.floor(gsa[idx] / 6)]);
      }
    }

    return set;
  }

  private handleLetter(at: number, letter: string, state: State, soFar: Record<string, number>): Node[] {
    switch (state) {
      case State.Right: {
        return [new Node(letter, this.getRange(letter, at), soFar)];
      }

      case State.Elsewhere: {
        const allowed = Object.keys(soFar).filter(l => l !== letter && soFar[l] > 0);
        return allowed.map(l => new Node(l, this.getRange(l, at), soFar));
      }

      default:
      case State.Empty:
      case State.Wrong: {
        const exclude = Object.keys(soFar).filter(l => soFar[l] > 0);
        return [
          new Node(null, this.getUngroupedRangeWithout(exclude, at), soFar)
        ];
      }
    }
  }

  match(pattern: State[], word: string): Set<string> {
    // we want to start with the most-constraining states and then broaden
    // e.g. locking in green cells first lets us narrow yellow cells' constraints down
    // and the same in turn applies to yellow => black
    const sortedStates = pattern
      .map((_, idx) => idx)
      .sort((a, b) => pattern[b] - pattern[a]);
    let counts = counter(word);
    const matches: Node[][] = Array.from({length: pattern.length});

    sortedStates.forEach((idx, iteration) => {
      const state = pattern[idx];
      const letter = word[idx];
      
      let possibilities: Node[];
      if (iteration === 0) {
        possibilities = this.handleLetter(idx, letter, state, counts);
      } else {
        possibilities = matches[sortedStates[iteration - 1]].flatMap(
          node => this.handleLetter(idx, letter, state, node.counts)
        );
      }

      matches[idx] = possibilities.filter(node => node.set.size > 0);
    });

    return Sets.intersection(...matches.map(nodes => Sets.union(EMPTY_SET, ...nodes.map(node => node.set))));
  }
}
