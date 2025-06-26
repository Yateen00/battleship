import GameBoard from "../src/GameBoard.js";
describe("GameBoard", () => {
  let gameBoard;

  describe("GameBoard creation", () => {
    beforeEach(() => {
      const availableShips = {
        //length : count
        2: 2,
      };
      gameBoard = GameBoard(availableShips);
    });
    test("should create a game board with the correct properties", () => {
      expect(gameBoard.hits).toEqual([]);
      expect(gameBoard.missedShots).toEqual([]);
      expect(gameBoard.sunkenShips).toEqual([]);
      expect(gameBoard).toHaveLength(10);
      expect(gameBoard[0]).toHaveLength(10);
      expect(gameBoard[0][0]).toHaveProperty("x", 0);
      expect(gameBoard[0][0]).toHaveProperty("y", 0);
      expect(gameBoard[0][0]).toHaveProperty("ship", null);
      expect(gameBoard.totalAvailableShips).toBe(2);
      expect(gameBoard.totalShips).toBe(2);
      expect(gameBoard.allShipsSunk()).toBe(false);
    });

    test("placing a ship on the board", () => {
      gameBoard.placeShip(2, [7, 8], "horizontal");
      expect(gameBoard[7][8].ship).not.toBeNull();
      expect(gameBoard[7][9].ship).not.toBeNull();
      expect(gameBoard.totalAvailableShips).toBe(1);
    });

    test("placing a ship at an invalid position", () => {
      expect(() => gameBoard.placeShip(2, [-1, 9], "horizontal")).toThrow(
        "Invalid position"
      );
    });
    test("placing a ship that exceeds board boundaries", () => {
      expect(() => gameBoard.placeShip(2, [9, 9], "horizontal")).toThrow(
        "Invalid position"
      );
    });
    test("placing a ship with an invalid orientation", () => {
      expect(() => gameBoard.placeShip(3, [0, 0], "diagonal")).toThrow(
        "Invalid orientation"
      );
    });
    test("placing a ship with an invalid length", () => {
      expect(() => gameBoard.placeShip(0, [0, 0], "horizontal")).toThrow(
        "Invalid ship length"
      );
    });
    test("placing a ship with no available ships of that length", () => {
      expect(() => gameBoard.placeShip(6, [0, 0], "horizontal")).toThrow(
        "No ships of this length available"
      );
    });
    test("placing a ship that overlaps with another ship", () => {
      gameBoard.placeShip(2, [0, 0], "horizontal");
      expect(() => gameBoard.placeShip(2, [0, 1], "vertical")).toThrow(
        "Ships overlap"
      );
    });
    test("after placing all ships, totalAvailableShips should be 0", () => {
      gameBoard.placeShip(2, [0, 0], "horizontal");
      expect(gameBoard.totalAvailableShips).toBe(1);
      gameBoard.placeShip(2, [1, 0], "vertical");
      expect(gameBoard.totalAvailableShips).toBe(0);
    });
    test("getting ship coordinates for tile with ship", () => {
      gameBoard.placeShip(2, [0, 0], "horizontal");
      const shipCoords = gameBoard.shipCoordinates([0, 0]);
      expect(shipCoords).toEqual([
        [0, 0],
        [0, 1],
      ]);
    });
    test("getting ship coordinates for a ship at an invalid position", () => {
      expect(() => gameBoard.shipCoordinates([-1, 0])).toThrow(
        "Invalid position"
      );
    });
    test("getting ship coordinates for a tile with no ship", () => {
      expect(() => gameBoard.shipCoordinates([5, 5])).toThrow(
        "No ship at this tile"
      );
    });
    test("repositionShip with valid parameters", () => {
      gameBoard.placeShip(2, [0, 0], "horizontal");

      gameBoard.repositionShip([0, 0], [1, 1], "vertical");
      expect(gameBoard[1][1].ship).not.toBeNull();
      expect(gameBoard[0][0].ship).toBeNull();
    });
    test("repositionShip with invalid parameters", () => {
      gameBoard.placeShip(2, [0, 0], "horizontal");
      expect(() =>
        gameBoard.repositionShip([-1, 0], [0, 0], "vertical")
      ).toThrow("Invalid old position");
      expect(() =>
        gameBoard.repositionShip([0, 0], [1, 1], "diagonal")
      ).toThrow("Invalid orientation");
      expect(() =>
        gameBoard.repositionShip([0, 0], [-1, 1], "vertical")
      ).toThrow("Invalid new position");
      expect(() =>
        gameBoard.repositionShip([2, 2], [1, 1], "vertical")
      ).toThrow("No ship at the old position");
      gameBoard.placeShip(2, [0, 2], "horizontal");
      expect(() =>
        gameBoard.repositionShip([0, 0], [0, 2], "vertical")
      ).toThrow(/Repositioning failed:/);
      expect(gameBoard[0][0].ship).not.toBeNull();
      expect(gameBoard[0][2].ship).not.toBeNull();
    });
  });
  describe("GameBoard attack", () => {
    beforeEach(() => {
      const availableShips = {
        2: 1,
      };
      gameBoard = GameBoard(availableShips);
      gameBoard.placeShip(2, [0, 0], "horizontal");
    });
    test("reposition after attacks have been made", () => {
      gameBoard.receiveAttack([0, 0]);
      expect(() =>
        gameBoard.repositionShip([0, 0], [1, 1], "vertical")
      ).toThrow("Cannot reposition ships after attacks have been made");
    });
    test("attacking before placing all ships", () => {
      gameBoard = GameBoard({ 2: 1 });
      expect(() => gameBoard.receiveAttack([0, 0])).toThrow(
        "All ships not placed yet"
      );
    });
    test("hitting a ship", () => {
      gameBoard.receiveAttack([0, 1]);
      expect(gameBoard[0][1].ship.hits).toContain(1);

      expect(gameBoard.hits).toContainEqual([0, 1]);
      expect(gameBoard.allShipsSunk()).toBe(false);
    });

    test("missed shot", () => {
      gameBoard.receiveAttack([5, 5]);
      expect(gameBoard.missedShots).toContainEqual([5, 5]);
      expect(gameBoard.hits).toEqual([]);
    });

    test("hitting a ship at an invalid position", () => {
      expect(() => gameBoard.receiveAttack([-1, 2])).toThrow(
        "Invalid position"
      );
    });
    test("hitting a ship at a position already hit", () => {
      gameBoard.receiveAttack([0, 0]);
      expect(() => gameBoard.receiveAttack([0, 0])).toThrow(
        "Position already hit"
      );
    });
    test("sinking a ship", () => {
      gameBoard.receiveAttack([0, 0]);
      gameBoard.receiveAttack([0, 1]);
      expect(gameBoard.sunkenShips).toContainEqual([0, 0]);
      expect(gameBoard.allShipsSunk()).toBe(true);
    });
    test("attacking after all ships are sunk", () => {
      gameBoard.receiveAttack([0, 0]);
      gameBoard.receiveAttack([0, 1]);
      expect(() => gameBoard.receiveAttack([1, 1])).toThrow(
        "All ships already sunk"
      );
    });
  });
});
