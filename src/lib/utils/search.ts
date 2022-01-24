import { GeneralizedSuffixArray, LRUCache } from 'mnemonist';
import Sets from 'mnemonist/set';

import { State } from './types';

const EMPTY_SET = Object.freeze(new Set<string>());
const LRU_CAPACITY = 512;  // idk

class Possibility {
  constructor(
    letter: string | null,
    public readonly set: Set<string>,
    public readonly letterCounts: Record<string, number>,  // record of letters still available to use
  ) {
    // shallow-copy this so we can mutate it
    this.letterCounts = {...this.letterCounts};
    if (letter !== null) {
      // remove letter from available letters
      this.letterCounts[letter] -= 1;
    }
    // make it read-only
    this.letterCounts = Object.freeze(this.letterCounts);
  }
}

// create a counter of the letters/chars that appear in a string
// TODO: maybe simplify this with mnemonist's DefaultMap
// (https://yomguithereal.github.io/mnemonist/default-map#autoincrement)
function counter(s: string): Record<string, number> {
  let counts: Record<string, number> = {};
  for (let char of s) {
    counts[char] = (counts[char] || 0) + 1;
  }
  return counts;
}

export class Dictionary {
  // this LRUCache stores string[] instead of Set<string> even though we have to get a
  // set out of it eventually
  // we got three reasons for that:
  // 1. if we were to store a set we'd have to copy it out anyway bc the match() loop
  //    does intersections in situ (and changing that to copy before intersecting would be
  //    lame/inefficient)
  // 2. given that we have to copy it out anyway, new Set(string[]) is for some reason
  //    a lot faster than new Set(Set<string>) (probably a bug in engines but w/e)
  // 3. plus, pushing to an array to create it in the first place is ofc a lot faster than
  //    adding to a set
  private gsaByPosition: {suffixes: number[], cache: LRUCache<string, string[]>}[];
  private gsaText: string;
  private readonly gsaWordLength;

  public readonly dictionary: readonly string[];

  constructor(
    public readonly rawDictionary: readonly string[],
    public readonly wordLength: number
  ) {
    this.dictionary = [...this.rawDictionary].sort();
    this.gsaWordLength = 1 + this.wordLength;

    const gsa = new GeneralizedSuffixArray(this.dictionary as string[]);  // no harm done, GSA doesn't mutate

    // asserting `string` bc this.dictionary's type makes `string[]` impossible
    this.gsaText = gsa.text as string;
    this.gsaByPosition = Array.from({length: this.gsaWordLength}, () => ({
      suffixes: [],
      cache: new LRUCache(LRU_CAPACITY)
    }));

    for (let value of gsa.array) {
      this.gsaByPosition[value % this.gsaWordLength].suffixes.push(value);
    }
  }

  indexOf(word: string): number {
    let low = 0;
    let high = this.dictionary.length - 1;
    let mid: number;
  
    do {
      mid = Math.floor((high + low) / 2);
      if (this.dictionary[mid] > word) {
        high = mid;
      }
      if (this.dictionary[mid] < word) {
        low = mid;
      }
      if (high - low <= 1) {
        break;
      }
    } while (this.dictionary[mid] !== word);

    if (this.dictionary[mid] === word) {
      return mid;
    }
    return -1;
  }

  private findFirst(letter: string, at: number): number {
    const gsa = this.gsaByPosition[at].suffixes;
    const text = this.gsaText;

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
    const gsa = this.gsaByPosition[at].suffixes;
    const text = this.gsaText;

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

  // get all words that have the given letter at the given index
  private getRange(letter: string, at: number): Set<string> {
    const {suffixes: gsa, cache} = this.gsaByPosition[at];

    if (!cache.has(letter)) {
      const first = this.findFirst(letter, at);
      const last = this.findLast(letter, at);
      const dictionary = this.dictionary;

      let words: string[] = [];
      for (let idx = first; idx < last; idx++) {
        words.push(dictionary[Math.floor(gsa[idx] / this.gsaWordLength)]);
      }
      cache.set(letter, words);
    }

    // asserting `string[]` (even though it's not necessary now that I'm returning a Set instead
    // of a string[]) because we just made it impossible for cache.get() to be `undefined`
    return new Set(cache.get(letter) as string[]);
  }

  // get all words that *don't* have any of the given letters at the given index
  // TODO: figure out how to cache this...
  private getRangeWithout(letters: string[], at: number): Set<string> {
    const gsa = this.gsaByPosition[at].suffixes;
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
        set.add(dictionary[Math.floor(gsa[idx] / this.gsaWordLength)]);
      }
    }

    return set;
  }

  // soFar stores the state of the solve 'so far', i.e. all seen letters
  // it starts out as a map of the original word produced by counter(),
  // so for example the word 'banal' starts as {b: 1, a: 2, n: 1, l: 1}
  // but every time we use a letter its value in there gets decremented by one
  private handleLetter(at: number, letter: string, state: State, soFar: Record<string, number>): Possibility[] {
    switch (state) {
      // 'Right' means we want a word that has this letter at this exact index
      case State.Right: {
        return [new Possibility(letter, this.getRange(letter, at), soFar)];
      }

      // 'Elsewhere' means we want a word that has this letter, but not at this index
      // Wordle's rules make that tricky, though: if we've already used this letter
      // as many times as it appears in the original word, it doesn't count as 'Elsewhere'
      // but as 'Wrong'
      case State.Elsewhere: {
        // l !== letter: we don't want to return words that have this letter at this index ofc
        // soFar[l] > 0: we also don't want words that have letters we've already used up
        const allowed = Object.keys(soFar).filter(l => l !== letter && soFar[l] > 0);
        return allowed.map(l => new Possibility(l, this.getRange(l, at), soFar));
      }

      // this means we want a word that doesn't have this letter anywhere
      // or one in which we've already used this letter all the way up
      case State.Wrong: {
        const exclude = Object.keys(soFar).filter(l => soFar[l] > 0);
        if (soFar[letter] === 0) {
          exclude.push(letter);
        }
        return [new Possibility(null, this.getRangeWithout(exclude, at), soFar)];
      }

      // otherwise nothing
      default:
      case State.Empty: {
        return [];
      }
    }
  }

  match(pattern: State[], word: string): Set<string> {
    // we want to start with the most-constraining states and then broaden out
    // e.g. locking in green cells first lets us narrow yellow cells' constraints down
    // and the same in turn applies to yellow => black
    const [firstIndex, ...sortedIndices] = pattern
      .map((_, idx) => idx)
      .sort((a, b) => pattern[b] - pattern[a]);  // taking advantage of the State enum's ordering

    // this part is basically a giant reduce loop
    // `possibilities` is the accumulator / holds all possible words at each iteration
    // and slowly gets whittled down until we reach the end, where it'll store all results
    let possibilities: Possibility[] = this.handleLetter(
      firstIndex,
      word[firstIndex],
      pattern[firstIndex],
      counter(word)
    );

    sortedIndices.forEach(idx => {
      const state = pattern[idx];
      const letter = word[idx];

      possibilities = possibilities
        .flatMap(ogPossibility => {
          let newPossibilities = this.handleLetter(idx, letter, state, ogPossibility.letterCounts);
          newPossibilities.forEach(newPossibility => Sets.intersect(newPossibility.set, ogPossibility.set));
          return newPossibilities;
        }).filter(
          possibility => possibility.set.size > 0
        );
    });

    // the two EMPTY_SETS are there just in case there are no results
    // (Sets.union() needs at least two arguments so this is a lazy workaround)
    return Sets.union(EMPTY_SET, EMPTY_SET, ...possibilities.map(possibility => possibility.set));
  }
}
