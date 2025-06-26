import Ship from "../src/Ship.js";
test("Ship with invalid length", () => {
  expect(() => Ship(-2)).toThrow("Invalid ship length");
});
describe("Ship properties", () => {
  let ship;

  beforeEach(() => {
    ship = Ship(2);
  });

  test("should create a ship with the correct properties", () => {
    expect(ship).toHaveLength(2);
    expect(ship.hits).toEqual([]);
    expect(ship.isSunk).toBe(false);
  });
  test("hitting a ship", () => {
    ship.hit(0);
    expect(ship.hits).toEqual([0]);
    expect(ship.isSunk).toBe(false);
  });
  test("sinking a ship", () => {
    ship.hit(0);
    ship.hit(1);
    expect(ship.hits).toEqual([0, 1]);
    expect(ship.isSunk).toBe(true);
  });
  test("hitting a ship at an invalid position", () => {
    expect(() => ship.hit(2)).toThrow("Invalid position");
  });
  test("hitting a ship at a position already hit", () => {
    ship.hit(0);
    expect(() => ship.hit(0)).toThrow("Position already hit");
  });
});
