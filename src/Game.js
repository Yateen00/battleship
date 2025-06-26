import Player from "./Player.js";
import GameBoard from "./GameBoard.js";

function Game(player1Type = "human", player2Type = "human") {
  //partially works with bots, issue is attack needs to be called at least once
  if (player1Type === "bot" && player2Type === "bot") {
    throw new Error("At least one player must be human");
  }
  const pieces = {
    2: 1,
    3: 2,
    4: 1,
    5: 1,
  };
  const player1Board = GameBoard(pieces);
  const player2Board = GameBoard(pieces);
  const player1 = Player(player2Board, player1Type);
  const player2 = Player(player1Board, player2Type);
  let currentPlayer = player1;
  let opponentPlayer = player2;
  //initally place ships for both players randomly
  function placeRandomly(player) {
    Object.keys(pieces).forEach((length) => {
      for (let i = 0; i < pieces[length]; i++) {
        let placed = false;
        while (!placed) {
          try {
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);
            const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
            player.board.placeShip(parseInt(length), [x, y], orientation);

            placed = true;
          } catch (error) {
            if (error.message === "No ships of this length available") {
              break; // No more ships of this length to place
            }
          }
        }
      }
    });
  }
  placeRandomly(player1);
  placeRandomly(player2);
  function switchPlayer() {
    [currentPlayer, opponentPlayer] = [opponentPlayer, currentPlayer];
  }
  function attack(position) {
    if (gameOver()) {
      throw new Error("Game is already over");
    }
    const hit = opponentPlayer.attack(position);
    if (!opponentPlayer.board.allShipsSunk() && !hit) {
      switchPlayer();
      while (currentPlayer.isBot && !opponentPlayer.board.allShipsSunk()) {
        const randomMove = currentPlayer.makeRandomMove();
        attack(randomMove);
      }
    }
    return hit;
  }
  function gameOver() {
    return (
      opponentPlayer.board.allShipsSunk() || currentPlayer.board.allShipsSunk()
    );
  }
  return {
    player1,
    player2,
    get currentPlayer() {
      return currentPlayer;
    },
    get opponentBoard() {
      return opponentPlayer.board;
    },
    get opponentPlayer() {
      return opponentPlayer;
    },
    get currentBoard() {
      return currentPlayer.board;
    },
    get gameOver() {
      return gameOver();
    },
    get winner() {
      if (gameOver()) {
        return currentPlayer.board.allShipsSunk() ? "Player 2" : "Player 1";
      }
      return null;
    },
    attack,
    get currentPlayerName() {
      return currentPlayer === player1 ? "Player 1" : "Player 2";
    },
    get opponentPlayerName() {
      return currentPlayer === player1 ? "Player 2" : "Player 1";
    },
  };
}
export default Game;
