function Player(gameBoard, type = "human") {
  if (!gameBoard || typeof gameBoard.receiveAttack !== "function") {
    throw new Error("Invalid game board provided");
  }

  function makeRandomMove() {
    let x, y;
    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
    } while (gameBoard[x][y].hit); // Ensure the move is legal (not already hit)
    return [x, y];
  }

  return {
    attack: (position) => {
      return gameBoard.receiveAttack(position);
    },
    get board() {
      return gameBoard;
    },
    get isBot() {
      return type === "bot";
    },
    makeRandomMove,
  };
}
export default Player;
