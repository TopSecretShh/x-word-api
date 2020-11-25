CREATE TABLE puzzles (
    id SERIAL PRIMARY KEY,
    user_name TEXT REFERENCES users(user_name) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    rows INTEGER NOT NULL,
    cols INTEGER NOT NULL,
    -- figure out cells. can you do boolean || text ??
    cells BOOLEAN || TEXT [] NOT NULL,
    cellId INTEGER NOT NULL,
    clues TEXT [][] NOT NULL
)