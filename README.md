# [Wordle Doodle](https://supposedly.github.io/wordledoodle)

Wordle art! This gives you a Wordle grid to doodle on with three colors, and it tries its best to fill in the grid with matching words.

If you've already solved today's Wordle but you still want to try out a result from here on the real site,
you can open https://powerlanguage.co.uk/wordle in a Private or Incognito window and have at it.

## Thing I need to fix
- Combining "elsewhere" (yellow) and "wrong" (black) letters takes too much time. More below

## Technical stuff

### Algorithm
If anyone reading knows more than me and spots something inefficient or wrong here, please let me know! I'm not sure if there's
a better alternative to the set stuff.

Starting with a sorted dictionary of words that are all the same length...
1. Concatenate the words together with an arbitrary out-of-alphabet delimiter, then construct a huge suffix array out of the resulting string.
2. Go through the suffix array linearly and group the indices together based on each one's position within a word.  
   (Since our words are all the same length, and the concatenation delimiter adds 1 to that length, we can just
   group the indices by `index % (1 + wordLength)`)  
   These "suffix subarrays" are already sorted lexicographically because the original suffix array was as well.
3. When a row of green states (letters that are `Right`), yellow states (letters that are `Elsewhere`), and/or black states
   (letters that are `Wrong`) needs to be solved for:
    1. Start keeping a running set of possible solves. This'll actually be a list of multiple sets, each one representing a different 'solve path'.
    2. Do all the `Right` letters first, since that's the narrowest state possible and helps us cut down a lot on our search space.
       To process a `Right` letter, do two binary searches in the "suffix subarray" that matches its position: one search to find
       the very first word that has it at that position, and another to find the very last word with it there. Grab those two
       words and all of the ones in between them, then store them in a set.  
       Narrow down the running set of solves by taking its intersection with that set.  
    3. Do the `Elsewhere`s next. To process one, take all of the target word's letters except the correct one for this position and
       any that have already been used up, and for each one, collect the same type of word-set as for `Right` letters. Associate
       all of those sets with this position, since they're all different possibilities.  
       Once done, intersect the running solution set with each of these possibilities, and prune any intersections that end up empty.  
       The intersections that remain will be the new sets of possible solves. Make sure to keep track of the letters each one had to consume to
       get there. (We can't merge (union) all of these possibilities together because they represent different 'solve paths', aka
       different sequences of consumed letters.)
    4. Finally, finish off by processing the `Wrong` letters. Unlike `Elsewhere`s, `Wrong`s don't need to pay attention to the letters
       they're consuming: the same letter can be `Wrong` indefinitely many times, even though it can't be `Elsewhere` any more times
       than it appears in the target word.  
       To process a `Wrong` letter, create a set of all words in the dictionary **except** the ones that are still in the word and
       haven't already been used all the way up. Intersect that set with each set out of the current possible solves.
4. After all of that, the 'current possible solves' will consist of a bunch of different sets, each containing words that match
   the requested pattern of states. Union all of those together and you have your set of results. (If there are no matches, it'll be
   empty.) Pick a random one to finish up.

\#2 could be simplified by constructing a suffix array that sorts by position before going lexicographically, but it didn't
seem worth the trouble. It would come at the cost of a couple extra binary-search hops every time we need to find a letter.

Also, since Wordle's dictionary is relatively small, most of this is kind of overkill -- a few linear regex searches on it might be quick
enough to handle basically everything above. I just wanted to leave things open for words longer than 5 letters or a way-larger dictionary.

...speaking of which, #3.iv above isn't working: grids with lots of Elsewheres followed by lots of Wrongs would take up to two seconds
to solve before I started caching the possible solves for each combination of word + pattern of states. Even the caching technique fails
if you draw a different pattern of Elsewheres on each row, though. (It's more-or-less fine for now because the small size of the Wordle
grid makes you pretty likely to draw repeated rows, but the cracks will start showing on grids that are any larger.)

Caching the results of individual Wrong cells would also help, but I don't have any ideas as to how. I tried making it search
letter-by-letter instead of range-by-range so it could be backed by the cache I use for individual letters' results, but that just
made it even slower.

### To do

#### Significant
1. Figure out the best way to cache searches for `Wrong` letters
2. Mayyyyybe sort letters in ascending order of the size of the set(s) they'd produce (e.g. sort `Right`s by their frequency in
   English and `Elsewhere`s by the combined frequency of their alternatives?) to maximally trim the search space, but meh

#### Unimportant optimizations
1. Use `>>0` trick instead of `Math.floor()`
2. Use classic for-loops more than `.forEach()`, `.map()`, etc.
3. Don't bother `Object.freeze()`-ing stuff
