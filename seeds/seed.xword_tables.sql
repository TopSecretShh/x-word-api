BEGIN;

TRUNCATE
    users,
    puzzles
    RESTART IDENTITY CASCADE;

INSERT INTO users (user_name, password) VALUES
    (
        'Bob',
        -- hoping that the below hash equals 'bob'
        '$2a$12$iXnTAVkI9.TT66clQPC9KOWwchihXk1sFnYnRxMZ9veQc90IV5D3S'
    );

INSERT INTO puzzles (user_id, title, rows, cols, blocks, letters, cell_id, clues_across, clues_down) VALUES 
    (
        1,
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
            "", "", "", "", "", "", "", "", ""
        }',
        '{
            "0", "1", "2", "3", "4", "5", "6", "7", "8"
        }',
        '{
            {"1 across", "a"},
            {"2 across", "b"}
            
        }',
        '{
            {"1 down", "c"},
            {"2 down", "d"}
        }'
    );

COMMIT;