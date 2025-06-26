import Player from "../src/Player";
//unit test for Player module
describe("Player", () => {
  let player;
  let gameBoard;

  beforeEach(() => {
    // Mock the board as a 10x10 array of tiles
    const board = Array.from({ length: 10 }, () =>
      Array.from({ length: 10 }, () => ({ hit: false }))
    );

    // Use a Proxy to handle array-like access directly on gameBoard
    gameBoard = new Proxy(
      {
        receiveAttack: jest.fn(),
        allShipsSunk: jest.fn().mockReturnValue(false),
      },
      {
        get(target, prop) {
          // Handle numeric properties for array-like access
          if (!isNaN(prop)) {
            return board[prop]; // Return the corresponding row
          }
          // Otherwise, return the property from the target object
          return target[prop];
        },
      }
    );

    player = Player(gameBoard);
  });

  test("attacks the opponent's game board", () => {
    const position = [1, 1];
    player.attack(position);
    expect(gameBoard.receiveAttack).toHaveBeenCalledWith(position);
  });
  test("makes a random move on the game board", () => {
    const position = player.makeRandomMove();
    expect(position).toEqual(
      expect.arrayContaining([expect.any(Number), expect.any(Number)])
    );
    expect(gameBoard.receiveAttack).not.toHaveBeenCalledWith(position);
  });
  test("throws an error if an invalid game board is provided", () => {
    expect(() => Player(null)).toThrow("Invalid game board provided");
    expect(() => Player({})).toThrow("Invalid game board provided");
    expect(() => Player({ receiveAttack: "not a function" })).toThrow(
      "Invalid game board provided"
    );
  });
});
