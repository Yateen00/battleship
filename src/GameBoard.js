import Ship from "./Ship.js";
class Tile {
  constructor(y, x) {
    this.ship = null;
    this.hit = false;
    this.x = x;
    this.y = y;
    this.orientation = null; 
    // structure: x,y is coord of parent tile. number= abs(parent-self)
  }
}
function GameBoard(availableShips) {
  //copy availableShips to avoid mutation
  availableShips = { ...availableShips };
  const board = Array.from({ length: 10 }, (_, x) =>
    Array.from({ length: 10 }, (_, y) => new Tile(y, x))
  );
  const hits = [];
  const sunkenShips = [];
  const totalShips = Object.keys(availableShips).reduce(
    (total, length) => total + availableShips[length],
    0
  );
  let totalAvailableShips = totalShips;
  const missedShots = [];
  function validShipStartTile(start, orientation, length) {
    if (
      !inBoardBounds(start) ||
      (orientation === "horizontal" && start[1] + length > 10) ||
      (orientation === "vertical" && start[0] + length > 10)
    ) {
      return false;
    }
    return true;
  }

  function placeShip(length, start, orientation) {
    if (orientation !== "horizontal" && orientation !== "vertical") {
      throw new Error("Invalid orientation");
    }
    if (!validShipStartTile(start, orientation, length)) {
      throw new Error("Invalid position");
    }
    if (length <= 0) {
      throw new Error("Invalid ship length");
    }

    if (!availableShips[length] || availableShips[length] <= 0) {
      throw new Error("No ships of this length available");
    }

    const multix = orientation === "horizontal" ? 1 : 0;
    const multiy = orientation === "vertical" ? 1 : 0;
    const shipOverlaps = Array.from({ length }, (_, i) => {
      const x = start[1] + i * multix;
      const y = start[0] + i * multiy;
      return board[y][x].ship;
    }).some((overlap) => overlap);
    if (shipOverlaps) {
      throw new Error("Ships overlap");
    }
    availableShips[length]--;
    totalAvailableShips--;
    const ship = Ship(length);
    for (let i = 0; i < length; i++) {
      const x = start[1] + i * multix;
      const y = start[0] + i * multiy;
      board[y][x].ship = ship;
      board[y][x].x = start[1];
      board[y][x].y = start[0];
      board[y][x].orientation = orientation; 
    }
  }
  function parentDistance(tile, coord) {
    if (!tile.ship) {
      throw new Error("No ship at this tile");
    }
    const parentX = tile.x;
    const parentY = tile.y;
    return Math.abs(parentX - coord[1]) + Math.abs(parentY - coord[0]);
  }
  function inBoardBounds(coord) {
    if (coord[0] < 0 || coord[0] >= 10 || coord[1] < 0 || coord[1] >= 10) {
      return false;
    }
    return true;
  }
  function allShipsSunk() {
    return sunkenShips.length === totalShips;
  }
  function parentCoordinate(tile) {
    if (!tile.ship) {
      throw new Error("No ship at this tile");
    }
    return [tile.y, tile.x];
  }
  function receiveAttack(coord) {
    if (totalAvailableShips !== 0) {
      throw new Error("All ships not placed yet");
    }
    if (allShipsSunk()) {
      throw new Error("All ships already sunk");
    }
    if (!inBoardBounds(coord)) {
      throw new Error("Invalid position");
    }
    const tile = board[coord[0]][coord[1]];
    if (tile.hit) {
      throw new Error("Position already hit");
    }
    tile.hit = true;
    if (tile.ship) {
      tile.ship.hit(parentDistance(tile, coord));
      hits.push(coord);
      if (tile.ship.isSunk) {
        sunkenShips.push(parentCoordinate(tile));
      }
      return true;
    } else {
      missedShots.push(coord);
      return false;
    }
  }
  function shipCoordinates(coord) {
    if (!inBoardBounds(coord)) {
      throw new Error("Invalid position");
    }
    const tile = board[coord[0]][coord[1]];
    if (!tile.ship) {
      throw new Error("No ship at this tile");
    }
    const orientation = tile.orientation;
    const length = tile.ship.length;
    const coordinates = [];
    const multix = orientation === "horizontal" ? 1 : 0;
    const multiy = orientation === "vertical" ? 1 : 0;
    for (let i = 0; i < length; i++) {
      const x = tile.x + i * multix;
      const y = tile.y + i * multiy;
      coordinates.push([y, x]);
    }
    return coordinates;
  }
  function repositionShip(oldCoord, newCoord, newOrientation) {
   
    if (hits.length !== 0 || missedShots.length !== 0) {
      throw new Error("Cannot reposition ships after attacks have been made");
    }
    if (["horizontal", "vertical"].indexOf(newOrientation) === -1) {
      throw new Error("Invalid orientation");
    }
    if (!inBoardBounds(oldCoord)) {
      throw new Error("Invalid old position");
    }
    const tile = board[oldCoord[0]][oldCoord[1]];
    if (!tile.ship) {
      throw new Error("No ship at the old position");
    }
    const length = tile.ship.length;
    // find dis of old coord to parent. ships go like -> or down
    const oldCoordStart = [tile.y, tile.x];
    const ogOrientation = tile.orientation;
    const dis = parentDistance(tile, oldCoord);


    const newCoordStart = [
      newCoord[0] - dis * (ogOrientation === "vertical" ? 1 : 0),
      newCoord[1] - dis * (ogOrientation === "horizontal" ? 1 : 0),
    ];
    if (!validShipStartTile(newCoordStart, newOrientation, length)) {
      throw new Error("Invalid new position");
    }
    availableShips[length]++;
    totalAvailableShips++;
   
    const coords = shipCoordinates(oldCoord);
  
    coords.forEach((coord) => {
      const tile = board[coord[0]][coord[1]];
      tile.ship = null;
      tile.orientation = null; 
      tile.x = coord[1];
      tile.y = coord[0];
    });

    try {
      placeShip(length, newCoordStart, newOrientation);

    } catch (error) {
      // If placing the ship fails, revert to original position
      placeShip(length, oldCoordStart, ogOrientation);
 
      throw new Error("Repositioning failed: " + error.message);
    }
  }
  return new Proxy(
    {
      hits,
      sunkenShips,
      missedShots,
      placeShip,
      receiveAttack,
      allShipsSunk,
      get totalAvailableShips() {
        return totalAvailableShips;
      },
      totalShips,
      board, 
      repositionShip,
      shipCoordinates,
    },
    {
      get(target, prop) {
        // Handle numeric properties (e.g., gameBoard[0])
        if (!isNaN(prop)) {
          return board[prop];
        }

        // Handle array methods (e.g., flat, map, forEach, etc.)
        if (typeof board[prop] === "function") {
          return board[prop].bind(board); 
        }

        // Handle the `length` property
        if (prop === "length") {
          return board.length;
        }

        // Otherwise, return the property from the target object
        return target[prop];
      },
    }
  );
}

export default GameBoard;
