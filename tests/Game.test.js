import Game from "../src/Game.js";

describe("Game", () => {
  let game;

  beforeEach(() => {
    game = Game();
  });

  test("should create a game with two players and already places ships", () => {
    expect(game.player1).toBeDefined();
    expect(game.player2).toBeDefined();
    expect(game.player1.board.totalAvailableShips).toBe(0);
    expect(game.player2.board.totalAvailableShips).toBe(0);
  });

  test("should allow players to attack each other and switch after miss", () => {
    //find a position to attack that will miss
    let tile = game.opponentBoard
      .flat()
      .find((tile) => !tile.ship && !tile.hit);
    let position = [tile.x, tile.y];
    expect(game.currentPlayer).toBe(game.player1);
    expect(game.attack(position)).toBe(false);
    expect(game.currentPlayer).toBe(game.player2);
    tile = game.opponentBoard.flat().find((tile) => !tile.ship && !tile.hit);
    position = [tile.x, tile.y];
    expect(game.attack(position)).toBe(false);
    expect(game.currentPlayer).toBe(game.player1);
  });
  test("allow same player to play again if they hit a ship", () => {
    //find a position to attack that will hit
    const tile = game.opponentBoard
      .flat()
      .find((tile) => tile.ship && !tile.hit);
    const position = [tile.x, tile.y];
    expect(game.currentPlayer).toBe(game.player1);
    expect(game.attack(position)).toBe(true);
    expect(game.currentPlayer).toBe(game.player1); // Player 1 should play again
  });
  test("should end the game when all ships are sunk", () => {
    //find all positions to attack that will hit
    const positions = [];
    game.opponentBoard.forEach((row, x) => {
      row.forEach((tile, y) => {
        if (tile.ship && !tile.hit) {
          positions.push([x, y]); // Use the indices as the actual position
        }
      });
    });
    positions.forEach((position) => {
      game.attack(position);
    });
    expect(game.gameOver).toBe(true);
    expect(game.winner).toBe("Player 1");
  });
  test("should not allow attacks after the game is over", () => {
    //find all positions to attack that will hit
    const positions = [];
    game.opponentBoard.forEach((row, x) => {
      row.forEach((tile, y) => {
        if (tile.ship && !tile.hit) {
          positions.push([x, y]); // Use the indices as the actual position
        }
      });
    });
    positions.forEach((position) => {
      game.attack(position);
    });
    expect(game.gameOver).toBe(true);
    expect(() => game.attack([0, 0])).toThrow("Game is already over");
  });
});
