CREATE TABLE puzzles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT REFERENCES users(user_name) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    rows INTEGER NOT NULL,
    cols INTEGER NOT NULL,
    -- figure out cells. can you do boolean || text ??
    cells BOOLEAN || TEXT [] NOT NULL,
    cellId INTEGER NOT NULL,
    -- figure out clues. can you store an array of objects? is it helpful in any way to store clues in a separate table?
    -- create type?
    -- enum?
    clues TEXT NOT NULL
)