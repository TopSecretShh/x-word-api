BEGIN;

TRUNCATE
    users,
    puzzles
    RESTART IDENTITY CASCADE;

INSERT INTO users (user_name, password) VALUES
    (
        'Bob',
        'bob'
    );

INSERT INTO puzzles (user_name, title, rows, cols, cells, cellId, clues) VALUES 
    (
        'Bob',
        'Small',
        3,
        3,
        '{
            "true",
            "true",
            "true",
            "true",
            "false",
            "true",
            "true",
            "true",
            "true"
        }',
        '{
            "0", "1", "2", "3", "4", "5", "6", "7", "8"
        }',
        '{
            {"1 across", "a"},
            {"2 across", "b"},
            {"1 down", "c"},
            {"2 down", "d"}
        }'
    );