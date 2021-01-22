const xss = require("xss");

const PuzzlesService = {
  getAllPuzzles(db) {
    return db.from("puzzles").select("*");
  },
  getById(db, id) {
    return db.from("puzzles").select("*").where("puzzles.id", id).first();
  },
  getByUserId(db, userId) {
    return db.from("puzzles").select("*").where("puzzles.user_id", userId);
  },
  insertPuzzle(db, newPuzzle) {
    return db
      .insert(newPuzzle)
      .into("puzzles")
      .returning("*")
      .then(([puzzle]) => puzzle)
      .then((puzzle) => PuzzlesService.getById(db, puzzle.id));
  },
  // TODO how to xss only the second element in nested arrays of clue arrays
  serializePuzzle(puzzle) {
    return {
      id: puzzle.id,
      user_id: puzzle.user_id,
      title: xss(puzzle.title),
      rows: puzzle.rows,
      cols: puzzle.cols,
      blocks: puzzle.blocks,
      letters: puzzle.letters,
      cell_id: puzzle.cell_id,
      // clues_across: xss(puzzle.clues_across, {
      //   whiteList: [],
      //   stripIgnoreTag: true,
      //   stripIgnoreTagBody: ["script"],
      // }),
      clues_across: puzzle.clues_across,
      clues_down: puzzle.clues_down,
    };
  },
  deletePuzzle(db, id) {
    return PuzzlesService.getAllPuzzles(db).where({ id }).delete();
  },
  updatePuzzle(db, id, newPuzzleFields) {
    return PuzzlesService.getAllPuzzles(db)
      .where({ id })
      .update(newPuzzleFields);
  },
};

module.exports = PuzzlesService;
