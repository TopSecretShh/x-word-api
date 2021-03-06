CREATE TABLE puzzles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    rows INTEGER NOT NULL,
    cols INTEGER NOT NULL,
    blocks BOOLEAN [] NOT NULL,
    letters TEXT [] NOT NULL,
    cell_id INTEGER [] NOT NULL,
    clues_across TEXT [][] NOT NULL,
    clues_down TEXT [][] NOT NULL
);


-- clues [][]
-- clues should look like this: [['1 across', 'this is the clue']. ['1 down', 'this is also a clue'], ['3 across', 'etc']]