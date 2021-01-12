const express = require("express");
const PuzzlesService = require("./puzzles-service");

const puzzlesRouter = express.Router();
const jsonParser = express.json();

puzzlesRouter
  .route("/")
  .get((req, res, next) => {
    PuzzlesService.getAllPuzzles(req.app.get("db"))
      .then((puzzles) => {
        res.json(puzzles.map(PuzzlesService.serializePuzzle));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const {
      user_id,
      title,
      rows,
      cols,
      blocks,
      letters,
      cellId,
      clues,
    } = req.body;
    const newPuzzle = {
      user_id,
      title,
      rows,
      cols,
      blocks,
      letters,
      cellId,
      clues,
    };

    for (const [key, value] of Object.entries(newPuzzle)) {
      if (value == null) {
        return res
          .status(400)
          .json({ error: { message: `Missing '${key}' in request body` } });
      }
    }

    PuzzlesService.insertPuzzle(req.app.get("db"), newPuzzle)
      .then((puzzle) => {
        res.status(201).json(PuzzlesService.serializePuzzle(puzzle));
      })
      .catch(next);
  });

puzzlesRouter.route("/user/:user_id").get((req, res, next) => {
  PuzzlesService.getByUserId(req.app.get("db"), req.params.user_id).then(
    (user) => {
      res.user = user;
      res.json(res.user);
      next();
    }
  );
});

puzzlesRouter
  .route("/:puzzle_id")
  .all((req, res, next) => {
    PuzzlesService.getById(req.app.get("db"), req.params.puzzle_id).then(
      (puzzle) => {
        if (!puzzle) {
          return res
            .status(400)
            .json({ error: { message: `Puzzle doesn't exist` } });
        }
        res.puzzle = puzzle;
        next();
      }
    );
  })
  .get((req, res, next) => {
    res.json(PuzzlesService.serializePuzzle(res.puzzle));
  })
  .patch(jsonParser, (req, res, next) => {
    const {
      user_id,
      title,
      rows,
      cols,
      blocks,
      letters,
      cellId,
      clues,
    } = req.body;
    const puzzleToUpdate = {
      user_id,
      title,
      rows,
      cols,
      blocks,
      letters,
      cellId,
      clues,
    };

    const numberOfValues = Object.values(puzzleToUpdate).filter(Boolean).length;
    if (numberOfValues < 8) {
      return res.status(400).json({
        error: {
          message: `Request body must contain 'user_id', 'title', 'rows', 'cols', 'blocks', 'letters', 'cellId', and 'clues'`,
        },
      });
    }

    PuzzlesService.updatePuzzle(
      req.app.get("db"),
      req.params.puzzle_id,
      puzzleToUpdate
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    PuzzlesService.deletePuzzle(req.app.get("db"), req.params.puzzle_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = puzzlesRouter;
